import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, MessageSquare } from 'lucide-react';
import { CartItem, SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  sellerSettings,
  language,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const t = TRANSLATIONS[language];
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const totalRetail = items.reduce(
    (sum, item) => sum + item.product.retailPrice * item.quantity,
    0
  );
  const currentSubtotal = Math.max(0, totalRetail - promoDiscount);

  const freeDeliveryThreshold = 3000; // 3000 сом
  const freeDeliveryProgress = Math.min(100, Math.round((currentSubtotal / freeDeliveryThreshold) * 100));
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - currentSubtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'ECO2026' || code === 'OSH' || code === 'GREENLEAF') {
      setAppliedPromo(code);
      setPromoDiscount(300); // 300 сом
      setPromoCode('');
      setPromoError('');
    } else {
      setPromoError(language === 'ky' ? 'Промокод табылган жок. ECO2026 кодун колдонуңуз (300 сом арзандатуу).' : 'Промокод не найден. Попробуйте промокод ECO2026 для скидки 300 сом.');
    }
  };

  // WhatsApp formatted order text
  const cleanPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const itemsText = items.map((i, idx) => {
    const name = (language === 'ky' && i.product.nameKy) ? i.product.nameKy : i.product.name;
    return `${idx + 1}. ${name} (${i.quantity} шт.) — ${formatPrice(i.product.retailPrice * i.quantity, currency)}`;
  }).join('\n');

  const waOrderText = language === 'ky'
    ? `Саламатсызбы! Ош кампаңыздан заказ берейин дедим эле:\n\n${itemsText}\n\nЖалпы сумма: ${formatPrice(currentSubtotal, currency)}. Жеткирүү шартын тактап бериңизчи.`
    : `Здравствуйте! Заказ с вашего склада в г. Ош:\n\n${itemsText}\n\nИтого: ${formatPrice(currentSubtotal, currency)}. Уточните условия доставки.`;

  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waOrderText)}` : '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#DFE6DC] text-left">
          {/* Header */}
          <div className="p-5 border-b border-[#E3E8DF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="text-lg font-serif font-bold text-[#143427]">
                {t.cart.title}
              </h2>
              <span className="text-xs text-[#5E7164] font-mono tabular-nums">
                ({items.reduce((acc, i) => acc + i.quantity, 0)} {t.cart.itemsCount})
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5E7164] hover:text-[#143427] rounded-lg transition-colors"
              aria-label={language === 'ky' ? 'Себетти жабуу' : 'Закрыть корзину'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery progress */}
          <div className="bg-[#F4F7F2] px-5 py-3 border-b border-[#E3E8DF]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[#3A4D40] font-medium">
                {remainingForFreeDelivery === 0 ? (
                  <span className="text-[#2D6A4F] font-bold">{t.cart.freeDeliveryActive}</span>
                ) : (
                  <span>{t.cart.freeDeliveryRemain} <strong className="font-mono">{formatPrice(remainingForFreeDelivery, currency)}</strong></span>
                )}
              </span>
              <span className="text-[#5E7164] font-mono tabular-nums">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-[#DDE6DA] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#2D6A4F] h-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#F0F5EE] flex items-center justify-center text-[#2D6A4F]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-[#143427]">
                    {t.cart.emptyTitle}
                  </p>
                  <p className="text-xs text-[#5E7164] mt-1 max-w-xs mx-auto">
                    {t.cart.emptyDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-lg hover:bg-[#153828] transition-colors"
                >
                  {t.cart.goToShopping}
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => {
                const productName = (language === 'ky' && product.nameKy) ? product.nameKy : product.name;
                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 p-3 rounded-xl bg-[#FBFDFB] border border-[#E3EAE0]"
                  >
                    <img
                      src={product.image}
                      alt={productName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg border border-[#DFE7DB] shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-semibold text-[#163324] truncate">
                            {productName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(product.id)}
                            className="text-[#96A89B] hover:text-[#C53030] p-0.5 transition-colors shrink-0"
                            aria-label={`Өчүрүү ${productName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-[#5E7164] mt-0.5">
                          <span>{product.brand}</span>
                          <span className="mx-1">·</span>
                          <span className={product.stockStatus === 'in_stock' ? 'text-[#2D6A4F]' : 'text-[#A06015]'}>
                            {product.stockStatus === 'in_stock' ? t.catalog.inStock : t.catalog.onDemand}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#CBD7C7] rounded bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#183325] hover:bg-[#F2F6F1] font-mono text-xs"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-semibold font-mono tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-[#183325] hover:bg-[#F2F6F1] font-mono text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-sm font-bold font-mono text-[#143427] tabular-nums">
                          {formatPrice(product.retailPrice * quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#DFE6DC] bg-[#FAFBF9] space-y-4">
              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#7A8E80] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoError) setPromoError('');
                    }}
                    placeholder={t.cart.promoPlaceholder}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#E6EFE5] hover:bg-[#DAE7D8] text-[#1B4332] text-xs font-semibold rounded-lg transition-colors"
                >
                  {t.cart.applyPromo}
                </button>
              </form>
              {promoError && (
                <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">{promoError}</p>
              )}

              {appliedPromo && (
                <div className="flex justify-between items-center text-xs bg-[#EAF5EC] px-3 py-1.5 rounded-lg border border-[#C6E2CB] text-[#1B4332]">
                  <span>Промокод {appliedPromo} (-{formatPrice(promoDiscount, currency)})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoDiscount(0);
                    }}
                    className="text-[#556F5E] hover:text-[#C53030]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Total breakdown */}
              <div className="space-y-1.5 text-xs text-[#4E6254]">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-mono tabular-nums">{formatPrice(totalRetail, currency)}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-[#2D6A4F] font-medium">
                    <span>{t.cart.discount}</span>
                    <span className="font-mono tabular-nums">-{formatPrice(promoDiscount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-[#143427] pt-2 border-t border-[#DFE6DC]">
                  <span>{t.cart.total}</span>
                  <span className="font-mono text-xl tabular-nums">
                    {formatPrice(currentSubtotal, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp 1-click & Regular Checkout */}
              <div className="space-y-2">
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{t.cart.fastWaOrder}</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="w-full py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>{t.cart.checkoutSite}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
