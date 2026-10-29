'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { promoBannersApi, productsApi, categoriesApi, couponsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/formatCurrency';
import Icon from '@/components/Icon';
import { lockPageScroll } from '@/lib/scrollLock';

// "50% off on orders over ₹999 (up to ₹1,500 off)" from a coupon's rules
function describeCoupon(c) {
  if (c.description && c.description.trim()) return c.description.trim();
  const amount = c.discountType === 'percentage' ? `${c.discountValue}% off` : `${formatCurrency(c.discountValue)} off`;
  const where = c.firstOrderOnly
    ? 'on your first order'
    : c.minOrderValue > 0
    ? `on orders over ${formatCurrency(c.minOrderValue)}`
    : 'on your order';
  const cap = c.discountType === 'percentage' && c.maxDiscountAmount > 0 ? ` (up to ${formatCurrency(c.maxDiscountAmount)} off)` : '';
  return `${amount} ${where}${cap}`;
}

const navLinkClass = (active) =>
  `inline-flex items-center min-h-11 whitespace-nowrap border-b font-label-caps text-xs xl:text-[13px] tracking-[0.12em] xl:tracking-[0.18em] uppercase text-on-surface hover:border-accent-gold transition-colors ${active ? 'border-accent-gold' : 'border-transparent'}`;
const iconButtonClass = 'relative w-11 h-11 inline-flex items-center justify-center hover:text-primary transition-colors cursor-pointer';
const megaLabelClass = 'font-label-caps text-[11px] tracking-[0.28em] uppercase text-gold-ink';
const megaLinkClass = 'text-[15px] text-on-surface hover:text-primary transition-colors';

// Thin outline icons from the brand reference (1.4px stroke)
const strokeProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const SearchIcon = (p) => <svg {...strokeProps} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>;
const HeartIcon = (p) => <svg {...strokeProps} {...p}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" /></svg>;
const UserIcon = (p) => <svg {...strokeProps} {...p}><circle cx="12" cy="8.5" r="3.7" /><path d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6" /></svg>;
const BagIcon = (p) => <svg {...strokeProps} {...p}><path d="M5.5 8h13l-1 11.5h-11L5.5 8Z" /><path d="M9 8V6.6a3 3 0 0 1 6 0V8" /></svg>;
const ChevronIcon = (p) => <svg {...strokeProps} viewBox="0 0 12 12" {...p}><path d="M2 4.2 6 8l4-3.8" /></svg>;

