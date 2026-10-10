import React, { useState } from 'react';
import { X, Check, ShoppingBag, Star, ShieldCheck, Share2, MessageSquare } from 'lucide-react';
import { Product, SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface ProductModalProps {
  product: Product | null;
  isSellerMode: boolean;
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isSellerMode,
  sellerSettings,
  language,
  currency,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const t = TRANSLATIONS[language];
  const productName = (language === 'ky' && product.nameKy) ? product.nameKy : product.name;
  const productTagline = (language === 'ky' && product.taglineKy) ? product.taglineKy : product.tagline;
  const productDescription = (language === 'ky' && product.descriptionKy) ? product.descriptionKy : product.description;
  const productFeatures = (language === 'ky' && product.featuresKy) ? product.featuresKy : product.features;
  const productUsage = (language === 'ky' && product.usageKy) ? product.usageKy : product.usage;

  const totalPrice = product.retailPrice * quantity;
  const totalWholesale = product.wholesalePrice * quantity;
  const totalProfit = totalPrice - totalWholesale;

  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waOrderUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? `Саламатсызбы! Ош кампасынан заказ берейин дедим эле: "${productName}" (${quantity} даана) суммасы: ${formatPrice(totalPrice, currency)}.`
          : `Здравствуйте! Заказ со склада в г. Ош: "${productName}" (${quantity} шт.) на сумму ${formatPrice(totalPrice, currency)}.`
      )}`
    : '';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 text-[#3C4E42] hover:text-[#143427] hover:bg-white shadow-sm flex items-center justify-center transition-colors"
          aria-label="Жабуу"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Stage */}
          <div className="bg-[#F8FAF7] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5ECE0]">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-[#E0E8DC] p-4 flex items-center justify-center">
              <img
                src={product.image}
                alt={productName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
              
              <div className="absolute top-3 left-3 bg-[#1B4332] text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                {t.modal.originalBadge}
              </div>
            </div>

            {/* Certifications row */}
            <div className="mt-6 pt-4 border-t border-[#E3EAE0]">
              <p className="text-[11px] uppercase tracking-wider text-[#697D70] font-semibold mb-2">
                {t.modal.certs}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-[#2D6A4F] font-medium">
                {product.certification.map((c) => (
                  <span key={c} className="flex items-center gap-1 bg-[#EEF5EE] px-2 py-1 rounded border border-[#D5E3D5]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header meta */}
              <div className="flex items-center justify-between text-xs text-[#62776A]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1B4332] uppercase">{product.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.volume}</span>
                  <span aria-hidden="true">·</span>
                  <span className={product.stockStatus === 'in_stock' ? 'text-[#2D6A4F] font-semibold' : 'text-[#A06015]'}>
                    {product.stockStatus === 'in_stock' ? t.catalog.inStock : t.catalog.onDemand}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#E08736]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold text-[#182C20] font-mono tabular-nums">{product.rating}</span>
                  <span className="text-[#62776A]">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#143427] leading-snug">
                  {productName}
                </h2>
                <p className="text-xs sm:text-sm text-[#2D6A4F] font-medium mt-1">
                  {productTagline}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#455A4C] leading-relaxed">
                {productDescription}
              </p>

              {/* Features List */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-[#183325] uppercase tracking-wider">
                  {t.modal.features}
                </p>
                <div className="space-y-1.5 text-xs text-[#3E5244]">
                  {productFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Guide */}
              <div className="bg-[#F3F6F1] p-3 rounded-lg border border-[#E0E8DD]">
                <p className="text-[11px] font-semibold text-[#183325] uppercase">
                  {t.modal.usage}
                </p>
                <p className="text-xs text-[#4A5E51] mt-0.5">
                  {productUsage}
                </p>
              </div>

              {isSellerMode && (
                <div className="bg-[#EAF5EC] p-3 rounded-lg border border-[#BCDDC3] text-xs text-[#1B4332]">
                  <span className="font-bold">{t.modal.resellerInfo}</span> {t.catalog.wholesalePrice}: {formatPrice(totalWholesale, currency)} · Киреше: <strong className="font-mono text-[#2D6A4F]">+{formatPrice(totalProfit, currency)}</strong> (+{product.pv * quantity} PV).
                </div>
              )}
            </div>

            {/* Bottom Actions: Pricing, Quantity, Add to Cart */}
            <div className="pt-4 border-t border-[#E5EBE1] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-[#143427] tabular-nums">
                      {formatPrice(totalPrice, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-[#2D6A4F] font-medium">
                    {product.stockStatus === 'in_stock' ? t.modal.shipToday : t.modal.shipOnDemand}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#CBD7C7] rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#183325] hover:bg-[#F2F6F1] transition-colors font-mono"
                    aria-label={language === 'ky' ? 'Азайтуу' : 'Уменьшить'}
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-semibold font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#183325] hover:bg-[#F2F6F1] transition-colors font-mono"
                    aria-label={language === 'ky' ? 'Көбөйтүү' : 'Увеличить'}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#1B4332] hover:bg-[#143427] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.modal.addToCartQty} ({quantity})</span>
                </button>

                {waOrderUrl && (
                  <a
                    href={waOrderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto py-3 px-4 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{t.modal.buyInWa}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 border border-[#CBD7C7] rounded-lg text-[#3E5244] hover:bg-[#F2F6F1] transition-colors self-stretch sm:self-auto flex items-center justify-center"
                  title={language === 'ky' ? 'Бөлүшүү' : 'Поделиться'}
                >
                  <Share2 className="w-4 h-4" />
                  {copied && (
                    <span className="ml-1 text-[11px] text-[#2D6A4F] font-semibold">
                      {t.modal.copied}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
