/**
 * HIRAD COMMERCE — IMMUTABLE FINANCIAL LEDGER VIEW
 * Visualizes double-entry bookkeeping, audit balances, and VAT liabilities.
 * Invariant Check: SUM(DEBIT) === SUM(CREDIT).
 */

import React from 'react';
import { BookOpen, CheckCircle2, ShieldAlert, DollarSign, FileSpreadsheet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { commerceService } from '../services/commerce-service';
import { PricingEngine } from '../domain/pricing-engine';
import { LedgerAccount } from '../types/domain';

export const FinancialLedgerView: React.FC = () => {
  const ledger = commerceService.ledger;
  const entries = ledger.getEntries();
  const balances = ledger.getAccountBalances();

  // Invariant calculation
  const totalDebits = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((acc, e) => acc + e.amount.amount, 0);

  const totalCredits = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((acc, e) => acc + e.amount.amount, 0);

  const isBalanced = totalDebits === totalCredits;

  const ACCOUNT_NAMES: Record<LedgerAccount, { title: string; desc: string }> = {
    CUSTOMER_PAYMENT: { title: 'حساب دریافت از مشتریان', desc: 'کل مبالغ واریزشده از شاپرک' },
    PLATFORM_REVENUE: { title: 'درآمد ناخالص بازرگانی هیراد', desc: 'سهم فروش خالص قطعات معماری' },
    TAX_PAYABLE_VAT: { title: 'مالیات بر ارزش افزوده بدهکار (VAT)', desc: '۱۰٪ سهم سازمان امور مالیاتی ماده ۱۶۹' },
    SHIPPING_CARRIER_FEE: { title: 'تسهیم ناوگان و لجستیک White-Glove', desc: 'هزینه باربری تخصصی و تکنسین' },
    SELLER_PAYABLE: { title: 'بستانکاری تأمین‌کنندگان / کارگاه‌ها', desc: 'مطالبات کارگاه‌های ریخته‌گری و سنگ' },
    REFUND_RESERVE: { title: 'اندوخته استرداد و مرجوعی', desc: 'وجوه عودت‌داده‌شده به خریداران' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title & Audit Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e4de] pb-4">
        <div>
          <span className="font-tech text-xs uppercase tracking-widest text-stone-500 block">
            DOUBLE-ENTRY IMMUTABLE GENERAL LEDGER
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
            دفترکل مالی تغییرناپذیر و حسابرسی تراز آزمایشی
          </h1>
        </div>

        {/* Balance Assertion Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-tech font-bold ${
          isBalanced
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          {isBalanced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تراز دفترکل برقرار است (SUM_DEBIT = SUM_CREDIT)</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>مغایرت تراز مالی در لجر کشف شد</span>
            </>
          )}
        </div>
      </div>

      {/* Account Balances Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-tech">
        <div className="p-4 bg-white border border-[#e5e4de] space-y-1">
          <span className="text-stone-400 text-[11px] block">{ACCOUNT_NAMES.CUSTOMER_PAYMENT.title}</span>
          <span className="text-lg font-bold text-stone-900 block">
            {PricingEngine.formatRial(Math.abs(balances.CUSTOMER_PAYMENT), 'TOMAN')}
          </span>
          <span className="text-[10px] text-stone-500 block">{ACCOUNT_NAMES.CUSTOMER_PAYMENT.desc}</span>
        </div>

        <div className="p-4 bg-white border border-[#e5e4de] space-y-1">
          <span className="text-stone-400 text-[11px] block">{ACCOUNT_NAMES.PLATFORM_REVENUE.title}</span>
          <span className="text-lg font-bold text-emerald-900 block">
            {PricingEngine.formatRial(Math.abs(balances.PLATFORM_REVENUE), 'TOMAN')}
          </span>
          <span className="text-[10px] text-stone-500 block">{ACCOUNT_NAMES.PLATFORM_REVENUE.desc}</span>
        </div>

        <div className="p-4 bg-white border border-[#e5e4de] space-y-1">
          <span className="text-stone-400 text-[11px] block">{ACCOUNT_NAMES.TAX_PAYABLE_VAT.title}</span>
          <span className="text-lg font-bold text-amber-900 block">
            {PricingEngine.formatRial(Math.abs(balances.TAX_PAYABLE_VAT), 'TOMAN')}
          </span>
          <span className="text-[10px] text-stone-500 block">{ACCOUNT_NAMES.TAX_PAYABLE_VAT.desc}</span>
        </div>

        <div className="p-4 bg-white border border-[#e5e4de] space-y-1">
          <span className="text-stone-400 text-[11px] block">{ACCOUNT_NAMES.SHIPPING_CARRIER_FEE.title}</span>
          <span className="text-lg font-bold text-stone-900 block">
            {PricingEngine.formatRial(Math.abs(balances.SHIPPING_CARRIER_FEE), 'TOMAN')}
          </span>
          <span className="text-[10px] text-stone-500 block">{ACCOUNT_NAMES.SHIPPING_CARRIER_FEE.desc}</span>
        </div>
      </div>

      {/* Ledger Journal Entries Table */}
      <div className="bg-white border border-[#e5e4de] overflow-hidden">
        <div className="p-4 border-b border-[#e5e4de] bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900">سند روزنامه و ردیف‌های دفترکل (Journal Entries):</h3>
          </div>
          <span className="text-xs font-tech text-stone-500">
            تعداد ردیف‌های ثبت‌شده: {entries.length} آرتیکل
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs font-tech">
            هیچ آرتیکل مالی تاکنون ثبت نشده است. با ثبت اولین سفارش، رویدادهای مالی به‌صورت خودکار در لجر درج می‌گردند.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100/70 border-b border-[#e5e4de] text-[11px] font-tech text-stone-600">
                <tr>
                  <th className="p-3">شناسه آرتیکل</th>
                  <th className="p-3">زمان ثبت</th>
                  <th className="p-3">نوع سند</th>
                  <th className="p-3">سرفصل حساب (Account)</th>
                  <th className="p-3">شرح رویداد مالی</th>
                  <th className="p-3">سفارش / مرجع</th>
                  <th className="p-3 text-left">مبلغ (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-tech">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3 text-stone-400 text-[10px]">{e.id}</td>
                    <td className="p-3 text-stone-500 text-[11px] whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleTimeString('fa-IR')}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold ${
                        e.type === 'DEBIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {e.type === 'DEBIT' ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" />
                            بدهکار (Debit)
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            بستانکار (Credit)
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-stone-800">{ACCOUNT_NAMES[e.account]?.title || e.account}</td>
                    <td className="p-3 text-stone-600 font-sans text-xs">{e.narration}</td>
                    <td className="p-3 text-stone-500 text-[11px]">{e.referenceId || e.orderId}</td>
                    <td className="p-3 text-left font-bold text-stone-900">
                      {PricingEngine.formatRial(e.amount.amount, 'TOMAN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
