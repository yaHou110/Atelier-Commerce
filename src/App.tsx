/**
 * HIRAD ATELIER & COMMERCE — MAIN APPLICATION ROOT
 * Architectural luxury commerce platform built to world-class engineering standards:
 * - Deterministic domain modeling (No floats, Rial integers)
 * - Immutable double-entry general ledger
 * - Finite state machine with audit history
 * - Optimistic locking and concurrency control
 * - Frozen order line pricing snapshots
 * - Persian architectural editorial aesthetic
 */

import React, { useState, useEffect } from 'react';
import { commerceService } from './services/commerce-service';
import { Product, Order } from './types/domain';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerView } from './components/OrderTrackerView';
import { FinancialLedgerView } from './components/FinancialLedgerView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { EnterpriseHubView } from './components/EnterpriseHubView';
import { ConcurrencyTestingModal } from './components/ConcurrencyTestingModal';
import { 
  Compass, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  FileText 
} from 'lucide-react';

export default function App() {
  // Reactive subscription to domain service singleton
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = commerceService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // UI Views State
  const [currentTab, setCurrentTab] = useState<'storefront' | 'orders' | 'ledger' | 'admin' | 'enterprise' | 'tests'>('storefront');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Catalog filtering
  const allProducts = commerceService.getProducts();
  const filteredProducts = allProducts.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesSearch = 
      p.title.toLowerCase().includes(q) ||
      p.latinTitle.toLowerCase().includes(q) ||
      p.editorialNote.toLowerCase().includes(q) ||
      p.architecturalSeries.toLowerCase().includes(q) ||
      p.variants.some((v) => v.sku.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleQuickAdd = (product: Product) => {
    const primaryVariant = product.variants[0];
    if (!primaryVariant) return;
    try {
      commerceService.addToCart(product.id, primaryVariant.id, 1);
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOrderCompleted = (order: Order) => {
    setIsCheckoutOpen(false);
    setCurrentTab('orders');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f9f9f7] text-[#1a1c1b] flex flex-col selection:bg-stone-800 selection:text-amber-100">
      {/* Header & Global Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* VIEW 1: STOREFRONT & ARCHITECTURAL CATALOG */}
        {currentTab === 'storefront' && (
          <div className="space-y-10 pb-16">
            {/* Curated Editorial Hero */}
            <section className="border-b border-[#e5e4de] bg-[#f1f0eb] relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-700" />
                    <span className="font-tech text-xs tracking-widest uppercase text-stone-600 font-bold">
                      THE MONOLITH & BESPOKE COLLECTION 1403
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-950 tracking-tight leading-tight">
                    پلتفرم بازرگانی و آتلیه معماری هیراد
                  </h1>
                  <p className="text-stone-700 text-xs sm:text-sm max-w-2xl leading-relaxed font-light">
                    خلق، سفارش‌سازی و زنجیره تأمین بدون واسطه قطعات سنگین سازه‌ای، کانترهای یکپارچه سنگ دهبید، یراق‌آلات پیوت و لومینایرهای تندیس‌گون. پیاده‌سازی‌شده بر پایه دقیق‌ترین اصول مهندسی نرم‌افزار، لجر مالی دوطرفه و انجماد اسنپ‌شات قطعی اقلام.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                    <button
                      onClick={() => setCurrentTab('tests')}
                      className="px-4 py-2.5 bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>مشاهده ۱۲ لایه اعتبارسنجی مهندسی</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('enterprise')}
                      className="px-4 py-2.5 border border-stone-400 hover:border-stone-900 bg-white text-stone-800 font-medium transition-colors"
                    >
                      مرکز قابلیت‌های سازمانی (Tier C)
                    </button>
                  </div>
                </div>

                {/* Technical Trust Card */}
                <div className="lg:col-span-4 bg-white border border-[#e5e4de] p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-tech text-xs text-stone-400 uppercase">SYSTEM ARCHITECTURE</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-tech px-2 py-0.5 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs font-tech text-stone-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>حسابداری ریالی بدون ممیز شناور (Integer Rials)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>دفترکل دوطرفه متوازن (Balanced Ledger)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>قفل خوش‌بینانه موجودی و کنترل نسخه (OCC)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>پوشش کامل الزامات فاکتور رسمی ماده ۱۶۹</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Catalog Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#e5e4de]">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">کاتالوگ منتخب آتلیه هیراد</h2>
                  <span className="text-xs text-stone-500 font-tech">
                    نمایش {filteredProducts.length} اثر معماری با کد شناسنامه فنی (Material Passport)
                  </span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#e5e4de] text-stone-500">
                  کالایی مطابق با جستجوی شما یافت نشد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={(p) => setSelectedProduct(p)}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: ORDER STATE MACHINE & AUDIT TRACKER */}
        {currentTab === 'orders' && (
          <OrderTrackerView onBackToStore={() => setCurrentTab('storefront')} />
        )}

        {/* VIEW 3: IMMUTABLE DOUBLE-ENTRY FINANCIAL LEDGER */}
        {currentTab === 'ledger' && <FinancialLedgerView />}

        {/* VIEW 4: ADMIN CONSOLE & OPTIMISTIC CONCURRENCY */}
        {currentTab === 'admin' && <AdminConsoleView />}

        {/* VIEW 5: ENTERPRISE & TIER C HUB */}
        {currentTab === 'enterprise' && <EnterpriseHubView />}

        {/* VIEW 6: CONCURRENCY & ARCHITECTURAL TESTS SUITE */}
        {currentTab === 'tests' && <ConcurrencyTestingModal />}
      </main>

      {/* MODAL 1: PRODUCT DETAIL MODAL (PDP) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(pId, vId, q) => {
            commerceService.addToCart(pId, vId, q);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* MODAL 2: CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* MODAL 3: TRANSACTIONAL CHECKOUT */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-[#e5e4de] bg-[#f1f0eb] text-stone-700 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <span className="font-serif text-lg font-bold text-stone-950 uppercase tracking-widest block">
              HIRAD
            </span>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              هیراد؛ آتلیه معماری، ریخته‌گری برنز و بازرگانی سنگ‌های یکپارچه لوکس ساختمانی.
            </p>
            <span className="text-[10px] font-tech text-stone-400 block pt-2">
              ENGINEERED MODULAR MONOLITH • TEHRAN, IRAN
            </span>
          </div>

          <div className="space-y-1.5 font-tech text-[11px]">
            <span className="font-bold text-stone-900 block font-sans text-xs mb-2">اطلاعات حقوقی و ثبت</span>
            <div>شرکت مهندسی و بازرگانی هیراد فردا (سهامی خاص)</div>
            <div>شناسه ملی: ۱۴۰۰۹۸۷۶۵۴۳ • کد اقتصادی: ۴۱۱۵۴۹۸۳۲۱۴۵</div>
            <div>ثبت‌شده در سامانه مؤدیان و مالیات بر ارزش افزوده</div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <span className="font-bold text-stone-900 block text-xs mb-2">کارگاه‌ها و انبارش</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>هاب مرکزی: شهرک صنعتی شمس‌آباد، بلوار نگارستان</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>آتلیه طراحی و شوروم: نیاوران، مجتمع نیاوران پالاس</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>ارتباط فنی پروژه‌ها: ۰۲۱-۲۲۸۰۹۱۰۰</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px] font-tech text-stone-600">
            <span className="font-bold text-stone-900 block font-sans text-xs mb-2">استانداردهای مهندسی پلتفرم</span>
            <p className="leading-relaxed">
              توسعه‌یافته با معماری Modular Monolith، دفترکل دوطرفه غیرقابل بازگشت، و تضمین عدم خطا در شرایط خرید پرسرعت همزمان.
            </p>
          </div>
        </div>

        <div className="border-t border-[#e5e4de] bg-[#ebeae4] px-4 py-3 text-center text-[10px] font-tech text-stone-500">
          © 1403 HIRAD ATELIER & COMMERCE PLATFORM • ALL RIGHTS RESERVED • COMPLIANT WITH IRANIAN TAX LAW ART. 169
        </div>
      </footer>
    </div>
  );
}
