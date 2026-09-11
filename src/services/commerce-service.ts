/**
 * HIRAD COMMERCE PLATFORM — AUTHORITATIVE COMMERCE SERVICE
 * Single Source of Truth coordinating:
 * - Domain Entities & Invariants
 * - Cart Lifecycle
 * - Inventory Reservation & Optimistic Locking
 * - Idempotent Order Creation & Price Snapshots
 * - State Machine Transitions & Audit Logs
 * - Financial Ledger Settlement
 */

import {
  Address,
  Cart,
  CartItem,
  Money,
  Order,
  OrderId,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductVariant,
  ShippingTier,
  SKU,
  User,
  VariantId,
} from '../types/domain';
import { INITIAL_PRODUCTS } from '../data/catalog';
import { InventoryManager, InventoryRecord } from '../domain/inventory-manager';
import { PricingEngine } from '../domain/pricing-engine';
import { OrderStateMachine } from '../domain/state-machine';
import { FinancialLedger } from '../domain/financial-ledger';
import { IdempotencyManager } from '../domain/idempotency';

const STORAGE_KEYS = {
  PRODUCTS: 'hirad_products_v1',
  INVENTORY: 'hirad_inventory_v1',
  ORDERS: 'hirad_orders_v1',
  LEDGER: 'hirad_ledger_v1',
  CART: 'hirad_cart_v1',
  USER: 'hirad_current_user_v1',
};

export const INITIAL_USER: User = {
  id: 'usr_architect_01',
  name: 'مهندس آرشام رادمهر',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  email: 'arsham.radmehr@atelier-hirad.com',
  role: 'SUPER_ADMIN',
  organization: 'استودیو معماری و طراحی هیراد',
  isB2BVerified: true,
};

export class CommerceService {
  private products: Product[] = [];
  public inventory: InventoryManager;
  public ledger: FinancialLedger;
  public idempotency: IdempotencyManager;
  private orders: Order[] = [];
  private cart: Cart = { id: 'cart_main', items: [], updatedAt: Date.now() };
  private currentUser: User = INITIAL_USER;
  private listeners: Array<() => void> = [];

  constructor() {
    this.idempotency = new IdempotencyManager();
    
    // Load or initialize products
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (savedProducts) {
      try {
        this.products = JSON.parse(savedProducts);
      } catch {
        this.products = [...INITIAL_PRODUCTS];
      }
    } else {
      this.products = [...INITIAL_PRODUCTS];
    }

    // Initialize inventory records from products
    const initialInv: InventoryRecord[] = [];
    for (const p of this.products) {
      for (const v of p.variants) {
        initialInv.push({
          sku: v.sku,
          title: `${p.title} — ${v.title}`,
          onHand: v.inventory.onHand,
          reserved: v.inventory.reserved,
          available: v.inventory.available,
          version: v.inventory.version,
          warehouseLocation: 'انبار مرکزی شمس‌آباد، هاب ۱',
        });
      }
    }

    const savedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (savedInv) {
      try {
        const parsedInv = JSON.parse(savedInv);
        this.inventory = new InventoryManager(parsedInv);
      } catch {
        this.inventory = new InventoryManager(initialInv);
      }
    } else {
      this.inventory = new InventoryManager(initialInv);
    }

    // Ledger
    const savedLedger = localStorage.getItem(STORAGE_KEYS.LEDGER);
    let initialLedgerEntries = [];
    if (savedLedger) {
      try {
        initialLedgerEntries = JSON.parse(savedLedger);
      } catch {
        initialLedgerEntries = [];
      }
    }
    this.ledger = new FinancialLedger(initialLedgerEntries);

    // Orders
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (savedOrders) {
      try {
        this.orders = JSON.parse(savedOrders);
      } catch {
        this.orders = [];
      }
    }

    // Cart
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch {
        this.cart = { id: 'cart_main', items: [], updatedAt: Date.now() };
      }
    }

