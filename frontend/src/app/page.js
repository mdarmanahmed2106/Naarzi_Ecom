'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { productsApi, categoriesApi } from '@/lib/api';

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);

  // Sync category and tag with URL query params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams]);

  // Load Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await categoriesApi.getAll();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Load Products based on filters
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) {
          // Find matching category ID
          const catObj = categories.find(c => c.slug === selectedCategory || c.name === selectedCategory);
          if (catObj) {
            params.category = catObj._id;
          }
        }
        if (selectedTag) {
          params.tag = selectedTag;
        }
        if (searchVal) {
          params.search = searchVal;
        }
        
        const response = await productsApi.getAll(params);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, selectedTag, searchVal, categories]);

  const handleCategoryFilter = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleTagFilter = (tag) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      {/* Hero Banner */}
      <section className="relative w-full h-[75vh] min-h-[500px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Naarzi Resort Collection Hero" 
            className="w-full h-full object-cover object-center" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLtEjcQoKnaAVgF78U7xuTNE3Y4rdh0DPiEC4if45-dF56Op5sIPcmmTUA8wQfd6hVUg5-wiDdoRqfXXMEdqYa9zjU4zuaxRR54zuU4KRoM5e_bCF-cdVqpGcoXaf87nb35NF4qOSNczM--WDQBvES7FCnAHrhpMDFnuLmgDr82huYFlnr7m_c83fqy0rv8YVtcjtQqLakFEwyezImiVd60e7B3qdUCrqdkMa5QBH7hvCUjwVMk-9O-AqHzp" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/30 to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <div className="max-w-xl">
            <span className="font-label-caps text-label-caps text-primary tracking-widest block mb-4">
              RESORT 2026
            </span>
            <h1 className="font-display-lg text-4xl md:text-6xl text-on-surface mb-6 leading-tight">
              Elevate your everyday
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md">
              Consciously crafted pieces for the modern woman, blending coastal ease with timeless sophistication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleTagFilter('new arrival')}
                className="px-8 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm"
              >
                Shop New Arrivals
              </button>
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTag('');
                }}
                className="px-8 py-4 bg-transparent border border-outline text-on-surface font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                Explore All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Slider/Grid */}
      <section className="py-16 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full">
        <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-8 text-center">
          Browse Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat._id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className="group relative h-80 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_8px_30px_rgba(107,34,51,0.08)] transition-all duration-300"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-display-lg text-xl mb-1">{cat.name}</h3>
                <span className="font-label-caps text-[10px] tracking-widest border-b border-white pb-1">
                  VIEW PRODUCTS
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Product Feed & Filtering */}
      <section className="py-16 bg-surface-container-lowest w-full border-t border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 pb-6 border-b border-outline-variant/30">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-5 py-2.5 rounded-full text-xs font-label-caps tracking-widest transition-colors ${
                  !selectedCategory
                    ? 'bg-primary text-white'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                ALL
              </button>
              {categories.map(c => (
                <button
                  key={c._id}
                  onClick={() => handleCategoryFilter(c.slug)}
                  className={`px-5 py-2.5 rounded-full text-xs font-label-caps tracking-widest transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-primary text-white'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {c.name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-surface border border-outline/20 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors"
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/60 text-lg">
                search
              </span>
            </div>
          </div>

          {/* Tag Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            <span className="text-xs font-label-caps text-on-surface-variant mr-2">FILTER BY TAG:</span>
            {['new arrival', 'trending', 'featured'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(selectedTag === tag ? '' : tag)}
                className={`px-4 py-2 rounded-lg text-[10px] font-label-caps tracking-wider transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-container text-primary font-bold'
                    : 'bg-surface hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
              <p className="font-body-md text-on-surface-variant mt-4">Loading collection...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-xl p-8 max-w-md mx-auto">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
                search_off
              </span>
              <p className="font-body-md text-on-surface-variant">
                We couldn't find any products matching those criteria.
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTag('');
                  setSearchVal('');
                }}
                className="mt-6 px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => {
                const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
                const price = hasDiscount ? product.discountedPrice : product.price;
                const originalPrice = product.price;

                return (
                  <div key={product._id} className="group cursor-pointer">
                    <Link href={`/products/${product.slug}`}>
                      <div>
                        {/* Image Frame */}
                        <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden mb-4 relative shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(107,34,51,0.05)]">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          {/* Tags floating */}
                          {product.tags && product.tags.length > 0 && (
                            <span className="absolute top-4 left-4 bg-surface/90 text-primary text-[8px] font-label-caps tracking-widest px-2.5 py-1.5 rounded shadow-sm">
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
                                <span className="font-body-md text-xs text-on-surface-variant line-through">
                                  INR {originalPrice}
                                </span>
                              </>
                            ) : (
                              <span className="font-body-md text-sm text-on-surface-variant">
                                INR {price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Editorial lookbook section */}
      <section className="py-24 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <span className="font-label-caps text-label-caps text-primary tracking-widest block">
            EDITORIAL LOOKBOOK
          </span>
          <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface leading-tight">
            Sun-Drenched Warm Minimalism
          </h2>
          <p className="font-body-lg text-on-surface-variant">
            Our visual language draws inspiration from Mediterranean beachside walls, organic cotton, linen wraps, and neutral plaster backdrops. We focus on breathing rooms, soft tactile shadows, and quiet luxury.
          </p>
          <div className="pt-4">
            <Link 
              href="/?category=apparel"
              className="inline-flex items-center gap-2 font-label-caps text-xs tracking-widest text-primary border-b border-primary pb-2 hover:opacity-80 transition-opacity"
            >
              EXPLORE RESORT COLLECTION
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden h-96 shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida/AP1WRLuwbVtOXdrb3zdk3EkZNAYsYDMcjI2Uvg1gu0lmnIiVbCsJ1bPWsmB5lKQBX6yGZcratFfqfDaMiNBw4a3Oi_oBUGkzFJr7bXZIfG1d5Q324u_YsRt5ROKVe7C6amQF15jezlafwLwmfOftrQSejvgG3VxXAxoxwA8LhKSasDUvrk28pLa6Wp2bRRRJmAVGDmtgiccat1cYRCf8MSzUZvnEOYhctK22eXsBy3jDH1EYJeBwMmx3jM4bN7a1" 
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" 
              alt="Lookbook 1" 
            />
          </div>
          <div className="rounded-xl overflow-hidden h-96 mt-8 shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH" 
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" 
              alt="Lookbook 2" 
            />
          </div>
        </div>
      </section>

      {/* Global Modals / Overlay components */}
      <CartDrawer />
      <AuthModal />

      <Footer />
    </div>
  );
}

import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
        </div>
        <Footer />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
