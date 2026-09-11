/**
 * HIRAD COMMERCE — IMMUTABLE FINANCIAL LEDGER
 * Double-entry bookkeeping engine ensuring auditability and financial integrity.
 * Rule: For any transaction, SUM(DEBITS) === SUM(CREDITS).
 */

import { LedgerAccount, LedgerEntry, Money, OrderId } from '../types/domain';

export class FinancialLedger {
  private entries: LedgerEntry[] = [];

  constructor(initialEntries: LedgerEntry[] = []) {
    this.entries = [...initialEntries];
  }

  getEntries(): LedgerEntry[] {
    return [...this.entries];
  }

  getEntriesByOrder(orderId: OrderId): LedgerEntry[] {
    return this.entries.filter((e) => e.orderId === orderId);
  }

  /**
   * Records a settled customer order:
   * 1. DEBIT  CUSTOMER_PAYMENT  (Total Paid by Customer)
   * 2. CREDIT PLATFORM_REVENUE  (Product Net Subtotal - Discount)
   * 3. CREDIT TAX_PAYABLE_VAT   (10% VAT collected for Iranian Tax Org)
   * 4. CREDIT SHIPPING_CARRIER_FEE (White-Glove Fleet logistics cost)
   */
  recordOrderSettlement(
    orderId: OrderId,
    referenceId: string,
    amounts: {
      grandTotal: Money;
      netRevenue: Money;
      vatTotal: Money;
      shippingFee: Money;
    }
  ): void {
    const entryGroupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const debits: LedgerEntry[] = [
      {
        id: `led_${Date.now()}_1`,
        entryGroup: entryGroupId,
        type: 'DEBIT',
        account: 'CUSTOMER_PAYMENT',
        amount: { ...amounts.grandTotal },
        orderId,
        referenceId,
        narration: `دریافت وجه فاکتور سفارش ${orderId} از طریق درگاه شاپرک`,
        createdAt: now,
        reconciled: true,
      },
    ];

    const credits: LedgerEntry[] = [
      {
        id: `led_${Date.now()}_2`,
        entryGroup: entryGroupId,
        type: 'CREDIT',
        account: 'PLATFORM_REVENUE',
        amount: { ...amounts.netRevenue },
        orderId,
        referenceId,
        narration: `شناسایی درآمد خالص فروش کالای معماری و یراق هیراد`,
        createdAt: now,
        reconciled: true,
      },
      {
        id: `led_${Date.now()}_3`,
        entryGroup: entryGroupId,
        type: 'CREDIT',
        account: 'TAX_PAYABLE_VAT',
        amount: { ...amounts.vatTotal },
        orderId,
        referenceId,
        narration: `تسهیم مالیات بر ارزش افزوده ۱۰٪ جهت تسویه فصلی ماده ۱۶۹`,
        createdAt: now,
        reconciled: true,
      },
    ];

    if (amounts.shippingFee.amount > 0) {
      credits.push({
        id: `led_${Date.now()}_4`,
        entryGroup: entryGroupId,
        type: 'CREDIT',
        account: 'SHIPPING_CARRIER_FEE',
        amount: { ...amounts.shippingFee },
        orderId,
        referenceId,
        narration: `تسهیم هزینه ناوگان باربری تخصصی سنگ و قطعات معماری`,
        createdAt: now,
        reconciled: true,
      });
    }

    // Mathematical assertion: SUM(DEBIT) === SUM(CREDIT)
    const sumDebit = debits.reduce((acc, cur) => acc + cur.amount.amount, 0);
    const sumCredit = credits.reduce((acc, cur) => acc + cur.amount.amount, 0);

    if (sumDebit !== sumCredit) {
      throw new Error(
        `[LEDGER_BALANCE_MISMATCH] خطای تراز حسابداری: جمع بدهکار (${sumDebit}) با بستانکار (${sumCredit}) برابر نیست.`
      );
    }

    this.entries.push(...debits, ...credits);
  }

  /**
   * Records a processed refund:
   * 1. DEBIT  REFUND_RESERVE    (Total Refund Amount)
   * 2. CREDIT CUSTOMER_PAYMENT  (Discharge payment back to customer bank card)
   */
  recordRefund(
    orderId: OrderId,
    refundAmount: Money,
    trackingNumber: string,
    reason: string
  ): void {
    const entryGroupId = `refund_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const debitEntry: LedgerEntry = {
      id: `led_ref_${Date.now()}_1`,
      entryGroup: entryGroupId,
      type: 'DEBIT',
      account: 'REFUND_RESERVE',
      amount: { ...refundAmount },
      orderId,
      referenceId: trackingNumber,
      narration: `استرداد وجه بابت ${reason}`,
      createdAt: now,
      reconciled: true,
    };

    const creditEntry: LedgerEntry = {
      id: `led_ref_${Date.now()}_2`,
      entryGroup: entryGroupId,
      type: 'CREDIT',
      account: 'CUSTOMER_PAYMENT',
      amount: { ...refundAmount },
      orderId,
      referenceId: trackingNumber,
      narration: `خروج وجه از حساب بانکی به شماره شبا/کارت خریدار`,
      createdAt: now,
      reconciled: true,
    };

    this.entries.push(debitEntry, creditEntry);
  }

  /**
   * Calculate account balances: DEBIT - CREDIT
   */
  getAccountBalances(): Record<LedgerAccount, number> {
    const balances: Record<LedgerAccount, number> = {
      CUSTOMER_PAYMENT: 0,
      PLATFORM_REVENUE: 0,
      SELLER_PAYABLE: 0,
      TAX_PAYABLE_VAT: 0,
      SHIPPING_CARRIER_FEE: 0,
      REFUND_RESERVE: 0,
    };

    for (const e of this.entries) {
      if (e.type === 'DEBIT') {
        balances[e.account] += e.amount.amount;
      } else {
        balances[e.account] -= e.amount.amount;
      }
    }

    return balances;
  }
}
