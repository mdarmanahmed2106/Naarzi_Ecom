'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { promoBannersApi, productsApi } from '@/lib/api';

export default function Header() {
  const {
    user,
    logout,
    cartCount,
    setIsCartOpen,
    setIsAuthOpen,
    setAuthModalTab,
    wishlistItems = [],
  } = useApp();

  const [banners, setBanners] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileApparelOpen, setMobileApparelOpen] = useState(false);
  const closeTimerRef = React.useRef(null);
  
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchCacheRef = useRef(new Map());
  const searchRequestIdRef = useRef(0);

  const handleMouseEnter = (menu) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveMegaMenu(menu);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await promoBannersApi.getAll();
        if (res.success) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }
    }
    fetchBanners();
  }, []);

  useEffect(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    setActiveResultIndex(-1);

    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      setWordSuggestions([]);
      setSearchLoading(false);
      return;
    }

    // Serve from cache instantly if we've already fetched this exact query this session
    const cached = searchCacheRef.current.get(normalizedQuery);
    if (cached) {
      setSearchResults(cached.results);
      setWordSuggestions(cached.suggestions);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const requestId = ++searchRequestIdRef.current;

    const timeout = setTimeout(async () => {
      try {
        const [productsRes, suggestionsRes] = await Promise.all([
          productsApi.getAll({ search: searchQuery, limit: 5 }),
          productsApi.getSuggestions(searchQuery)
        ]);

        // Ignore this response if a newer search has since been kicked off
        if (requestId !== searchRequestIdRef.current) return;

        const results = productsRes.success ? (productsRes.data || []) : [];
        const suggestions = suggestionsRes.success ? (suggestionsRes.data || []) : [];

        // Cap cache size with simple FIFO eviction so it can't grow unbounded in a long session
        if (searchCacheRef.current.size >= 50) {
          const oldestKey = searchCacheRef.current.keys().next().value;
          searchCacheRef.current.delete(oldestKey);
        }
        searchCacheRef.current.set(normalizedQuery, { results, suggestions });

        setSearchResults(results);
        setWordSuggestions(suggestions);
      } catch (err) {
        if (requestId === searchRequestIdRef.current) {
          console.error('Search failed:', err);
        }
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Lock background scroll while the full-screen mobile search overlay is open
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveResultIndex(-1);
  };

  const handleSearchSubmit = (query) => {
    const q = (typeof query === 'string' ? query : searchQuery).trim();
    if (q.length > 0) {
      closeSearch();
      router.push(`/shop?search=${encodeURIComponent(q)}`);
    }
  };

  const goToProduct = (product) => {
    closeSearch();
    router.push(`/products/${product.slug}`);
  };

  // Combined, keyboard-navigable list: word suggestions first, then product results
  const navigableItems = [
    ...wordSuggestions.map((word) => ({ type: 'suggestion', value: word })),
    ...searchResults.map((product) => ({ type: 'product', value: product })),
  ];

  const handleSearchKeyDown = (e) => {
    if (navigableItems.length === 0) {
      if (e.key === 'Enter') handleSearchSubmit();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResultIndex((prev) => (prev + 1) % navigableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIndex((prev) => (prev - 1 + navigableItems.length) % navigableItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const active = navigableItems[activeResultIndex];
      if (!active) {
        handleSearchSubmit();
      } else if (active.type === 'suggestion') {
        handleSearchSubmit(active.value);
      } else {
        goToProduct(active.value);
      }
    }
  };

  return (
    <>
      {banners.length > 0 && (
        <aside className="bg-surface-container text-on-surface border-b border-on-surface overflow-hidden relative">
          <div className="flex w-[200%] marquee-track text-[9px] md:text-[10px] font-label-caps tracking-widest">
            {/* First set for seamless loop */}
            <div className="flex w-1/2">
              {banners.map((banner) => (
                <div key={banner._id} className="flex-1 text-center py-2 px-4 flex items-center justify-center whitespace-nowrap">
                  {banner.message}
                  {banner.link && (
                    <Link href={banner.link} className="font-bold underline underline-offset-2 hover:text-primary transition-colors ml-1">
                      SHOP NOW
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicated set for seamless loop */}
            <div className="flex w-1/2">
              {banners.map((banner) => (
                <div key={`${banner._id}-dup`} className="flex-1 text-center py-2 px-4 flex items-center justify-center whitespace-nowrap">
                  {banner.message}
                  {banner.link && (
                    <Link href={banner.link} className="font-bold underline underline-offset-2 hover:text-primary transition-colors ml-1">
                      SHOP NOW
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
      <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-md transition-all duration-300 border-b border-on-surface">
        <div className="h-20 max-w-container-max mx-auto px-6 md:px-margin-desktop flex items-center justify-between">
          
          {/* Mobile Hamburger & Desktop Nav Links */}
          <div className="flex-1 flex items-center justify-start">
            <button 
              className="lg:hidden flex items-center justify-center p-2 -ml-2 mr-2 text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <nav className="hidden lg:flex items-center gap-6 h-full">
              <div 
                className="flex items-center h-full"
                onMouseEnter={() => handleMouseEnter('apparel')}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/shop?category=apparel" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold h-full flex items-center">
                  APPAREL
                </Link>
                
                {activeMegaMenu === 'apparel' && (
                  <div className="fixed left-0 top-20 w-full bg-surface shadow-xl border-t border-outline-variant/30 z-40">
                    <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop grid grid-cols-4 gap-12 py-10">
                      <div>
                        <h4 className="font-label-caps text-xs tracking-widest font-bold mb-4">Clothing</h4>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                          <li><Link href="/shop?category=tops" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Tops</Link></li>
                          <li><Link href="/shop?category=bottoms" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Bottoms</Link></li>
                          <li><Link href="/shop?category=dresses" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Dresses</Link></li>
                          <li><Link href="/shop?category=outerwear" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Outerwear</Link></li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-label-caps text-xs tracking-widest font-bold mb-4">Featured</h4>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                          <li><Link href="/shop?tag=trending" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Trending</Link></li>
                          <li><Link href="/shop?tag=staff-pick" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Staff Picks</Link></li>
                          <li><Link href="/shop?tag=essentials" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Essentials</Link></li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-label-caps text-xs tracking-widest font-bold mb-4">Shop All</h4>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                          <li><Link href="/shop?tag=new-arrival" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">New Arrivals</Link></li>
                          <li><Link href="/shop?tag=bestsellers" onClick={() => setActiveMegaMenu(null)} className="hover:text-primary transition-colors block">Best Sellers</Link></li>
                          <li>
                            <Link href="/shop?tag=sale" onClick={() => setActiveMegaMenu(null)} className="font-bold text-white bg-[#E55B5B] px-2 py-0.5 rounded w-fit hover:opacity-80 transition-opacity inline-block">
                              Sale
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/shop?category=knitwear" onClick={() => setActiveMegaMenu(null)} className="relative rounded-lg overflow-hidden group">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3pAvrBBot7wDb-k_B5z0L-qaAozsKQsK8uo9Kz4QCK4TzSF_0iQRTClaKS4lF3lT7ZArRzxdaMbzt6vLVKEW_httHrEiFkzsljgbUoeHHoqv5TVFQ1BC4XbOSW9Gwv34L1EG4RxzCdc-W8t0qBjZHCpm0w5y6u_hdAo7rOGVOPbRsBy1-A10dj_EmSax-hlJvvYpWOlHcpsDTR0U2jdoRV4NcBxwHRRsSqnnjbvHTWHXxg6vBt_-JtA" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" alt="Knitwear" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          <span className="absolute bottom-4 left-4 text-white font-label-caps tracking-widest text-sm font-bold">KNITWEAR</span>
                        </Link>
                        <Link href="/shop?tag=resort" onClick={() => setActiveMegaMenu(null)} className="relative rounded-lg overflow-hidden group">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIeMBEfSxzipvrzE5_u8en_SqGEqsxK0LvLnoCn0Xu-R22dHxVwuAS40Vl72ubbo8b2o6TY40BkkMypYaSnjCixMXod5ksWMx_ci1JfqN27Tb4dyuARFXkHtP6I1jlzqPHqQnUvAnii9ckAUn5iP4Jc51V2JkGF10xGWYZjZLEP5Ka4W8sBilQCUQuGdxunTNtA58y46RGlC83URgUk-b20VP6TH3iMlhe7WsZqP4da0fxsAU1S5VDQw" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" alt="Resort Looks" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                          <span className="absolute bottom-4 left-4 text-white font-label-caps tracking-widest text-sm font-bold">RESORT LOOKS</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/shop?tag=new-arrival" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">
                NEW
              </Link>

              <Link href="/shop?tag=sale" className="font-label-caps text-[11px] bg-[#E55B5B] text-white px-2 py-0.5 rounded hover:opacity-80 transition-opacity font-bold flex items-center justify-center">
                SALE
              </Link>
            </nav>
          </div>

          {/* Logo */}
          <div className="flex justify-center flex-1">
            <Link href="/" className="flex flex-col items-center justify-center">
              <span className="font-display-lg text-3xl md:text-4xl tracking-widest text-primary font-bold leading-none">
                NAARZI
              </span>
              <span className="font-label-caps text-[8px] md:text-[10px] tracking-[0.4em] text-[#C5A059] font-bold mt-2 uppercase">
                OWN THE MOMENT
              </span>
            </Link>
          </div>

          {/* Icons / Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
            <nav className="hidden xl:flex items-center gap-6 mr-4 translate-y-[1px]">
              <Link href="/about" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold leading-none">ABOUT US</Link>

              <Link href="/faq" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold leading-none">FAQ</Link>
              <Link href="/contact" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold leading-none">CONTACT</Link>
            </nav>

            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex items-center text-on-surface-variant hover:text-primary transition-colors p-2.5 -m-2.5">
              <span className="material-symbols-outlined text-[22px] leading-none">search</span>
            </button>
            
            <Link href="/wishlist" className="hidden md:flex items-center relative" title="My Wishlist">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-[22px] leading-none">
                favorite
              </span>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* User Icon */}
            {user ? (
              <Link href="/account" className="hidden md:flex items-center gap-2 cursor-pointer" title="My Account">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px] leading-none">person</span>
              </Link>
            ) : (
              <div className="hidden md:flex items-center cursor-pointer" onClick={() => { setAuthModalTab('login'); setIsAuthOpen(true); }}>
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px] leading-none">person</span>
              </div>
            )}

            {/* Cart Icon */}
            <div className="relative cursor-pointer flex items-center" onClick={() => setIsCartOpen(true)}>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px] leading-none">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Bottom Trust Banner */}
      <div className="bg-surface-container text-on-surface py-2.5 text-center text-[10px] font-label-caps tracking-widest border-b border-on-surface hidden md:block">
        Loved by over 10,000+ customers since 2016
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Drawer Content */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-surface transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <span className="font-display-lg text-xl tracking-widest text-primary font-bold">NAARZI</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
          {/* Main Links */}
          <nav className="flex flex-col gap-6">
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest"
                onClick={() => setMobileApparelOpen(!mobileApparelOpen)}
              >
                <span>APPAREL</span>
                <span className="material-symbols-outlined text-xl transition-transform duration-300" style={{ transform: mobileApparelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${mobileApparelOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
                <ul className="space-y-4 pl-4 text-sm text-on-surface-variant font-medium">
                  <li><Link href="/shop?category=tops" onClick={() => setIsMobileMenuOpen(false)}>Tops</Link></li>
                  <li><Link href="/shop?category=bottoms" onClick={() => setIsMobileMenuOpen(false)}>Bottoms</Link></li>
                  <li><Link href="/shop?category=dresses" onClick={() => setIsMobileMenuOpen(false)}>Dresses</Link></li>
                  <li><Link href="/shop?category=outerwear" onClick={() => setIsMobileMenuOpen(false)}>Outerwear</Link></li>
                  <li><Link href="/shop?tag=trending" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link></li>
                  <li><Link href="/shop?category=apparel" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-primary">Shop All Apparel</Link></li>
                </ul>
              </div>
            </div>
            <Link href="/shop?tag=new-arrival" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest">
              NEW ARRIVAL
            </Link>

            <Link href="/shop?tag=sale" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm bg-[#E55B5B] text-white px-3 py-1 rounded w-fit font-bold tracking-widest hover:opacity-80 transition-opacity">
              SALE
            </Link>
          </nav>
          
          <hr className="border-outline-variant/30" />
          
          {/* Secondary Links */}
          <nav className="flex flex-col gap-4">
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">ABOUT US</Link>

            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">CONTACT</Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-outline-variant/30 bg-surface-container/30 flex flex-col gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); setSearchOpen(true); }}>
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
            <span className="font-label-caps text-xs font-bold">SEARCH</span>
          </div>
          <Link href="/wishlist" className="flex items-center justify-between cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">favorite</span>
              <span className="font-label-caps text-xs font-bold">MY WISHLIST</span>
            </div>
            {wishlistItems.length > 0 && (
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link href="/account" className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">person</span>
                <span className="font-label-caps text-xs font-bold">MY ACCOUNT</span>
              </Link>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">logout</span>
                <span className="font-label-caps text-xs font-bold">LOGOUT</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); setAuthModalTab('login'); setIsAuthOpen(true); }}>
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">person</span>
              <span className="font-label-caps text-xs font-bold">LOGIN / REGISTER</span>
            </div>
          )}
        </div>
      </div>
      {/* Search Overlay: full-screen takeover on mobile, centered modal from sm: up */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-surface sm:items-start sm:justify-center sm:bg-black/40 sm:pt-24 sm:backdrop-blur-sm"
          onClick={closeSearch}
        >
          <div
            className="flex h-full w-full flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-2xl sm:mx-4 sm:rounded-2xl sm:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 sm:gap-4 border-b border-outline-variant/30 p-4 sm:p-6 sm:pb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-2xl">search</span>
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                inputMode="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                className="flex-1 min-w-0 outline-none text-base sm:text-lg bg-transparent text-on-surface font-body-md"
              />
              <button onClick={closeSearch} aria-label="Close search" className="text-on-surface-variant hover:text-primary transition-colors p-2 -m-2">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Live Preview Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 sm:flex-none sm:max-h-[60vh]">
                {searchLoading && <p className="text-sm text-on-surface-variant font-label-caps tracking-widest text-center py-4">SEARCHING...</p>}

                {!searchLoading && searchResults.length === 0 && wordSuggestions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-on-surface-variant font-body-md">No products found for "{searchQuery}"</p>
                    <Link href="/shop" onClick={closeSearch} className="inline-block mt-4 text-xs font-label-caps tracking-widest text-primary hover:underline underline-offset-4">
                      BROWSE ALL PRODUCTS
                    </Link>
                  </div>
                )}

                {wordSuggestions.length > 0 && (
                  <div className="mb-4 mt-4 flex flex-wrap gap-2">
                    {wordSuggestions.map((word, idx) => (
                      <button
                        key={word}
                        onClick={() => handleSearchSubmit(word)}
                        onMouseEnter={() => setActiveResultIndex(idx)}
                        className={`px-3 py-1.5 rounded-full text-xs font-label-caps tracking-widest transition-colors ${
                          activeResultIndex === idx ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-primary hover:text-white'
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 && (
                  <div className="flex flex-col gap-1 mt-4">
                    {searchResults.map((product, idx) => {
                      const resultIndex = wordSuggestions.length + idx;
                      return (
                        <Link
                          key={product._id}
                          href={`/products/${product.slug}`}
                          onClick={closeSearch}
                          onMouseEnter={() => setActiveResultIndex(resultIndex)}
                          className={`flex items-center gap-4 p-3 rounded-xl transition-colors group ${
                            activeResultIndex === resultIndex ? 'bg-surface-container' : 'hover:bg-surface-container'
                          }`}
                        >
                          <img
                            src={product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="w-16 h-20 object-cover rounded-lg bg-surface-container-high flex-none"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-headline-sm text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">{product.name}</p>
                            <p className="text-sm font-medium text-primary mt-1">
                              ${product.discountedPrice ?? product.price}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                            chevron_right
                          </span>
                        </Link>
                      );
                    })}

                    <button
                      onClick={() => handleSearchSubmit()}
                      className="mt-4 py-4 border-t border-outline-variant/30 text-center text-xs font-label-caps tracking-widest text-primary hover:bg-surface-container rounded-xl transition-colors font-bold"
                    >
                      SEE ALL RESULTS FOR "{searchQuery.toUpperCase()}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
