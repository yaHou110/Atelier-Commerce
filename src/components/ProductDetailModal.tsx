/**
 * HIRAD COMMERCE — PRODUCT DETAIL MODAL (PDP)
 * Editorial architectural inspection with CAD Blueprint, Material Passport, and Variant Matrix.
 */

import React, { useState } from 'react';
import { Product, ProductVariant } from '../types/domain';
import { PricingEngine } from '../domain/pricing-engine';
import { commerceService } from '../services/commerce-service';
import { 
  X, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Compass, 
  Check, 
  Clock, 
  AlertCircle, 
  ShoppingBag,
  Maximize2
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cad' | 'passport'>('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [addedNotification, setAddedNotification] = useState(false);

  const selectedVariant: ProductVariant | undefined = 
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const inventoryRecord = selectedVariant ? commerceService.inventory.getRecord(selectedVariant.sku) : undefined;
  const isAvailable = (inventoryRecord?.available || 0) >= quantity;

  const handleAdd = () => {
    if (!selectedVariant || !isAvailable) return;
    try {
      onAddToCart(product.id, selectedVariant.id, quantity);
      setAddedNotification(true);
      setTimeout(() => setAddedNotification(false), 2500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#f9f9f7] border border-stone-700 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#e5e4de] px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="font-tech text-xs uppercase tracking-widest text-amber-900 font-bold bg-amber-50 px-2 py-0.5 border border-amber-200">
              {product.architecturalSeries}
            </span>
            <span className="text-stone-300">/</span>
            <span className="font-tech text-xs text-stone-500">{selectedVariant?.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Media & Gallery */}
          <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-l border-[#e5e4de] bg-stone-50 flex flex-col justify-between">
            <div>
              {/* Main Image Frame */}
              <div className="relative aspect-4/3 bg-stone-200 border border-stone-300 overflow-hidden">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 bg-stone-900/80 text-stone-200 text-[10px] font-tech px-2 py-1">
                  عکس مستند شماره {activeImageIndex + 1} از {product.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 border overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? 'border-stone-900 ring-1 ring-stone-900'
                        : 'border-stone-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Geological Origin Stamp */}
            <div className="mt-6 p-3.5 bg-white border border-[#e5e4de] text-xs font-sans">
              <div className="flex items-center gap-2 text-stone-800 font-semibold mb-1">
                <Compass className="w-4 h-4 text-amber-700" />
                <span>شناسنامه زمین‌شناسی و معدن</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                {product.materialPassport.origin} • تراکم فیزیکی: {product.materialPassport.density}
              </p>
            </div>
          </div>

          {/* Right Column: Specifications, Variants & Actions */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between">
            <div>
              {/* Tab Switcher: Overview / CAD Blueprint / Material Passport */}
              <div className="flex border-b border-[#e5e4de] text-xs mb-5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-stone-900 text-stone-900 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  نمای کلی و پیکربندی
                </button>
                <button
                  onClick={() => setActiveTab('cad')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'cad'
                      ? 'border-stone-900 text-stone-900 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  نقشه مهندسی CAD
                </button>
                <button
                  onClick={() => setActiveTab('passport')}
                  className={`pb-2 px-3 font-medium transition-colors border-b-2 flex items-center gap-1 ${
                    activeTab === 'passport'
                      ? 'border-stone-900 text-stone-900 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  پاسپورت اصالت ماده
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900">{product.title}</h2>
                    <p className="text-xs font-tech text-stone-400 mt-1">{product.latinTitle}</p>
                    <p className="text-xs text-stone-600 mt-3 leading-relaxed font-light">
                      {product.description}
                    </p>
                  </div>

                  {/* Variant Selection Matrix */}
                  <div className="border-t border-[#e5e4de] pt-4">
                    <label className="text-xs font-bold text-stone-800 block mb-2">
                      انتخاب تنوع سازه‌ای و پوشش نهایی (SKU Matrix):
                    </label>
                    <div className="space-y-2">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-3 border cursor-pointer transition-all flex items-center justify-between text-xs ${
                            selectedVariantId === v.id
                              ? 'border-stone-900 bg-white ring-1 ring-stone-900'
                              : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-stone-900 block">{v.title}</span>
                            <span className="text-[11px] font-tech text-stone-500">کد انبار: {v.sku}</span>
                          </div>
                          <div className="text-left font-tech">
                            <span className="font-bold text-stone-900 block">
                              {PricingEngine.formatRial(v.price.amount, 'TOMAN')}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              موجودی: {v.inventory.available} عدد
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions & Logistics */}
                  {selectedVariant?.dimensions && (
                    <div className="p-3 bg-stone-100 text-xs font-tech grid grid-cols-3 gap-2 text-stone-700">
                      <div>
                        <span className="text-stone-400 block text-[10px]">ابعاد (طول × عرض × ارتفاع)</span>
                        <span>
                          {selectedVariant.dimensions.length} × {selectedVariant.dimensions.width} × {selectedVariant.dimensions.height} mm
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">وزن سازه‌ای</span>
                        <span>{selectedVariant.dimensions.weight} کیلوگرم</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">مدت آماده‌سازی</span>
                        <span>{selectedVariant.leadTimeDays} روز کاری</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: CAD Blueprint */}
              {activeTab === 'cad' && (
                <div className="space-y-4">
                  <div className="bg-stone-900 text-stone-200 p-4 border border-stone-800 font-tech">
                    <div className="flex items-center justify-between border-b border-stone-700 pb-2 mb-3 text-xs">
                      <span className="text-amber-400">BLUEPRINT SCHEMATIC — REV 2.4</span>
                      <span className="text-stone-400">SCALE 1:20 (DIN A3)</span>
                    </div>

                    {/* Simulated CAD Vector Drawing */}
                    <div className="h-44 bg-stone-950 border border-stone-800 flex items-center justify-center relative p-4 bg-cad-grid">
                      <div className="border border-cyan-500/70 p-4 text-center w-3/4 relative">
                        <span className="text-[10px] text-cyan-400 block">
                          [ مقطع فنی: {selectedVariant?.title} ]
                        </span>
                        <div className="my-2 border-t border-dashed border-cyan-500/50" />
                        <span className="text-[9px] text-cyan-300/80">
                          تلورانس ماشین‌کاری CNC: ±۰.۲ میلی‌متر • زاویه برش فارسی ۴۵°
                        </span>
                        {/* Dimension annotations */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-950 px-1 text-[9px] text-amber-400">
                          {selectedVariant?.dimensions?.length || 2400} mm
                        </div>
                        <div className="absolute top-1/2 -right-3 -translate-y-1/2 bg-stone-950 px-1 text-[9px] text-amber-400">
                          {selectedVariant?.dimensions?.height || 900} mm
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-stone-400 space-y-1">
                      <p>✓ فایل وکتور ۲ بعدی DWG و مدل سه‌بعدی Rhino/Revit پس از ثبت سفارش در پورتال پروژه قرار می‌گیرد.</p>
                      <p>✓ تأییدیه پیش از ساخت توسط سرپرست مهندسی پروژه الزامی است.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Material Passport */}
              {activeTab === 'passport' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white border border-[#e5e4de] space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="font-bold text-stone-900">شماره شناسنامه متالوژی و سنگ</span>
                      <span className="font-tech text-amber-900 font-bold">
                        {product.materialPassport.certificationNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-stone-700">
                      <div>
                        <span className="text-stone-400 block text-[10px]">معدن و خاستگاه</span>
                        <span className="font-medium">{product.materialPassport.origin}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">پرداخت سطح</span>
                        <span className="font-medium">{product.materialPassport.finish}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">چگالی متریال</span>
                        <span className="font-tech">{product.materialPassport.density}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">رتبه مقاومت سازه‌ای</span>
                        <span className="font-medium text-emerald-800">
                          {product.materialPassport.durabilityGrade}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications List */}
                  <div className="border border-[#e5e4de] bg-stone-50 p-3">
                    <span className="font-bold text-stone-900 block mb-2 text-xs">مشخصات استاندارد مهندسی:</span>
                    <ul className="space-y-1.5 text-[11px] text-stone-600">
                      {product.specifications.map((s, idx) => (
                        <li key={idx} className="flex justify-between border-b border-stone-200 pb-1">
                          <span>{s.label}</span>
                          <span className="font-tech text-stone-900">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom: Pricing, Quantity & Add to Cart */}
            <div className="border-t border-[#e5e4de] pt-5 mt-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="text-xs text-stone-500 block font-tech">مبلغ نهایی تنوع (شامل ۱۰٪ ارزش افزوده قانونی):</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-tech text-stone-950">
                      {selectedVariant && PricingEngine.formatRial(selectedVariant.price.amount, 'TOMAN')}
                    </span>
                    <span className="text-xs text-stone-400 font-tech">
                      ({selectedVariant && PricingEngine.formatRial(selectedVariant.price.amount, 'RIAL')})
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center border border-stone-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-tech"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-tech font-bold text-stone-900 text-xs">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-100 font-tech"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  disabled={!isAvailable}
                  onClick={handleAdd}
                  className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isAvailable
                      ? 'bg-stone-900 hover:bg-amber-950 text-white'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAvailable ? 'افزودن به سبد سفارش پروژه' : 'تکمیل ظرفیت فعلی انبار'}</span>
                </button>
              </div>

              {/* Notification Banner */}
              {addedNotification && (
                <div className="mt-2.5 p-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>محصول با موفقیت به سبد سفارش اضافه شد.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