function CountBadge({ count }) {
  return (
    <span aria-hidden="true" className="absolute top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] leading-4 text-center tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  );
}

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
  const [promoCoupons, setPromoCoupons] = useState([]);
  const [navCategories, setNavCategories] = useState([]);
  // Products ticked "Best seller" in the admin, listed in the Apparel mega menu
  const [bestSellers, setBestSellers] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileApparelOpen, setMobileApparelOpen] = useState(false);
  const closeTimerRef = React.useRef(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  // Compact logo (monogram only) once the page has scrolled past the announcement bar
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 40);
    const frame = requestAnimationFrame(onScroll); // pages that open already scrolled
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [wordSuggestions, setWordSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchCacheRef = useRef(new Map());
  const searchRequestIdRef = useRef(0);

  const offers = [
    ...promoCoupons.map((c) => ({ _id: `coupon-${c._id}`, code: c.code, message: describeCoupon(c) })),
    ...banners,
  ];
  // The bar only appears once there are promo codes or banners from the admin: nothing while they
  // load, if the request fails, or if none are set
  const announcements = offers;
  // Shop and product pages sit under Apparel
  const apparelActive = pathname === '/shop' || pathname.startsWith('/products/');

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
    // Active promo codes for the announcement bar (first-order codes are hidden server-side
    // for customers who have already bought)
    async function fetchPromoCoupons() {
      try {
        const res = await couponsApi.getActive();
        if (res.success) {
          setPromoCoupons(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch promo codes', err);
      }
    }
    async function fetchNavCategories() {
      try {
        const res = await categoriesApi.getAll();
        if (res.success) {
          setNavCategories(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories for nav:', err);
      }
    }
    async function fetchBestSellers() {
      try {
        const res = await productsApi.getBestSellers();
        if (res.success) setBestSellers((res.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load best sellers for nav:', err);
      }
    }
    fetchBanners();
    fetchPromoCoupons();
    fetchNavCategories();
    fetchBestSellers();
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

  // Lock background scroll while the full-screen mobile search overlay is open.
  // The desktop inline dropdown (lg+) isn't a full takeover, so it leaves scroll alone.
  useEffect(() => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    if (searchOpen && !isDesktop) return lockPageScroll();
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

  // Desktop inline dropdown only shows text suggestions (no product cards),
  // so its keyboard nav is scoped to wordSuggestions rather than navigableItems.
  const handleDesktopSearchKeyDown = (e) => {
    if (wordSuggestions.length === 0) {
      if (e.key === 'Enter') handleSearchSubmit();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResultIndex((prev) => (prev + 1) % wordSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResultIndex((prev) => (prev - 1 + wordSuggestions.length) % wordSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeWord = wordSuggestions[activeResultIndex];
      handleSearchSubmit(activeWord || undefined);
    }
  };

  return (
    <>
      {/* Announcement bar: active promo codes and the admin's promo banners scrolling across */}
      {announcements.length > 0 && (
      <aside aria-label="Announcements" className="bg-primary text-on-primary overflow-hidden">
        {/* Each half is at least a screen wide but grows to fit the messages, so they never overlap;
            the halves are identical so the -50% loop is seamless */}
        <div className="flex w-max marquee-track font-label-caps text-[11px] md:text-xs tracking-[0.16em] uppercase">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 min-w-[100vw]">
              {announcements.map((banner) => (
                <p key={`${banner._id}-${copy}`} className="flex-1 shrink-0 h-10 px-8 flex items-center justify-center gap-2 whitespace-nowrap">
                  {banner.code && (
                    <>
                      <span>Use code</span>
                      <span className="px-2 py-0.5 border border-accent-gold/70 text-on-primary tracking-[0.2em]">{banner.code}</span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  {banner.message}
                  {banner.link && (
                    <Link href={banner.link} tabIndex={copy === 1 ? -1 : undefined} className="underline underline-offset-4 decoration-accent-gold hover:text-on-primary-container transition-colors">
                      Shop now
                    </Link>
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>
      </aside>
      )}
      <header className="sticky top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-accent-gold/35">
        <div className="relative h-16 lg:h-20 max-w-container-max mx-auto px-5 md:px-margin-desktop flex items-center justify-between">

          {/* Mobile Hamburger & Desktop Nav Links */}
          <div className="flex-1 flex items-center justify-start">
            <button
              className="lg:hidden w-11 h-11 -ml-3 inline-flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" size="lg" />
            </button>
            <nav aria-label="Primary" className="hidden lg:flex items-center gap-5 xl:gap-9">
              <div
                onMouseEnter={() => handleMouseEnter('apparel')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/shop"
                  aria-haspopup="true"
                  aria-expanded={activeMegaMenu === 'apparel'}
                  onFocus={() => handleMouseEnter('apparel')}
                  className={`${navLinkClass(apparelActive || activeMegaMenu === 'apparel')} gap-2`}
                >
                  Apparel
                  <ChevronIcon className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'apparel' ? 'rotate-180' : ''}`} />
                </Link>
              </div>
              <Link href="/shop?tag=new-arrival" className={navLinkClass(false)}>
                New Arrival
              </Link>
              <Link href="/shop?tag=sale" className={navLinkClass(false)}>
                Sale
              </Link>
              <Link href="/about" aria-current={pathname === '/about' ? 'page' : undefined} className={navLinkClass(pathname === '/about')}>
                About
              </Link>
            </nav>
          </div>

          {/* Logo, or inline search bar (desktop) when search is active */}
          <div className="relative flex justify-center items-center flex-1">
            {searchOpen ? (
              <div className="hidden lg:flex w-full items-center gap-3 border border-on-surface/25 px-5 py-2.5 bg-surface focus-within:border-primary transition-colors">
                <SearchIcon className="w-5 h-5 text-on-surface-variant shrink-0" />
                <input
                  ref={searchInputRef}
                  autoFocus
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleDesktopSearchKeyDown}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="flex-1 min-w-0 outline-none bg-transparent text-sm text-on-surface font-body-md"
                />
                <button onClick={closeSearch} aria-label="Close search" className="text-on-surface-variant hover:text-primary transition-colors">
                  <Icon name="close" size="md" className="leading-none" />
                </button>

                {/* Suggestions dropdown, anchored directly under the input */}
                {searchQuery.trim().length >= 2 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-accent-gold/35 shadow-[0_24px_40px_rgba(143,77,92,0.12)] overflow-hidden z-50 text-left">
                    {searchLoading ? (
                      <div className="py-2" aria-busy="true" aria-label="Searching">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="px-4 py-2.5"><div className={`h-3.5 rounded animate-shimmer ${['w-2/5', 'w-1/2', 'w-1/3'][i]}`} /></div>
                        ))}
                      </div>
                    ) : wordSuggestions.length === 0 ? (
                      <div className="text-center py-6 px-4">
                        <p className="text-sm text-on-surface-variant font-body-md">No matches for &quot;{searchQuery}&quot;</p>
                        <Link href="/shop" onClick={closeSearch} className="inline-block mt-2 text-xs font-label-caps tracking-widest text-primary hover:underline underline-offset-4">
                          BROWSE ALL PRODUCTS
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="px-4 py-2 border-b border-accent-gold/25 text-[10px] font-label-caps tracking-[0.28em] uppercase text-gold-ink">
                          Suggestions
                        </div>
                        <ul className="max-h-80 overflow-y-auto py-1">
                          {wordSuggestions.map((word, idx) => (
                            <li key={word}>
                              <button
                                onClick={() => handleSearchSubmit(word)}
                                onMouseEnter={() => setActiveResultIndex(idx)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                  activeResultIndex === idx ? 'text-primary bg-primary/5' : 'text-on-surface hover:text-primary hover:bg-primary/5'
                                }`}
                              >
                                {word}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link href="/" aria-label="Naarzi, Own the moment: home" className="relative flex items-center justify-center h-12 lg:h-[66px] my-2">
                {/* At the top of the page only the NAARZI wordmark shows; once scrolled it crossfades to the
                    monogram. Both sit in the same fixed-height box, so the header height never changes. */}
                <img
                  src="/brand/naarzi-wordmark.png"
                  alt="Naarzi"
                  className={`h-6 lg:h-9 w-auto transition-all duration-300 ease-out ${isCompact ? 'opacity-0 scale-95' : ''}`}
                />
                <img
                  src="/brand/naarzi-monogram.png"
                  alt=""
                  className={`absolute inset-0 m-auto h-[30px] lg:h-10 w-auto transition-all duration-300 ease-out ${isCompact ? '' : 'opacity-0 scale-90'}`}
                />
              </Link>
            )}
          </div>

          {/* Click-catcher: closes the inline desktop search when clicking outside it */}
          {searchOpen && (
            <div className="hidden lg:block fixed inset-0 z-40" onClick={closeSearch}></div>
          )}

          {/* Icons / Actions */}
          <div className="flex-1 flex items-center justify-end gap-0.5 -mr-3 text-on-surface">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className={`${iconButtonClass} ${searchOpen ? 'lg:invisible' : ''}`}>
              <SearchIcon className="w-[22px] h-[22px]" />
            </button>

            <Link href="/wishlist" aria-label={wishlistItems.length > 0 ? `Wishlist, ${wishlistItems.length} items` : 'Wishlist'} className={`${iconButtonClass} max-md:hidden`}>
              <HeartIcon className="w-[22px] h-[22px]" />
              {wishlistItems.length > 0 && <CountBadge count={wishlistItems.length} />}
            </Link>

            {user ? (
              <Link href="/account" aria-label="My account" className={`${iconButtonClass} max-md:hidden`}>
                <UserIcon className="w-[22px] h-[22px]" />
              </Link>
            ) : (
              <button onClick={() => { setAuthModalTab('login'); setIsAuthOpen(true); }} aria-label="Log in or register" className={`${iconButtonClass} max-md:hidden`}>
                <UserIcon className="w-[22px] h-[22px]" />
              </button>
            )}

            <button onClick={() => setIsCartOpen(true)} aria-label={cartCount > 0 ? `Shopping bag, ${cartCount} items` : 'Shopping bag'} className={iconButtonClass}>
              <BagIcon className="w-[22px] h-[22px]" />
              {cartCount > 0 && <CountBadge count={cartCount} />}
            </button>
          </div>
        </div>

        {/* Apparel mega menu, opening directly under the header */}
        {activeMegaMenu === 'apparel' && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-surface border-b border-accent-gold/35 shadow-[0_24px_40px_rgba(143,77,92,0.12)]"
            onMouseEnter={() => handleMouseEnter('apparel')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop pt-10 pb-11 flex flex-wrap gap-x-14 gap-y-10">
              <div className="flex flex-col gap-3.5 min-w-[200px]">
                <p className={megaLabelClass}>Apparel</p>
                <Link href="/shop?tag=trending" onClick={() => setActiveMegaMenu(null)} className="font-display-lg text-[2rem] leading-[1.1] text-on-surface hover:text-primary transition-colors">Trending</Link>
                <Link href="/shop" onClick={() => setActiveMegaMenu(null)} className="font-display-lg text-[2rem] leading-[1.1] text-on-surface hover:text-primary transition-colors">Shop All Apparel</Link>
              </div>

              <div className="flex flex-col gap-3.5 min-w-[160px]">
                <p className={megaLabelClass}>Categories</p>
                {navCategories.length > 0 ? (
                  navCategories.map((cat) => (
                    <Link key={cat._id} href={`/shop?category=${cat.slug}`} onClick={() => setActiveMegaMenu(null)} className={megaLinkClass}>
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <>
                    <span className="h-4 w-20 bg-surface-container animate-pulse" />
                    <span className="h-4 w-24 bg-surface-container animate-pulse" />
                    <span className="h-4 w-16 bg-surface-container animate-pulse" />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-3.5 min-w-[160px]">
                <p className={megaLabelClass}>Explore</p>
                <Link href="/shop?tag=new-arrival" onClick={() => setActiveMegaMenu(null)} className={megaLinkClass}>New Arrival</Link>
                <Link href="/shop?tag=sale" onClick={() => setActiveMegaMenu(null)} className={megaLinkClass}>Sale</Link>
              </div>

              {/* Only when at least one product is ticked "Best seller" in the admin */}
              {bestSellers.length > 0 && (
                <div className="flex flex-col gap-3.5 min-w-[180px]">
                  <p className={megaLabelClass}>Best Sellers</p>
                  {bestSellers.map((p) => (
                    <Link key={p._id} href={`/products/${p.slug}`} onClick={() => setActiveMegaMenu(null)} className={megaLinkClass}>
                      {p.name}
                    </Link>
                  ))}
                  <Link href="/shop?tag=best-sellers" onClick={() => setActiveMegaMenu(null)} className="text-[13px] font-label-caps tracking-[0.16em] uppercase text-primary hover:opacity-70 transition-opacity">
                    Shop all best sellers
                  </Link>
                </div>
              )}

            </div>
          </div>
        )}
      </header>

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
          <img src="/brand/naarzi-wordmark.png" alt="Naarzi" className="h-6 w-auto" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors">
            <Icon name="close" size="lg" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
          {/* Main Links */}
          <nav className="flex flex-col gap-2">
            <div>
              <button
                type="button"
                aria-expanded={mobileApparelOpen}
                className="w-full min-h-11 flex items-center justify-between cursor-pointer font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest"
                onClick={() => setMobileApparelOpen(!mobileApparelOpen)}
              >
                <span>APPAREL</span>
                <Icon name="expand_more" size="md" className="transition-transform duration-300" style={{ transform: mobileApparelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileApparelOpen ? 'max-h-[500px] mt-1' : 'max-h-0'}`}>
                <ul className="pl-4 text-sm text-on-surface-variant font-medium">
                  {navCategories.length > 0 ? (
                    navCategories.map((cat) => (
                      <li key={cat._id}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="hover:text-primary transition-colors flex items-center min-h-11"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="h-4 w-20 bg-surface-container rounded animate-pulse" />
                      <li className="h-4 w-24 bg-surface-container rounded animate-pulse" />
                    </>
                  )}
                  <li><Link href="/shop?tag=trending" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors flex items-center min-h-11">Trending</Link></li>
                  {bestSellers.length > 0 && (
                    <li><Link href="/shop?tag=best-sellers" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors flex items-center min-h-11">Best Sellers</Link></li>
                  )}
                  <li><Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-primary flex items-center min-h-11">Shop All Apparel</Link></li>
                </ul>
              </div>
            </div>
            <Link href="/shop?tag=new-arrival" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest flex items-center min-h-11">
              NEW ARRIVAL
            </Link>

            <Link href="/shop?tag=sale" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-sale w-fit font-bold tracking-widest hover:opacity-70 transition-opacity flex items-center min-h-11">
              SALE
            </Link>
          </nav>
          
          <hr className="border-outline-variant/30" />
          
          {/* Secondary Links */}
          <nav className="flex flex-col">
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider flex items-center min-h-11">ABOUT US</Link>

            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider flex items-center min-h-11">FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider flex items-center min-h-11">CONTACT</Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-outline-variant/30 bg-surface-container/30 flex flex-col gap-1">
          <div className="flex items-center gap-3 min-h-11 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); setSearchOpen(true); }}>
            <Icon name="search" size="lg" className="text-on-surface-variant" />
            <span className="font-label-caps text-xs font-bold">SEARCH</span>
          </div>
          <Link href="/wishlist" className="flex items-center justify-between min-h-11 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-3">
              <Icon name="favorite" size="lg" className="text-on-surface-variant" />
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
              <Link href="/account" className="flex items-center gap-3 min-h-11 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="person" size="lg" className="text-on-surface-variant" />
                <span className="font-label-caps text-xs font-bold">MY ACCOUNT</span>
              </Link>
              <div className="flex items-center gap-3 min-h-11 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>
                <Icon name="logout" size="lg" className="text-on-surface-variant" />
                <span className="font-label-caps text-xs font-bold">LOGOUT</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 min-h-11 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); setAuthModalTab('login'); setIsAuthOpen(true); }}>
              <Icon name="person" size="lg" className="text-on-surface-variant" />
              <span className="font-label-caps text-xs font-bold">LOGIN / REGISTER</span>
            </div>
          )}
        </div>
      </div>
      {/* Search Overlay: full-screen takeover on mobile, centered modal from sm: to lg:. Desktop (lg+) uses the inline header search instead. */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-surface sm:items-center sm:justify-center sm:bg-black/40 sm:pt-24 sm:backdrop-blur-sm lg:hidden"
          onClick={closeSearch}
        >
          <div
            className="flex h-full w-full flex-col overflow-hidden bg-surface sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-2xl sm:mx-4 sm:rounded-2xl sm:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 sm:gap-4 border-b border-outline-variant/30 p-4 sm:p-6 sm:pb-4">
              <Icon name="search" size="lg" className="text-on-surface-variant" />
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
                <Icon name="close" size="lg" />
              </button>
            </div>

            {/* Live Preview Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 sm:flex-none sm:max-h-[60vh]">
                {searchLoading && (
                  <div className="flex flex-col gap-1 mt-4" aria-busy="true" aria-label="Searching">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <div className="w-16 h-20 rounded-lg animate-shimmer flex-none" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-1/2 rounded animate-shimmer" />
                          <div className="h-3 w-1/5 rounded animate-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                              {formatCurrency(product.discountedPrice ?? product.price)}
                            </p>
                          </div>
                          <Icon name="chevron_right" size="lg" className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
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
