/**
 * HIRAD COMMERCE — PRODUCT CARD
 * Architectural layout with technical metadata, lead time, and precise pricing.
 */

import React from 'react';
import { Product } from '../types/domain';
import { PricingEngine } from '../domain/pricing-engine';
import { Layers, ArrowLeft, Clock, Shield } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
}) => {
  const primaryVariant = product.variants[0];
  const totalStock = product.variants.reduce((acc, v) => acc + v.inventory.available, 0);

  return (
    <div className="group bg-white border border-[#e5e4de] flex flex-col justify-between transition-all duration-300 hover:border-stone-800 hover:shadow-lg">
      {/* Image & Badges */}
      <div 
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 bg-stone-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex justify-between items-start pointer-events-none">
          <span className="bg-stone-900/90 text-stone-100 text-[10px] font-tech uppercase tracking-wider px-2 py-1">
            {product.subCategory}
          </span>
          {totalStock > 0 ? (
            <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-tech px-2 py-0.5 border border-emerald-700/50">
              {totalStock} قطعه آماده تخصیص
            </span>
          ) : (
            <span className="bg-amber-950/80 text-amber-300 text-[10px] font-tech px-2 py-0.5 border border-amber-700/50">
              سفارش‌ساخت آتلیه‌ای
            </span>
          )}
        </div>

        {/* Architectural Series Stamp */}
        <div className="absolute bottom-2 right-2 bg-stone-950/70 text-stone-300 text-[10px] font-sans px-2 py-0.5 backdrop-blur-xs">
          {product.architecturalSeries}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Latin Title & SKU prefix */}
          <div className="flex items-center justify-between text-[11px] font-tech text-stone-400 mb-1">
            <span>{product.latinTitle}</span>
            <span>{primaryVariant?.sku.split('-').slice(0, 3).join('-')}</span>
          </div>

          {/* Main Title */}
          <h3 
            onClick={() => onSelect(product)}
            className="font-sans text-base font-bold text-[#1a1c1b] group-hover:text-amber-900 transition-colors cursor-pointer line-clamp-1"
          >
            {product.title}
          </h3>

          {/* Material Passport snippet */}
          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed font-light">
            {product.editorialNote}
          </p>

          {/* Technical Specs Tags */}
          <div className="mt-3.5 pt-3 border-t border-[#f1f0eb] flex flex-wrap gap-2 text-[10px] text-stone-600 font-tech">
            <span className="bg-stone-100 px-2 py-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-stone-500" />
              {product.materialPassport.origin.split(' ')[0]}
            </span>
            <span className="bg-stone-100 px-2 py-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-500" />
              دوره ساخت: {primaryVariant?.leadTimeDays} روز
            </span>
          </div>
        </div>

        {/* Footer: Price & CTA */}
        <div className="mt-5 pt-3.5 border-t border-[#e5e4de] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-tech block">بهای پایه کارشناسی</span>
            <span className="font-tech text-sm sm:text-base font-bold text-stone-900">
              {PricingEngine.formatRial(product.basePrice.amount, 'TOMAN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(product)}
              className="border border-[#d6d3d1] hover:border-stone-900 text-stone-800 text-xs px-3 py-1.5 font-medium transition-colors flex items-center gap-1"
            >
              <span>مشخصات فنی</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => onQuickAdd(product)}
              className="bg-stone-900 hover:bg-amber-900 text-white text-xs px-3 py-1.5 font-medium transition-colors"
            >
              افزودن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
