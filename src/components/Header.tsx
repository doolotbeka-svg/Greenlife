import React from 'react';
import { ShoppingBag, MessageCircle, PackageCheck, Sliders, Globe, MapPin, ShieldCheck } from 'lucide-react';
import { SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface HeaderProps {
  cartCount: number;
  totalCartAmount: number;
  sellerSettings: SellerSettings;
  isSellerMode: boolean;
  language: Language;
  currency: Currency;
  onLanguageChange: (lang: Language) => void;
  onCurrencyChange: (curr: Currency) => void;
  onToggleSellerMode: () => void;
  onOpenCart: () => void;
  onOpenSellerPanel: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  ordersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  totalCartAmount,
  sellerSettings,
  isSellerMode,
  language,
  currency,
  onLanguageChange,
  onCurrencyChange,
  onToggleSellerMode,
  onOpenCart,
  onOpenSellerPanel,
  onOpenAdmin,
  onOpenOrders,
  ordersCount,
}) => {
  const t = TRANSLATIONS[language];
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waDirectUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? 'Саламатсызбы! Greenleaf эко-продукциялары боюнча маалымат алгым келет.'
          : 'Здравствуйте! Хочу узнать подробнее о наличии эко-продукции Greenleaf в г. Ош.'
      )}`
    : '#';

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/95 backdrop-blur-md border-b border-[#E3E8E1] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        {/* Brand Wordmark & Location */}
        <div className="flex flex-col text-left shrink-0">
          <a 
            href="#" 
            className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-tight text-[#163826] hover:text-[#2D6A4F] transition-colors flex items-center gap-1.5"
          >
            <span>{sellerSettings.storeName || 'Greenleaf Osh'}</span>
          </a>
          <div className="flex items-center gap-1.5 text-[11px] text-[#556D5E] font-medium -mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
            <span className="font-semibold text-[#2D6A4F]">
              {t.header.location}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#465A4F]">
          <a href="#catalog" className="hover:text-[#163826] transition-colors">
            {t.header.catalog}
          </a>
          <a href="#about" className="hover:text-[#163826] transition-colors">
            {t.header.about}
          </a>
          <a href="#location-map" className="hover:text-[#163826] transition-colors flex items-center gap-1 font-semibold text-[#2D6A4F]">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>{t.header.map}</span>
          </a>
          <a href="#standards" className="hover:text-[#163826] transition-colors">
            {t.header.standards}
          </a>
          {cleanPhone && (
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[#25D366] hover:text-[#1EA952] transition-colors font-semibold"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{t.header.waConsult}</span>
            </a>
          )}
        </nav>

        {/* Actions Zone: Lang & Currency Selectors, Seller Mode, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#EDF3EC] rounded-lg p-0.5 border border-[#CFDFCD] text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLanguageChange('ky')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ky'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#445A4C] hover:text-[#1B4332]'
              }`}
              title="Кыргыз тили"
            >
              KG
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('ru')}
              className={`px-2 py-1 rounded transition-colors ${
                language === 'ru'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#445A4C] hover:text-[#1B4332]'
              }`}
              title="Русский язык"
            >
              RU
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="hidden sm:flex items-center bg-[#EDF3EC] rounded-lg p-0.5 border border-[#CFDFCD] text-xs font-semibold">
            {(['KGS', 'RUB', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={`px-2 py-1 rounded transition-colors ${
                  currency === c
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#445A4C] hover:text-[#1B4332]'
                }`}
              >
                {c === 'KGS' ? 'сом' : c === 'RUB' ? '₽' : '$'}
              </button>
            ))}
          </div>

          {/* Admin Panel Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap bg-[#1B4332] text-white hover:bg-[#143427] shadow-xs"
            title={language === 'ky' ? 'Greenleaf администратор панели (Ош)' : 'Панель администратора Greenleaf (Ош)'}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#74C69D]" />
            <span className="hidden sm:inline">{t.admin.button}</span>
          </button>

          {/* Seller / Distributor Mode Toggle */}
          <button
            type="button"
            onClick={onOpenSellerPanel}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              isSellerMode
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-[#EEF4EC] text-[#245C3F] hover:bg-[#E2EDE0] border border-[#CDE3CE]'
            }`}
            title="Панель реселлера / бааларды башкаруу"
          >
            <Sliders className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span className="hidden md:inline">{t.header.sellerPanel}</span>
          </button>

          {/* Orders tracker button */}
          {ordersCount > 0 && (
            <button
              type="button"
              onClick={onOpenOrders}
              className="p-2 text-[#465A4F] hover:text-[#163826] hover:bg-[#EAEFE8] rounded-lg transition-colors relative"
              title={t.header.orders}
              aria-label={t.header.orders}
            >
              <PackageCheck className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2D6A4F] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {ordersCount}
              </span>
            </button>
          )}

          {/* Cart action button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-medium text-white bg-[#1B4332] hover:bg-[#143427] rounded-lg transition-colors shadow-sm whitespace-nowrap"
            aria-label={t.header.cart}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-[#E07A5F] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-mono tabular-nums">
              {totalCartAmount > 0 ? formatPrice(totalCartAmount, currency) : t.header.cart}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
