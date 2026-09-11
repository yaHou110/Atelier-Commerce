/**
 * HIRAD COMMERCE PLATFORM — CAPABILITY & FEATURE GATING
 * Enables zero-drift activation, deactivation, and enterprise preview of Tier C features.
 * When a feature is disabled or in 'preview', the core commerce engine functions completely uninhibited.
 */

export type FeatureState = 'active' | 'preview_only' | 'disabled';

export interface FeatureCapability {
  id: string;
  name: string;
  latinName: string;
  tier: 'TIER_A_CORE' | 'TIER_B_ADVANCED' | 'TIER_C_ENTERPRISE';
  state: FeatureState;
  badgeLabel: string;
  tagline: string;
  technicalDescription: string;
  architecturalCapabilities: string[];
}

export const FEATURES_CONFIG: Record<string, FeatureCapability> = {
  coreCommerce: {
    id: 'coreCommerce',
    name: 'هسته بازرگانی هیراد',
    latinName: 'Core Commerce Engine',
    tier: 'TIER_A_CORE',
    state: 'active',
    badgeLabel: 'عملیاتی — Tier A',
    tagline: 'موتور پردازش سفارش، کاتالوگ ابعاد و درگاه‌های یکپارچه شاپرک',
    technicalDescription: 'مدیریت قطعی سبد، صدور پیش‌فاکتور با ۱۰٪ ارزش افزوده، قفل خوش‌بینانه موجودی و اسنپ‌شات قیمت تاریخی.',
    architecturalCapabilities: [
      'Transactional Checkout Engine',
      'Authoritative Order Line Snapshots',
      'Optimistic Concurrency Inventory',
      'Immutable Double-Entry Ledger',
      'Iranian Tax Law (ماده ۱۶۹ م.م) Compliant',
    ],
  },
  multiVendorMarketplace: {
    id: 'multiVendorMarketplace',
    name: 'پلتفرم چندفروشندگی و تأمین‌کنندگان',
    latinName: 'Multi-Vendor Marketplace & Seller Hub',
    tier: 'TIER_C_ENTERPRISE',
    state: 'preview_only',
    badgeLabel: 'قابلیت سازمانی — Enterprise',
    tagline: 'پورتال یکپارچه کارگاه‌های ریخته‌گری، سنگ‌بری‌های معادن و تسویه‌حساب سهم سود',
    technicalDescription: 'تفکیک سفارش‌های فرعی (Sub-Orders)، پورتال مستقل کارگاه‌ها، کمیسیون خودکار و ماژول دفترکل تسویه متمرکز.',
    architecturalCapabilities: [
      'Sub-Order Routing per Workshop/Mine',
      'Automated Tiered Commission Calculation',
      'Seller Escrow & Settlement Scheduling',
      'Isolated Seller RBAC & Inventory Quarantine',
    ],
  },
  b2bNegotiatedRFQ: {
    id: 'b2bNegotiatedRFQ',
    name: 'پیش‌فاکتور پروژه‌ای و مناقصه B2B',
    latinName: 'B2B RFQ & Project Procurement',
    tier: 'TIER_C_ENTERPRISE',
    state: 'preview_only',
    badgeLabel: 'سازمانی و پروژه‌ای — Enterprise',
    tagline: 'گردش کار تأیید اعتبار اسنادی، صورت‌وضعیت مهندسی و تخفیف تیراژ پروژه‌های انبوه‌سازی',
    technicalDescription: 'ایجاد اسناد RFQ، صدور فاکتور رسمی تجمیعی با شناسه اقتصادی شرکتی، و تأیید اعتبارات ال‌سی (L/C) داخلی.',
    architecturalCapabilities: [
      'Multi-Level Architectural Approval Workflow',
      'Custom Milestone Payment Scheduling',
      'Bulk Bill of Quantities (BOQ) Import/Export',
      'Corporate Credit Line Auditing',
    ],
  },
  multiWarehouseLogistics: {
    id: 'multiWarehouseLogistics',
    name: 'لجستیک چندانباره و ناوگان اختصاصی',
    latinName: 'Multi-Warehouse & White-Glove Fleet',
    tier: 'TIER_C_ENTERPRISE',
    state: 'preview_only',
    badgeLabel: 'زنجیره تأمین کلان — Enterprise',
    tagline: 'انبارش تفکیکی متریال خام در معادن اصفهان و کارگاه مونتاژ شمس‌آباد با ره‌گیری لحظه‌ای',
    technicalDescription: 'مسیریابی هوشمند محموله‌های فوق‌سنگین، رزرو باربری تخصصی، و تخصیص هوشمند موجودی بر اساس نزدیک‌ترین هاب.',
    architecturalCapabilities: [
      'Geospatial Multi-Depot Inventory Allocation',
      'White-Glove Architectural Rigging & Installation Crew Booking',
      'Weight & Volumetric Freight Rate Calculation',
      'Damage Liability & Transit Insurance Traceability',
    ],
  },
  aiArchitecturalAdvisor: {
    id: 'aiArchitecturalAdvisor',
    name: 'دستیار هوش‌مصنوعی مشخصات فنی و تطابق متریال',
    latinName: 'AI Architectural Specification Advisor',
    tier: 'TIER_C_ENTERPRISE',
    state: 'preview_only',
    badgeLabel: 'هوش مصنوعی سازمانی — Gemini AI',
    tagline: 'تطابق استانداردهای سنگ و مقاومت سایشی، بررسی تلاقی یراق‌آلات با نقشه‌های فاز ۲',
    technicalDescription: 'استخراج خودکار جدول نازک‌کاری از فایل‌های نقشه و توصیه پوشش‌های مقاوم در برابر اقلیم‌های مرطوب یا خشک.',
    architecturalCapabilities: [
      'Material Compatibility Analysis',
      'Architectural Spec Sheet Q&A',
      'Climate Durability Grading Engine',
      'CAD Integration Blueprint Checking',
    ],
  },
};
