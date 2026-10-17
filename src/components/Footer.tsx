import React from 'react';
import { MessageSquare, MapPin, ShieldCheck, Mail, Instagram, Send } from 'lucide-react';

// Accepts a full link or just a username/handle
const socialUrl = (value: string, base: string) =>
  /^https?:\/\//.test(value) ? value : base + value.replace(/^@/, '');
import { SellerSettings } from '../types/store';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  sellerSettings: SellerSettings;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ sellerSettings, language }) => {
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

              {sellerSettings.email && (
                <a href={`mailto:${sellerSettings.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-[#74C69D]" />
                  <span>{sellerSettings.email}</span>
                </a>
              )}

              {(sellerSettings.instagram || sellerSettings.telegram) && (
                <div className="flex flex-wrap gap-3">
                  {sellerSettings.instagram && (
                    <a href={socialUrl(sellerSettings.instagram, 'https://instagram.com/')} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Instagram className="w-4 h-4 text-[#74C69D]" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {sellerSettings.telegram && (
                    <a href={socialUrl(sellerSettings.telegram, 'https://t.me/')} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Send className="w-4 h-4 text-[#74C69D]" />
                      <span>Telegram</span>
                    </a>
                  )}
                </div>
              )}

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
