/**
 * HIRAD COMMERCE — ADMIN CONSOLE & INVENTORY CONTROL
 * Demonstrates:
 * - High-density tabular inventory ledger
 * - Optimistic concurrency control (version mutations)
 * - Catalog price updates proving immutability of historical orders
 */

import React, { useState } from 'react';
import { 
  Boxes, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Edit3, 
  DollarSign, 
  Layers,
  Check
} from 'lucide-react';
import { commerceService } from '../services/commerce-service';
import { PricingEngine } from '../domain/pricing-engine';
import { SKU } from '../types/domain';

export const AdminConsoleView: React.FC = () => {
  const inventory = commerceService.inventory;
  const records = inventory.getAllRecords();
  const products = commerceService.getProducts();

  // Stock edit state
  const [editingSku, setEditingSku] = useState<SKU | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [targetVersion, setTargetVersion] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Price edit state for proof of immutable order snapshots
  const [editingProductId, setEditingProductId] = useState<string>(products[0]?.id || '');
  const [newPriceToman, setNewPriceToman] = useState<number>(45_000_000);
  const [priceUpdatedSuccess, setPriceUpdatedSuccess] = useState(false);

  const handleStockUpdate = (sku: SKU) => {
    try {
      inventory.adjustStock(sku, Number(newStockValue), targetVersion);
      setEditingSku(null);
      setStatusMessage({ text: `موجودی کالای ${sku} با موفقیت در پایگاه داده ثبت شد.`, isError: false });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ text: err.message, isError: true });
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rialAmount = newPriceToman * 10;
      commerceService.updateProductBasePrice(editingProductId, rialAmount);
      setPriceUpdatedSuccess(true);
      setTimeout(() => setPriceUpdatedSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e4de] pb-4">
        <div>
          <span className="font-tech text-xs uppercase tracking-widest text-stone-500 block">
            ADMINISTRATION & OPTIMISTIC CONCURRENCY LEDGER
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
            مدیریت انبار، کنترل نسخه‌ها و آزمون ثبات اسنپ‌شات
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-stone-900 text-white text-xs font-tech px-2.5 py-1">
            نقش فعال: {commerceService.getCurrentUser().role}
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3 border text-xs flex items-center gap-2 ${
          statusMessage.isError
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          {statusMessage.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Inventory Control Table */}
      <div className="bg-white border border-[#e5e4de] overflow-hidden">
        <div className="p-4 border-b border-[#e5e4de] bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-stone-800" />
            <h3 className="text-xs font-bold text-stone-900">دفتر انبار قطعات سازه‌ای و یراق‌آلات (قفل خوش‌بینانه فعال):</h3>
          </div>
          <span className="text-[11px] font-tech text-stone-500">
            الگوی Concurrency: Optimistic Locking with version validation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-100/70 border-b border-[#e5e4de] text-[11px] font-tech text-stone-600">
              <tr>
                <th className="p-3">کد کالا (SKU)</th>
                <th className="p-3">عنوان قطعه و مشخصات</th>
                <th className="p-3">موجودی فیزیکی (On-Hand)</th>
                <th className="p-3">رزرو فعال (Reserved)</th>
                <th className="p-3">موجودی آزاد فروش (Available)</th>
                <th className="p-3">نسخه لاگ (Version)</th>
                <th className="p-3">موقعیت انبار</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-tech">
              {records.map((r) => (
                <tr key={r.sku} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3 font-bold text-stone-900">{r.sku}</td>
                  <td className="p-3 font-sans text-xs text-stone-700">{r.title}</td>
                  <td className="p-3 font-bold">
                    {editingSku === r.sku ? (
                      <input
                        type="number"
                        value={newStockValue}
                        onChange={(e) => setNewStockValue(Number(e.target.value))}
                        className="w-16 bg-white border border-stone-400 px-1 py-0.5 text-xs text-center"
                      />
                    ) : (
                      r.onHand
                    )}
                  </td>
                  <td className="p-3 text-amber-800 font-bold">{r.reserved}</td>
                  <td className="p-3 text-emerald-800 font-bold">{r.available}</td>
                  <td className="p-3 text-stone-400">v{r.version}</td>
                  <td className="p-3 text-stone-500 text-[11px] font-sans">{r.warehouseLocation}</td>
                  <td className="p-3 text-center">
                    {editingSku === r.sku ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStockUpdate(r.sku)}
                          className="px-2 py-0.5 bg-emerald-800 text-white text-[10px] hover:bg-emerald-900"
                        >
                          تأیید
                        </button>
                        <button
                          onClick={() => setEditingSku(null)}
                          className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px]"
                        >
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingSku(r.sku);
                          setNewStockValue(r.onHand);
                          setTargetVersion(r.version);
                        }}
                        className="p-1 text-stone-500 hover:text-stone-900"
                        title="ویرایش موجودی"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Price Adjustment & Historical Snapshot Proof */}
      <div className="p-6 bg-white border border-[#e5e4de] space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <DollarSign className="w-5 h-5 text-amber-700" />
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              آزمون تغییر بهای کاتالوگ و حفظ تمامیت اسنپ‌شات‌های سفارشات قبلی (Price Snapshot Invariant)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 font-light">
              با تغییر قیمت زیر، قیمت کاتالوگ به‌روز می‌شود اما سفارشات ثبت‌شده در تب «ماشین وضعیت سفارشات» با قیمت منجمد قبلی باقی خواهند ماند.
            </p>
          </div>
        </div>

        <form onSubmit={handlePriceUpdate} className="flex flex-wrap items-end gap-3 text-xs">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-stone-700 font-medium mb-1">انتخاب محصول کاتالوگ:</label>
            <select
              value={editingProductId}
              onChange={(e) => setEditingProductId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — فعلی: {PricingEngine.formatRial(p.basePrice.amount, 'TOMAN')}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-stone-700 font-medium mb-1">قیمت جدید پایه (تومان):</label>
            <input
              type="number"
              value={newPriceToman}
              onChange={(e) => setNewPriceToman(Number(e.target.value))}
              className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs font-tech focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-stone-900 hover:bg-amber-950 text-white text-xs font-bold transition-colors"
          >
            به‌روزرسانی بهای کاتالوگ
          </button>
        </form>

        {priceUpdatedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>
              بهای کاتالوگ با موفقیت اصلاح شد. می‌توانید به تب «ماشین وضعیت سفارشات» رفته و ملاحظه فرمایید که قیمت فاکتورهای قبلی بدون کوچکترین تغییری حفظ شده است.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
