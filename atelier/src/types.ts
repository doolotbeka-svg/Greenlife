export type ZoneCategory = 
  | 'all'
  | 'kitchen'
  | 'wardrobe'
  | 'living'
  | 'cabinet'
  | 'complex';

export type StyleCategory = 
  | 'all'
  | 'minimalism'
  | 'modern_luxury'
  | 'japandi'
  | 'neoclassic';

export interface CaseStudy {
  id: string;
  title: string;
  residence: string;
  zone: ZoneCategory;
  zoneLabel: string;
  style: StyleCategory;
  styleLabel: string;
  area: string;
  timeline: string;
  description: string;
  task: string;
  engineeringSolution: string;
  materials: string[];
  hardware: string[];
  drawingNote: string;
  realizedImage: string;
  blueprintImage: string;
  gallery: string[];
  metrics: { label: string; value: string }[];
  priceRub: number;
  priceKgs: number;
  priceBreakdown?: { item: string; priceRub: number }[];
}

export interface ReadyFurnitureItem {
  id: string;
  sku: string;
  title: {
    ru: string;
    en: string;
    ky: string;
  };
  category: 'dining' | 'living' | 'lounge' | 'storage' | 'office';
  categoryLabel: {
    ru: string;
    en: string;
    ky: string;
  };
  dimensions: string;
  materials: {
    ru: string;
    en: string;
    ky: string;
  };
  finish: {
    ru: string;
    en: string;
    ky: string;
  };
  priceRub: number;
  priceKgs: number;
  inStock: boolean;
  stockLocation: {
    ru: string;
    en: string;
    ky: string;
  };
  leadTimeDays?: number;
  image: string;
  gallery?: string[];
  description: {
    ru: string;
    en: string;
    ky: string;
  };
  specs: {
    label: { ru: string; en: string; ky: string };
    value: { ru: string; en: string; ky: string };
  }[];
}

export interface MaterialItem {
  id: string;
  name: string;
  category: 'veneer' | 'stone' | 'metal' | 'enamel' | 'leather';
  categoryLabel: string;
  origin: string;
  finish: string;
  description: string;
  specs: string;
  colorHex: string;
  texturePattern: string;
  highlight: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  residence: string;
  text: string;
  year: string;
  projectScope: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
