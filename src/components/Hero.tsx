import React from 'react';
import { ArrowDown, ShieldCheck, CheckCircle2, MessageSquare, Truck, MapPin } from 'lucide-react';
import { IMAGES } from '../data/products';
import { SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS } from '../i18n/translations';

interface HeroProps {
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
}

export const Hero: React.FC<HeroProps> = ({ sellerSettings, language, currency }) => {
  const t = TRANSLATIONS[language];
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? 'Саламатсызбы! Ош шаарындагы Greenleaf эко-дүкөнүнөн буюртма берейин дедим эле.'
          : 'Здравствуйте! Хочу оформить заказ продукции Greenleaf со склада в г. Ош.'
      )}`
    : '#catalog';

  return (
    <section className="relative overflow-hidden bg-[#F4F6F1] border-b border-[#E2E7DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D6A4F]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.hero.badge}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#143427] leading-[1.18] tracking-tight">
              {t.hero.title}
            </h1>

            <p className="text-sm sm:text-base text-[#3D5245] leading-relaxed max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1B4332] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#153628] transition-colors shadow-sm"
              >
                <span>{t.hero.viewCatalog}</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href="#location-map"
                className="inline-flex items-center gap-1.5 px-4 py-3 bg-white text-[#1B4332] font-semibold text-xs sm:text-sm rounded-lg hover:bg-[#EEF5EC] transition-colors border border-[#CBD7C7] shadow-xs"
              >
                <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                <span>{language === 'ky' ? 'Кампа картада (Ош)' : 'Склад на карте (Ош)'}</span>
              </a>

              {cleanPhone && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium text-xs sm:text-sm rounded-lg transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>{t.hero.waOrder}</span>
                </a>
              )}
            </div>

            {/* Trust Markers */}
            <div className="pt-5 border-t border-[#DDE4D8] grid grid-cols-3 gap-3">
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1B4332]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{t.hero.trustOriginal}</span>
                </div>
                <p className="text-[11px] text-[#52685B] mt-0.5">
                  {t.hero.trustOriginalSub}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1B4332]">
                  <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{t.hero.trustStock}</span>
                </div>
                <p className="text-[11px] text-[#52685B] mt-0.5">
                  {t.hero.trustStockSub}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{t.hero.trustPrices}</span>
                </div>
                <p className="text-[11px] text-[#52685B] mt-0.5">
                  {t.hero.trustPricesSub}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Campaign */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D5DFD0] aspect-[16/10] bg-[#E8EDE5]">
              <img
                src={IMAGES.hero}
                alt="Greenleaf түп нуска продукциясы"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                loading="eager"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#143427]/75 via-transparent to-transparent flex items-end p-6">
                <div className="text-white text-left">
                  <p className="text-xs tracking-wider uppercase font-semibold text-[#B7E4C7]">
                    {language === 'ky' ? 'Кыргызстан, Ош ш. · Түз жеткирүү' : 'Кыргызстан, г. Ош · Прямые поставки'}
                  </p>
                  <p className="font-serif text-lg sm:text-2xl font-bold mt-1 text-white">
                    {language === 'ky' ? 'Үй-бүлөңүз үчүн премиум эко-өнүмдөр' : 'Премиальная эко-продукция для всей семьи'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stock notice badge */}
            <a
              href="#location-map"
              className="absolute -bottom-3 right-4 bg-white/95 hover:bg-white backdrop-blur-xs border border-[#C8D6C3] px-3.5 py-2 rounded-xl shadow-md text-left transition-all hover:scale-102 cursor-pointer"
            >
              <div className="text-[11px] text-[#2D6A4F] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <MapPin className="w-3.5 h-3.5" />
                <span>{sellerSettings.sellerAddress || 'Кыргызстан, Ош шаары (Кампада бар)'}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
