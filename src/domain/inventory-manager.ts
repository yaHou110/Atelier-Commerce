/**
 * HIRAD COMMERCE — INVENTORY & CONCURRENCY MANAGER
 * Enforces:
 * - Optimistic Locking via version tracking
 * - Reservation lifecycle (10-minute reservation expiry)
 * - Safe stock mutations (available = onHand - reserved >= 0)
 */

import { SKU, StockReservation } from '../types/domain';

export interface InventoryRecord {
  sku: SKU;
  title: string;
  onHand: number;
  reserved: number;
  available: number;
  version: number;
  warehouseLocation: string;
}

export class InventoryManager {
  private records: Map<SKU, InventoryRecord> = new Map();
  private reservations: Map<string, StockReservation> = new Map();
  public reservationTtlMs = 10 * 60 * 1000; // 10 minutes

  constructor(initialRecords: InventoryRecord[] = []) {
    for (const rec of initialRecords) {
      this.records.set(rec.sku, {
        ...rec,
        available: Math.max(0, rec.onHand - rec.reserved),
      });
    }
  }

  getRecord(sku: SKU): InventoryRecord | undefined {
    return this.records.get(sku);
  }

  getAllRecords(): InventoryRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Cleans up expired reservations automatically and frees back reserved stock
   */
  cleanupExpiredReservations(): number {
    const now = Date.now();
    let freedCount = 0;

    for (const res of this.reservations.values()) {
      if (res.status === 'ACTIVE' && res.expiresAt < now) {
        res.status = 'EXPIRED';
        const inv = this.records.get(res.sku);
        if (inv) {
          inv.reserved = Math.max(0, inv.reserved - res.quantity);
          inv.available = Math.max(0, inv.onHand - inv.reserved);
          inv.version += 1;
          freedCount++;
        }
      }
    }
    return freedCount;
  }

  /**
   * Atomically reserves stock with optimistic version checking.
   * Throws if version mismatch or insufficient available stock.
   */
  reserveStock(
    sku: SKU,
    quantity: number,
    cartId: string,
    expectedVersion?: number
  ): StockReservation {
    this.cleanupExpiredReservations();

    const inv = this.records.get(sku);
    if (!inv) {
      throw new Error(`[INVENTORY_ERROR] کالای با شناسه SKU ${sku} یافت نشد.`);
    }

    if (expectedVersion !== undefined && inv.version !== expectedVersion) {
      throw new Error(
        `[CONCURRENCY_CONFLICT] تداخل ویرایش همزمان (نسخه فعلی انبار: ${inv.version}، نسخه ارسالی: ${expectedVersion}). لطفاً مجدداً استعلام موجودی بگیرید.`
      );
    }

    const currentAvailable = inv.onHand - inv.reserved;
    if (currentAvailable < quantity) {
      throw new Error(
        `[INSUFFICIENT_STOCK] موجودی قابل سفارش برای ${inv.title} ناکافی است. (موجود: ${currentAvailable}، درخواستی: ${quantity})`
      );
    }

    // Mutate inventory
    inv.reserved += quantity;
    inv.available = inv.onHand - inv.reserved;
    inv.version += 1;

    const reservation: StockReservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sku,
      quantity,
      cartId,
      expiresAt: Date.now() + this.reservationTtlMs,
      status: 'ACTIVE',
      createdAt: Date.now(),
    };

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  /**
   * Finalizes reservation upon successful payment (converts reserved into depleted on-hand)
   */
  commitReservation(reservationId: string): void {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') {
      throw new Error(`[INVALID_RESERVATION] رزرو معتبر یافت نشد یا منقضی شده است.`);
    }

    const inv = this.records.get(res.sku);
    if (!inv) {
      throw new Error(`[INVENTORY_ERROR] کالای مربوطه پیدا نشد.`);
    }

    inv.onHand = Math.max(0, inv.onHand - res.quantity);
    inv.reserved = Math.max(0, inv.reserved - res.quantity);
    inv.available = Math.max(0, inv.onHand - inv.reserved);
    inv.version += 1;

    res.status = 'CONVERTED';
  }

  /**
   * Cancels active reservation (e.g., user abandons checkout or payment fails)
   */
  cancelReservation(reservationId: string): void {
    const res = this.reservations.get(reservationId);
    if (!res || res.status !== 'ACTIVE') return;

    const inv = this.records.get(res.sku);
    if (inv) {
      inv.reserved = Math.max(0, inv.reserved - res.quantity);
      inv.available = Math.max(0, inv.onHand - inv.reserved);
      inv.version += 1;
    }

    res.status = 'CANCELLED';
  }

  /**
   * Administrative adjustment of physical on-hand inventory
   */
  adjustStock(sku: SKU, newOnHand: number, expectedVersion: number): InventoryRecord {
    const inv = this.records.get(sku);
    if (!inv) throw new Error('موجودی یافت نشد.');

    if (inv.version !== expectedVersion) {
      throw new Error('تداخل ویرایش همزمان انبار. نسخه به‌روزشده نیست.');
    }

    if (newOnHand < inv.reserved) {
      throw new Error(
        `تعداد موجودی فیزیکی (${newOnHand}) نمی‌تواند کمتر از تعداد رزرو فعال (${inv.reserved}) باشد.`
      );
    }

    inv.onHand = newOnHand;
    inv.available = inv.onHand - inv.reserved;
    inv.version += 1;
    return { ...inv };
  }
}
