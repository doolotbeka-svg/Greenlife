/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS } from './data/products';
import { Product, CartItem, Order, SellerSettings } from './types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from './i18n/translations';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SellerPanelModal } from './components/SellerPanelModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { OrdersModal } from './components/OrdersModal';
import { AboutCompany } from './components/AboutCompany';
import { StoreLocationMap } from './components/StoreLocationMap';
import { AIChatBot } from './components/AIChatBot';
import { Footer } from './components/Footer';
import { Check, Sliders } from 'lucide-react';
import { safeStorage } from './utils/storage';

const DEFAULT_SELLER_SETTINGS: SellerSettings = {
  storeName: 'Greenleaf Osh',
  sellerName: 'Дөөлөтбек (Менеджер)',
  sellerCity: 'Ош шаары, Кыргызстан',
  sellerAddress: 'Кыргызстан, Ош ш., Курманжан Датка көч.',
  whatsappPhone: '+996770123456',
  partnerId: 'KG-884920',
  globalMarkupPercent: 60,
  currency: 'KGS',
  language: 'ky',
  adminPin: '1995',
  deliveryOshCost: 150,
  deliveryKgCost: 250,
  freeDeliveryThreshold: 3000,
  workingHours: '09:00 - 20:00 (без выходных)',
  workingHoursKy: '09:00 - 20:00 (күн сайын)',
};

export default function App() {
  // Reseller settings
  const [sellerSettings, setSellerSettings] = useState<SellerSettings>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_reseller_settings_kg');
      if (!saved) return DEFAULT_SELLER_SETTINGS;
      const parsed: SellerSettings = JSON.parse(saved);
      // Settings saved before the PIN change still carry the old default
      if (!parsed.adminPin || parsed.adminPin === '2026') parsed.adminPin = DEFAULT_SELLER_SETTINGS.adminPin;
      return parsed;
    } catch {
      return DEFAULT_SELLER_SETTINGS;
    }
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

  // Product catalog with reseller customized prices & stock
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_reseller_products_kg');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Seller mode toggle (displays wholesale costs & profit margin)
  const [isSellerMode, setIsSellerMode] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem('greenleaf_is_seller_mode_kg');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

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
  const [isSellerPanelOpen, setIsSellerPanelOpen] = useState(false);
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

  // Sync to safeStorage
  useEffect(() => {
    safeStorage.setItem('greenleaf_reseller_settings_kg', JSON.stringify(sellerSettings));
  }, [sellerSettings]);

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
    safeStorage.setItem('greenleaf_reseller_products_kg', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeStorage.setItem('greenleaf_is_seller_mode_kg', JSON.stringify(isSellerMode));
  }, [isSellerMode]);

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
    setProducts(INITIAL_PRODUCTS);
    safeStorage.removeItem('greenleaf_reseller_products_kg');
    showToast(language === 'ky' ? 'Каталог баштапкы абалга кайтарылды' : 'Каталог сброшен к заводскому');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(language === 'ky' ? 'Буюртманын абалы жаңыртылды' : 'Статус заказа обновлен');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(language === 'ky' ? 'Буюртма өчүрүлдү' : 'Заказ удален');
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

  const handleToggleSellerMode = () => {
    setIsSellerMode((prev) => {
      const next = !prev;
      showToast(next ? (language === 'ky' ? 'Сатуучу режими күйдү (закупка жана киреше)' : 'Режим продавца активен') : (language === 'ky' ? 'Кардар режими' : 'Режим покупателя'));
      return next;
    });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    handleClearCart();
    showToast(`${language === 'ky' ? 'Буюртма' : 'Заказ'} #${newOrder.id} ${language === 'ky' ? 'кабыл алынды!' : 'успешно сформирован!'}`);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cartItems.reduce(
    (sum, item) => sum + item.product.retailPrice * item.quantity,
    0
  );

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#EEF2EC]">
        <AdminPanelModal
          isOpen
          asPage
          onClose={closeAdminPage}
          products={products}
          orders={orders}
          sellerSettings={sellerSettings}
          language={language}
          currency={currency}
          onUpdateSettings={setSellerSettings}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetCatalog={handleResetCatalog}
          onBulkMarkupChange={handleBulkMarkupChange}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
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

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#163826] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#2D6A4F]">
          <Check className="w-4 h-4 text-[#74C69D] shrink-0" />
          <span>{toastMessage}</span>
        </div>
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

          <div className="flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={handleToggleSellerMode}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                isSellerMode
                  ? 'bg-white text-[#1B4332]'
                  : 'bg-[#2D6A4F] text-white hover:bg-[#388563]'
              }`}
            >
              {isSellerMode ? `✓ ${t.banner.sellerModeBtn} (On)` : t.banner.sellerModeBtn}
            </button>

            <button
              type="button"
              onClick={() => setIsSellerPanelOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-[#D8F3DC] hover:text-white underline underline-offset-2"
            >
              <Sliders className="w-3 h-3" />
              <span>{t.banner.settingsBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        cartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        sellerSettings={sellerSettings}
        isSellerMode={isSellerMode}
        language={language}
        currency={currency}
        onLanguageChange={setLanguage}
        onCurrencyChange={setCurrency}
        onToggleSellerMode={handleToggleSellerMode}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSellerPanel={() => setIsSellerPanelOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        ordersCount={orders.length}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          sellerSettings={sellerSettings}
          language={language}
          currency={currency}
        />

        {/* Catalog Grid */}
        <CatalogSection
          products={products}
          isSellerMode={isSellerMode}
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
        onOpenSellerPanel={() => setIsSellerPanelOpen(true)}
      />

      {/* AI Assistant Chatbot */}
      <AIChatBot
        language={language}
        sellerSettings={sellerSettings}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isSellerMode={isSellerMode}
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
        items={cartItems}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
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
        items={cartItems}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        onOrderSuccess={handleOrderSuccess}
      />


      {/* Quick Reseller Margin Modal */}
      <SellerPanelModal
        isOpen={isSellerPanelOpen}
        onClose={() => setIsSellerPanelOpen(false)}
        products={products}
        orders={orders}
        sellerSettings={sellerSettings}
        language={language}
        currency={currency}
        onUpdateSettings={setSellerSettings}
        onUpdateProduct={handleUpdateProduct}
        onBulkMarkupChange={handleBulkMarkupChange}
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
