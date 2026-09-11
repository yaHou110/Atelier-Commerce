/**
 * HIRAD COMMERCE — CART DRAWER
 * Authoritative cart summary with real pricing snapshots, coupon validation, and VAT 10%.
 */

import React, { useState } from 'react';
import { X, Trash2, Tag, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { commerceService } from '../services/commerce-service';
import { PricingEngine } from '../domain/pricing-engine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const cart = commerceService.getCart();
  const evaluation = commerceService.getCartEvaluation();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    commerceService.applyCouponToCart(couponInput.trim());
    const newEval = commerceService.getCartEvaluation();
    if (newEval.discountTotal.amount > 0) {
      setCouponSuccess('کد تخفیف با موفقیت اعمال گردید.');
    } else {
      setCouponError('کد تخفیف واردشده نامعتبر است یا حداقل مبلغ سفارش رعایت نشده است.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#f9f9f7] border-r border-[#e5e4de] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#e5e4de] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-base font-bold text-stone-900">سبد سفارش و پیش‌فاکتور</h2>
              <span className="bg-stone-100 text-stone-600 text-xs font-tech px-2 py-0.5">
                {cart.items.reduce((s, i) => s + i.quantity, 0)} کالا
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-900 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {evaluation.snapshots.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-stone-500">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-sm font-medium">سبد سفارش پروژه شما خالی است.</p>
                <p className="text-xs text-stone-400 mt-1">
                  از میان آثار و متریال‌های کاتالوگ، گزینه‌های مدنظر را اضافه فرمایید.
                </p>
              </div>
            ) : (
              evaluation.snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3.5 bg-white border border-[#e5e4de] flex gap-3 text-xs"
                >
                  <img
                    src={snap.imageUrlSnapshot}
                    alt={snap.productTitleSnapshot}
                    className="w-16 h-16 object-cover border border-stone-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-tech text-[10px] text-stone-400">{snap.skuSnapshot}</span>
                        <button
                          onClick={() => commerceService.removeFromCart(snap.variantId)}
                          className="text-stone-400 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-stone-900 line-clamp-1 mt-0.5">
                        {snap.productTitleSnapshot}
                      </h4>
                      <span className="text-[11px] text-stone-600 font-light block">
                        {snap.variantTitleSnapshot}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-300 bg-stone-50 text-[11px] font-tech">
                        <button
                          onClick={() => commerceService.updateCartItemQuantity(snap.variantId, snap.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold">{snap.quantity}</span>
                        <button
                          onClick={() => commerceService.updateCartItemQuantity(snap.variantId, snap.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-left font-tech">
                        <span className="font-bold text-stone-900">
                          {PricingEngine.formatRial(snap.finalLineTotal.amount, 'TOMAN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Coupon Code Box */}
            {evaluation.snapshots.length > 0 && (
              <div className="p-4 bg-white border border-[#e5e4de] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>کد تخفیف همکاری معماری یا پروژه</span>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: HIRAD-ARCH-1403 یا ATELIER-VIP"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs font-tech uppercase placeholder:normal-case placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
                  />
                  <button
                    type="submit"
                    className="bg-stone-900 text-white px-3 py-1.5 font-medium hover:bg-stone-800 text-xs"
                  >
                    اعمال
                  </button>
                </form>
                {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-700">{couponSuccess}</p>}
              </div>
            )}
          </div>

          {/* Drawer Footer: Totals & Checkout Trigger */}
          {evaluation.snapshots.length > 0 && (
            <div className="p-5 border-t border-[#e5e4de] bg-white space-y-3 text-xs">
              {/* Calculation Ledger */}
              <div className="space-y-1.5 text-stone-600 font-tech">
                <div className="flex justify-between">
                  <span>مجموع ناخالص کالاها:</span>
                  <span>{PricingEngine.formatRial(evaluation.subtotal.amount, 'TOMAN')}</span>
                </div>
                {evaluation.discountTotal.amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>تخفیف و تسهیلات همکار:</span>
                    <span>- {PricingEngine.formatRial(evaluation.discountTotal.amount, 'TOMAN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>مالیات بر ارزش افزوده (۱۰٪ قانون مالیات):</span>
                  </span>
                  <span>+ {PricingEngine.formatRial(evaluation.taxTotal.amount, 'TOMAN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-tech">
                <span className="text-sm font-bold text-stone-900 font-sans">مبلغ قابل تسویه پیش‌فاکتور:</span>
                <span className="text-lg font-bold text-stone-950">
                  {PricingEngine.formatRial(evaluation.grandTotal.amount, 'TOMAN')}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-stone-900 hover:bg-amber-950 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span>ورود به مرحله صدور پیش‌فاکتور و تسویه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 text-center font-tech">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>گارانتی عدم تغییر قیمت پس از صدور سفارش (Order Line Snapshot)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
