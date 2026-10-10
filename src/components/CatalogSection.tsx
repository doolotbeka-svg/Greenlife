import React, { useState, useMemo } from 'react';
import { Search, X, CheckCircle2 } from 'lucide-react';
import { Product, ProductCategory, BrandName, SellerSettings } from '../types/store';
import { ProductCard } from './ProductCard';
import { Language, Currency, TRANSLATIONS } from '../i18n/translations';

interface CatalogSectionProps {
  products: Product[];
  isSellerMode: boolean;
  sellerSettings: SellerSettings;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  isSellerMode,
  sellerSettings,
  language,
  currency,
  onAddToCart,
  onSelectProduct,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'profit_desc'>('popular');

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: t.catalog.allCategories },
    { id: 'cosmetics', label: t.catalog.cosmetics },
    { id: 'home', label: t.catalog.home },
    { id: 'hygiene', label: t.catalog.hygiene },
    { id: 'health', label: t.catalog.health },
    { id: 'franchise', label: t.catalog.franchise },
  ];

  const brands: { id: string; label: string }[] = [
    { id: 'all', label: t.catalog.allBrands },
    { id: 'Sealuxe', label: 'Sealuxe' },
    { id: 'iLife', label: 'iLife' },
    { id: 'Carich', label: 'Carich' },
    { id: 'Kardli', label: 'Kardli' },
    { id: 'Nilrich', label: 'Nilrich' },
    { id: 'Greenleaf Starter', label: 'Greenleaf' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand !== (selectedBrand as BrandName)) return false;
      if (stockOnly && p.stockStatus !== 'in_stock') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inName = p.name.toLowerCase().includes(query) || (p.nameKy && p.nameKy.toLowerCase().includes(query));
        const inBrand = p.brand.toLowerCase().includes(query);
        const inDesc = p.description.toLowerCase().includes(query);
        if (!inName && !inBrand && !inDesc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.retailPrice - b.retailPrice;
      if (sortBy === 'price_desc') return b.retailPrice - a.retailPrice;
      if (sortBy === 'profit_desc') {
        const profitA = a.retailPrice - a.wholesalePrice;
        const profitB = b.retailPrice - b.wholesalePrice;
        return profitB - profitA;
      }
      if (a.bestseller && !b.bestseller) return -1;
      if (!a.bestseller && b.bestseller) return 1;
      return b.rating - a.rating;
    });
  }, [products, selectedCategory, selectedBrand, stockOnly, searchQuery, sortBy]);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 sm:mb-8 text-left">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-[#2D6A4F] mb-1">
            {t.catalog.tag}
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#143427]">
            {t.catalog.title}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#4E6255] max-w-md">
          {isSellerMode ? t.catalog.sellerModeNote : t.catalog.customerNote}
        </p>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 scrollbar-none border-b border-[#E3E8DF] mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'text-[#485D51] hover:text-[#183124] hover:bg-[#EEF3EC]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-8 items-center">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-[#7A8E80] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#D5DFD1] rounded-lg text-xs sm:text-sm text-[#183124] placeholder-[#7A8E80] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8E80] hover:text-[#183124]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Brand Selector */}
        <div className="sm:col-span-3">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-[#D5DFD1] rounded-lg text-xs sm:text-sm text-[#183124] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full py-2.5 px-3 bg-white border border-[#D5DFD1] rounded-lg text-xs sm:text-sm text-[#183124] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          >
            <option value="popular">{t.catalog.sortPopular}</option>
            <option value="price_asc">{t.catalog.sortPriceAsc}</option>
            <option value="price_desc">{t.catalog.sortPriceDesc}</option>
            {isSellerMode && <option value="profit_desc">{t.catalog.sortProfitDesc}</option>}
          </select>
        </div>

        {/* In-Stock only filter */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setStockOnly(!stockOnly)}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
              stockOnly
                ? 'bg-[#E3F2E6] text-[#245C3F] border-[#BCDDC3]'
                : 'bg-white text-[#485D51] border-[#D5DFD1] hover:bg-[#F4F7F2]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.catalog.stockOnly}</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSellerMode={isSellerMode}
              sellerSettings={sellerSettings}
              language={language}
              currency={currency}
              onAddToCart={onAddToCart}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E3E8DF] p-8">
          <p className="font-serif text-xl font-bold text-[#143427] mb-2">
            {t.catalog.noProducts}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSearchQuery('');
              setStockOnly(false);
            }}
            className="px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-lg hover:bg-[#153828] transition-colors"
          >
            {t.catalog.resetFilters}
          </button>
        </div>
      )}
    </section>
  );
};
