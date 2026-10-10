import { Language, Currency } from '../i18n/translations';

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
  adminPin: string;
  deliveryOshCost: number;
  deliveryKgCost: number;
  freeDeliveryThreshold: number;
  workingHours: string;
  workingHoursKy?: string;
}
