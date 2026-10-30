/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, SellerSettings, SiteContent, Slide, PromoCode, Announcement, HeroTexts } from './types/store';
import { DEFAULT_CONTENT, normalizeContent } from './data/defaultContent';
import { Language, Currency, TRANSLATIONS, formatPrice } from './i18n/translations';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { OrdersModal } from './components/OrdersModal';
import { AboutCompany } from './components/AboutCompany';
import { StoreLocationMap } from './components/StoreLocationMap';
import { AIChatBot } from './components/AIChatBot';
import { Footer } from './components/Footer';
import { PaymentResultModal } from './components/PaymentResultModal';
import { Check } from 'lucide-react';
import { safeStorage } from './utils/storage';
import { fetchContent, submitOrder, fetchPaymentStatus } from './utils/api';
import { findPromo, promoDiscount } from './utils/promo';

const CONTENT_CACHE_KEY = 'greenleaf_site_content_cache';

// Last content seen from the server, so repeat visits render the real catalog immediately
function loadCachedContent(): SiteContent {
  try {
    const saved = safeStorage.getItem(CONTENT_CACHE_KEY);
    return saved ? normalizeContent(JSON.parse(saved)) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export default function App() {
  // Site content published from the admin panel
  const [initialContent] = useState(loadCachedContent);
  const [sellerSettings, setSellerSettingsState] = useState<SellerSettings>(initialContent.settings);
  const [slides, setSlidesState] = useState<Slide[]>(initialContent.slides);
  const [promoCodes, setPromoCodesState] = useState<PromoCode[]>(initialContent.promoCodes);
  const [announcement, setAnnouncementState] = useState<Announcement>(initialContent.announcement);
  const [heroTexts, setHeroTextsState] = useState<HeroTexts>(initialContent.hero);
  // True when the admin has edits that are not published yet
  const [isContentDirty, setIsContentDirty] = useState(false);
  // Server content loaded (or confirmed empty); until then the admin must not publish
  const [isContentReady, setIsContentReady] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  // Finik checkout is offered only when the server has Finik keys and the admin left it on
  const [isOnlinePaymentAvailable, setIsOnlinePaymentAvailable] = useState(false);
  const [isFinikConfigured, setIsFinikConfigured] = useState(false);
  // Shopper came back from the Finik payment page (?payment=<order id>)
  const [paymentReturn, setPaymentReturn] = useState<{ id: string; status: Order['paymentStatus'] | 'checking' } | null>(() => {
    const id = new URLSearchParams(window.location.search).get('payment');
    return id ? { id, status: 'checking' } : null;
  });

  // Language & Currency
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_lang');
      return (saved === 'ky' || saved === 'ru') ? saved : 'ky';
    } catch {
      return 'ky';
    }
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_currency');
      return (saved === 'KGS' || saved === 'RUB' || saved === 'USD') ? saved : 'KGS';
    } catch {
      return 'KGS';
    }
  });

  const [products, setProductsState] = useState<Product[]>(initialContent.products);


  // Cart & Orders
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_cart_kg');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_orders_kg');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & UI states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // Admin panel lives on a hidden page: <site>/#admin
  const [isAdminPage, setIsAdminPage] = useState(() => window.location.hash === '#admin');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasMapsQuotaWarning, setHasMapsQuotaWarning] = useState(false);

  const t = TRANSLATIONS[language];

  // Listen to Google Maps Demo Key Quota Defense event
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setHasMapsQuotaWarning(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const applyContent = (content: SiteContent) => {
    setSellerSettingsState(content.settings);
    setProductsState(content.products);
    setSlidesState(content.slides);
    setPromoCodesState(content.promoCodes);
    setAnnouncementState(content.announcement);
    setHeroTextsState(content.hero);
    setIsContentDirty(false);
  };

  // Admin edits mark the content as unpublished
  const markDirty = () => setIsContentDirty(true);
  const setSellerSettings = (v: SellerSettings | ((p: SellerSettings) => SellerSettings)) => { setSellerSettingsState(v); markDirty(); };
  const setProducts = (v: Product[] | ((p: Product[]) => Product[])) => { setProductsState(v); markDirty(); };
  const setSlides = (v: Slide[]) => { setSlidesState(v); markDirty(); };
  const setPromoCodes = (v: PromoCode[]) => { setPromoCodesState(v); markDirty(); };
  const setAnnouncement = (v: Announcement) => { setAnnouncementState(v); markDirty(); };
  const setHeroTexts = (v: HeroTexts) => { setHeroTextsState(v); markDirty(); };

  const currentContent = (): SiteContent => ({
    settings: sellerSettings,
    products,
    slides,
    promoCodes,
    announcement,
    hero: heroTexts,
  });

  useEffect(() => {
    let cancelled = false;
    fetchContent()
      .then(({ content, onlinePayment, finikConfigured }) => {
        if (cancelled) return;
        setIsOnlinePaymentAvailable(onlinePayment);
        setIsFinikConfigured(finikConfigured);
        const next = content ? normalizeContent(content) : DEFAULT_CONTENT;
        applyContent(next);
        setIsContentReady(true);
        safeStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(next));
      })
      .catch(() => {
        // Offline or API unavailable: keep the cached / bundled content
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContentPublished = () => {
    setIsContentDirty(false);
    safeStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(currentContent()));
  };

  useEffect(() => {
    safeStorage.setItem('greenleaf_lang', language);
  }, [language]);

  useEffect(() => {
    safeStorage.setItem('greenleaf_currency', currency);
  }, [currency]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'ky'
      ? 'Greenleaf Ош — Түп нуска эко-продукция (Кыргызстан)'
      : 'Greenleaf Ош — Оригинальная эко-продукция от поставщика (Кыргызстан)';
  }, [language]);

  useEffect(() => {
    safeStorage.setItem('greenleaf_cart_kg', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    safeStorage.setItem('greenleaf_orders_kg', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const handleHashChange = () => setIsAdminPage(window.location.hash === '#admin');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closeAdminPage = () => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setIsAdminPage(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Cart Actions
  const handleAddToCart = (product: Product, quantity = 1) => {
    const pName = (language === 'ky' && product.nameKy) ? product.nameKy : product.name;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`"${pName}" ${language === 'ky' ? 'себетке кошулду' : 'добавлен в корзину'}`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Reseller catalog management
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast(language === 'ky' ? 'Товар баасы жаңыртылды' : 'Цена товара обновлена');
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(language === 'ky' ? 'Жаңы товар кошулду!' : 'Новый товар добавлен в каталог!');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast(language === 'ky' ? 'Товар өчүрүлдү' : 'Товар удален из каталога');
  };

  const handleResetCatalog = () => {
    setProducts(DEFAULT_CONTENT.products);
    showToast(language === 'ky' ? 'Каталог баштапкы абалга кайтарылды' : 'Каталог сброшен к заводскому');
  };

  const handleBulkMarkupChange = (markupPercent: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        const newRetail = Math.round(p.wholesalePrice * (1 + markupPercent / 100));
        return { ...p, retailPrice: newRetail };
      })
    );
    setSellerSettings((prev) => ({ ...prev, globalMarkupPercent: markupPercent }));
    showToast(`+${markupPercent}% ${language === 'ky' ? 'наценка кошулду' : 'наценка применена'}`);
  };

  // Sends the order to the shop; if the server is unreachable the order stays local and
  // the shopper can still send it over WhatsApp from the confirmation screen.
  // For online payment the shopper is then sent to the Finik payment page.
  const handleOrderSuccess = async (
    draft: Order
  ): Promise<{ order: Order; saved: boolean; paymentError: boolean; redirecting: boolean }> => {
    let order = draft;
    let saved = true;
    let paymentError = false;
    try {
      const res = await submitOrder(draft, language);
      order = res.order;
      paymentError = res.paymentError;
    } catch {
      saved = false;
      if (draft.paymentMethod === 'online') paymentError = true;
    }
    setOrders((prev) => [order, ...prev]);
    handleClearCart();
    setAppliedPromoCode('');
    if (order.paymentUrl && !paymentError) {
      window.location.assign(order.paymentUrl);
      return { order, saved, paymentError, redirecting: true };
    }
    showToast(`${language === 'ky' ? 'Буюртма' : 'Заказ'} #${order.id} ${language === 'ky' ? 'кабыл алынды!' : 'успешно сформирован!'}`);
    return { order, saved, paymentError, redirecting: false };
  };

  // After returning from Finik, wait for its webhook to confirm the payment
  useEffect(() => {
    if (!paymentReturn || paymentReturn.status !== 'checking') return;
    window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      let status: Order['paymentStatus'] | undefined;
      try {
        status = await fetchPaymentStatus(paymentReturn.id);
      } catch {
        status = undefined;
      }
      if (cancelled) return;
      if (status === 'paid' || status === 'failed' || attempts >= 15) {
        const final = status === 'paid' || status === 'failed' ? status : 'pending';
        setPaymentReturn({ id: paymentReturn.id, status: final });
        setOrders((prev) => prev.map((o) => (o.id === paymentReturn.id ? { ...o, paymentStatus: final } : o)));
        return;
      }
      window.setTimeout(check, 2000);
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [paymentReturn?.id]);

  const visibleProducts = products.filter((p) => !p.hidden);

  // Cart keeps product snapshots; refresh them so price edits apply and hidden items drop out
  const liveCartItems: CartItem[] = cartItems
    .map((item) => ({ ...item, product: products.find((p) => p.id === item.product.id) || item.product }))
    .filter((item) => !item.product.hidden);

  const totalCartCount = liveCartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = liveCartItems.reduce(
    (sum, item) => sum + item.product.retailPrice * item.quantity,
    0
  );

  const appliedPromo = findPromo(promoCodes, appliedPromoCode);
  const cartDiscount = promoDiscount(appliedPromo, totalCartAmount);

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#EEF2EC]">
        <AdminPanelModal
          isOpen
          asPage
          onClose={closeAdminPage}
          products={products}
          sellerSettings={sellerSettings}
          slides={slides}
          promoCodes={promoCodes}
          announcement={announcement}
          heroTexts={heroTexts}
          isDirty={isContentDirty}
          finikConfigured={isFinikConfigured}
          contentReady={isContentReady}
          getContent={currentContent}
          onPublished={handleContentPublished}
          language={language}
          currency={currency}
          onLanguageChange={setLanguage}
          onUpdateSettings={setSellerSettings}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onReorderProducts={setProducts}
          onResetCatalog={handleResetCatalog}
          onBulkMarkupChange={handleBulkMarkupChange}
          onUpdateSlides={setSlides}
          onUpdatePromoCodes={setPromoCodes}
          onUpdateAnnouncement={setAnnouncement}
          onUpdateHeroTexts={setHeroTexts}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-[#1E2922]">
      {/* Google Maps Quota Warning Banner (if demo quota reached) */}
      {hasMapsQuotaWarning && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
          <button
            type="button"
            onClick={() => setHasMapsQuotaWarning(false)}
            className="ml-2 text-xs font-bold text-amber-900 hover:text-amber-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Result of an online payment, shown after Finik sends the shopper back */}
      {paymentReturn && (
        <PaymentResultModal
          orderId={paymentReturn.id}
          status={paymentReturn.status}
          language={language}
          whatsappPhone={sellerSettings.whatsappPhone}
          onClose={() => setPaymentReturn(null)}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#163826] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#2D6A4F]">
          <Check className="w-4 h-4 text-[#74C69D] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sale / news bar managed from the admin panel */}
      {announcement.enabled && (language === 'ky' ? announcement.textKy : announcement.textRu) && (
        <a
          href={announcement.link || '#catalog'}
          className="block bg-[#E07A5F] hover:bg-[#D06A4F] text-white text-center text-xs sm:text-sm font-semibold px-4 py-2 transition-colors"
        >
          {language === 'ky' ? announcement.textKy : announcement.textRu}
        </a>
      )}

      {/* Reseller Toolbar Banner */}
      <div className="bg-[#1B4332] text-white px-4 py-2.5 text-xs border-b border-[#255C44]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2 text-[#D8F3DC]">
            <span className="w-2 h-2 rounded-full bg-[#74C69D] animate-ping" />
            <span className="font-semibold">{t.banner.distributor}</span>
            <span className="text-[#B7E4C7] hidden md:inline">
              {t.banner.tagline}
            </span>
          </div>

        </div>
      </div>

      {/* Header */}
      <Header
        cartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        onLanguageChange={setLanguage}
        onCurrencyChange={setCurrency}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={orders.length}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          sellerSettings={sellerSettings}
          slides={slides}
          heroTexts={heroTexts}
          language={language}
          currency={currency}
        />

        {/* Catalog Grid */}
        <CatalogSection
          products={visibleProducts}
          isSellerMode={false}
          sellerSettings={sellerSettings}
          language={language}
          currency={currency}
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Quality & Direct Shipments Story */}
        <AboutCompany
          sellerSettings={sellerSettings}
          language={language}
          currency={currency}
        />

        {/* Google Map with Osh Warehouse Marker */}
        <StoreLocationMap
          sellerSettings={sellerSettings}
          language={language}
        />
      </main>

      {/* Footer */}
      <Footer
        sellerSettings={sellerSettings}
        language={language}
      />

      {/* AI Assistant Chatbot */}
      <AIChatBot
        language={language}
        sellerSettings={sellerSettings}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isSellerMode={false}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={liveCartItems}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        promoCodes={promoCodes}
        appliedPromoCode={appliedPromo ? appliedPromo.code : ''}
        discount={cartDiscount}
        onApplyPromo={setAppliedPromoCode}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={liveCartItems}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        promoCode={appliedPromo ? appliedPromo.code : ''}
        discount={cartDiscount}
        onlinePaymentAvailable={isOnlinePaymentAvailable}
        onOrderSuccess={handleOrderSuccess}
      />



      {/* Customer Orders Modal */}
      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        language={language}
        currency={currency}
      />
    </div>
  );
}
