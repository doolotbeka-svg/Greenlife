import React from 'react';
import { ShieldCheck, Award, Factory, Leaf, CheckCircle2, MessageSquare, MapPin } from 'lucide-react';
import { CERTIFICATIONS_LIST } from '../data/products';
import { SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS } from '../i18n/translations';

interface AboutCompanyProps {
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
}

export const AboutCompany: React.FC<AboutCompanyProps> = ({ sellerSettings, language }) => {
  const t = TRANSLATIONS[language];
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waFranchiseUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? 'Саламатсызбы! Ош шаарында Greenleaf эко-товарларын заводдон 50% арзан клубдук баада алуу боюнча маалымат алгым келет.'
          : 'Здравствуйте! Расскажите, как покупать продукцию Greenleaf со скидкой 50% со склада в г. Ош.'
      )}`
    : '#';

  return (
    <section id="about" className="bg-white border-y border-[#E2E7DF] py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 text-left">
        {/* Story Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#2D6A4F] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.about.badge}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#143427] leading-tight">
              {t.about.title}
            </h2>
            <p className="text-sm sm:text-base text-[#465B4D] leading-relaxed">
              {t.about.p1}
            </p>
            <p className="text-xs sm:text-sm text-[#546A5C] leading-relaxed">
              {t.about.p2}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E7ECE4] text-xs">
              <div>
                <span className="font-bold text-[#143427] text-base block font-mono">100%</span>
                <span className="text-[#657B6D] text-[11px]">{t.about.stat1Sub}</span>
              </div>
              <div>
                <span className="font-bold text-[#143427] text-base block font-mono">{t.about.stat2Title}</span>
                <span className="text-[#657B6D] text-[11px]">{t.about.stat2Sub}</span>
              </div>
              <div>
                <span className="font-bold text-[#143427] text-base block font-mono">WhatsApp</span>
                <span className="text-[#657B6D] text-[11px]">{t.about.stat3Sub}</span>
              </div>
            </div>
          </div>

          {/* R&D Centers Bento */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAFBF9] border border-[#DEE5DA] p-5 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F0E7] text-[#2D6A4F] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#143427]">
                {t.about.bentoTitle1}
              </h3>
              <p className="text-xs text-[#526659]">
                {t.about.bentoDesc1}
              </p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#DEE5DA] p-5 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F0E7] text-[#2D6A4F] flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#143427]">
                {t.about.bentoTitle2}
              </h3>
              <p className="text-xs text-[#526659]">
                {t.about.bentoDesc2}
              </p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#DEE5DA] p-5 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F0E7] text-[#2D6A4F] flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#143427]">
                {t.about.bentoTitle3}
              </h3>
              <p className="text-xs text-[#526659]">
                {t.about.bentoDesc3}
              </p>
            </div>

            <div className="bg-[#FAFBF9] border border-[#DEE5DA] p-5 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E6F0E7] text-[#2D6A4F] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#143427]">
                {t.about.bentoTitle4}
              </h3>
              <p className="text-xs text-[#526659]">
                {t.about.bentoDesc4}
              </p>
            </div>
          </div>
        </div>

        {/* Certifications row */}
        <div id="standards" className="bg-[#F5F8F4] border border-[#DCE4D8] rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
              {t.about.certsBadge}
            </span>
            <h3 className="text-xl font-serif font-bold text-[#143427] mt-1">
              {t.about.certsTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CERTIFICATIONS_LIST.map((cert) => {
              const certDesc = language === 'ky' ? cert.descKy : cert.desc;
              return (
                <div key={cert.name} className="bg-white p-4 rounded-xl border border-[#DFE7DB] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#143427]">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                    <span>{cert.name}</span>
                  </div>
                  <p className="text-xs text-[#5D7365]">
                    {certDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wholesale Opportunity Callout */}
        <div className="bg-[#1B4332] text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74C69D]">
              {t.about.wholesaleBadge}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {t.about.wholesaleTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8F3DC] leading-relaxed">
              {t.about.wholesaleDesc}
            </p>
          </div>

          {cleanPhone && (
            <a
              href={waFranchiseUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-sm shrink-0 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>{t.about.wholesaleBtn}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
