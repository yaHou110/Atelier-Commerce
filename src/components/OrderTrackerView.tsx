/**
 * HIRAD COMMERCE — ORDER STATE MACHINE & AUDIT TRACKER
 * Visualizes order lifecycle, enforces legal transitions, and displays immutable snapshots.
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Building2,
  Printer
} from 'lucide-react';
import { Order, OrderStatus } from '../types/domain';
import { commerceService } from '../services/commerce-service';
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS } from '../domain/state-machine';
import { PricingEngine } from '../domain/pricing-engine';

interface OrderTrackerViewProps {
  onBackToStore: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ onBackToStore }) => {
  const orders = commerceService.getOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [transitionNote, setTransitionNote] = useState('');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleStatusChange = (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      commerceService.transitionOrderStatus(
        selectedOrder.id,
        nextStatus,
        transitionNote.trim() || `تغییر وضعیت توسط ${commerceService.getCurrentUser().name}`
      );
      setTransitionNote('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!selectedOrder) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center bg-white border border-[#e5e4de] my-10">
        <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-stone-900">هیچ سفارشی تاکنون ثبت نشده است</h3>
        <p className="text-xs text-stone-500 mt-1">
          برای مشاهده عملکرد ماشین وضعیت و اسنپ‌شات‌های قیمت، ابتدا از کاتالوگ کالایی را سفارش دهید.
        </p>
        <button
          onClick={onBackToStore}
          className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-medium hover:bg-stone-800"
        >
          بازگشت به آتلیه و کاتالوگ
        </button>
      </div>
    );
  }

  const allowedTransitions = ORDER_TRANSITIONS[selectedOrder.status] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e4de] pb-4">
        <div>
          <span className="font-tech text-xs uppercase tracking-widest text-stone-500 block">
            DETERMINISTIC STATE MACHINE & AUDIT LOG
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
            ره‌گیری چرخه حیات سفارشات و اسنپ‌شات‌های مالی
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Order Selector */}
          <select
            value={selectedOrder.id}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="bg-white border border-stone-300 px-3 py-1.5 text-xs font-tech font-bold text-stone-900 focus:outline-none"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {ORDER_STATUS_LABELS[o.status].fa} ({PricingEngine.formatRial(o.pricing.grandTotal.amount, 'TOMAN')})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="p-2 border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs flex items-center gap-1"
            title="چاپ فاکتور رسمی"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Lifecycle Stepper & Legal Transitions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Progression Card */}
          <div className="bg-white border border-[#e5e4de] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs text-stone-400 font-tech">کد پیگیری سیستمی سفارش:</span>
                <span className="font-tech font-bold text-base text-stone-900 mr-2">
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <span className={`px-3 py-1 text-xs font-tech font-bold ${ORDER_STATUS_LABELS[selectedOrder.status].color}`}>
                {ORDER_STATUS_LABELS[selectedOrder.status].fa}
              </span>
            </div>

            {/* Visual State Chain */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-tech">
              {(['CREATED', 'PAID', 'IN_PRODUCTION', 'QUALITY_INSPECTION', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((st, idx) => {
                const isCurrent = selectedOrder.status === st;
                const isPast = selectedOrder.statusHistory.some((h) => h.status === st);
                return (
                  <div
                    key={st}
                    className={`p-2.5 border text-center ${
                      isCurrent
                        ? 'border-stone-900 bg-stone-900 text-white font-bold ring-2 ring-amber-400'
                        : isPast
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 bg-stone-50 text-stone-400'
                    }`}
                  >
                    <span className="text-[10px] block opacity-70">مرحله {idx + 1}</span>
                    <span className="text-[11px] block mt-0.5">{ORDER_STATUS_LABELS[st].fa}</span>
                  </div>
                );
              })}
            </div>

            {/* Allowed Transitions Action Bar */}
            <div className="p-4 bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  عملیات مجاز طبق ماشین وضعیت (Legal State Transitions):
                </span>
                <span className="text-[10px] font-tech text-stone-500">
                  محدودشده به قوانین صریح دامنه هیراد
                </span>
              </div>

              {allowedTransitions.length === 0 ? (
                <p className="text-xs text-stone-500">
                  سفارش در وضعیت نهایی (پایان‌یافته یا ابطال‌شده) قرار دارد و تغییر وضعیت دیگری مجاز نیست.
                </p>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="شرح یا صورت‌جلسه تغییر وضعیت (اختیاری)..."
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    className="w-full bg-white border border-stone-300 px-3 py-1.5 text-xs focus:outline-none focus:border-stone-900"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {allowedTransitions.map((target) => (
                      <button
                        key={target}
                        onClick={() => handleStatusChange(target)}
                        className="px-3.5 py-2 bg-white border border-stone-400 hover:border-stone-900 text-stone-800 hover:bg-stone-900 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                        <span>انتقال به: «{ORDER_STATUS_LABELS[target].fa}»</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frozen Order Line Snapshots (Immutable Audit Proof) */}
          <div className="bg-white border border-[#e5e4de] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  اسنپ‌شات‌های ثبت‌شده اقلام سفارش (Immutable Order Line Snapshots)
                </h3>
              </div>
              <span className="text-[10px] font-tech text-stone-500 bg-stone-100 px-2 py-0.5">
                مستقل از تغییرات کاتالوگ در آینده
              </span>
            </div>

            <div className="space-y-3">
              {selectedOrder.items.map((snap) => (
                <div key={snap.id} className="p-4 border border-stone-200 bg-stone-50/50 flex gap-3 text-xs">
                  <img
                    src={snap.imageUrlSnapshot}
                    alt=""
                    className="w-16 h-16 object-cover border border-stone-300 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-tech text-stone-400 text-[10px]">{snap.skuSnapshot}</span>
                      <span className="font-tech text-stone-900 font-bold">
                        {PricingEngine.formatRial(snap.finalLineTotal.amount, 'TOMAN')}
                      </span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-xs">{snap.productTitleSnapshot}</h4>
                    <span className="text-stone-600 text-[11px] block">{snap.variantTitleSnapshot}</span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-tech text-stone-500 border-t border-stone-200">
                      <div>بهای واحد: {PricingEngine.formatRial(snap.unitPriceSnapshot.amount, 'TOMAN')}</div>
                      <div>تعداد: {snap.quantity} واحد</div>
                      <div>مالیات ۱۰٪: {PricingEngine.formatRial(snap.taxAmountSnapshot.amount, 'TOMAN')}</div>
                      <div>تخفیف: {PricingEngine.formatRial(snap.discountAmountSnapshot.amount, 'TOMAN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail & History */}
          <div className="bg-white border border-[#e5e4de] p-6 space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>لاگ تاریخچه و حسابرسی تغییرات (Audit Trail):</span>
            </h3>
            <div className="border-r-2 border-stone-300 pr-4 space-y-3 text-xs">
              {selectedOrder.statusHistory.map((h, i) => (
                <div key={i} className="relative">
                  <span className="w-2 h-2 rounded-full bg-stone-800 absolute -right-[21px] top-1.5" />
                  <div className="flex items-baseline justify-between font-tech">
                    <span className="font-bold text-stone-900">{ORDER_STATUS_LABELS[h.status].fa}</span>
                    <span className="text-[10px] text-stone-400">{new Date(h.timestamp).toLocaleString('fa-IR')}</span>
                  </div>
                  <p className="text-stone-600 mt-0.5">{h.note}</p>
                  <span className="text-[10px] text-stone-400">توسط: {h.actor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Official Invoice Details (ماده ۱۶۹) & Financial Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Official Invoice Summary Box */}
          <div className="bg-white border border-[#e5e4de] p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                فاکتور رسمی ماده ۱۶۹
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-tech px-2 py-0.5">
                ثبت سامانه مؤدیان
              </span>
            </div>

            {selectedOrder.officialCompanyDetails ? (
              <div className="space-y-2 text-stone-600 font-tech">
                <div>
                  <span className="text-stone-400 block text-[10px]">خریدار حقوقی:</span>
                  <span className="font-bold text-stone-900">{selectedOrder.officialCompanyDetails.companyName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">شناسه ملی شرکتی:</span>
                  <span>{selectedOrder.officialCompanyDetails.nationalId}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">کد اقتصادی مالیاتی:</span>
                  <span>{selectedOrder.officialCompanyDetails.economicCode}</span>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 text-[11px]">فاکتور با هویت حقیقی صادر گردیده است.</p>
            )}

            <div className="border-t border-stone-200 pt-3 space-y-1.5 font-tech">
              <div className="flex justify-between">
                <span className="text-stone-500">جمع ناخالص کالا:</span>
                <span>{PricingEngine.formatRial(selectedOrder.pricing.subtotal.amount, 'TOMAN')}</span>
              </div>
              {selectedOrder.pricing.discountTotal.amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>کسر تخفیف همکاری:</span>
                  <span>- {PricingEngine.formatRial(selectedOrder.pricing.discountTotal.amount, 'TOMAN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">مالیات بر ارزش افزوده ۱۰٪:</span>
                <span>+ {PricingEngine.formatRial(selectedOrder.pricing.taxTotal.amount, 'TOMAN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">ناوگان حمل White-Glove:</span>
                <span>+ {PricingEngine.formatRial(selectedOrder.pricing.shippingCost.amount, 'TOMAN')}</span>
              </div>
              <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline font-bold text-sm text-stone-950">
                <span>مبلغ نهایی تسویه‌شده:</span>
                <span>{PricingEngine.formatRial(selectedOrder.pricing.grandTotal.amount, 'TOMAN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Rigging Notes */}
          <div className="bg-white border border-[#e5e4de] p-5 space-y-2 text-xs">
            <span className="font-bold text-stone-900 block border-b border-stone-200 pb-2">
              نشانی و اطلاعات کارگاه پروژه:
            </span>
            <p className="text-stone-700 leading-relaxed">
              {selectedOrder.shippingAddress.province}، {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.streetAddress}
            </p>
            <div className="pt-2 text-[11px] font-tech text-stone-500 space-y-1">
              <div>کد پستی: {selectedOrder.shippingAddress.postalCode}</div>
              <div>تحویل‌گیرنده: {selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})</div>
              {selectedOrder.shippingAddress.architecturalNotes && (
                <div className="p-2 bg-amber-50 text-amber-900 mt-2">
                  ملاحظات جرثقیل: {selectedOrder.shippingAddress.architecturalNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
