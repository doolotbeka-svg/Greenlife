import React, { useEffect, useState } from 'react';
import {
  X,
  Store,
  Check,
  Package,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Settings,
  ShieldCheck,
  Download,
  RotateCcw,
  Search,
  Lock,
  DollarSign,
  Truck,
  Eye,
  LogOut,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Images,
  Tag,
  Type,
  UploadCloud,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Product, Order, SellerSettings, ProductCategory, BrandName, StockStatus, Slide, PromoCode, Announcement, HeroTexts, SiteContent } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';
import { INITIAL_PRODUCTS, IMAGES } from '../data/products';
import { useEscapeKey } from '../utils/useEscapeKey';
import { adminLogin, adminSession, saveContent, fetchOrders, updateOrderStatus, deleteOrder, changeAdminPassword, ApiError } from '../utils/api';
import { ImageField, SlidesEditor, PromotionsEditor, TextsEditor, moveItem } from './AdminContentEditors';

interface AdminPanelModalProps {
  isOpen: boolean;
  // Rendered as the standalone #admin page instead of over the store
  asPage?: boolean;
  onClose: () => void;
  products: Product[];
  sellerSettings: SellerSettings;
  slides: Slide[];
  promoCodes: PromoCode[];
  announcement: Announcement;
  heroTexts: HeroTexts;
  // Unpublished edits exist
  isDirty: boolean;
  // Finik keys are set on the server
  finikConfigured: boolean;
  // Saved content finished loading from the server, so publishing will not overwrite it with defaults
  contentReady: boolean;
  getContent: () => SiteContent;
  onPublished: () => void;
  language: Language;
  currency: Currency;
  onLanguageChange: (language: Language) => void;
  onUpdateSettings: (settings: SellerSettings) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onReorderProducts: (products: Product[]) => void;
  onResetCatalog: () => void;
  onBulkMarkupChange: (markupPercent: number) => void;
  onUpdateSlides: (slides: Slide[]) => void;
  onUpdatePromoCodes: (codes: PromoCode[]) => void;
  onUpdateAnnouncement: (a: Announcement) => void;
  onUpdateHeroTexts: (h: HeroTexts) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  asPage = false,
  onClose,
  products,
  sellerSettings,
  slides,
  promoCodes,
  announcement,
  heroTexts,
  isDirty,
  finikConfigured,
  contentReady,
  getContent,
  onPublished,
  language,
  currency,
  onLanguageChange,
  onUpdateSettings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onReorderProducts,
  onResetCatalog,
  onBulkMarkupChange,
  onUpdateSlides,
  onUpdatePromoCodes,
  onUpdateAnnouncement,
  onUpdateHeroTexts,
}) => {
  const t = TRANSLATIONS[language];
  const L = (ky: string, ru: string) => (language === 'ky' ? ky : ru);

  // Password is checked by the server; it is kept for this tab and sent with each admin request
  const [password, setPassword] = useState('');
  const isAuthenticated = !!password;
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinMessage, setPinMessage] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  // Orders come from the server: every shopper's order, not just this browser's
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'products' | 'form' | 'orders' | 'pricing' | 'settings' | 'analytics' | 'slides' | 'promo' | 'texts'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State (for adding or editing a product)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    name: '',
    nameKy: '',
    brand: 'Sealuxe',
    category: 'cosmetics',
    retailPrice: 1000,
    wholesalePrice: 600,
    partnerPrice: 600,
    pv: 10,
    image: IMAGES.sealuxeSerum,
    volume: '50 мл',
    rating: 4.9,
    reviewsCount: 15,
    tagline: '',
    taglineKy: '',
    description: '',
    descriptionKy: '',
    features: ['100% Оригинальное качество Greenleaf'],
    featuresKy: ['100% Greenleaf түп нуска сапаты'],
    usage: 'Использовать по инструкции.',
    usageKy: 'Колдонмо боюнча пайдалануу.',
    certification: ['GMP Standard', 'ISO 9001'],
    stockStatus: 'in_stock',
    bestseller: false,
  });

  // Settings local draft
  const [localSettings, setLocalSettings] = useState<SellerSettings>(sellerSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEscapeKey(isOpen, onClose);

  // Settings arrive from the server after the panel opens
  useEffect(() => {
    setLocalSettings(sellerSettings);
  }, [sellerSettings]);

  // Resume the session of this tab, if the saved password is still valid
  useEffect(() => {
    const saved = adminSession.get();
    if (!saved) return;
    adminLogin(saved)
      .then(() => setPassword(saved))
      .catch(() => adminSession.clear());
  }, []);

  const loadOrders = async (pw = password) => {
    if (!pw) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      setOrders(await fetchOrders(pw));
    } catch {
      setOrdersError(language === 'ky' ? 'Буюртмаларды жүктөө мүмкүн болгон жок.' : 'Не удалось загрузить заказы.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (password) loadOrders(password);
  }, [password]);

  // Warn before leaving with unpublished edits
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = enteredPin.trim();
    if (!pw || isCheckingPin) return;
    setIsCheckingPin(true);
    setPinMessage('');
    try {
      await adminLogin(pw);
      adminSession.set(pw);
      setPassword(pw);
      setPinError(false);
      setEnteredPin('');
    } catch (err) {
      setPinError(true);
      const code = err instanceof ApiError ? err.status : 0;
      if (code === 429) setPinMessage(L('Өтө көп аракет. 1 мүнөттөн кийин кайталаңыз.', 'Слишком много попыток. Повторите через минуту.'));
      else if (code !== 401) setPinMessage(L('Сервер менен байланыш жок.', 'Нет связи с сервером.'));
    } finally {
      setIsCheckingPin(false);
    }
  };

  const handleLogout = () => {
    adminSession.clear();
    setPassword('');
    setOrders([]);
  };

  const handlePublish = async () => {
    if (!contentReady) {
      showToast(L('Сайттын маалыматы али жүктөлө элек. Баракты жаңыртыңыз.', 'Данные сайта ещё не загрузились. Обновите страницу.'));
      return;
    }
    setIsPublishing(true);
    try {
      await saveContent(getContent(), password);
      onPublished();
      showToast(L('Өзгөртүүлөр сайтка жарыяланды!', 'Изменения опубликованы на сайте!'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) handleLogout();
      showToast(
        err instanceof ApiError && err.code === 'too_large'
          ? L('Маалымат өтө чоң.', 'Слишком много данных.')
          : L('Сактоо мүмкүн болгон жок. Кайра аракет кылыңыз.', 'Не удалось сохранить. Попробуйте ещё раз.')
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOrderStatus = async (orderId: string, status: Order['status']) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await updateOrderStatus(orderId, status, password);
    } catch {
      setOrders(previous);
      showToast(L('Абалын өзгөртүү мүмкүн болгон жок.', 'Не удалось изменить статус.'));
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId, password);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(L('Буюртма өчүрүлдү', 'Заказ удален'));
    } catch {
      showToast(L('Өчүрүү мүмкүн болгон жок.', 'Не удалось удалить.'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pw = newPassword.trim();
    if (pw.length < 4) {
      showToast(L('Сырсөз кеминде 4 белгиден турушу керек.', 'Пароль должен быть не короче 4 символов.'));
      return;
    }
    try {
      await changeAdminPassword(pw, password);
      adminSession.set(pw);
      setPassword(pw);
      setNewPassword('');
      showToast(L('Сырсөз өзгөртүлдү.', 'Пароль изменён.'));
    } catch {
      showToast(L('Сырсөздү өзгөртүү мүмкүн болгон жок.', 'Не удалось изменить пароль.'));
    }
  };

  // Open Form for editing
  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormProduct({ ...product });
    setActiveTab('form');
  };

  // Open Form for creating new product
  const handleStartCreate = () => {
    setEditingProductId(null);
    setFormProduct({
      id: `gl-${Date.now().toString().slice(-4)}`,
      name: '',
      nameKy: '',
      brand: 'Sealuxe',
      category: 'cosmetics',
      retailPrice: 1200,
      wholesalePrice: 700,
      partnerPrice: 700,
      pv: 10,
      image: IMAGES.sealuxeSerum,
      volume: '100 мл',
      rating: 5.0,
      reviewsCount: 1,
      tagline: '',
      taglineKy: '',
      description: '',
      descriptionKy: '',
      features: ['Оригинал завода Greenleaf', 'Сертификат качества'],
      featuresKy: ['Greenleaf заводунан түп нуска', 'Сапат сертификаты'],
      usage: 'Колдонуу ыкмасы.',
      usageKy: 'Колдонуу ыкмасы.',
      certification: ['GMP Standard', 'ISO 9001'],
      stockStatus: 'in_stock',
      bestseller: false,
    });
    setActiveTab('form');
  };

  // Save product from form
  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name?.trim()) {
      showToast(language === 'ky' ? 'Товардын аталышын жазыңыз' : 'Укажите название товара');
      return;
    }

    const finalProduct: Product = {
      id: editingProductId || formProduct.id || `gl-${Date.now().toString().slice(-4)}`,
      name: formProduct.name || 'Товар Greenleaf',
      nameKy: formProduct.nameKy || formProduct.name || '',
      brand: (formProduct.brand as BrandName) || 'Sealuxe',
      category: (formProduct.category as ProductCategory) || 'cosmetics',
      retailPrice: Number(formProduct.retailPrice) || 100,
      wholesalePrice: Number(formProduct.wholesalePrice) || 50,
      partnerPrice: Number(formProduct.partnerPrice) || Number(formProduct.wholesalePrice) || 50,
      pv: Number(formProduct.pv) || 5,
      image: formProduct.image || IMAGES.sealuxeSerum,
      volume: formProduct.volume || '1 шт.',
      rating: Number(formProduct.rating) || 4.9,
      reviewsCount: Number(formProduct.reviewsCount) || 10,
      tagline: formProduct.tagline || '',
      taglineKy: formProduct.taglineKy || formProduct.tagline || '',
      description: formProduct.description || '',
      descriptionKy: formProduct.descriptionKy || formProduct.description || '',
      features: formProduct.features || ['Оригинал Greenleaf'],
      featuresKy: formProduct.featuresKy || ['Greenleaf түп нускасы'],
      usage: formProduct.usage || '',
      usageKy: formProduct.usageKy || '',
      certification: formProduct.certification || ['GMP Standard'],
      stockStatus: (formProduct.stockStatus as StockStatus) || 'in_stock',
      bestseller: !!formProduct.bestseller,
      oldPrice: Number(formProduct.oldPrice) > 0 ? Number(formProduct.oldPrice) : undefined,
      hidden: !!formProduct.hidden,
    };

    if (editingProductId) {
      onUpdateProduct(finalProduct);
      showToast(t.admin.productSaved);
    } else {
      onAddProduct(finalProduct);
      showToast(t.admin.productAdded);
    }

    setActiveTab('products');
  };

  // Delete product with confirmation
  const handleDeleteProductPrompt = (p: Product) => {
    const pName = (language === 'ky' && p.nameKy) ? p.nameKy : p.name;
    setConfirmAction({
      message: `${t.admin.deleteConfirm}\n\n"${pName}"`,
      onConfirm: () => {
        onDeleteProduct(p.id);
        showToast(t.admin.productDeleted);
      },
    });
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    showToast(t.seller.saveSuccess);
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      products,
      sellerSettings,
      orders,
      exportedAt: new Date().toISOString(),
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `greenleaf_osh_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalRetail, 0);
  const totalWholesaleCost = orders.reduce((sum, o) => sum + o.totalWholesale, 0);
  const totalRealizedProfit = totalRevenue - totalWholesaleCost;
  const inStockCount = products.filter((p) => p.stockStatus === 'in_stock').length;

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || (p.nameKy && p.nameKy.toLowerCase().includes(q));
      const matchBrand = p.brand.toLowerCase().includes(q);
      if (!matchName && !matchBrand) return false;
    }
    return true;
  });

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${asPage ? 'bg-[#EEF2EC]' : 'bg-black/65 backdrop-blur-xs'} flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200`}>
      <div 
        className="relative bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-4 text-left flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#163826] text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-[#2D6A4F]">
            <Check className="w-4 h-4 text-[#74C69D]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PIN Security View */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7 text-[#74C69D]" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#143427]">
                {t.admin.pinPrompt}
              </h2>
              <p className="text-xs text-[#5D7365] mt-1.5">
                {t.admin.pinDesc}
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder={t.admin.pinPlaceholder}
                  className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-[#F4F7F2] border border-[#CBD7C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-[#143427]"
                />
                {pinError && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5">
                    {pinMessage || t.admin.pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#EEF2EC] hover:bg-[#E2E8DF] text-[#445A4C] text-xs font-semibold rounded-xl transition-colors"
                >
                  {t.admin.pinCancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                >
                  {t.admin.pinLogin}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#E3EAE0] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAF7] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#74C69D]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                    {t.admin.title} · {sellerSettings.sellerCity || L('Ош ш.', 'г. Ош')}
                  </span>
                  <h2 className="hidden sm:block text-lg sm:text-xl font-serif font-bold text-[#143427]">
                    {t.admin.subtitle}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-[#D5E0D2] text-[11px] font-semibold">
                  {(['ky', 'ru'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => onLanguageChange(lang)}
                      className={`px-2 py-1 rounded ${language === lang ? 'bg-[#1B4332] text-white' : 'text-[#5E7164]'}`}
                    >
                      {lang === 'ky' ? 'KG' : 'RU'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || !isDirty}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isDirty ? 'bg-[#E07A5F] hover:bg-[#C9654B] text-white shadow-sm' : 'bg-white text-[#8A9A8F] border border-[#D5E0D2]'
                  }`}
                  title={L('Өзгөртүүлөрдү бардык кардарлар үчүн сактоо', 'Сохранить изменения для всех посетителей')}
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{isDirty ? L('Сайтка жарыялоо', 'Опубликовать') : L('Жарыяланды', 'Опубликовано')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-[#5E7164] hover:text-[#143427] rounded-lg transition-colors border border-[#D5E0D2] bg-white"
                  title={L('Админкадан чыгуу', 'Выйти из админки')}
                >
                  <LogOut className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white text-[#5E7164] hover:text-[#143427] flex items-center justify-center border border-[#D5E0D2] transition-colors"
                  aria-label="Жабуу"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isDirty && (
              <div className="px-6 py-2 bg-[#FFF4EE] border-b border-[#F3D3C6] text-[11px] text-[#9A4A33] font-medium shrink-0">
                {L(
                  'Сакталбаган өзгөртүүлөр бар. Кардарлар аларды «Сайтка жарыялоо» баскычын баскандан кийин гана көрүшөт.',
                  'Есть неопубликованные изменения. Посетители увидят их только после нажатия «Опубликовать».'
                )}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#E3EAE0] bg-[#FAFBF9] px-6 overflow-x-auto scrollbar-none text-xs sm:text-sm shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <Package className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.admin.tabProducts} ({products.length})</span>
              </button>

              <button
                type="button"
                onClick={handleStartCreate}
                className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <Plus className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.admin.tabAddProduct}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <Store className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.admin.tabOrders} ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pricing'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.seller.tabOverview}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.admin.tabSettings}</span>
              </button>

              {([
                ['slides', Images, L('Слайддар', 'Слайды')],
                ['promo', Tag, L('Акциялар', 'Акции')],
                ['texts', Type, L('Тексттер', 'Тексты')],
              ] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`py-3.5 border-b-2 mr-6 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === key
                      ? 'border-[#2D6A4F] text-[#143427] font-bold'
                      : 'border-transparent text-[#62776A] hover:text-[#143427]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#2D6A4F]" />
                  <span>{label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`py-3.5 border-b-2 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'border-[#2D6A4F] text-[#143427] font-bold'
                    : 'border-transparent text-[#62776A] hover:text-[#143427]'
                }`}
              >
                <DollarSign className="w-4 h-4 text-[#2D6A4F]" />
                <span>{t.admin.tabAnalytics}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: PRODUCTS LIST & FAST EDIT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="flex gap-2 w-full sm:w-auto flex-1 max-w-md">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#7A8E80] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder={L('Товар издөө...', 'Поиск товара...')}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                        />
                      </div>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="text-xs px-2.5 py-2 bg-white border border-[#CBD7C7] rounded-lg"
                      >
                        <option value="all">{L('Бардык категориялар', 'Все категории')}</option>
                        <option value="cosmetics">{L('Sealuxe косметика', 'Sealuxe Косметика')}</option>
                        <option value="home">{L('iLife & Kardli эко-үй', 'iLife & Kardli Эко-дом')}</option>
                        <option value="hygiene">{L('Carich гигиена', 'Carich Гигиена')}</option>
                        <option value="health">{L('Nilrich ден соолук', 'Nilrich Здоровье')}</option>
                        <option value="franchise">{L('Франшиза / Кейстер', 'Франшиза / Кейсы')}</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartCreate}
                      className="w-full sm:w-auto px-4 py-2 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.admin.tabAddProduct}</span>
                    </button>
                  </div>

                  {/* Products Table/List */}
                  <div className="space-y-3">
                    {filteredProducts.map((p) => {
                      const pName = (language === 'ky' && p.nameKy) ? p.nameKy : p.name;
                      const profit = p.retailPrice - p.wholesalePrice;
                      const marginPercent = p.wholesalePrice > 0 ? Math.round((profit / p.wholesalePrice) * 100) : 0;

                      return (
                        <div
                          key={p.id}
                          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3.5 bg-[#FAFBF9] border border-[#DEE6DB] rounded-xl text-xs hover:border-[#CAD5C6] transition-colors"
                        >
                          {/* Image & Title */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={p.image}
                              alt={pName}
                              className="w-12 h-12 rounded-lg object-cover border border-[#D5E0D2] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#143427] truncate">
                                  {pName}
                                </span>
                                {p.bestseller && (
                                  <span className="bg-[#1B4332] text-white text-[10px] px-1.5 py-0.2 rounded font-medium">
                                    Хит
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#657C6E] flex items-center gap-2 mt-0.5">
                                <span className="font-semibold text-[#2D6A4F]">{p.brand}</span>
                                <span>·</span>
                                <span>{p.volume}</span>
                                <span>·</span>
                                <span>+{p.pv} PV</span>
                              </div>
                            </div>
                          </div>

                          {/* Editable Prices in Som */}
                          <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                            {/* Wholesale cost */}
                            <div className="w-24">
                              <label className="text-[10px] text-[#6B8072] block">{L('Дүң баа:', 'Закупка:')}</label>
                              <input
                                type="number"
                                value={p.wholesalePrice}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  onUpdateProduct({ ...p, wholesalePrice: val });
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#CBD7C7] rounded text-xs font-mono font-medium"
                              />
                            </div>

                            {/* Retail price */}
                            <div className="w-28">
                              <label className="text-[10px] text-[#6B8072] block">{L('Сатуу баасы:', 'Цена продажи:')}</label>
                              <input
                                type="number"
                                value={p.retailPrice}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  onUpdateProduct({ ...p, retailPrice: val });
                                }}
                                className="w-full px-2 py-1 bg-white border border-[#CBD7C7] rounded text-xs font-mono font-bold text-[#143427]"
                              />
                            </div>

                            {/* Profit calculation */}
                            <div className="text-right min-w-[70px]">
                              <span className="text-[10px] text-[#6B8072] block">{L('Пайда:', 'Прибыль:')}</span>
                              <span className="font-mono font-bold text-[#2D6A4F]">
                                +{formatPrice(profit, currency)}
                              </span>
                              <span className="text-[10px] text-[#5A7363] block">({marginPercent}%)</span>
                            </div>

                            {/* Stock status toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = p.stockStatus === 'in_stock' ? 'on_demand' : 'in_stock';
                                onUpdateProduct({ ...p, stockStatus: nextStatus });
                              }}
                              className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap ${
                                p.stockStatus === 'in_stock'
                                  ? 'bg-[#E3F2E6] text-[#245C3F] border border-[#BCDDC3]'
                                  : 'bg-[#FFF3E0] text-[#9A6216] border border-[#F5D8A8]'
                              }`}
                            >
                              {p.stockStatus === 'in_stock' ? t.catalog.inStock : t.catalog.onDemand}
                            </button>

                            {/* Show / hide on the site */}
                            <button
                              type="button"
                              onClick={() => onUpdateProduct({ ...p, hidden: !p.hidden })}
                              className={`p-1.5 rounded-lg transition-colors border ${p.hidden ? 'text-[#8A9A8F] border-[#D5E0D2] bg-[#F1F3F0]' : 'text-[#2D6A4F] border-[#D5E0D2] hover:bg-[#EEF4EC]'}`}
                              title={p.hidden ? L('Сайтта жашырылган — көрсөтүү', 'Скрыт на сайте — показать') : L('Сайтта жашыруу', 'Скрыть на сайте')}
                            >
                              {p.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            {/* Order in the catalog */}
                            {!searchFilter.trim() && categoryFilter === 'all' && (
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={products.indexOf(p) === 0}
                                  onClick={() => onReorderProducts(moveItem(products, products.indexOf(p), -1))}
                                  className="px-1 text-[#2D6A4F] disabled:opacity-30"
                                  title={L('Жогору', 'Выше')}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={products.indexOf(p) === products.length - 1}
                                  onClick={() => onReorderProducts(moveItem(products, products.indexOf(p), 1))}
                                  className="px-1 text-[#2D6A4F] disabled:opacity-30"
                                  title={L('Төмөн', 'Ниже')}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="p-1.5 text-[#2D6A4F] hover:bg-[#EEF4EC] rounded-lg transition-colors border border-[#D5E0D2]"
                              title={t.admin.editProduct}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleDeleteProductPrompt(p)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                              title={t.admin.deleteProduct}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT EDIT / CREATE FORM */}
              {activeTab === 'form' && (
                <form onSubmit={handleSaveProductForm} className="space-y-5 bg-[#FAFBF9] p-5 sm:p-6 rounded-2xl border border-[#DFE7DB]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5EDE2]">
                    <h3 className="font-serif font-bold text-base text-[#143427]">
                      {editingProductId ? t.admin.editProduct : t.admin.addNewProduct}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="text-xs text-[#526659] hover:text-[#143427] underline"
                    >
                      {t.admin.cancelBtn}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.productNameRu}
                      </label>
                      <input
                        type="text"
                        required
                        value={formProduct.name || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                        placeholder="Например: Sealuxe Пептидная сыворотка"
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.productNameKy}
                      </label>
                      <input
                        type="text"
                        value={formProduct.nameKy || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, nameKy: e.target.value })}
                        placeholder="Мисалы: Sealuxe пептид сывороткасы"
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.brandLabel}
                      </label>
                      <select
                        value={formProduct.brand || 'Sealuxe'}
                        onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value as BrandName })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      >
                        <option value="Sealuxe">Sealuxe (Косметика)</option>
                        <option value="iLife">{L('iLife (Эко-үй)', 'iLife (Эко-дом)')}</option>
                        <option value="Carich">Carich (Гигиена)</option>
                        <option value="Kardli">{L('Kardli (Кир жуу)', 'Kardli (Стирка)')}</option>
                        <option value="Nilrich">{L('Nilrich (Ден соолук)', 'Nilrich (Здоровье)')}</option>
                        <option value="Greenleaf Starter">Greenleaf Франшиза</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.categoryLabel}
                      </label>
                      <select
                        value={formProduct.category || 'cosmetics'}
                        onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value as ProductCategory })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      >
                        <option value="cosmetics">Косметика (Sealuxe)</option>
                        <option value="home">{L('Эко-үй (iLife & Kardli)', 'Эко-дом (iLife & Kardli)')}</option>
                        <option value="hygiene">Гигиена (Carich)</option>
                        <option value="health">{L('Ден соолук (Nilrich)', 'Здоровье (Nilrich)')}</option>
                        <option value="franchise">{L('Франшиза / Кейстер', 'Франшиза / Кейсы')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.volumeLabel}
                      </label>
                      <input
                        type="text"
                        value={formProduct.volume || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, volume: e.target.value })}
                        placeholder="50 мл / 64 шт. / 1000 мл"
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.wholesalePriceLabel}
                      </label>
                      <input
                        type="number"
                        required
                        value={formProduct.wholesalePrice || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, wholesalePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.retailPriceLabel}
                      </label>
                      <input
                        type="number"
                        required
                        value={formProduct.retailPrice || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, retailPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono font-bold text-[#143427]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.pvLabel}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={formProduct.pv || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, pv: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.statusLabel}
                      </label>
                      <select
                        value={formProduct.stockStatus || 'in_stock'}
                        onChange={(e) => setFormProduct({ ...formProduct, stockStatus: e.target.value as StockStatus })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      >
                        <option value="in_stock">{t.admin.inStock}</option>
                        <option value="on_demand">{t.admin.onDemand}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="bestseller-check"
                        checked={!!formProduct.bestseller}
                        onChange={(e) => setFormProduct({ ...formProduct, bestseller: e.target.checked })}
                        className="w-4 h-4 text-[#1B4332] rounded"
                      />
                      <label htmlFor="bestseller-check" className="font-semibold text-[#183325] cursor-pointer">
                        {t.admin.bestsellerLabel}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.taglineRu}
                      </label>
                      <input
                        type="text"
                        value={formProduct.tagline || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, tagline: e.target.value })}
                        placeholder="Краткое преимущество"
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.taglineKy}
                      </label>
                      <input
                        type="text"
                        value={formProduct.taglineKy || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, taglineKy: e.target.value })}
                        placeholder="Кыска артыкчылыгы"
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.descRu}
                      </label>
                      <textarea
                        rows={3}
                        value={formProduct.description || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">
                        {t.admin.descKy}
                      </label>
                      <textarea
                        rows={3}
                        value={formProduct.descriptionKy || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, descriptionKy: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <ImageField
                    value={formProduct.image || ''}
                    onChange={(image) => setFormProduct({ ...formProduct, image })}
                    password={password}
                    L={L}
                    label={L('Товардын сүрөтү', 'Фото товара')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Эски баа (акция үчүн)', 'Старая цена (для акции)')}</label>
                      <input
                        type="number"
                        min={0}
                        value={formProduct.oldPrice || ''}
                        placeholder={L('бош = акция жок', 'пусто = без акции')}
                        onChange={(e) => setFormProduct({ ...formProduct, oldPrice: Number(e.target.value) || undefined })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Рейтинг (1–5)', 'Рейтинг (1–5)')}</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        step={0.1}
                        value={formProduct.rating ?? ''}
                        onChange={(e) => setFormProduct({ ...formProduct, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Пикирлердин саны', 'Кол-во отзывов')}</label>
                      <input
                        type="number"
                        min={0}
                        value={formProduct.reviewsCount ?? ''}
                        onChange={(e) => setFormProduct({ ...formProduct, reviewsCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="inline-flex items-center gap-2 font-semibold text-[#183325] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formProduct.hidden}
                          onChange={(e) => setFormProduct({ ...formProduct, hidden: e.target.checked })}
                          className="w-4 h-4 accent-[#1B4332]"
                        />
                        {L('Сайтта жашыруу', 'Скрыть на сайте')}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Өзгөчөлүктөрү (RU, ар бири жаңы саптан)', 'Особенности (RU, каждая с новой строки)')}</label>
                      <textarea
                        rows={4}
                        value={(formProduct.features || []).join('\n')}
                        onChange={(e) => setFormProduct({ ...formProduct, features: e.target.value.split('\n') })}
                        onBlur={(e) => setFormProduct({ ...formProduct, features: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Өзгөчөлүктөрү (KG, ар бири жаңы саптан)', 'Особенности (KG, каждая с новой строки)')}</label>
                      <textarea
                        rows={4}
                        value={(formProduct.featuresKy || []).join('\n')}
                        onChange={(e) => setFormProduct({ ...formProduct, featuresKy: e.target.value.split('\n') })}
                        onBlur={(e) => setFormProduct({ ...formProduct, featuresKy: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Колдонуу ыкмасы (RU)', 'Способ применения (RU)')}</label>
                      <textarea
                        rows={2}
                        value={formProduct.usage || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, usage: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1">{L('Колдонуу ыкмасы (KG)', 'Способ применения (KG)')}</label>
                      <textarea
                        rows={2}
                        value={formProduct.usageKy || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, usageKy: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#183325] mb-1">{L('Сертификаттар (үтүр менен)', 'Сертификаты (через запятую)')}</label>
                      <input
                        type="text"
                        value={(formProduct.certification || []).join(', ')}
                        onChange={(e) => setFormProduct({ ...formProduct, certification: e.target.value.split(',').map((x) => x.trimStart()) })}
                        onBlur={(e) => setFormProduct({ ...formProduct, certification: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                    >
                      {t.admin.saveProductBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="px-4 py-2.5 bg-[#E8EFE5] hover:bg-[#DFE8DC] text-[#245C3F] text-xs font-semibold rounded-lg transition-colors"
                    >
                      {t.admin.cancelBtn}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: CUSTOMER ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[#526659]">
                      {L('Сайттан келген бардык буюртмалар.', 'Все заказы, оформленные на сайте.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadOrders()}
                      disabled={ordersLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#CBD7C7] bg-white rounded-lg text-xs font-semibold text-[#1B4332] disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                      <span>{L('Жаңыртуу', 'Обновить')}</span>
                    </button>
                  </div>
                  {ordersError && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{ordersError}</p>
                  )}
                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-2 bg-[#FAFBF9] rounded-xl border border-[#DFE7DB] p-6">
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
                          ? `Саламатсызбы, ${order.customerName}! Сиздин #${order.id} буюртмаңыз Ош кампасынан кабыл алынды. Суммасы: ${formatPrice(order.totalRetail, currency)}. Жеткирүү убактысын тактап бериңиз.`
                          : `Здравствуйте, ${order.customerName}! Ваш заказ #${order.id} со склада в г. Ош подтвержден на сумму ${formatPrice(order.totalRetail, currency)}.`
                      )}`;

                      return (
                        <div
                          key={order.id}
                          className="p-4 bg-[#FAFBF9] border border-[#DCE4DA] rounded-xl space-y-3 text-xs"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-[#E7EFE5]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm text-[#143427]">
                                #{order.id}
                              </span>
                              <span className="text-[#6D8374]">{order.date}</span>
                              {order.paymentMethod === 'online' && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                    order.paymentStatus === 'paid'
                                      ? 'bg-[#E3F2E6] text-[#245C3F] border-[#BCDDC3]'
                                      : order.paymentStatus === 'failed'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                  }`}
                                >
                                  {order.paymentStatus === 'paid'
                                    ? L('Finik аркылуу төлөндү', 'Оплачен через Finik')
                                    : order.paymentStatus === 'failed'
                                    ? L('Төлөм өткөн жок', 'Оплата не прошла')
                                    : L('Төлөм күтүлүүдө', 'Ожидает оплаты')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Order Status Selector */}
                              <select
                                value={order.status || 'new'}
                                onChange={(e) => handleOrderStatus(order.id, e.target.value as Order['status'])}
                                className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${
                                  order.status === 'completed'
                                    ? 'bg-[#E3F2E6] text-[#245C3F] border-[#BCDDC3]'
                                    : order.status === 'shipped'
                                    ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]'
                                    : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                                }`}
                              >
                                <option value="new">{L('Жаңы буюртма', 'Новый заказ')}</option>
                                <option value="processing">{L('Иштетилүүдө', 'В обработке')}</option>
                                <option value="shipped">{L('Жөнөтүлдү / Курьерде', 'Отправлен / У курьера')}</option>
                                <option value="completed">{L('Аткарылды', 'Выполнен')}</option>
                              </select>

                              <a
                                href={waLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-md text-[11px] font-semibold shadow-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(L('Бул буюртманы өчүрөсүзбү?', 'Удалить этот заказ?'))) {
                                    handleOrderDelete(order.id);
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title={L('Буюртманы өчүрүү', 'Удалить заказ')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#465A4E]">
                            <div>
                              <span className="text-[#758B7C] block">{L('Алуучу:', 'Получатель:')}</span>
                              <p className="font-semibold text-[#183124]">{order.customerName} ({order.phone})</p>
                            </div>
                            <div>
                              <span className="text-[#758B7C] block">{L('Алуу дареги:', 'Адрес получения:')}</span>
                              <p className="font-medium text-[#183124]">{order.address}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#EAEFE7] flex justify-between items-center text-[#55695D]">
                            <span>
                              {order.items.map((i) => `${(language === 'ky' && i.product.nameKy) || i.product.name} × ${i.quantity}`).join(', ')}
                            </span>
                            <div className="text-right">
                              <span className="font-mono font-bold text-sm text-[#143427] tabular-nums block">
                                {formatPrice(order.totalRetail, currency)}
                              </span>
                              <span className="text-[10px] text-[#2D6A4F] font-semibold">
                                {L('Пайда', 'Прибыль')}: +{formatPrice(order.profit, currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: BULK PRICING & MARGIN */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                      <span className="text-xs uppercase font-semibold text-[#667C6E]">
                        {t.seller.avgMarkup}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-[#2D6A4F] tabular-nums">
                          +{sellerSettings.globalMarkupPercent}%
                        </span>
                        <span className="text-xs text-[#52685A]">{L('заводдук баага карата', 'к цене завода')}</span>
                      </div>
                      <p className="text-[11px] text-[#718779] mt-2">
                        {L('Greenleaf компаниясынын бардык дүң бааларына автоматтык наценка.', 'Автоматическая наценка ко всем оптовым ценам Greenleaf.')}
                      </p>
                    </div>

                    <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                      <span className="text-xs uppercase font-semibold text-[#667C6E]">
                        {L('Кампадан таза пайда', 'Чистая прибыль со склада')}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-[#143427] tabular-nums">
                          {formatPrice(totalRealizedProfit, currency)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#718779] mt-2">
                        {L('Жалпы түшкөн акча', 'Общая выручка')}: {formatPrice(totalRevenue, currency)}
                      </p>
                    </div>

                    <div className="bg-[#FAFBF9] border border-[#DEE6DB] p-5 rounded-xl">
                      <span className="text-xs uppercase font-semibold text-[#667C6E]">
                        {L('Кампада бар товарлар', 'Товаров в наличии')}
                      </span>
                      <div className="text-2xl font-bold font-mono text-[#143427] mt-1 tabular-nums">
                        {language === 'ky' ? `${products.length} ичинен ${inStockCount}` : `${inStockCount} из ${products.length}`}
                      </div>
                      <p className="text-[11px] text-[#718779] mt-2">
                        {L('Ош ш. кампасынан тез жөнөтүүгө даяр.', 'Готовы к быстрой отправке со склада в г. Ош.')}
                      </p>
                    </div>
                  </div>

                  {/* Bulk Markup Buttons */}
                  <div className="bg-[#F5F8F4] border border-[#DAE3D7] rounded-xl p-5 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#143427]">
                        {t.admin.bulkMarkupTitle}
                      </h4>
                      <p className="text-xs text-[#516759] mt-0.5">
                        {t.admin.bulkMarkupDesc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {[30, 40, 50, 60, 75, 90, 100].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          onClick={() => {
                            onBulkMarkupChange(percent);
                            showToast(language === 'ky' ? `+${percent}% наценка бардык товарларга колдонулду!` : `+${percent}% наценка применена ко всем товарам!`);
                          }}
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

                  {/* Explanation card */}
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

              {/* TAB 5: STORE & WAREHOUSE SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-5 bg-[#FAFBF9] p-5 sm:p-6 rounded-2xl border border-[#DFE7DB] text-xs">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                        {t.seller.storeNameLabel}
                      </label>
                      <input
                        type="text"
                        value={localSettings.storeName}
                        onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                        {t.seller.waPhoneLabel}
                      </label>
                      <input
                        type="text"
                        value={localSettings.whatsappPhone}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsappPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                          {t.seller.cityLabel}
                        </label>
                        <input
                          type="text"
                          value={localSettings.sellerCity}
                          onChange={(e) => setLocalSettings({ ...localSettings, sellerCity: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                          {t.seller.addressLabel}
                        </label>
                        <input
                          type="text"
                          value={localSettings.sellerAddress}
                          onChange={(e) => setLocalSettings({ ...localSettings, sellerAddress: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                          {t.seller.sellerNameLabel}
                        </label>
                        <input
                          type="text"
                          value={localSettings.sellerName}
                          onChange={(e) => setLocalSettings({ ...localSettings, sellerName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#183325] mb-1.5 uppercase tracking-wider text-[11px]">
                          {t.seller.partnerIdLabel}
                        </label>
                        <input
                          type="text"
                          value={localSettings.partnerId}
                          onChange={(e) => setLocalSettings({ ...localSettings, partnerId: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#CBD7C7] rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E3ECE0]">
                      <h4 className="font-semibold text-xs text-[#143427] mb-3">
                        {t.admin.deliverySettingsTitle}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium text-[#465C4F] mb-1">
                            {t.admin.deliveryOshCostLabel}
                          </label>
                          <input
                            type="number"
                            value={localSettings.deliveryOshCost ?? 150}
                            onChange={(e) => setLocalSettings({ ...localSettings, deliveryOshCost: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#465C4F] mb-1">
                            {t.admin.deliveryKgCostLabel}
                          </label>
                          <input
                            type="number"
                            value={localSettings.deliveryKgCost ?? 250}
                            onChange={(e) => setLocalSettings({ ...localSettings, deliveryKgCost: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#465C4F] mb-1">
                            {t.admin.freeDeliveryThresholdLabel}
                          </label>
                          <input
                            type="number"
                            value={localSettings.freeDeliveryThreshold ?? 3000}
                            onChange={(e) => setLocalSettings({ ...localSettings, freeDeliveryThreshold: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E3ECE0]">
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">
                          {t.admin.workingHoursLabel}
                        </label>
                        <input
                          type="text"
                          value={localSettings.workingHours || '09:00 - 20:00 (без выходных)'}
                          onChange={(e) => setLocalSettings({ ...localSettings, workingHours: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">
                          {L('Иштөө тартиби (KG)', 'График работы (KG)')}
                        </label>
                        <input
                          type="text"
                          value={localSettings.workingHoursKy || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, workingHoursKy: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E3ECE0]">
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">{L('Дүкөндүн аталышы', 'Название магазина')}</label>
                        <input
                          type="text"
                          value={localSettings.storeName || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">{L('Кыргызстан боюнча акысыз жеткирүү (сомдон)', 'Бесплатная доставка по КР (от, сом)')}</label>
                        <input
                          type="number"
                          value={localSettings.freeDeliveryKgThreshold ?? 5000}
                          onChange={(e) => setLocalSettings({ ...localSettings, freeDeliveryKgThreshold: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2 bg-white border border-[#DCE4D8] rounded-lg p-3 space-y-1">
                        <label className="inline-flex items-center gap-2 font-semibold text-[#183325] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.onlinePaymentEnabled !== false}
                            onChange={(e) => setLocalSettings({ ...localSettings, onlinePaymentEnabled: e.target.checked })}
                            className="w-4 h-4 accent-[#1B4332]"
                          />
                          {L('Finik аркылуу онлайн төлөмдү кабыл алуу', 'Принимать онлайн-оплату через Finik')}
                        </label>
                        <p className={`text-[11px] ${finikConfigured ? 'text-[#2D6A4F]' : 'text-amber-700'}`}>
                          {finikConfigured
                            ? L('Finik ачкычтары серверде орнотулган.', 'Ключи Finik настроены на сервере.')
                            : L(
                                'Finik ачкычтары серверде али жок, ошондуктан онлайн төлөм көрсөтүлбөйт.',
                                'Ключи Finik на сервере ещё не заданы, поэтому онлайн-оплата пока не показывается.'
                              )}
                        </p>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">Instagram</label>
                        <input
                          type="text"
                          value={localSettings.instagram || ''}
                          placeholder="@greenleaf_osh"
                          onChange={(e) => setLocalSettings({ ...localSettings, instagram: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">Telegram</label>
                        <input
                          type="text"
                          value={localSettings.telegram || ''}
                          placeholder="@greenleaf_osh"
                          onChange={(e) => setLocalSettings({ ...localSettings, telegram: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#183325] mb-1">Email</label>
                        <input
                          type="email"
                          value={localSettings.email || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B4332] hover:bg-[#143427] text-white font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    {t.seller.saveSettingsBtn}
                  </button>
                </form>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleChangePassword} className="mt-6 bg-[#FAFBF9] border border-[#DFE7DB] rounded-xl p-5 space-y-3 text-xs">
                  <h4 className="font-serif font-bold text-base text-[#143427]">{L('Админкага кирүү сырсөзү', 'Пароль для входа в админку')}</h4>
                  <p className="text-[#526659]">
                    {L('Сырсөз дароо өзгөрөт, «Жарыялоо» баскычы керек эмес.', 'Пароль меняется сразу, кнопка «Опубликовать» не нужна.')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={L('Жаңы сырсөз', 'Новый пароль')}
                      className="flex-1 px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs"
                    />
                    <button type="submit" className="px-5 py-2 bg-[#1B4332] hover:bg-[#143427] text-white font-semibold rounded-lg">
                      {L('Сырсөздү өзгөртүү', 'Сменить пароль')}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'slides' && (
                <SlidesEditor slides={slides} onChange={onUpdateSlides} password={password} L={L} />
              )}

              {activeTab === 'promo' && (
                <PromotionsEditor
                  promoCodes={promoCodes}
                  announcement={announcement}
                  onChangePromoCodes={onUpdatePromoCodes}
                  onChangeAnnouncement={onUpdateAnnouncement}
                  L={L}
                />
              )}

              {activeTab === 'texts' && (
                <TextsEditor heroTexts={heroTexts} onChange={onUpdateHeroTexts} language={language} L={L} />
              )}

              {/* TAB 6: ANALYTICS & BACKUP */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#DFE7DB] space-y-1">
                      <span className="text-[11px] text-[#697E71] block font-semibold uppercase">{L('Бардык буюртмалар:', 'Всего заказов:')}</span>
                      <span className="text-xl font-bold font-mono text-[#143427] block">{orders.length}</span>
                      <span className="text-[10px] text-[#4F6456]">{L('сайт жана WhatsApp аркылуу', 'оформлено через сайт и WhatsApp')}</span>
                    </div>

                    <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#DFE7DB] space-y-1">
                      <span className="text-[11px] text-[#697E71] block font-semibold uppercase">{L('Жалпы түшкөн акча:', 'Общая выручка:')}</span>
                      <span className="text-xl font-bold font-mono text-[#143427] block">{formatPrice(totalRevenue, currency)}</span>
                      <span className="text-[10px] text-[#4F6456]">{L('кардарлардын буюртмаларынын суммасы', 'сумма по заказам клиентов')}</span>
                    </div>

                    <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#DFE7DB] space-y-1">
                      <span className="text-[11px] text-[#697E71] block font-semibold uppercase">{L('Дүң сатып алуу:', 'Оптовая закупка:')}</span>
                      <span className="text-xl font-bold font-mono text-[#526659] block">{formatPrice(totalWholesaleCost, currency)}</span>
                      <span className="text-[10px] text-[#4F6456]">{L('Greenleaf боюнча өздүк нарк', 'себестоимость у Greenleaf')}</span>
                    </div>

                    <div className="p-4 bg-[#EAF5EC] rounded-xl border border-[#C6E2CB] space-y-1">
                      <span className="text-[11px] text-[#2D6A4F] block font-semibold uppercase">{L('Таза пайда:', 'Чистая прибыль:')}</span>
                      <span className="text-xl font-bold font-mono text-[#1B4332] block">+{formatPrice(totalRealizedProfit, currency)}</span>
                      <span className="text-[10px] text-[#2D6A4F]">{L('сатуучунун кампадан тапкан кирешеси', 'заработок продавца со склада')}</span>
                    </div>
                  </div>

                  {/* Backup & Catalog Reset Actions */}
                  <div className="bg-[#FAFBF9] border border-[#DFE7DB] rounded-2xl p-5 sm:p-6 space-y-4">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#143427]">
                        {L('Камдык көчүрмөлөр жана каталогду баштапкы абалга кайтаруу', 'Управление резервными копиями и сброс каталога')}
                      </h4>
                      <p className="text-xs text-[#526659] mt-0.5">
                        {L('Бардык товарларды жана орнотууларды JSON файлга сактап же Greenleaf заводунун баштапкы каталогун кайтара аласыз.', 'Вы можете сохранить все товары и настройки в JSON файл или вернуть начальный заводской каталог Greenleaf.')}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="px-4 py-2.5 bg-white border border-[#CBD7C7] hover:bg-[#EEF4EC] text-[#1B4332] text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
                      >
                        <Download className="w-4 h-4 text-[#2D6A4F]" />
                        <span>{t.admin.exportBackup}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t.admin.resetConfirm)) {
                            onResetCatalog();
                            showToast(t.admin.resetSuccess);
                          }
                        }}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4 text-red-600" />
                        <span>{t.admin.resetCatalogBtn}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
