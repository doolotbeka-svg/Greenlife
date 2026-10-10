import React from 'react';
import { ShoppingBag, Eye, Star, MessageSquare } from 'lucide-react';
import { Product, SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface ProductCardProps {
  product: Product;
  isSellerMode: boolean;
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSellerMode,
  sellerSettings,
  language,
  currency,
  onAddToCart,
  onSelectProduct,
}) => {
  const t = TRANSLATIONS[language];
  const profit = product.retailPrice - product.wholesalePrice;
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');

  const productName = (language === 'ky' && product.nameKy) ? product.nameKy : product.name;

  const waQuickOrderUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? `Саламатсызбы! Мен Ош кампасынан буюртма берейин дедим эле: "${productName}" (${formatPrice(product.retailPrice, currency)}).`
          : `Здравствуйте! Хочу заказать со склада в г. Ош: "${productName}" по цене ${formatPrice(product.retailPrice, currency)}.`
      )}`
    : '';

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-[#E3E8E0] hover:border-[#CAD5C6] hover:shadow-md transition-all duration-200 overflow-hidden text-left">
      {/* Product Image Stage */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full bg-[#F8FAF7] overflow-hidden cursor-pointer flex items-center justify-center p-4"
      >
        <img
          src={product.image}
          alt={productName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center rounded-lg group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
            product.stockStatus === 'in_stock'
              ? 'bg-[#EAF5EC] text-[#245C3F] border border-[#BCDDC3]'
              : 'bg-[#FFF3E0] text-[#9A6216] border border-[#F5D8A8]'
          }`}>
            {product.stockStatus === 'in_stock' ? t.catalog.inStock : t.catalog.onDemand}
          </span>

          {isSellerMode ? (
            <span className="bg-[#1B4332] text-[#D8F3DC] px-2 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums">
              +{formatPrice(profit, currency)} {t.catalog.profitBadge}
            </span>
          ) : (
            product.bestseller && (
              <span className="bg-[#1B4332] text-white px-2 py-0.5 rounded text-[11px] font-medium">
                Хит
              </span>
            )
          )}
        </div>

        {/* Quick View Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          className="absolute bottom-3 inset-x-3 hidden sm:flex items-center justify-center gap-1.5 py-2 bg-white/95 backdrop-blur-xs text-[#1B4332] text-xs font-semibold rounded-lg shadow-sm border border-[#D5E0D0] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>{t.catalog.quickView}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Brand & Volume */}
          <div className="flex items-center gap-1.5 text-xs text-[#6B7E72] uppercase tracking-wider font-medium mb-1.5">
            <span className="text-[#2D6A4F] font-semibold">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume}</span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-sm sm:text-base font-semibold text-[#183124] hover:text-[#2D6A4F] cursor-pointer line-clamp-2 transition-colors"
          >
            {productName}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#5D7063]">
            <div className="flex items-center text-[#E08736]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 font-semibold text-[#1F2D24] font-mono tabular-nums">
                {product.rating}
              </span>
            </div>
            <span aria-hidden="true">·</span>
            <span>{product.reviewsCount} {t.catalog.reviews}</span>
          </div>
        </div>

        {/* Pricing Module */}
        <div className="pt-2 border-t border-[#EEF2EC] flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-[#143427] font-mono tabular-nums">
                {formatPrice(product.retailPrice, currency)}
              </span>
            </div>

            {isSellerMode ? (
              <p className="text-[11px] text-[#556F5E] font-medium mt-0.5">
                {t.catalog.wholesalePrice}: {formatPrice(product.wholesalePrice, currency)} ({product.pv} PV)
              </p>
            ) : (
              <p className="text-[11px] text-[#2D6A4F] font-medium mt-0.5">
                {t.catalog.originalNotice}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {waQuickOrderUrl && (
              <a
                href={waQuickOrderUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors shadow-xs"
                title={t.catalog.buyWa}
              >
                <MessageSquare className="w-4 h-4 fill-current" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="p-2.5 bg-[#1B4332] hover:bg-[#153828] text-white rounded-lg transition-colors shadow-xs"
              title={t.catalog.addToCart}
              aria-label={`${t.catalog.addToCart}: ${productName}`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
