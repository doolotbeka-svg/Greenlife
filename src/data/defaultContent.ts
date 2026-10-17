import type { SellerSettings, SiteContent } from '../types/store';
import { INITIAL_PRODUCTS, IMAGES } from './products.js';

export const DEFAULT_SELLER_SETTINGS: SellerSettings = {
  storeName: 'Greenleaf Osh',
  sellerName: 'Дөөлөтбек (Менеджер)',
  sellerCity: 'Ош шаары, Кыргызстан',
  sellerAddress: 'Кыргызстан, Ош ш., Курманжан Датка көч.',
  whatsappPhone: '+996770123456',
  partnerId: 'KG-884920',
  globalMarkupPercent: 60,
  currency: 'KGS',
  language: 'ky',
  deliveryOshCost: 150,
  deliveryKgCost: 250,
  freeDeliveryThreshold: 3000,
  freeDeliveryKgThreshold: 5000,
  workingHours: '09:00 - 20:00 (без выходных)',
  workingHoursKy: '09:00 - 20:00 (күн сайын)',
  instagram: '',
  telegram: '',
  email: '',
};

// Used until the admin publishes content for the first time
export const DEFAULT_CONTENT: SiteContent = {
  settings: DEFAULT_SELLER_SETTINGS,
  products: INITIAL_PRODUCTS,
  slides: [
    {
      id: 'slide-1',
      image: IMAGES.hero,
      titleKy: 'Үй-бүлөңүз үчүн премиум эко-өнүмдөр',
      titleRu: 'Премиальная эко-продукция для всей семьи',
      subtitleKy: 'Кыргызстан, Ош ш. · Түз жеткирүү',
      subtitleRu: 'Кыргызстан, г. Ош · Прямые поставки',
      link: '#catalog',
      enabled: true,
    },
  ],
  promoCodes: [
    { id: 'promo-eco2026', code: 'ECO2026', type: 'fixed', value: 300, minOrder: 0, active: true },
    { id: 'promo-osh', code: 'OSH', type: 'fixed', value: 300, minOrder: 0, active: true },
    { id: 'promo-greenleaf', code: 'GREENLEAF', type: 'fixed', value: 300, minOrder: 0, active: true },
  ],
  announcement: { enabled: false, textKy: '', textRu: '', link: '' },
  hero: {},
};

// Fills fields missing from older saved content so the app can rely on them
export function normalizeContent(raw: Partial<SiteContent> | null | undefined): SiteContent {
  const c = raw || {};
  const settings = { ...DEFAULT_SELLER_SETTINGS, ...(c.settings || {}) };
  delete settings.adminPin;
  return {
    settings,
    products: Array.isArray(c.products) ? c.products : DEFAULT_CONTENT.products,
    slides: Array.isArray(c.slides) ? c.slides : DEFAULT_CONTENT.slides,
    promoCodes: Array.isArray(c.promoCodes) ? c.promoCodes : DEFAULT_CONTENT.promoCodes,
    announcement: { ...DEFAULT_CONTENT.announcement, ...(c.announcement || {}) },
    hero: { ...(c.hero || {}) },
    updatedAt: c.updatedAt,
  };
}
