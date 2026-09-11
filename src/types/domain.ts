/**
 * HIRAD ATELIER & COMMERCE — DOMAIN VALUE OBJECTS & CORE TYPES
 * Production-grade domain models strictly enforcing:
 * - Integer Rial representation (no floating point)
 * - Order line price snapshots
 * - Multi-state inventory
 * - Immutable financial ledger
 * - RBAC + Resource Ownership
 */

// 1. VALUE OBJECTS
export interface Money {
  amount: number; // Integer Rial (always >= 0)
  currency: 'IRR';
}

export type SKU = string;
export type OrderId = string;
export type ProductId = string;
export type VariantId = string;
export type UserId = string;
export type ReservationId = string;

// 2. PRODUCT & CATALOG
export type ProductCategory = 
  | 'architectural-hardware'
  | 'bespoke-stone'
  | 'monumental-openings'
  | 'luminaire-monoliths'
  | 'mineral-surfaces';

export interface AttributeOption {
  id: string;
  name: string; // e.g. "روکش برنج سندبلاست", "سنگ مرمر دودی دهبید"
  value: string;
  extraPrice: number; // in Rials
}

export interface ProductAttribute {
  id: string;
  name: string; // e.g. "روکش نهایی", "ابعاد سفارشی", "نوع متریال"
  options: AttributeOption[];
}

export interface ProductVariant {
  id: VariantId;
  sku: SKU;
  title: string;
  attributes: Record<string, string>; // attributeId -> optionId
  price: Money;
  inventory: {
    onHand: number;
    reserved: number;
    available: number;
    version: number; // For optimistic concurrency
  };
  dimensions?: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
    weight: number; // kg
  };
  cadBlueprintUrl?: string;
  leadTimeDays: number; // Architectural production lead time
}

export interface TechnicalSpecification {
  label: string;
  value: string;
  standard?: string; // e.g. "DIN 18251", "ASTM C503"
}

export interface Product {
  id: ProductId;
  slug: string;
  title: string;
  latinTitle: string;
  category: ProductCategory;
  subCategory: string;
  description: string;
  editorialNote: string;
  architecturalSeries: string; // e.g. "مجموعه پاسارگاد", "سری مونوکرم زعفرانیه"
  basePrice: Money;
  images: string[];
  cadSchematicUrl: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  specifications: TechnicalSpecification[];
  materialPassport: {
    origin: string; // e.g. "معادن سنگ دهبید شیراز"
    finish: string;
    density: string;
    certificationNumber: string;
    durabilityGrade: string;
  };
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

// 3. INVENTORY & RESERVATIONS
export interface StockReservation {
  id: ReservationId;
  sku: SKU;
  quantity: number;
  cartId: string;
  userId?: UserId;
  expiresAt: number; // Unix timestamp ms
  status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: number;
}

// 4. PRICING, TAX & SNAPSHOTS
export interface OrderItemSnapshot {
  id: string;
  productId: ProductId;
  variantId: VariantId;
  skuSnapshot: SKU;
  productTitleSnapshot: string;
  variantTitleSnapshot: string;
  imageUrlSnapshot: string;
  unitPriceSnapshot: Money;
  taxRatePercent: number; // e.g. 10 for 10% VAT
  taxAmountSnapshot: Money;
  discountAmountSnapshot: Money;
  finalLineTotal: Money;
  quantity: number;
  specificationsSnapshot: Record<string, string>;
}

// 5. ORDER STATE MACHINE
export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'PAID'
  | 'IN_PRODUCTION'
  | 'QUALITY_INSPECTION'
  | 'READY_FOR_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 
  | 'SHAPARAK_ONLINE' // سامانه پرداخت الکترونیک شاپرک (سداد / سامان)
  | 'ORGANIZATIONAL_CREDIT' // اعتبار اسنادی B2B (۳۰ روزه)
  | 'SAYAD_CHEQUE'; // چک صیادی دیجیتال بانکی

export type ShippingTier =
  | 'WHITE_GLOVE_ATELIER' // حمل تخصصی سازه‌ای همراه با نصاب معمار
  | 'HEAVY_FREIGHT' // باربری تجهیزات سنگین معدنی
  | 'STANDARD_COURIER'; // ارسال ویژه هوایی / اکسپرس

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  nationalCode: string;
  streetAddress: string;
  buildingUnit?: string;
  architecturalNotes?: string;
}

export interface Order {
  id: OrderId;
  orderNumber: string; // e.g. "HRD-1403-8891"
  customerId: UserId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItemSnapshot[];
  pricing: {
    subtotal: Money;
    taxTotal: Money; // VAT 10%
    shippingCost: Money;
    discountTotal: Money;
    grandTotal: Money;
  };
  couponCodeApplied?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    trackingNumber?: string;
    referenceId?: string;
    gateway: string;
    paidAt?: string;
  };
  shippingTier: ShippingTier;
  shippingAddress: Address;
  officialInvoiceRequested: boolean; // ماده ۱۶۹ م.م
  officialCompanyDetails?: {
    companyName: string;
    economicCode: string;
    nationalId: string;
    registrationNumber: string;
  };
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note: string;
    actor: string;
  }>;
  correlationId: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

// 6. FINANCIAL LEDGER (Immutable Double-Entry)
export type LedgerEntryType = 'DEBIT' | 'CREDIT';
export type LedgerAccount = 
  | 'CUSTOMER_PAYMENT'
  | 'PLATFORM_REVENUE'
  | 'SELLER_PAYABLE'
  | 'TAX_PAYABLE_VAT'
  | 'SHIPPING_CARRIER_FEE'
  | 'REFUND_RESERVE';

export interface LedgerEntry {
  id: string;
  entryGroup: string; // Grouping matching debit/credit pairs
  type: LedgerEntryType;
  account: LedgerAccount;
  amount: Money;
  orderId?: OrderId;
  referenceId: string;
  narration: string; // شرح آرتیکل مالی
  createdAt: string;
  reconciled: boolean;
}

// 7. USER & RBAC
export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ARCHITECT_CATALOG_MANAGER'
  | 'FINANCE_AUDITOR'
  | 'WAREHOUSE_CONTROLLER'
  | 'CUSTOMER';

export interface User {
  id: UserId;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  organization?: string;
  isB2BVerified?: boolean;
}

// 8. API STANDARD CONTRACT
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    requestId: string;
    correlationId: string;
    timestamp: string;
  };
}

// 9. CART
export interface CartItem {
  productId: ProductId;
  variantId: VariantId;
  sku: SKU;
  quantity: number;
  addedAt: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  appliedCoupon?: string;
  reservationId?: ReservationId;
  updatedAt: number;
}
