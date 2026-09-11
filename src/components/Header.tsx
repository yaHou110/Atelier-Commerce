/**
 * HIRAD COMMERCE — HEADER & TOP NAVIGATION
 * Editorial navigation with brand wordmark, role switcher (RBAC test), search, and cart trigger.
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Layers, 
  ShieldCheck, 
  BookOpen, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types/domain';
import { commerceService } from '../services/commerce-service';
import { PricingEngine } from '../domain/pricing-engine';

interface HeaderProps {
  currentTab: 'storefront' | 'orders' | 'ledger' | 'admin' | 'enterprise' | 'tests';
  onSelectTab: (tab: 'storefront' | 'orders' | 'ledger' | 'admin' | 'enterprise' | 'tests') => void;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const ROLES: Array<{ role: UserRole; label: string }> = [
  { role: 'SUPER_ADMIN', label: 'مدیر ارشد (Super Admin)' },
  { role: 'ARCHITECT_CATALOG_MANAGER', label: 'مدیر آتلیه و کاتالوگ' },
  { role: 'FINANCE_AUDITOR', label: 'حسابرس مالی و لجر' },
  { role: 'WAREHOUSE_CONTROLLER', label: 'مسئول انبار شمس‌آباد' },
  { role: 'CUSTOMER', label: 'معمار / خریدار پروژه' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenCart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = commerceService.getCurrentUser();
  const cart = commerceService.getCart();
  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const evaluation = commerceService.getCartEvaluation();

  return (
    <header className="sticky top-0 z-40 bg-[#f9f9f7]/95 backdrop-blur-md border-b border-[#e5e4de]">
      {/* Top Utility Bar: RBAC Role Switcher & System Assurance */}
      <div className="border-b border-[#e5e4de] bg-[#f1f0eb] px-4 py-1.5 text-xs text-[#57534e]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-tech text-[11px] uppercase tracking-wider text-[#78716c] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
              سیستم بازرگانی فعال: هسته Tier A + لجر دوطرفه + ماده ۱۶۹
            </span>
            <span className="hidden sm:inline text-stone-300">|</span>
            <span className="hidden sm:inline font-sans text-stone-500">
              ارزش افزوده ۱۰٪ قانونی • مالیات ریالی قطعی
            </span>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[11px] font-medium text-stone-600">نقش کاربر فعال:</span>
            <select
              value={currentUser.role}
              onChange={(e) => commerceService.switchUserRole(e.target.value as UserRole)}
              className="bg-white border border-[#d6d3d1] text-[11px] font-medium text-stone-800 px-2 py-0.5 focus:outline-none focus:border-stone-900"
            >
              {ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div 
          onClick={() => onSelectTab('storefront')}
          className="cursor-pointer flex flex-col items-start group"
        >
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-[#1a1c1b] uppercase font-bold">
              HIRAD
            </span>
            <span className="font-sans text-xs tracking-wider text-[#78716c] font-light border-r border-[#d6d3d1] pr-2 mr-2">
              هـیـراد • آتلیه و بازرگانی معماری
            </span>
          </div>
          <span className="text-[9px] font-tech tracking-[0.2em] text-[#a8a29e] uppercase">
            EST. 1403 • LUXURY ARCHITECTURAL COMMERCE
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            placeholder="جستجوی متریال، سنگ دهبید، لولا پیوت، کد فنی SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#e5e4de] px-3.5 py-2 pl-10 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Actions & Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Concurrency & Verification Suite Button */}
          <button
            onClick={() => onSelectTab('tests')}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 border transition-all ${
              currentTab === 'tests'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-[#e5e4de] hover:border-stone-900'
            }`}
            title="آزمون‌های همزمانی، ایندمپوتنسی و صحت سیستم"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>آزمون‌های کنترلی (۱۲ اصل)</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#1a1c1b] text-white px-3.5 py-2 text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">سبد سفارش</span>
            {cartItemCount > 0 && (
              <span className="bg-amber-500 text-stone-950 text-[11px] font-tech font-bold px-1.5 py-0.2">
                {cartItemCount}
              </span>
            )}
            {evaluation.grandTotal.amount > 0 && (
              <span className="hidden lg:inline border-r border-stone-700 pr-2 mr-1 font-tech text-[11px] text-amber-200">
                {PricingEngine.formatRial(evaluation.grandTotal.amount, 'TOMAN')}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:bg-stone-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="border-t border-[#e5e4de] bg-[#f9f9f7] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center text-xs font-medium whitespace-nowrap">
            <button
              onClick={() => onSelectTab('storefront')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                currentTab === 'storefront'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              کاتالوگ و آتلیه معماری
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                currentTab === 'orders'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              ماشین وضعیت سفارشات ({commerceService.getOrders().length})
            </button>

            <button
              onClick={() => onSelectTab('ledger')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                currentTab === 'ledger'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              دفترکل مالی تغییرناپذیر (Ledger)
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                currentTab === 'admin'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              مدیریت انبار و قفل خوش‌بینانه
            </button>

            <button
              onClick={() => onSelectTab('enterprise')}
              className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                currentTab === 'enterprise'
                  ? 'border-amber-600 text-amber-900 font-semibold'
                  : 'border-transparent text-amber-700 hover:text-amber-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>پلتفرم سازمانی (Tier C)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-tech">
                Enterprise
              </span>
            </button>
          </div>

          {/* Reset Demo Button */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => {
                if (confirm('آیا مایلید وضعیت سیستم را به نمونه استاندارد اولیه بازنشانی کنید؟')) {
                  commerceService.resetToInitialDemo();
                }
              }}
              className="text-[11px] text-stone-500 hover:text-rose-700 flex items-center gap-1 px-2 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              بازنشانی پایگاه نمونه
            </button>
          </div>
        </div>
      </nav>

      {/* Category Pills (Visible when in storefront) */}
      {currentTab === 'storefront' && (
        <div className="border-t border-[#e5e4de] bg-[#f4f3ef] px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-stone-400 text-[11px] font-tech pl-2">دسته‌بندی:</span>
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3 py-1 text-xs transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white text-stone-700 border border-[#e5e4de] hover:border-stone-400'
              }`}
            >
              تمام آثار و متریال‌ها
            </button>
            <button
              onClick={() => onSelectCategory('bespoke-stone')}
              className={`px-3 py-1 text-xs transition-colors ${
                selectedCategory === 'bespoke-stone'
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white text-stone-700 border border-[#e5e4de] hover:border-stone-400'
              }`}
            >
              سنگ‌های یکپارچه و کانترهای فرم‌تراش
            </button>
            <button
              onClick={() => onSelectCategory('architectural-hardware')}
              className={`px-3 py-1 text-xs transition-colors ${
                selectedCategory === 'architectural-hardware'
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white text-stone-700 border border-[#e5e4de] hover:border-stone-400'
              }`}
            >
              یراق‌آلات سازه‌ای و لولاهای سنگین پیوت
            </button>
            <button
              onClick={() => onSelectCategory('luminaire-monoliths')}
              className={`px-3 py-1 text-xs transition-colors ${
                selectedCategory === 'luminaire-monoliths'
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-white text-stone-700 border border-[#e5e4de] hover:border-stone-400'
              }`}
            >
              لومینایرهای برنز و روشنایی‌های تندیس‌گون
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e5e4de] bg-white p-4 space-y-3">
          <input
            type="text"
            placeholder="جستجو در متریال‌ها..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-stone-50 border border-[#e5e4de] px-3 py-2 text-xs"
          />
          <div className="flex flex-col gap-2 pt-2 border-t border-stone-200 text-xs">
            <button
              onClick={() => {
                onSelectTab('tests');
                setMobileMenuOpen(false);
              }}
              className="text-right py-1.5 font-medium text-emerald-800"
            >
              ✓ آزمون‌های صحت ۱۲ لایه کنترلی
            </button>
            <button
              onClick={() => {
                onSelectTab('enterprise');
                setMobileMenuOpen(false);
              }}
              className="text-right py-1.5 font-medium text-amber-800"
            >
              ✦ پیش‌نمایش قابلیت‌های سازمانی (Tier C)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
