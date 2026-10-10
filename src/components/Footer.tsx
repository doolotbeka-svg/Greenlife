import React from 'react';
import { MessageSquare, MapPin, ShieldCheck, Sliders } from 'lucide-react';
import { SellerSettings } from '../types/store';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  sellerSettings: SellerSettings;
  language: Language;
  onOpenSellerPanel: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ sellerSettings, language, onOpenSellerPanel, onOpenAdmin }) => {
  const t = TRANSLATIONS[language];
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? 'Саламатсызбы! Ош шаарындагы Greenleaf эко-дүкөнү боюнча суроом бар эле.'
          : 'Здравствуйте! Вопрос по наличию продукции Greenleaf в г. Ош.'
      )}`
    : '#';

  return (
    <footer className="bg-[#14231B] text-[#D0DDD5] border-t border-[#23382C] pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {sellerSettings.storeName || 'Greenleaf Osh'}
            </h3>
            <p className="text-xs sm:text-sm text-[#9BB1A4] leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#74C69D] pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.footer.originalGuarantee}</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2.5 text-xs text-[#9BB1A4]">
            <h4 className="font-semibold uppercase tracking-wider text-white mb-2">
              {t.footer.assortment}
            </h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">{t.catalog.cosmetics}</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">{t.catalog.home}</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">{t.catalog.hygiene}</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">{t.catalog.health}</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">{t.catalog.franchise}</a></li>
            </ul>
          </div>

          {/* Seller contacts */}
          <div className="space-y-2.5 text-xs text-[#9BB1A4]">
            <h4 className="font-semibold uppercase tracking-wider text-white mb-2">
              {t.footer.contacts}
            </h4>
            <div className="space-y-2">
              {cleanPhone && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#25D366] hover:text-[#4AE384] transition-colors font-semibold"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>WhatsApp: {sellerSettings.whatsappPhone}</span>
                </a>
              )}

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#74C69D] shrink-0 mt-0.5" />
                <span>
                  {sellerSettings.sellerAddress || (language === 'ky' ? 'Кыргызстан, Ош шаары (Кыргызстан боюнча жеткирүү)' : 'Кыргызстан, г. Ош (доставка по всему Кыргызстану)')}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B4332] hover:bg-[#235841] text-[#A6E8BF] hover:text-white rounded-lg transition-colors border border-[#2D6A4F] text-[11px] font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#74C69D]" />
                  <span>{t.admin.button} (PIN: 2026)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSellerPanel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F382A] hover:bg-[#284937] text-[#A6CDB3] hover:text-white rounded-lg transition-colors border border-[#2D503C] text-[11px]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.header.sellerPanel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-6 border-t border-[#1F3327] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#7A9183]">
          <p>© {new Date().getFullYear()} {sellerSettings.storeName || 'Greenleaf Osh'}. {t.footer.copyright}</p>
          <p className="text-[11px]">
            {language === 'ky' ? 'Кыргызстан, Ош шаары. Бардык товарлар тастыкталган.' : 'Кыргызстан, г. Ош. Вся продукция сертифицирована.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