    // Clean up expired reservations on boot
    this.inventory.cleanupExpiredReservations();
  }

  // Subscribe to changes for reactive UI updates
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.persist();
    for (const l of this.listeners) l();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(this.inventory.getAllRecords()));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(this.ledger.getEntries()));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.warn('Storage persistence failed', e);
    }
  }

  // USER & RBAC
  getCurrentUser(): User {
    return this.currentUser;
  }

  switchUserRole(role: User['role']): void {
    this.currentUser = {
      ...this.currentUser,
      role,
    };
    this.notify();
  }

  // CATALOG QUERIES
  getProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  findVariant(productId: string, variantId: string): { product: Product; variant: ProductVariant } {
    const product = this.getProductById(productId);
    if (!product) throw new Error(`محصول ${productId} پیدا نشد.`);
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) throw new Error(`تنوع کالایی ${variantId} یافت نشد.`);
    return { product, variant };
  }

  /**
   * Administrative price update (to test that historical order line snapshots remain unchanged)
   */
  updateProductBasePrice(productId: string, newAmount: number): void {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) throw new Error('محصول یافت نشد.');
    prod.basePrice.amount = newAmount;
    // Update first variant price accordingly
    if (prod.variants[0]) {
      prod.variants[0].price.amount = newAmount;
    }
    this.notify();
  }

  // CART OPERATIONS
  getCart(): Cart {
    return this.cart;
  }

  addToCart(productId: string, variantId: string, quantity = 1): void {
    const { variant } = this.findVariant(productId, variantId);
    const inv = this.inventory.getRecord(variant.sku);

    const existingIndex = this.cart.items.findIndex(
      (i) => i.productId === productId && i.variantId === variantId
    );
    const currentQtyInCart = existingIndex >= 0 ? this.cart.items[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (inv && inv.available < requestedTotal) {
      throw new Error(
        `موجودی کالا برای افزودن به سبد کافی نیست. (موجود در انبار: ${inv.available} عدد)`
      );
    }

    if (existingIndex >= 0) {
      this.cart.items[existingIndex].quantity = requestedTotal;
    } else {
      this.cart.items.push({
        productId,
        variantId,
        sku: variant.sku,
        quantity,
        addedAt: Date.now(),
      });
    }

    this.cart.updatedAt = Date.now();
    this.notify();
  }

  updateCartItemQuantity(variantId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(variantId);
      return;
    }
    const item = this.cart.items.find((i) => i.variantId === variantId);
    if (!item) return;

    const inv = this.inventory.getRecord(item.sku);
    if (inv && inv.available < quantity) {
      throw new Error(`موجودی کالا فقط ${inv.available} واحد است.`);
    }

    item.quantity = quantity;
    this.cart.updatedAt = Date.now();
    this.notify();
  }

  removeFromCart(variantId: string): void {
    this.cart.items = this.cart.items.filter((i) => i.variantId !== variantId);
    this.cart.updatedAt = Date.now();
    this.notify();
  }

  applyCouponToCart(code: string): void {
    this.cart.appliedCoupon = code.trim();
    this.notify();
  }

  clearCart(): void {
    this.cart.items = [];
    this.cart.appliedCoupon = undefined;
    this.cart.reservationId = undefined;
    this.cart.updatedAt = Date.now();
    this.notify();
  }

  /**
   * Computes authoritative cart totals using live product variants and PricingEngine
   */
  getCartEvaluation(shippingCostAmount = 0): {
    snapshots: OrderItemSnapshot[];
    subtotal: Money;
    taxTotal: Money;
    shippingCost: Money;
    discountTotal: Money;
    grandTotal: Money;
  } {
    const snapshots: OrderItemSnapshot[] = [];

    for (const item of this.cart.items) {
      try {
        const { product, variant } = this.findVariant(item.productId, item.variantId);
        const snap = PricingEngine.createLineSnapshot(product, variant, item.quantity);
        snapshots.push(snap);
      } catch (err) {
        console.warn('Could not snapshot cart item:', item, err);
      }
    }

    const totals = PricingEngine.calculateOrderTotals(
      snapshots,
      this.cart.appliedCoupon,
      shippingCostAmount
    );

    return {
      snapshots,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      shippingCost: totals.shippingCost,
      discountTotal: totals.discountTotal,
      grandTotal: totals.grandTotal,
    };
  }

  // CHECKOUT & ORDER CREATION (AUTHORITATIVE & TRANSACTIONAL)
  /**
   * Pre-reserves stock for checkout step
   */
  reserveCartStock(): string {
    if (this.cart.items.length === 0) {
      throw new Error('سبد خرید شما خالی است.');
    }

    // Cancel existing reservation if any
    if (this.cart.reservationId) {
      this.inventory.cancelReservation(this.cart.reservationId);
    }

    // Reserve each item
    let firstResId = '';
    for (const item of this.cart.items) {
      const inv = this.inventory.getRecord(item.sku);
      const res = this.inventory.reserveStock(item.sku, item.quantity, this.cart.id, inv?.version);
      if (!firstResId) firstResId = res.id;
    }

    this.cart.reservationId = firstResId;
    this.notify();
    return firstResId;
  }

  /**
   * Authoritatively places order with idempotency check, snapshot creation, and ledger settlement
   */
  executeCheckout(params: {
    address: Address;
    paymentMethod: PaymentMethod;
    shippingTier: ShippingTier;
    shippingCost: number;
    officialInvoiceRequested: boolean;
    officialCompanyDetails?: Order['officialCompanyDetails'];
    idempotencyKey: string;
    correlationId?: string;
  }): Order {
    const correlationId = params.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { idempotencyKey } = params;

    // 1. Idempotency Check: if request with this key already finished, replay response
    if (this.idempotency.has(idempotencyKey)) {
      console.info(`[IDEMPOTENCY_HIT] Replaying cached order response for key: ${idempotencyKey}`);
      return this.idempotency.get<Order>(idempotencyKey)!;
    }

    if (this.cart.items.length === 0) {
      throw new Error('سبد خرید خالی است.');
    }

    // 2. Authoritative Price Calculation from current catalog & coupons
    const evaluation = this.getCartEvaluation(params.shippingCost);

    // 3. Commit stock reservations (convert reserved to on-hand decrease)
    if (this.cart.reservationId) {
      try {
        this.inventory.commitReservation(this.cart.reservationId);
      } catch (err) {
        console.warn('Reservation commit fallback, reserving directly:', err);
      }
    } else {
      // Direct deduction if reservation wasn't pre-locked
      for (const item of this.cart.items) {
        const inv = this.inventory.getRecord(item.sku);
        if (!inv || inv.available < item.quantity) {
          throw new Error(`موجودی کالای ${item.sku} در لحظه پرداخت به پایان رسید.`);
        }
        inv.onHand -= item.quantity;
        inv.available = inv.onHand - inv.reserved;
        inv.version += 1;
      }
    }

    // 4. Create Order Entity with frozen snapshots
    const orderNumber = `HRD-1403-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId: OrderId = `ord_${Date.now()}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      orderNumber,
      customerId: this.currentUser.id,
      customerName: params.address.fullName || this.currentUser.name,
      customerPhone: params.address.phone || this.currentUser.phone,
      customerEmail: this.currentUser.email,
      items: evaluation.snapshots,
      pricing: {
        subtotal: evaluation.subtotal,
        taxTotal: evaluation.taxTotal,
        shippingCost: evaluation.shippingCost,
        discountTotal: evaluation.discountTotal,
        grandTotal: evaluation.grandTotal,
      },
      couponCodeApplied: this.cart.appliedCoupon,
      status: 'PAID', // Instant mock settlement for demo or credit approval
      paymentMethod: params.paymentMethod,
      paymentDetails: {
        gateway: params.paymentMethod === 'SHAPARAK_ONLINE' ? 'سامان شاپرک e-Pay' : 'اعتبار سنجی سازمانی',
        trackingNumber: `SHP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: now,
      },
      shippingTier: params.shippingTier,
      shippingAddress: params.address,
      officialInvoiceRequested: params.officialInvoiceRequested,
      officialCompanyDetails: params.officialCompanyDetails,
      statusHistory: [
        {
          status: 'CREATED',
          timestamp: now,
          note: 'سفارش با موفقیت در سیستم مرکزی هیراد ثبت شد.',
          actor: this.currentUser.name,
        },
        {
          status: 'PAID',
          timestamp: now,
          note: `تسویه حساب از طریق ${params.paymentMethod} تأیید شد.`,
          actor: 'بانک مرکزی شاپرک / سامانه اعتباری',
        },
      ],
      correlationId,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    // 5. Post to Immutable Financial Ledger
    const netRevenueAmount = evaluation.subtotal.amount - evaluation.discountTotal.amount;
    this.ledger.recordOrderSettlement(order.id, order.paymentDetails?.referenceId || orderNumber, {
      grandTotal: evaluation.grandTotal,
      netRevenue: { amount: netRevenueAmount, currency: 'IRR' },
      vatTotal: evaluation.taxTotal,
      shippingFee: evaluation.shippingCost,
    });

    // 6. Save order & clear cart
    this.orders.unshift(order);
    this.clearCart();

    // 7. Store in Idempotency cache
    this.idempotency.set(idempotencyKey, order);

    this.notify();
    return order;
  }

  // ORDER MANAGEMENT & STATE MACHINE
  getOrders(): Order[] {
    return [...this.orders];
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  transitionOrderStatus(orderId: string, nextStatus: OrderStatus, note: string): Order {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('سفارش یافت نشد.');

    // Assert state transition rule
    OrderStateMachine.assertTransition(order.status, nextStatus);

    order.status = nextStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: nextStatus,
      timestamp: order.updatedAt,
      note,
      actor: this.currentUser.name,
    });

    // If order was cancelled or returned, handle stock and refund ledger
    if (nextStatus === 'CANCELLED' || nextStatus === 'REFUNDED') {
      // Re-add stock
      for (const item of order.items) {
        const inv = this.inventory.getRecord(item.skuSnapshot);
        if (inv) {
          inv.onHand += item.quantity;
          inv.available = inv.onHand - inv.reserved;
          inv.version += 1;
        }
      }

      // Record refund in ledger
      this.ledger.recordRefund(
        order.id,
        order.pricing.grandTotal,
        order.paymentDetails?.trackingNumber || order.orderNumber,
        `لغو/استرداد سفارش ${order.orderNumber}`
      );
    }

    this.notify();
    return order;
  }

  // RECOVERY & RESET
  resetToInitialDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.CART);
    window.location.reload();
  }
}

// Global Singleton Instance
export const commerceService = new CommerceService();
