'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi, categoriesApi } from '@/lib/api';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [outOfStockOnly, setOutOfStockOnly] = useState(searchParams.get('inStock') === 'false');
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get('size') ? searchParams.get('size').split(',') : []
  );
  
  // Sorting State
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Sidebar sections expansion state
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);

  // Available Sizes
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoriesApi.getAll();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          limit: 100, // Fetch more for the listing page
          sort
        };
        
        if (selectedCategory) params.category = selectedCategory;
        if (inStockOnly) params.inStock = 'true';
        else if (outOfStockOnly) params.inStock = 'false';
        
        if (selectedSizes.length > 0) {
          params.size = selectedSizes.join(',');
        }

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
  }, [selectedCategory, inStockOnly, outOfStockOnly, selectedSizes, sort]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (inStockOnly) params.set('inStock', 'true');
    else if (outOfStockOnly) params.set('inStock', 'false');
    if (selectedSizes.length > 0) params.set('size', selectedSizes.join(','));
    if (sort && sort !== 'newest') params.set('sort', sort);

    const newUrl = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, inStockOnly, outOfStockOnly, selectedSizes, sort, router]);

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleAvailabilityToggle = (type) => {
    if (type === 'inStock') {
      setInStockOnly(!inStockOnly);
      setOutOfStockOnly(false); // Can't be both exclusively
    } else {
      setOutOfStockOnly(!outOfStockOnly);
      setInStockOnly(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-12 md:py-16">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="sticky top-28 flex flex-col gap-8">
            
            {/* Availability Filter */}
            <div className="border-b border-outline-variant/30 pb-6">
              <button 
                onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                className="flex items-center justify-between w-full text-left font-label-caps text-xs tracking-widest font-bold text-on-surface mb-4"
              >
                AVAILABILITY
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  {isAvailabilityOpen ? 'remove' : 'add'}
                </span>
              </button>
              
              <AnimatePresence>
                {isAvailabilityOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-3"
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                        {inStockOnly && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={inStockOnly} 
                        onChange={() => handleAvailabilityToggle('inStock')} 
                      />
                      <span className="text-sm font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">In stock</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${outOfStockOnly ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                        {outOfStockOnly && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={outOfStockOnly} 
                        onChange={() => handleAvailabilityToggle('outOfStock')} 
                      />
                      <span className="text-sm font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Out of stock</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size Filter */}
            <div className="border-b border-outline-variant/30 pb-6">
              <button 
                onClick={() => setIsSizeOpen(!isSizeOpen)}
                className="flex items-center justify-between w-full text-left font-label-caps text-xs tracking-widest font-bold text-on-surface mb-4"
              >
                SIZE
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  {isSizeOpen ? 'remove' : 'add'}
                </span>
              </button>
              
              <AnimatePresence>
                {isSizeOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-3"
                  >
                    {sizeOptions.map(size => (
                      <label key={size} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedSizes.includes(size) ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                          {selectedSizes.includes(size) && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={selectedSizes.includes(size)} 
                          onChange={() => handleSizeToggle(size)} 
                        />
                        <span className="text-sm font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{size}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Filter */}
            <div className="border-b border-outline-variant/30 pb-6">
              <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-full text-left font-label-caps text-xs tracking-widest font-bold text-on-surface mb-4"
              >
                PRODUCT TYPE
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  {isCategoryOpen ? 'remove' : 'add'}
                </span>
              </button>
              
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col gap-3"
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedCategory === '' ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                        {selectedCategory === '' && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        checked={selectedCategory === ''} 
                        onChange={() => setSelectedCategory('')} 
                      />
                      <span className="text-sm font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">All Types</span>
                    </label>

                    {categories.map(cat => (
                      <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedCategory === cat.slug ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                          {selectedCategory === cat.slug && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                        </div>
                        <input 
                          type="radio" 
                          className="hidden" 
                          name="category"
                          checked={selectedCategory === cat.slug} 
                          onChange={() => setSelectedCategory(cat.slug)} 
                        />
                        <span className="text-sm font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{cat.name}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </aside>

        {/* MAIN PRODUCT GRID */}
        <div className="flex-1">
          {/* Top Bar (Count & Sort) */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/20">
            <div className="text-sm font-body-md text-on-surface-variant">
              {loading ? 'Loading...' : `${totalProducts} products`}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-on-surface-variant font-body-md">
              <span>Sort by</span>
              <div className="relative">
                <select 
                  className="appearance-none bg-transparent pl-2 pr-6 py-1 cursor-pointer font-bold text-on-surface focus:outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-surface-container rounded-sm"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {products.map(product => {
                const isSoldOut = product.stock <= 0;
                const activeSizes = product.sizes?.filter(s => s.stock > 0).length || 0;
                
                let discountPercent = 0;
                if (product.isOnSale && product.discountedPrice) {
                  discountPercent = Math.round(((product.price - product.discountedPrice) / product.price) * 100);
                }

                return (
                  <Link href={`/products/${product.slug}`} key={product._id} className="group flex flex-col">
                    <div className="relative aspect-[3/4] mb-4 bg-surface-container overflow-hidden rounded-sm">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Hover Image if exists */}
                      {product.images[1] && (
                        <Image
                          src={product.images[1]}
                          alt={`${product.name} alternate`}
                          fill
                          className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute top-0 left-0 w-full flex justify-between p-3 z-10 pointer-events-none">
                        {isSoldOut ? (
                          <div className="bg-surface/90 text-on-surface font-label-caps text-[9px] tracking-widest px-2 py-1 uppercase backdrop-blur-md shadow-sm">
                            Sold Out
                          </div>
                        ) : product.isOnSale && discountPercent > 0 ? (
                          <div className="bg-error text-white font-label-caps text-[9px] tracking-widest px-2 py-1 uppercase shadow-sm">
                            SAVE UP TO {discountPercent}%
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="font-body-lg text-base font-bold text-on-surface">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        {product.isOnSale && product.discountedPrice ? (
                          <>
                            <span className="font-body-md text-sm text-on-surface font-bold">
                              ${product.discountedPrice.toFixed(2)}
                            </span>
                            <span className="font-body-md text-sm text-on-surface-variant line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-body-md text-sm text-on-surface font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-body-md text-on-surface-variant mt-1">
                        {activeSizes > 0 ? `${activeSizes} sizes` : '1 size'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="font-display-lg text-2xl text-primary mb-2">No results found</h2>
              <p className="text-on-surface-variant font-body-md">Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setInStockOnly(false);
                  setOutOfStockOnly(false);
                  setSelectedSizes([]);
                }}
                className="mt-6 font-label-caps text-xs tracking-widest text-primary border-b border-primary pb-1 font-bold hover:text-primary-container transition-colors"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Suspense fallback={<div className="h-20 bg-surface"></div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}
