/**
 * HIRAD COMMERCE — AUTHORITATIVE TRANSACTIONAL CHECKOUT
 * Stepper workflow strictly enforcing:
 * - Address & Iranian National Code verification
 * - Shipping Tier selection
 * - Official Tax Invoice (ماده ۱۶۹ م.م)
 * - Payment Gateway simulation with Idempotency Key
 * - Frozen snapshot generation & double-entry ledger settlement
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  FileCheck, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Check, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { Address, Order, PaymentMethod, ShippingTier } from '../types/domain';
import { commerceService } from '../services/commerce-service';
import { PricingEngine } from '../domain/pricing-engine';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const currentUser = commerceService.getCurrentUser();

  // Form State
  const [address, setAddress] = useState<Address>({
    id: `addr_${Date.now()}`,
    fullName: currentUser.name,
    phone: currentUser.phone,
    province: 'تهران',
    city: 'تهران',
    postalCode: '1985923145',
    nationalCode: '0019284751',
    streetAddress: 'زعفرانیه، خیابان آصف، مجتمع ساختمانی پلاک ۲۴، پروژه نیاوران',
    buildingUnit: 'طبقه ۴، واحد شرقی',
    architecturalNotes: 'نیاز به جرثقیل تاور برای انتقال کانتر سنگ دهبید به تراس واحد طبقه ۴',
  });

  const [shippingTier, setShippingTier] = useState<ShippingTier>('WHITE_GLOVE_ATELIER');
  const [officialInvoiceRequested, setOfficialInvoiceRequested] = useState(true);
  const [companyDetails, setCompanyDetails] = useState({
    companyName: 'مهندسان مشاور و معماری هیراد فردا',
    economicCode: '411549832145',
    nationalId: '14009876543',
    registrationNumber: '582914',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('SHAPARAK_ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [idempotencyKey] = useState(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  if (!isOpen) return null;

  // Shipping cost calculation based on tier
  const shippingCostAmount = 
    shippingTier === 'WHITE_GLOVE_ATELIER' ? 18_000_000 : // 1.8M Toman
    shippingTier === 'HEAVY_FREIGHT' ? 28_000_000 : // 2.8M Toman
    6_000_000; // Standard

  const evaluation = commerceService.getCartEvaluation(shippingCostAmount);

  const handleFinalSubmit = () => {
    setIsProcessing(true);

    try {
      // Simulate real bank/ledger transaction latency
      setTimeout(() => {
        const order = commerceService.executeCheckout({
          address,
          paymentMethod,
          shippingTier,
          shippingCost: shippingCostAmount,
          officialInvoiceRequested,
          officialCompanyDetails: officialInvoiceRequested ? companyDetails : undefined,
          idempotencyKey,
        });

        setIsProcessing(false);
        onOrderCompleted(order);
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      alert(`خطا در تسویه نهایی: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#f9f9f7] border border-stone-700 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#e5e4de] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700" />
            <div>
              <h2 className="text-base font-bold text-stone-900">تسویه حساب و صدور پیش‌فاکتور رسمی</h2>
              <span className="text-[10px] font-tech text-stone-400">
                شناسه یکتای ترانزکشن: {idempotencyKey}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="border-b border-[#e5e4de] bg-stone-100 flex text-xs font-medium">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${
              step === 1
                ? 'border-stone-900 bg-white text-stone-900 font-bold'
                : 'border-transparent text-stone-500'
            }`}
          >
            ۱. نشانی پروژه و تحویل
          </button>
          <button
            onClick={() => setStep(2)}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${
              step === 2
                ? 'border-stone-900 bg-white text-stone-900 font-bold'
                : 'border-transparent text-stone-500'
            }`}
          >
            ۲. فاکتور رسمی ماده ۱۶۹ و ناوگان
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${
              step === 3
                ? 'border-stone-900 bg-white text-stone-900 font-bold'
                : 'border-transparent text-stone-500'
            }`}
          >
            ۳. درگاه پرداخت و تسویه لجر
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Address & National Verification */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                مطابق دستورالعمل بازرگانی هیراد، ارسال قطعات معماری و سنگ‌های حجیم تنها با ثبت کد پستی ۱۰ رقمی و کدملی معتبر کارفرما امکان‌پذیر است.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">نام و نام خانوادگی تحویل‌گیرنده / ناظر پروژه</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">شماره همراه ناظر کارگاه</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs font-tech focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">کد ملی / شناسه هویتی معمار</label>
                  <input
                    type="text"
                    value={address.nationalCode}
                    onChange={(e) => setAddress({ ...address, nationalCode: e.target.value })}
                    className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs font-tech focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">کد پستی ۱۰ رقمی محل پروژه</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs font-tech focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">نشانی دقیق کارگاه یا ملک</label>
                <textarea
                  rows={2}
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">ملاحظات مهندسی و دسترسی جرثقیل / لیفتراک</label>
                <input
                  type="text"
                  value={address.architecturalNotes}
                  onChange={(e) => setAddress({ ...address, architecturalNotes: e.target.value })}
                  className="w-full bg-white border border-[#e5e4de] px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                  placeholder="مثال: عرض راه‌پله، دسترسی آسانسور باری، ساعت مجاز تخلیه مصالح..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Tier & Official Tax Invoice */}
          {step === 2 && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="block text-stone-800 font-bold mb-2">انتخاب شیوه ارسال و ناوگان لجستیک هیراد:</label>
                <div className="space-y-2">
                  <div
                    onClick={() => setShippingTier('WHITE_GLOVE_ATELIER')}
                    className={`p-3.5 border cursor-pointer flex items-center justify-between ${
                      shippingTier === 'WHITE_GLOVE_ATELIER'
                        ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                        : 'border-[#e5e4de] bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-amber-700" />
                      <div>
                        <span className="font-bold text-stone-900 block">حمل تخصصی White-Glove آتلیه هیراد (پیشنهادی)</span>
                        <span className="text-stone-500 text-[11px]">همراه با تکنسین نصب، پالت‌بندی چوبی ضدضربه و بیمه کامل سازه‌ای</span>
                      </div>
                    </div>
                    <span className="font-tech font-bold text-stone-900">۱,۸۰۰,۰۰۰ تومان</span>
                  </div>

                  <div
                    onClick={() => setShippingTier('HEAVY_FREIGHT')}
                    className={`p-3.5 border cursor-pointer flex items-center justify-between ${
                      shippingTier === 'HEAVY_FREIGHT'
                        ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                        : 'border-[#e5e4de] bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-stone-600" />
                      <div>
                        <span className="font-bold text-stone-900 block">باربری فوق‌سنگین کفی معدنی (جرثقیل‌دار)</span>
                        <span className="text-stone-500 text-[11px]">مخصوص اسلب‌های سنگ مرمر بالای ۱ تن و دهانه‌های سازه‌ای</span>
                      </div>
                    </div>
                    <span className="font-tech font-bold text-stone-900">۲,۸۰۰,۰۰۰ تومان</span>
                  </div>
                </div>
              </div>

              {/* Official Tax Invoice Section (ماده ۱۶۹) */}
              <div className="border-t border-[#e5e4de] pt-4">
                <div className="flex items-center justify-between bg-stone-100 p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-stone-800" />
                    <div>
                      <span className="font-bold text-stone-900 block">درخواست صدور فاکتور رسمی مالیاتی (سامانه مودیان)</span>
                      <span className="text-[10px] text-stone-500">منطبق بر ماده ۱۶۹ م.م و ثبت سیستمی در کارپوشه مؤدیان</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={officialInvoiceRequested}
                    onChange={(e) => setOfficialInvoiceRequested(e.target.checked)}
                    className="w-4 h-4 accent-stone-900"
                  />
                </div>

                {officialInvoiceRequested && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-[#e5e4de]">
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-1">نام رسمی شرکت / دفتر معماری</label>
                      <input
                        type="text"
                        value={companyDetails.companyName}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, companyName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-1">شناسه ملی شرکت (۱۱ رقمی)</label>
                      <input
                        type="text"
                        value={companyDetails.nationalId}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, nationalId: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-tech"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-1">کد اقتصادی (سامانه مالیاتی)</label>
                      <input
                        type="text"
                        value={companyDetails.economicCode}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, economicCode: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-tech"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 text-[11px] mb-1">شماره ثبت اداره شرکت‌ها</label>
                      <input
                        type="text"
                        value={companyDetails.registrationNumber}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, registrationNumber: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-tech"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Payment Gateway & Ledger Settlement Preview */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <label className="block text-stone-800 font-bold mb-1">درگاه و نحوه تسویه وجه:</label>
              <div className="space-y-2">
                <div
                  onClick={() => setPaymentMethod('SHAPARAK_ONLINE')}
                  className={`p-3.5 border cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'SHAPARAK_ONLINE'
                      ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                      : 'border-[#e5e4de] bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="font-bold text-stone-900 block">درگاه پرداخت الکترونیک شاپرک (سداد / سامان)</span>
                      <span className="text-stone-500 text-[11px]">پوشش سقف تراکنش کارت‌های بانکی عضو شبکه شتاب</span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-tech px-2 py-0.5">آنلاین مستقیم</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('ORGANIZATIONAL_CREDIT')}
                  className={`p-3.5 border cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'ORGANIZATIONAL_CREDIT'
                      ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                      : 'border-[#e5e4de] bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-amber-800" />
                    <div>
                      <span className="font-bold text-stone-900 block">اعتبار اسنادی ۳۰ روزه B2B (دفاتر معماری طرف قرارداد)</span>
                      <span className="text-stone-500 text-[11px]">ثبت در دفترکل بدون پرداخت آنی پس از تایید واحد مالی</span>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-tech px-2 py-0.5">خط اعتباری معماران</span>
                </div>
              </div>

              {/* Immutable Financial Breakdown Review */}
              <div className="p-4 bg-stone-900 text-stone-200 border border-stone-800 space-y-2 font-tech">
                <div className="text-stone-400 text-[10px] uppercase border-b border-stone-800 pb-1.5 flex justify-between">
                  <span>خلاصه آرتیکل مالی پیش از ثبت در لجر:</span>
                  <span className="text-emerald-400">DOUBLE-ENTRY RECONCILED</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">جمع ناخالص کالا:</span>
                  <span>{PricingEngine.formatRial(evaluation.subtotal.amount, 'TOMAN')}</span>
                </div>
                {evaluation.discountTotal.amount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>کسر تخفیف همکاری:</span>
                    <span>- {PricingEngine.formatRial(evaluation.discountTotal.amount, 'TOMAN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">مالیات بر ارزش افزوده ۱۰٪:</span>
                  <span>+ {PricingEngine.formatRial(evaluation.taxTotal.amount, 'TOMAN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">هزینه ناوگان لجستیک تخصصی:</span>
                  <span>+ {PricingEngine.formatRial(evaluation.shippingCost.amount, 'TOMAN')}</span>
                </div>
                <div className="border-t border-stone-800 pt-2 flex justify-between items-baseline font-bold text-amber-400 text-base">
                  <span>مبلغ قطعی تراکنش (Rial Ledger):</span>
                  <span>{PricingEngine.formatRial(evaluation.grandTotal.amount, 'TOMAN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-[#e5e4de] bg-white flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>مرحله قبل</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="px-5 py-2.5 bg-stone-900 hover:bg-amber-950 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <span>گام بعدی</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={isProcessing}
              onClick={handleFinalSubmit}
              className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
                isProcessing
                  ? 'bg-stone-400 text-white cursor-wait'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {isProcessing ? (
                <span>در حال ثبت تراکنش و اسنپ‌شات لجر...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأیید نهایی و ثبت قطعی در لجر</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
