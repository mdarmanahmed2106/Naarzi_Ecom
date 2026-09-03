'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-outline-variant/30 py-5">
      <button
        className="w-full flex items-center justify-between font-label-caps text-xs tracking-widest text-on-surface uppercase font-bold"
        onClick={() => setOpen(!open)}
      >
        {title}
        <span className="material-symbols-outlined text-lg text-on-surface-variant">
          {open ? 'remove' : 'add'}
        </span>
      </button>
      {open && <div className="mt-5 space-y-3 font-body-md text-sm">{children}</div>}
    </div>
  );
}

function ProductCard({ product }) {
  const { wishlistItems = [], addToWishlist, removeFromWishlist, setQuickBuyProduct, setIsQuickBuyOpen } = useApp();
  const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
  const price = hasDiscount ? product.discountedPrice : product.price;
  const originalPrice = product.price;

  return (
    <div className="group cursor-pointer">
      <Link href={`/products/${product.slug}`}>
        <div>
          {/* Image Frame */}
          <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden mb-4 relative shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(107,34,51,0.05)] product-crossfade-container">
            <img 
              src={product.images?.[0] || product.colors?.[0]?.images?.[0] || '/placeholder.png'} 
              alt={product.name} 
              className="w-full h-full object-cover product-image-primary"
            />
            <img 
              src={product.images?.[1] || product.colors?.[0]?.images?.[1] || product.images?.[0] || product.colors?.[0]?.images?.[0] || '/placeholder.png'} 
              alt={`${product.name} alternate`} 
              className="absolute inset-0 w-full h-full object-cover product-image-secondary"
            />
            
            {/* Quick-add bag icon */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickBuyProduct(product);
                setIsQuickBuyOpen(true);
              }}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 product-quick-add cursor-pointer border border-outline-variant/30 z-20"
              title="Quick Add to Bag"
            >
              <span className="material-symbols-outlined text-lg font-bold">shopping_bag</span>
            </button>
            
            {/* Wishlist Icon */}
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isWishlisted) {
                  await removeFromWishlist(product._id);
                } else {
                  await addToWishlist(product._id);
                }
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-primary flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200 z-20 cursor-pointer"
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <span 
                className={`material-symbols-outlined text-[18px] ${isWishlisted ? 'fill-1 text-primary' : 'text-on-surface-variant'}`}
                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>

            {/* Tags floating */}
            {product.isOnSale && (
              <span className="absolute top-4 left-4 bg-error text-white text-[10px] font-label-caps tracking-widest px-3 py-1.5 rounded shadow-sm z-10 flex gap-4 w-24 overflow-hidden">
                <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
                  <span>SALE</span>
                  <span>SALE</span>
                  <span>SALE</span>
                </div>
              </span>
            )}
            {!product.isOnSale && product.tags && product.tags.length > 0 && (
              <span className="absolute top-4 left-4 bg-surface/90 text-primary text-[8px] font-label-caps tracking-widest px-2.5 py-1.5 rounded shadow-sm font-bold z-10">
                {product.tags[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Text Metadata */}
          <div className="space-y-1 px-1">
            <h3 className="font-headline-sm text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex gap-2 items-center">
              {hasDiscount ? (
                <>
                  <span className="font-body-md text-sm text-primary font-medium">
                    INR {price}
                  </span>
                  <span className="font-body-md text-xs text-on-surface-variant line-through opacity-70">
                    INR {originalPrice}
                  </span>
                </>
              ) : (
                <span className="font-body-md text-sm text-on-surface-variant">
                  INR {price}
                </span>
              )}
            </div>
            {product.colors && product.colors.length > 1 && (
              <p className="font-body-md text-xs text-on-surface-variant/80 mt-1">{product.colors.length} Colors</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Derive active states from searchParams
  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const outOfStockOnly = searchParams.get('inStock') === 'false';
  const sizeParam = searchParams.get('size') || '';
  const colorParam = searchParams.get('color') || '';
  const activeSizes = sizeParam ? sizeParam.split(',') : [];
  const activeColors = colorParam ? colorParam.split(',') : [];
  const activeSort = searchParams.get('sort') || 'newest';
  const activeSearch = searchParams.get('search') || '';

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    });

    if (!('search' in updates) && activeSearch) {
      params.set('search', activeSearch);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [catRes, filterRes] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getFilters()
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (filterRes.success) {
          setAvailableColors(filterRes.data.colors || []);
          setAvailableSizes(filterRes.data.sizes || []);
        }
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    }
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          limit: 100, 
          sort: activeSort
        };
        
        if (activeCategory) params.category = activeCategory;
        if (activeTag) params.tag = activeTag;
        if (inStockOnly) params.inStock = 'true';
        else if (outOfStockOnly) params.inStock = 'false';
        if (activeSizes.length > 0) params.size = activeSizes.join(',');
        if (activeColors.length > 0) params.color = activeColors.join(',');
        if (activeSearch) params.search = activeSearch;

        const response = await productsApi.getAll(params);
        if (response.success) {
          setProducts(response.data);
          setTotalProducts(response.count || response.data.length);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [activeCategory, activeTag, inStockOnly, outOfStockOnly, sizeParam, colorParam, activeSort]);

  const handleSizeToggle = (size) => {
    const newSizes = activeSizes.includes(size) 
      ? activeSizes.filter(s => s !== size) 
      : [...activeSizes, size];
    updateFilters({ size: newSizes });
  };

  const handleColorToggle = (colorName) => {
    const newColors = activeColors.includes(colorName) 
      ? activeColors.filter(c => c !== colorName) 
      : [...activeColors, colorName];
    updateFilters({ color: newColors });
  };

  const clearFilters = () => {
    updateFilters({
      category: null,
      tag: null,
      inStock: null,
      size: null,
      color: null,
      search: null
    });
  };

  const getCategoryDisplayName = () => {
    if (activeTag) {
      return activeTag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (activeCategory) {
      const catObj = categories.find(c => c.slug === activeCategory || c.name === activeCategory);
      return catObj ? catObj.name : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);
    }
    if (activeSearch) {
      return `Results for "${activeSearch}"`;
    }
    return 'All Products';
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface w-full">
      <Header />
      
      {/* Page Header Header */}
      <div className="bg-surface border-b border-outline-variant/30 pt-10 pb-10">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="flex items-center">
            <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight">
              {getCategoryDisplayName()}
            </h1>
            {activeSearch && (
              <button 
                onClick={() => updateFilters({ search: null })}
                className="ml-4 p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant flex items-center justify-center"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
           {(activeCategory === '' || activeCategory === 'apparel') && !activeTag && !activeSearch && (
             <p className="font-body-md text-on-surface-variant mt-4 max-w-xl">
               Contemporary, colour-led ready-to-wear designed for effortless confidence and personal expression.
             </p>
           )}
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-10 flex gap-12 w-full">
        
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
           <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg font-label-caps text-xs tracking-widest font-bold"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            FILTERS
          </button>
        </div>

        {/* SIDEBAR */}
        <aside className={`
          ${isMobileFilterOpen ? 'fixed inset-0 z-50 bg-surface p-6 overflow-y-auto block' : 'hidden lg:block w-64 flex-shrink-0'}
        `}>
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
              <h2 className="font-display-lg text-2xl font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          <div className="sticky top-28">
            <FilterSection title="Availability">
              <label className="flex items-center gap-3 text-on-surface cursor-pointer group hover:text-primary transition-colors">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => {
                  updateFilters({ inStock: e.target.checked ? 'true' : null });
                }} className="w-4 h-4 accent-primary" /> 
                <span>In stock</span>
              </label>
              <label className="flex items-center gap-3 text-on-surface cursor-pointer group hover:text-primary transition-colors">
                <input type="checkbox" checked={outOfStockOnly} onChange={(e) => {
                  updateFilters({ inStock: e.target.checked ? 'false' : null });
                }} className="w-4 h-4 accent-primary" /> 
                <span>Out of stock</span>
              </label>
            </FilterSection>

            <FilterSection title="Color">
              <div className="grid grid-cols-5 gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${activeColors.includes(color.name) ? 'border-primary scale-110' : 'border-outline-variant/30 hover:border-outline'}`}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Size">
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.length > 0 ? availableSizes.map((size) => (
                  <button 
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`py-2 text-xs font-label-caps tracking-wider rounded border transition-colors ${
                      activeSizes.includes(size) 
                        ? 'bg-primary border-primary text-white font-bold' 
                        : 'bg-transparent border-outline-variant/50 text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    {size}
                  </button>
                )) : (
                  <p className="col-span-3 text-sm text-on-surface-variant/60">No sizes available</p>
                )}
              </div>
            </FilterSection>

            <FilterSection title="Product Type">
              <label className="flex items-center gap-3 text-on-surface cursor-pointer group hover:text-primary transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={activeCategory === '' || activeCategory === 'apparel'} onChange={() => updateFilters({ category: null })} /> 
                <span>All Apparel</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-3 text-on-surface cursor-pointer group hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-primary"
                    checked={activeCategory === cat.slug} 
                    onChange={() => updateFilters({ category: activeCategory === cat.slug ? null : cat.slug })} 
                  /> 
                  <span>{cat.name}</span>
                </label>
              ))}
            </FilterSection>

            {/* Mobile apply button */}
            {isMobileFilterOpen && (
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-8 bg-primary text-white py-4 font-label-caps tracking-widest text-xs font-bold rounded-xl"
              >
                SHOW {totalProducts} RESULTS
              </button>
            )}
          </div>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <main className="flex-1 w-full">
          {/* Top Bar (Desktop sorting) */}
          <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <span className="font-body-md text-sm text-on-surface-variant">Showing {loading ? '...' : totalProducts} products</span>
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-xs text-on-surface-variant tracking-widest font-bold">SORT BY:</span>
              <select 
                value={activeSort} 
                onChange={(e) => updateFilters({ sort: e.target.value })} 
                className="text-sm border-none focus:outline-none cursor-pointer bg-transparent font-body-md text-primary font-medium"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Mobile Sorting & Count */}
          <div className="flex lg:hidden items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <span className="font-body-md text-sm text-on-surface-variant">{totalProducts} products</span>
             <select 
              value={activeSort} 
              onChange={(e) => updateFilters({ sort: e.target.value })} 
              className="text-sm border-none focus:outline-none cursor-pointer bg-transparent font-body-md text-primary font-medium"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low - High</option>
              <option value="price-desc">Price: High - Low</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 animate-pulse">
               {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-surface-container rounded-xl"></div>)}
             </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-surface-container-low rounded-xl border border-outline-variant/30 mt-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">search_off</span>
              <h2 className="font-display-lg text-2xl mb-2 text-on-surface">No results found</h2>
              <p className="font-body-md text-on-surface-variant mb-6">Try adjusting your filters.</p>
              <button 
                onClick={clearFilters} 
                className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors cursor-pointer font-bold"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface"></div>}>
      <ShopContent />
    </Suspense>
  );
}
