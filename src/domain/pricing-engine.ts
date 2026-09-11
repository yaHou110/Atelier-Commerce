/**
 * HIRAD COMMERCE — PRICING & TAX CALCULATION ENGINE
 * Guarantees integer arithmetic in Rials, price snapshotting, and Iranian VAT (10%).
 */

import { Money, OrderItemSnapshot, Product, ProductVariant } from '../types/domain';

export const TAX_RATE_PERCENT = 10; // 10% Iranian VAT (ارزش افزوده)

export interface CouponRule {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number; // percent e.g. 15, or fixed Rial e.g. 50,000,000
  minOrderValue: number; // in Rials
  maxDiscount?: number; // max discount cap
  validUntil: string;
  active: boolean;
}

export const ACTIVE_COUPONS: CouponRule[] = [
  {
    code: 'HIRAD-ARCH-1403',
    discountType: 'PERCENT',
    discountValue: 12,
    minOrderValue: 100_000_000, // 100M Rials
    maxDiscount: 45_000_000,
    validUntil: '2026-12-31',
    active: true,
  },
  {
    code: 'ATELIER-VIP',
    discountType: 'FIXED',
    discountValue: 20_000_000, // 20M Rials
    minOrderValue: 80_000_000,
    validUntil: '2026-12-31',
    active: true,
  },
];

export class PricingEngine {
  /**
   * Helper to format Rials into human-readable Persian/English strings (Toman / Rial)
   */
  static formatRial(amount: number, unit: 'RIAL' | 'TOMAN' = 'TOMAN'): string {
    const value = unit === 'TOMAN' ? Math.floor(amount / 10) : amount;
    const formatted = new Intl.NumberFormat('fa-IR').format(value);
    return `${formatted} ${unit === 'TOMAN' ? 'تومان' : 'ریال'}`;
  }

  /**
   * Converts a product and its selected variant into a frozen immutable snapshot.
   */
  static createLineSnapshot(
    product: Product,
    variant: ProductVariant,
    quantity: number,
    itemDiscountPercent = 0
  ): OrderItemSnapshot {
    if (quantity <= 0) {
      throw new Error('تعداد سفارش باید حداقل ۱ واحد باشد.');
    }

    const unitPriceAmount = Math.round(variant.price.amount);
    const lineGross = unitPriceAmount * quantity;
    
    // Line discount
    const discountAmount = Math.round((lineGross * itemDiscountPercent) / 100);
    const taxableBase = lineGross - discountAmount;
    
    // Tax calculation (10% VAT)
    const taxAmount = Math.round((taxableBase * TAX_RATE_PERCENT) / 100);
    const finalLineTotal = taxableBase + taxAmount;

    return {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      variantId: variant.id,
      skuSnapshot: variant.sku,
      productTitleSnapshot: product.title,
      variantTitleSnapshot: variant.title,
      imageUrlSnapshot: product.images[0] || '',
      unitPriceSnapshot: { amount: unitPriceAmount, currency: 'IRR' },
      taxRatePercent: TAX_RATE_PERCENT,
      taxAmountSnapshot: { amount: taxAmount, currency: 'IRR' },
      discountAmountSnapshot: { amount: discountAmount, currency: 'IRR' },
      finalLineTotal: { amount: finalLineTotal, currency: 'IRR' },
      quantity,
      specificationsSnapshot: {
        'کد محصول': variant.sku,
        'متریال': product.materialPassport.origin,
        'پوشش نهایی': product.materialPassport.finish,
        'دوره ساخت و تولید': `${variant.leadTimeDays} روز کاری`,
      },
    };
  }

  /**
   * Evaluates overall order pricing from an array of snapshots
   */
  static calculateOrderTotals(
    snapshots: OrderItemSnapshot[],
    couponCode?: string,
    shippingCostAmount = 0
  ): {
    subtotal: Money;
    taxTotal: Money;
    shippingCost: Money;
    discountTotal: Money;
    grandTotal: Money;
    appliedCoupon?: CouponRule;
  } {
    let subtotalAmount = 0;
    let taxTotalAmount = 0;
    let itemDiscountAmount = 0;

    for (const snap of snapshots) {
      const gross = snap.unitPriceSnapshot.amount * snap.quantity;
      subtotalAmount += gross;
      taxTotalAmount += snap.taxAmountSnapshot.amount;
      itemDiscountAmount += snap.discountAmountSnapshot.amount;
    }

    // Coupon evaluation
    let couponDiscountAmount = 0;
    let matchedCoupon: CouponRule | undefined;

    if (couponCode) {
      const found = ACTIVE_COUPONS.find(
        (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.active
      );
      if (found && subtotalAmount >= found.minOrderValue) {
        matchedCoupon = found;
        if (found.discountType === 'PERCENT') {
          couponDiscountAmount = Math.round((subtotalAmount * found.discountValue) / 100);
          if (found.maxDiscount && couponDiscountAmount > found.maxDiscount) {
            couponDiscountAmount = found.maxDiscount;
          }
        } else {
          couponDiscountAmount = found.discountValue;
        }
      }
    }

    const totalDiscount = itemDiscountAmount + couponDiscountAmount;
    const finalTaxable = Math.max(0, subtotalAmount - totalDiscount);
    // Recalculate VAT accurately if coupon applied
    const adjustedVat = Math.round((finalTaxable * TAX_RATE_PERCENT) / 100);
    const grandTotalAmount = finalTaxable + adjustedVat + shippingCostAmount;

    return {
      subtotal: { amount: subtotalAmount, currency: 'IRR' },
      taxTotal: { amount: adjustedVat, currency: 'IRR' },
      shippingCost: { amount: shippingCostAmount, currency: 'IRR' },
      discountTotal: { amount: totalDiscount, currency: 'IRR' },
      grandTotal: { amount: grandTotalAmount, currency: 'IRR' },
      appliedCoupon: matchedCoupon,
    };
  }
}
