/**
 * HIRAD COMMERCE — ENTERPRISE & TIER C CAPABILITY HUB
 * Professional showcase of modular enterprise modules:
 * - Feature Gating status & Removability proof
 * - Marketplace & Workshop Settlement preview
 * - B2B RFQ & Project Procurement preview
 * - Multi-Warehouse Logistics routing
 * - AI Architectural Advisor preview
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Store, 
  FileSpreadsheet, 
  Warehouse, 
  Bot, 
  ShieldCheck, 
  Lock, 
  ChevronLeft, 
  Check, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { FEATURES_CONFIG, FeatureCapability } from '../config/features';

export const EnterpriseHubView: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('multiVendorMarketplace');
  const [rfqProjectName, setRfqProjectName] = useState('پروژه برج باغ نیاوران (۱۸ واحد لوکس)');
  const [rfqSuccess, setRfqSuccess] = useState(false);

  const activeCapability: FeatureCapability = FEATURES_CONFIG[selectedFeatureId] || FEATURES_CONFIG.multiVendorMarketplace;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Enterprise Header */}
      <div className="border-b border-[#e5e4de] pb-6">
        <div className="flex items-center gap-2 text-amber-700 text-xs font-tech font-bold uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4" />
          <span>TIER C — ENTERPRISE & SCALABILITY CAPABILITIES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          مرکز قابلیت‌های سازمانی، مارکت‌پلیس و B2B هیراد
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed font-light">
          این ماژول‌ها نمایانگر ظرفیت مقیاس‌پذیری پلتفرم بازرگانی هیراد هستند. به دلیل معماری ماژولار مبتنی بر Feature-Gating، کلیه این قابلیت‌ها بدون کمترین وابستگی و بدون ایجاد شکست در عملکرد هسته اصلی (Tier A)، قابلیت فعال‌سازی یا جداسازی کامل را دارا می‌باشند.
        </p>
      </div>

      {/* Feature Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(FEATURES_CONFIG).map((feat) => {
          const isSelected = selectedFeatureId === feat.id;
          return (
            <div
              key={feat.id}
              onClick={() => setSelectedFeatureId(feat.id)}
              className={`p-5 border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-stone-900 bg-white ring-2 ring-amber-500/50 shadow-md'
                  : 'border-[#e5e4de] bg-stone-50/70 hover:bg-white hover:border-stone-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-tech font-bold px-2 py-0.5 ${
                    feat.tier === 'TIER_A_CORE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {feat.badgeLabel}
                  </span>
                  {feat.state === 'preview_only' && (
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </div>

                <h3 className="font-bold text-sm text-stone-900 mt-1">{feat.name}</h3>
                <span className="text-[10px] font-tech text-stone-400 block mt-0.5">{feat.latinName}</span>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed font-light">
                  {feat.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-medium text-stone-800">
                <span>بررسی جزئیات معماری</span>
                <ChevronLeft className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Feature Showcase Container */}
      <div className="bg-white border border-[#e5e4de] p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-tech text-xs bg-stone-900 text-white px-2 py-0.5">
                {activeCapability.latinName}
              </span>
              <span className="text-stone-400 text-xs">|</span>
              <span className="text-xs text-amber-800 font-tech font-semibold">
                وضعیت: {activeCapability.state === 'active' ? 'عملیاتی در هسته فعلی' : 'پیش‌نمایش تعاملی معماری (Zero-Drift)'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">{activeCapability.name}</h2>
          </div>

          <div className="bg-stone-50 border border-stone-300 px-3 py-1.5 text-xs text-stone-600 font-tech">
            قابلیت جداسازی بدون شکست کدهای کلاینت و سرور (Removable Module)
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-4xl">
          {activeCapability.technicalDescription}
        </p>

        {/* Architectural Checklist */}
        <div className="p-4 bg-stone-50 border border-stone-200">
          <span className="font-tech text-xs font-bold text-stone-800 block mb-2">
            مؤلفه‌ها و پروتکل‌های معماری این زیرسیستم (Architectural Specifications):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech text-stone-700">
            {activeCapability.architecturalCapabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 bg-white p-2 border border-stone-200">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Interactive Showcase Modules */}

        {/* 1. Marketplace Preview */}
        {selectedFeatureId === 'multiVendorMarketplace' && (
          <div className="space-y-4 border-t border-stone-200 pt-5 text-xs">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-700" />
              <span>پیش‌نمایش پورتال کارگاه‌های ریخته‌گری و معادن سنگ (Seller Settlement Ledger):</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-tech">
              <div className="p-4 border border-stone-300 bg-stone-50 space-y-1">
                <span className="text-stone-500 text-[11px]">کارگاه همکار ۱: معادن سنگ دهبید شایان</span>
                <span className="text-base font-bold text-stone-900 block">۸۴۰,۰۰۰,۰۰۰ تومان</span>
                <span className="text-[10px] text-emerald-700 block">تسویه شنبه هر هفته • کارمزد پلتفرم ۸٪</span>
              </div>
              <div className="p-4 border border-stone-300 bg-stone-50 space-y-1">
                <span className="text-stone-500 text-[11px]">کارگاه همکار ۲: ریخته‌گری برنز و آلیاژ شمس‌آباد</span>
                <span className="text-base font-bold text-stone-900 block">۲۹۵,۰۰۰,۰۰۰ تومان</span>
                <span className="text-[10px] text-emerald-700 block">تسویه ماهانه • کارمزد پلتفرم ۱۰٪</span>
              </div>
              <div className="p-4 border border-stone-300 bg-stone-50 space-y-1">
                <span className="text-stone-500 text-[11px]">کارگاه همکار ۳: آتلیه برش و CNC ماکو</span>
                <span className="text-base font-bold text-stone-900 block">۱۸۵,۰۰۰,۰۰۰ تومان</span>
                <span className="text-[10px] text-emerald-700 block">در انتظار تحویل بارنامه</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. B2B RFQ Generator */}
        {selectedFeatureId === 'b2bNegotiatedRFQ' && (
          <div className="space-y-4 border-t border-stone-200 pt-5 text-xs">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              <span>شبیه‌ساز گردش کار درخواست پیش‌فاکتور پروژه‌ای (Project RFQ Flow):</span>
            </h4>

            <div className="p-4 bg-stone-50 border border-stone-300 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">عنوان پروژه معماری:</label>
                  <input
                    type="text"
                    value={rfqProjectName}
                    onChange={(e) => setRfqProjectName(e.target.value)}
                    className="w-full bg-white border border-stone-300 px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">تیراژ تقریبی متریال سنگی و یراق:</label>
                  <input
                    type="text"
                    defaultValue="۲۴ ست کامل لولا پیوت سنگین + ۱۲ کانتر سنگی یکپارچه"
                    className="w-full bg-white border border-stone-300 px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500 font-tech">
                  درخواست تخفیف سازمانی بر اساس جدول تیراژ و تأییدیه حسابداری پروژه‌ای
                </span>
                <button
                  onClick={() => {
                    setRfqSuccess(true);
                    setTimeout(() => setRfqSuccess(false), 4000);
                  }}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold hover:bg-amber-950 transition-colors"
                >
                  ثبت سند RFQ در دبیرخانه فنی
                </button>
              </div>

              {rfqSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>
                    سند استعلام قیمت پروژه «{rfqProjectName}» با شناسه RFQ-1403-918 ثبت گردید و جهت کارشناسی فنی و تخصیص سقف اعتبار اسنادی ارجاع شد.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Multi-Warehouse Logistics */}
        {selectedFeatureId === 'multiWarehouseLogistics' && (
          <div className="space-y-4 border-t border-stone-200 pt-5 text-xs">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-amber-700" />
              <span>هاب‌های لجستیک و انبارش سنگ‌های سازه‌ای:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-tech">
              <div className="p-4 border border-stone-300 bg-stone-50 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-stone-900">انبار مرکزی شمس‌آباد (تهران)</span>
                  <span className="text-emerald-700 font-bold">هاب ۱ (تحویل فوری)</span>
                </div>
                <p className="text-[11px] text-stone-600 font-sans">
                  مجهز به تاورکرین سقفی ۲۰ تن، خط بسته‌بندی پالت‌های پلیمری ضدشوک، و دپوی یراق‌آلات پیوت و لومینایرها.
                </p>
                <div className="text-[10px] text-stone-400">موجودی فعال: ۴۱ قلم کالا • ناوگان مستقر: ۳ دستگاه کفی جرثقیل‌دار</div>
              </div>

              <div className="p-4 border border-stone-300 bg-stone-50 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-stone-900">دپوی معدنی دهبید (شیراز)</span>
                  <span className="text-amber-800 font-bold">هاب ۲ (تراش مستقیم بلوک)</span>
                </div>
                <p className="text-[11px] text-stone-600 font-sans">
                  انبارش اسلب‌های بوک‌مچ و فورمچ با ضخامت‌های سفارشی تا ۶۰ میلی‌متر، مستقیماً از دل معدن به پروژه.
                </p>
                <div className="text-[10px] text-stone-400">موجودی فعال: ۶۵۰ تن اسلب سنگ خام • زمان بارگیری: ۷۲ ساعت</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. AI Advisor */}
        {selectedFeatureId === 'aiArchitecturalAdvisor' && (
          <div className="space-y-4 border-t border-stone-200 pt-5 text-xs">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-700" />
              <span>هوش مصنوعی تطابق متریال و تحلیل اقلیمی:</span>
            </h4>

            <div className="p-4 bg-stone-900 text-stone-200 font-tech space-y-3 border border-stone-800">
              <div className="flex justify-between text-stone-400 text-[10px] border-b border-stone-800 pb-1">
                <span>GEMINI ARCHITECTURAL SPECIFICATION ENGINE</span>
                <span className="text-amber-400">PROPRIETARY PROMPT PIPELINE</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                «در طراحی ویلای لواسان، استفاده از سنگ مرمر دودی دهبید در فضای باز به دلیل چرخه انجماد و ذوب (Freeze-Thaw) توصیه نمی‌شود؛ در ازای آن، سنگ بازالت آذرین ماکو با جذب آب کمتر از ۰.۲٪ و پوشش نانو سیلیکونی بالاترین دوام سازه‌ای را به همراه دارد.»
              </p>
              <div className="text-[10px] text-stone-400 flex items-center gap-2 pt-1 border-t border-stone-800">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>بررسی استانداردهای ASTM C503 و DIN 18251 به‌صورت بی‌درنگ انجام شد.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
