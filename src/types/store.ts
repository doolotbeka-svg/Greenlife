import type { Language, Currency } from '../i18n/translations';

export type ProductCategory = 'all' | 'cosmetics' | 'home' | 'hygiene' | 'health' | 'franchise';

export type BrandName = 'Sealuxe' | 'iLife' | 'Carich' | 'Kardli' | 'Nilrich' | 'Greenleaf Starter';

export type StockStatus = 'in_stock' | 'on_demand';

export interface Product {
  id: string;
  name: string;
  nameKy?: string;
  brand: BrandName;
  category: ProductCategory;
  retailPrice: number;    // Баасы (сом / сом менен)
  wholesalePrice: number; // Greenleaf заводунан алуу баасы
  partnerPrice: number;   // Клубная цена
  pv: number;             // Баллы PV
  image: string;
  volume: string;
  rating: number;
  reviewsCount: number;
  tagline: string;
  taglineKy?: string;
  description: string;
  descriptionKy?: string;
  features: string[];
  featuresKy?: string[];
  usage: string;
  usageKy?: string;
  certification: string[];
  stockStatus: StockStatus;
  bestseller?: boolean;
  // Price before the sale; shown crossed out when higher than retailPrice
  oldPrice?: number;
  // Hidden products stay in the admin but are not shown in the store
  hidden?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  deliveryMethod: 'pickup' | 'cdek' | 'courier' | 'courier_osh' | 'kg_delivery';
  paymentMethod: 'card_on_delivery' | 'cash';
  items: CartItem[];
  totalRetail: number;
  totalWholesale: number;
  profit: number;
  totalPv: number;
  isPartner?: boolean;
  totalPartner?: number;
  status: 'new' | 'processing' | 'shipped' | 'completed';
  promoCode?: string;
  discount?: number;
  deliveryCost?: number;
  createdAt?: string;
}

export interface SellerSettings {
  storeName: string;
  sellerName: string;
  sellerCity: string;
  sellerAddress: string;
  whatsappPhone: string;
  partnerId: string;
  globalMarkupPercent: number;
  currency: Currency;
  language: Language;
  // Legacy client-side PIN; the admin password is now checked by the server
  adminPin?: string;
  deliveryOshCost: number;
  deliveryKgCost: number;
  freeDeliveryThreshold: number;
  freeDeliveryKgThreshold?: number;
  workingHours: string;
  workingHoursKy?: string;
  instagram?: string;
  telegram?: string;
  email?: string;
}

// Hero carousel slide
export interface Slide {
  id: string;
  image: string;
  titleKy: string;
  titleRu: string;
  subtitleKy: string;
  subtitleRu: string;
  link?: string;
  enabled: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minOrder: number;
  active: boolean;
  // ISO date (YYYY-MM-DD); the code stops working after this day
  expiresAt?: string;
}

// Thin bar above the header for sales and news
export interface Announcement {
  enabled: boolean;
  textKy: string;
  textRu: string;
  link?: string;
}

// Overrides for the hero block texts; empty fields fall back to translations
export interface HeroTexts {
  badgeKy?: string;
  badgeRu?: string;
  titleKy?: string;
  titleRu?: string;
  subtitleKy?: string;
  subtitleRu?: string;
}

// Everything the admin edits and the server stores for all visitors
export interface SiteContent {
  settings: SellerSettings;
  products: Product[];
  slides: Slide[];
  promoCodes: PromoCode[];
  announcement: Announcement;
  hero: HeroTexts;
  updatedAt?: string;
}
