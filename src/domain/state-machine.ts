/**
 * HIRAD COMMERCE — ORDER STATE MACHINE
 * Deterministic state transitions strictly disallowing invalid progressions.
 */

import { OrderStatus } from '../types/domain';

export interface StateTransitionRule {
  from: OrderStatus;
  to: OrderStatus[];
  description: string;
  allowedRoles: string[];
}

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAID: ['IN_PRODUCTION', 'CANCELLED'], // Can cancel before production starts
  IN_PRODUCTION: ['QUALITY_INSPECTION'],
  QUALITY_INSPECTION: ['READY_FOR_DISPATCH', 'IN_PRODUCTION'], // Re-work if failed inspection
  READY_FOR_DISPATCH: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'], // Approved or rejected
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, { fa: string; en: string; color: string }> = {
  CREATED: { fa: 'ثبت اولیه سفارش', en: 'Created', color: 'bg-stone-100 text-stone-700' },
  PAYMENT_PENDING: { fa: 'در انتظار پرداخت', en: 'Payment Pending', color: 'bg-amber-100 text-amber-800' },
  PAYMENT_FAILED: { fa: 'خطای تراکنش', en: 'Payment Failed', color: 'bg-rose-100 text-rose-800' },
  PAID: { fa: 'تسویه و تأیید مالی', en: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  IN_PRODUCTION: { fa: 'در خط تولید آتلیه', en: 'In Production', color: 'bg-blue-100 text-blue-800' },
  QUALITY_INSPECTION: { fa: 'کنترل کیفیت سازه‌ای', en: 'Quality Inspection', color: 'bg-indigo-100 text-indigo-800' },
  READY_FOR_DISPATCH: { fa: 'آماده بارگیری و بسته‌بندی', en: 'Ready for Dispatch', color: 'bg-cyan-100 text-cyan-800' },
  SHIPPED: { fa: 'تحویل ناوگان حمل تخصصی', en: 'Dispatched', color: 'bg-teal-100 text-teal-800' },
  DELIVERED: { fa: 'تحویل در محل پروژه', en: 'Delivered', color: 'bg-emerald-200 text-emerald-900' },
  CANCELLED: { fa: 'ابطال سفارش', en: 'Cancelled', color: 'bg-zinc-200 text-zinc-600' },
  RETURN_REQUESTED: { fa: 'درخواست عودت کالا', en: 'Return Requested', color: 'bg-orange-100 text-orange-800' },
  RETURNED: { fa: 'کالا عودت داده شد', en: 'Returned', color: 'bg-purple-100 text-purple-800' },
  REFUNDED: { fa: 'وجه مسترد گردید', en: 'Refunded', color: 'bg-violet-100 text-violet-800' },
};

export class OrderStateMachine {
  static canTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const validTargets = ORDER_TRANSITIONS[currentStatus] || [];
    return validTargets.includes(targetStatus);
  }

  static assertTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `[STATE_MACHINE_VIOLATION] انتقال غیرمجاز وضعیت سفارش از '${currentStatus}' به '${targetStatus}'.`
      );
    }
  }
}
