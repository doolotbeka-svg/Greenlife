import React, { useState } from 'react';
import { X, CheckCircle2, MapPin, Truck, MessageSquare } from 'lucide-react';
import { CartItem, Order, SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';
import { useEscapeKey } from '../utils/useEscapeKey';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  sellerSettings,
  language,
  currency,
  onOrderSuccess,
}) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+996 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(sellerSettings.sellerCity || (language === 'ky' ? 'Ош' : 'Ош'));
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'courier_osh' | 'kg_delivery'>('pickup');

  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const totalRetail = items.reduce((sum, i) => sum + i.product.retailPrice * i.quantity, 0);
  const totalWholesale = items.reduce((sum, i) => sum + i.product.wholesalePrice * i.quantity, 0);
  const totalProfit = totalRetail - totalWholesale;
  const totalPv = Number(items.reduce((sum, i) => sum + i.product.pv * i.quantity, 0).toFixed(1));

  // Delivery costs in Som (KGS)
  let deliveryCost = 0;
  if (deliveryMethod === 'pickup') {
    deliveryCost = 0;
  } else if (deliveryMethod === 'courier_osh') {
    deliveryCost = totalRetail >= 3000 ? 0 : 150;
  } else if (deliveryMethod === 'kg_delivery') {
    deliveryCost = totalRetail >= 5000 ? 0 : 250;
  }

  const finalTotal = totalRetail + deliveryCost;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || phone.trim() === '+996') {
      setErrorMessage(language === 'ky' ? 'Сураныч, атыңызды жана телефон номериңизди жазыңыз.' : 'Пожалуйста, укажите ваше имя и номер телефона.');
      return;
    }
    setErrorMessage('');

    const orderNumber = `OSH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderNumber,
      date: new Date().toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: name,
      phone,
      email,
      city,
      address: deliveryMethod === 'pickup' 
        ? (language === 'ky' ? `Ош ш. кампадан алып кетүү (${sellerSettings.sellerAddress || 'Кыргызстан, Ош ш.'})` : `Самовывоз со склада в г. Ош (${sellerSettings.sellerAddress || 'г. Ош'})`)
        : address,
      deliveryMethod,
      paymentMethod: 'card_on_delivery',
      items: [...items],
      totalRetail: finalTotal,
      totalWholesale,
      profit: totalProfit,
      totalPv,
      status: 'new',
    };

    setConfirmedOrder(newOrder);
    onOrderSuccess(newOrder);
  };

  const cleanSellerPhone = sellerSettings.whatsappPhone.replace(/[^0-9]/g, '');
  const waConfirmUrl = confirmedOrder && cleanSellerPhone
    ? `https://wa.me/${cleanSellerPhone}?text=${encodeURIComponent(
        language === 'ky'
          ? `Саламатсызбы! Мен Ош кампаңыздан #${confirmedOrder.id} буюртмасын тариздедим.\nАты-жөнү: ${confirmedOrder.customerName}\nТел: ${confirmedOrder.phone}\nДареги: ${confirmedOrder.city}, ${confirmedOrder.address}\nСуммасы: ${formatPrice(confirmedOrder.totalRetail, currency)}.\nТоварлар:\n${confirmedOrder.items.map((i) => `- ${i.product.name} (${i.quantity} даана)`).join('\n')}`
          : `Здравствуйте! Заказ #${confirmedOrder.id} со склада в г. Ош.\nИмя: ${confirmedOrder.customerName}\nТел: ${confirmedOrder.phone}\nАдрес: ${confirmedOrder.city}, ${confirmedOrder.address}\nСумма: ${formatPrice(confirmedOrder.totalRetail, currency)}.\nТовары:\n${confirmedOrder.items.map((i) => `- ${i.product.name} (${i.quantity} шт)`).join('\n')}`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E3EAE0] flex items-center justify-between bg-[#F8FAF7]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
              {sellerSettings.storeName || 'Greenleaf Osh'} · {t.header.location}
            </span>
            <h2 className="text-xl font-serif font-bold text-[#143427]">
              {confirmedOrder ? t.checkout.successTitle : t.checkout.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5E7164] hover:text-[#143427] flex items-center justify-center border border-[#D5E0D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4 bg-[#EDF7EF] border border-[#C5E5CC] p-4 rounded-xl text-[#1B4332]">
              <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] shrink-0" />
              <div>
                <h3 className="font-semibold text-base">
                  {confirmedOrder.id} — {t.checkout.successTitle}
                </h3>
                <p className="text-xs text-[#44624F] mt-0.5">
                  {t.checkout.successDesc} ({confirmedOrder.phone})
                </p>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="bg-[#FAFBF9] border border-[#E3E9DF] rounded-xl p-5 space-y-4 text-xs">
              <div className="flex justify-between pb-3 border-b border-[#E8EEE5]">
                <span className="text-[#64796B]">{t.checkout.orderNum}</span>
                <span className="font-mono font-bold text-[#143427] text-sm">{confirmedOrder.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64796B]">{t.checkout.customer}</span>
                <span className="font-medium text-[#143427]">{confirmedOrder.customerName} ({confirmedOrder.phone})</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64796B]">{t.checkout.method}</span>
                <span className="font-medium text-[#143427]">
                  {confirmedOrder.deliveryMethod === 'pickup'
                    ? t.checkout.pickup
                    : confirmedOrder.deliveryMethod === 'courier_osh'
                    ? t.checkout.courierOsh
                    : t.checkout.kyrgyzstanDelivery}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64796B]">{t.checkout.addressLabel}</span>
                <span className="font-medium text-[#143427] text-right max-w-xs">{confirmedOrder.address}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-[#E8EEE5] text-sm font-bold text-[#143427]">
                <span>{t.checkout.totalToPay}</span>
                <span className="font-mono text-base">{formatPrice(confirmedOrder.totalRetail, currency)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {waConfirmUrl && (
                <a
                  href={waConfirmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>{t.checkout.sendWaCheck}</span>
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {t.checkout.backToShop}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-5">
            {/* Delivery Methods */}
            <div>
              <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-2">
                {t.checkout.step1}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-[#2D6A4F] bg-[#F1F7F2] text-[#143427] font-semibold'
                      : 'border-[#D5DFD1] hover:bg-[#FAFBF9] text-[#4E6254]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#2D6A4F]">
                    <MapPin className="w-4 h-4" />
                    <span>{t.checkout.pickup}</span>
                  </div>
                  <p className="text-[11px] text-[#697D70]">{t.checkout.deliveryFree}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('courier_osh')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    deliveryMethod === 'courier_osh'
                      ? 'border-[#2D6A4F] bg-[#F1F7F2] text-[#143427] font-semibold'
                      : 'border-[#D5DFD1] hover:bg-[#FAFBF9] text-[#4E6254]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#2D6A4F]">
                    <Truck className="w-4 h-4" />
                    <span>{t.checkout.courierOsh}</span>
                  </div>
                  <p className="text-[11px] text-[#697D70]">
                    {totalRetail >= 3000 ? t.checkout.deliveryFree : formatPrice(150, currency)}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('kg_delivery')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    deliveryMethod === 'kg_delivery'
                      ? 'border-[#2D6A4F] bg-[#F1F7F2] text-[#143427] font-semibold'
                      : 'border-[#D5DFD1] hover:bg-[#FAFBF9] text-[#4E6254]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[#2D6A4F]">
                    <Truck className="w-4 h-4" />
                    <span>{t.checkout.kyrgyzstanDelivery}</span>
                  </div>
                  <p className="text-[11px] text-[#697D70]">
                    {totalRetail >= 5000 ? t.checkout.deliveryFree : formatPrice(250, currency)}
                  </p>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider">
                {t.checkout.step2}
              </label>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={t.checkout.namePlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />

                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={t.checkout.phonePlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t.checkout.cityPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'ky' ? 'Email (милдеттүү эмес)' : 'Email (необязательно)'}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>

              {deliveryMethod !== 'pickup' && (
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.checkout.addressPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              )}
            </div>

            {/* Order Total */}
            <div className="bg-[#F8FAF7] border border-[#E3EAE0] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#4D6254]">
                <span>{language === 'ky' ? 'Товарлар' : 'Товары'} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t.cart.itemsCount}):</span>
                <span className="font-mono tabular-nums">{formatPrice(totalRetail, currency)}</span>
              </div>
              <div className="flex justify-between text-[#4D6254]">
                <span>{language === 'ky' ? 'Жеткирүү:' : 'Доставка:'}</span>
                <span className="font-mono tabular-nums">
                  {deliveryCost === 0 ? t.checkout.deliveryFree : formatPrice(deliveryCost, currency)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#143427] pt-2 border-t border-[#DFE7DB]">
                <span>{t.checkout.totalToPay}</span>
                <span className="font-mono text-lg tabular-nums">{formatPrice(finalTotal, currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1B4332] hover:bg-[#143427] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {t.checkout.confirmBtn} ({formatPrice(finalTotal, currency)})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
