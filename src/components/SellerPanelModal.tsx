import React, { useState } from 'react';
import { X, Store, Check, Package, MessageSquare } from 'lucide-react';
import { Product, Order, SellerSettings } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface SellerPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onUpdateSettings: (settings: SellerSettings) => void;
  onUpdateProduct: (product: Product) => void;
  onBulkMarkupChange: (markupPercent: number) => void;
}

export const SellerPanelModal: React.FC<SellerPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  sellerSettings,
  language,
  currency,
  onUpdateSettings,
  onUpdateProduct,
  onBulkMarkupChange,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [localSettings, setLocalSettings] = useState<SellerSettings>(sellerSettings);
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  // Reseller financials
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalRetail, 0);
  const totalWholesaleCost = orders.reduce((sum, o) => sum + o.totalWholesale, 0);
  const totalRealizedProfit = totalRevenue - totalWholesaleCost;

  // Catalog margin stats
  const totalCatalogWholesale = products.reduce((sum, p) => sum + p.wholesalePrice, 0);
  const totalCatalogRetail = products.reduce((sum, p) => sum + p.retailPrice, 0);
  const avgMargin = totalCatalogWholesale > 0
    ? Math.round(((totalCatalogRetail - totalCatalogWholesale) / totalCatalogWholesale) * 100)
    : 0;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleApplyMarkup = (markupPercent: number) => {
    onBulkMarkupChange(markupPercent);
    setLocalSettings((prev) => ({ ...prev, globalMarkupPercent: markupPercent }));
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E3EAE0] flex items-center justify-between bg-[#F8FAF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                {t.seller.title} · {localSettings.sellerCity || 'г. Ош'}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#143427]">
                {t.seller.subtitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5E7164] hover:text-[#143427] flex items-center justify-center border border-[#D5E0D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E3EAE0] bg-[#FAFBF9] px-6 overflow-x-auto scrollbar-none text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            {t.seller.tabOverview}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            {t.seller.tabProducts} ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            {t.seller.tabOrders} ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            {t.seller.tabSettings}
          </button>
        </div>

        {savedAlert && (
          <div className="bg-[#EAF5EC] text-[#1B4332] text-xs font-semibold px-6 py-2 border-b border-[#C8E4CD] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#2D6A4F]" />
            <span>{t.seller.saveSuccess}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                <span className="text-xs uppercase font-semibold text-[#667C6E]">
                  {t.seller.avgMarkup}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#2D6A4F] tabular-nums">
                    +{avgMargin}%
                  </span>
                  <span className="text-xs text-[#52685A]">
                    {language === 'ky' ? 'заводдук баага карата' : 'к цене завода'}
                  </span>
                </div>
                <p className="text-[11px] text-[#718779] mt-2">
                  {language === 'ky'
                    ? 'Greenleaf дүң баасы жана Ошто сатуу баасынын айырмасы.'
                    : 'Разница между оптовой закупкой у Greenleaf и розницей в г. Ош.'}
                </p>
              </div>

              <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                <span className="text-xs uppercase font-semibold text-[#667C6E]">
                  {t.seller.realizedProfit}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-[#143427] tabular-nums">
                    {formatPrice(totalRealizedProfit, currency)}
                  </span>
                </div>
                <p className="text-[11px] text-[#718779] mt-2">
                  {language === 'ky' ? 'Түшкөн акча: ' : 'Выручка: '}
                  {formatPrice(totalRevenue, currency)} · {language === 'ky' ? 'Закупка: ' : 'Закупка: '}
                  {formatPrice(totalWholesaleCost, currency)}
                </p>
              </div>

              <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                <span className="text-xs uppercase font-semibold text-[#667C6E]">
                  {t.seller.waOrders}
                </span>
                <div className="text-base font-bold font-mono text-[#143427] mt-1 tabular-nums">
                  {sellerSettings.whatsappPhone || '+996 770 123 456'}
                </div>
                <p className="text-[11px] text-[#718779] mt-2">
                  {language === 'ky'
                    ? 'Ош жана Кыргызстан боюнча кардарлар түз WhatsApp номериңизге 1 клик менен заказ беришет.'
                    : 'Клиенты по Ошу и Кыргызстану оформляют заказы напрямую в ваш чат WhatsApp в 1 клик.'}
                </p>
              </div>
            </div>

            {/* Quick Bulk Markup changer */}
            <div className="bg-[#F5F8F4] border border-[#DAE3D7] rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#143427]">
                    {t.seller.bulkTitle}
                  </h4>
                  <p className="text-xs text-[#516759] mt-0.5">
                    {t.seller.bulkDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {[40, 50, 60, 75, 90, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() => handleApplyMarkup(percent)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      sellerSettings.globalMarkupPercent === percent
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-white border border-[#CBD7C7] text-[#1B4332] hover:bg-[#EEF4EC]'
                    }`}
                  >
                    +{percent}%
                  </button>
                ))}
              </div>
            </div>

            {/* Business model description */}
            <div className="border border-[#E2EAE0] rounded-xl p-5 space-y-2 text-xs text-[#44594C] bg-white">
              <h4 className="font-semibold text-sm text-[#143427]">
                {t.seller.howItWorksTitle}
              </h4>
              <p>{t.seller.step1}</p>
              <p>{t.seller.step2}</p>
              <p>{t.seller.step3}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Products & Wholesale Prices */}
        {activeTab === 'products' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xs text-[#5E7366]">
              {language === 'ky'
                ? 'Бул жерден сатуу баасын сом менен өзгөртүп, кампадагы калдыкты текшере аласыз:'
                : 'Здесь вы можете изменить цену продажи в сомах и переключить статус наличия на складе:'}
            </p>

            <div className="space-y-3">
              {products.map((product) => {
                const productName = (language === 'ky' && product.nameKy) ? product.nameKy : product.name;
                const profitPerUnit = product.retailPrice - product.wholesalePrice;
                const marginPercent = product.wholesalePrice > 0
                  ? Math.round((profitPerUnit / product.wholesalePrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAFBF9] border border-[#DEE6DB] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={product.image}
                        alt={productName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#D5E0D2]"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#143427] truncate">
                          {productName}
                        </h4>
                        <div className="text-[11px] text-[#697E71] flex items-center gap-2 mt-0.5">
                          <span>{t.catalog.wholesalePrice}: <strong className="font-mono text-[#143427]">{formatPrice(product.wholesalePrice, currency)}</strong></span>
                          <span>·</span>
                          <span className="font-mono text-[#2D6A4F]">+{product.pv} PV</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {/* Profit summary */}
                      <div className="text-right">
                        <span className="text-[11px] text-[#526659] block">{t.seller.orderProfit}</span>
                        <span className="font-mono font-bold text-[#2D6A4F] tabular-nums">
                          +{formatPrice(profitPerUnit, currency)} ({marginPercent}%)
                        </span>
                      </div>

                      {/* Retail price input in Som */}
                      <div className="w-28">
                        <label className="text-[10px] text-[#6B8072] block">{t.seller.retailPriceLabel}</label>
                        <input
                          type="number"
                          value={product.retailPrice}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            onUpdateProduct({ ...product, retailPrice: newPrice });
                          }}
                          className="w-full px-2 py-1 bg-white border border-[#CBD7C7] rounded text-xs font-mono font-semibold"
                        />
                      </div>

                      {/* Stock toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = product.stockStatus === 'in_stock' ? 'on_demand' : 'in_stock';
                          onUpdateProduct({ ...product, stockStatus: newStatus });
                        }}
                        className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap ${
                          product.stockStatus === 'in_stock'
                            ? 'bg-[#E3F2E6] text-[#245C3F] border border-[#BCDDC3]'
                            : 'bg-[#FFF3E0] text-[#9A6216] border border-[#F5D8A8]'
                        }`}
                      >
                        {product.stockStatus === 'in_stock' ? t.catalog.inStock : t.catalog.onDemand}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Customer Orders */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Package className="w-10 h-10 text-[#8DA093] mx-auto" />
                <h4 className="font-serif text-base font-bold text-[#143427]">
                  {t.seller.noOrdersTitle}
                </h4>
                <p className="text-xs text-[#5D7164]">
                  {t.seller.noOrdersDesc}
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  language === 'ky'
                    ? `Саламатсызбы, ${order.customerName}! Сиздин #${order.id} буюртмаңыз Ош кампасынан тастыкталды. Суммасы: ${formatPrice(order.totalRetail, currency)}.`
                    : `Здравствуйте, ${order.customerName}! Ваш заказ #${order.id} на сумму ${formatPrice(order.totalRetail, currency)} со склада в г. Ош подтвержден!`
                )}`;

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-[#FAFBF9] border border-[#DCE4DA] rounded-xl space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-[#E7EFE5]">
                      <div>
                        <span className="font-bold font-mono text-sm text-[#143427]">
                          {t.orders.orderNum}{order.id}
                        </span>
                        <span className="text-[#6D8374] ml-2">{order.date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#2D6A4F] font-bold">
                          {t.seller.orderProfit} +{formatPrice(order.profit, currency)}
                        </span>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{t.seller.replyWa}</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#465A4E]">
                      <div>
                        <span className="text-[#758B7C]">{t.seller.clientPhone}</span>
                        <p className="font-semibold text-[#183124]">{order.customerName} ({order.phone})</p>
                      </div>
                      <div>
                        <span className="text-[#758B7C]">{t.seller.clientAddress}</span>
                        <p className="font-medium text-[#183124]">{order.address}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAEFE7] flex justify-between items-center text-[#55695D]">
                      <span>
                        {t.orders.itemsList} {order.items.map((i) => {
                          const itemName = (language === 'ky' && i.product.nameKy) ? i.product.nameKy : i.product.name;
                          return `${itemName} (${i.quantity} ${t.cart.itemsCount})`;
                        }).join(', ')}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#143427] tabular-nums">
                        {t.orders.totalSum} {formatPrice(order.totalRetail, currency)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                  {t.seller.storeNameLabel}
                </label>
                <input
                  type="text"
                  value={localSettings.storeName}
                  onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                  placeholder="Greenleaf Osh EcoMarket"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                  {t.seller.waPhoneLabel}
                </label>
                <input
                  type="text"
                  value={localSettings.whatsappPhone}
                  onChange={(e) => setLocalSettings({ ...localSettings, whatsappPhone: e.target.value })}
                  placeholder="+996 770 123 456"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] font-mono"
                />
                <p className="text-[11px] text-[#697D70] mt-1">
                  {language === 'ky'
                    ? 'Ош жана бүт Кыргызстан боюнча кардарлар ушул WhatsApp номериңизге буюртма беришет.'
                    : 'Клиенты со всего Кыргызстана будут отправлять заявки на этот номер WhatsApp.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                    {t.seller.cityLabel}
                  </label>
                  <input
                    type="text"
                    value={localSettings.sellerCity}
                    onChange={(e) => setLocalSettings({ ...localSettings, sellerCity: e.target.value })}
                    placeholder={language === 'ky' ? 'Ош шаары, Кыргызстан' : 'г. Ош, Кыргызстан'}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                    {t.seller.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={localSettings.sellerAddress}
                    onChange={(e) => setLocalSettings({ ...localSettings, sellerAddress: e.target.value })}
                    placeholder={language === 'ky' ? 'Кыргызстан, Ош ш., Курманжан Датка көч.' : 'Кыргызстан, г. Ош, ул. Курманжан Датка'}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                    {t.seller.sellerNameLabel}
                  </label>
                  <input
                    type="text"
                    value={localSettings.sellerName}
                    onChange={(e) => setLocalSettings({ ...localSettings, sellerName: e.target.value })}
                    placeholder="Дөөлөтбек / Менеджер"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-1.5">
                    {t.seller.partnerIdLabel}
                  </label>
                  <input
                    type="text"
                    value={localSettings.partnerId}
                    onChange={(e) => setLocalSettings({ ...localSettings, partnerId: e.target.value })}
                    placeholder="KG-884920"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {t.seller.saveSettingsBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
