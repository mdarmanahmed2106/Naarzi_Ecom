'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { productsApi, categoriesApi } from '@/lib/api';
import Icon from '@/components/Icon';
import ProductCard from '@/components/ProductCard';
import ScrollRevealText from '@/components/ScrollRevealText';
import ScrollStorytellingSection from '@/components/ScrollStorytellingSection';
import NaarziStorySection from '@/components/NaarziStorySection';
import HighlightsStrip from '@/components/HighlightsStrip';
import RevealFooter from '@/components/RevealFooter';
import ReviewsSection from '@/components/ReviewsSection';
import OccasionEdits from '@/components/OccasionEdits';

// Horizontal Marquee Badge Component (e.g. SELLING FAST / STAFF PICK)
function MarqueeBadge({ text }) {
  return (
    <div className="absolute top-4 left-4 bg-primary text-white text-[8px] font-label-caps tracking-widest px-2.5 py-1.5 rounded shadow-sm overflow-hidden w-20 h-6 flex items-center select-none z-20">
      <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, setIsCartOpen, setQuickBuyProduct, setIsQuickBuyOpen, wishlistItems = [], addToWishlist, removeFromWishlist, user, setIsAuthOpen, setAuthModalTab } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const [poppingWishlistId, setPoppingWishlistId] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trending Carousel Drag Scroll State & Boundary Visibility
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [products]);


  // Instagram ticker images
  const instaImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBLQNhD0BgxsXxd7P7czm7dqEpzbBox51lXdbu4amdoYSbdVfglnEoehmzAvyrwzwJ28VH91ZBwbNZVRvWtoLqTsMt51kQ9C0ytoc-CuGba8jWEAgaOSfB6ZApu0Yt9c8WJYykjpwLJg2Ovjv8ccwaSgHFTWY72RxKbHIEAwuHwQGqjM4uzEavkH5A6eWlFvZwIEtJ91FQOx89ZvcgbiLy5GrVAnABXmPPhMtLPDM4eZp5LiW3mEmubKA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3pAvrBBot7wDb-k_B5z0L-qaAozsKQsK8uo9Kz4QCK4TzSF_0iQRTClaKS4lF3lT7ZArRzxdaMbzt6vLVKEW_httHrEiFkzsljgbUoeHHoqv5TVFQ1BC4XbOSW9Gwv34L1EG4RxzCdc-W8t0qBjZHCpm0w5y6u_hdAo7rOGVOPbRsBy1-A10dj_EmSax-hlJvvYpWOlHcpsDTR0U2jdoRV4NcBxwHRRsSqnnjbvHTWHXxg6vBt_-JtA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIeMBEfSxzipvrzE5_u8en_SqGEqsxK0LvLnoCn0Xu-R22dHxVwuAS40Vl72ubbo8b2o6TY40BkkMypYaSnjCixMXod5ksWMx_ci1JfqN27Tb4dyuARFXkHtP6I1jlzqPHqQnUvAnii9ckAUn5iP4Jc51V2JkGF10xGWYZjZLEP5Ka4W8sBilQCUQuGdxunTNtA58y46RGlC83URgUk-b20VP6TH3iMlhe7WsZqP4da0fxsAU1S5VDQw'
  ];
  // Duplicate images for seamless marquee looping
  const instaMarqueeImages = [...instaImages, ...instaImages];

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

  // Load Curated Homepage Products (Independent of home URL filters)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await productsApi.getAll({ limit: 12 });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Drag Scroll mouse handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    updateScrollButtons();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
    updateScrollButtons();
  };

  // Trending Carousel smooth scroll trigger
  const handleScrollTrending = (direction) => {
    if (carouselRef.current) {
      const scrollAmt = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };


  // Staggered load animation variants for Hero
  const heroContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12
      }
    }
  };

  const heroChildVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.215, 0.61, 0.355, 1] // cubic easeOut
      }
    }
  };

  // Scroll Triggered Fade-In Variants
  const scrollFadeInVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  // Category tiles: soft staggered rise the first time they scroll into view
  const categoryGridVariants = {
    rest: {},
    show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.12, delayChildren: 0.05 } }
  };
  const categoryTileVariants = {
    rest: { opacity: 0, y: shouldReduceMotion ? 0 : 48, scale: shouldReduceMotion ? 1 : 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1] } }
  };
  const categoryImageVariants = {
    rest: { scale: shouldReduceMotion ? 1 : 1.12 },
    show: { scale: 1, transition: { duration: 1.4, ease: [0.215, 0.61, 0.355, 1] } }
  };
  const categoryTextVariants = {
    rest: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.35 } }
  };

  // "Find Your Shape": tiles come from the live categories (admin-managed). Taglines follow the
  // brand content doc's voice; a category added later still gets a tile, just without a tagline.
  // Keys are the slugs the admin generates from the category names
  const CATEGORY_COPY = {
    shirts: { eyebrow: 'SHARP & STRUCTURED', tagline: 'Tailored, structured, unmistakably sharp.' },
    'kurtis-tunics': { eyebrow: 'EVERYDAY GRACE', tagline: 'Easy silhouettes, considered detail.' },
    'co-ord-sets': { eyebrow: 'MATCHED SEPARATES', tagline: 'Two pieces, one statement.' },
    'suit-sets': { eyebrow: 'DESK TO EVENING', tagline: 'From the desk to the evening, without changing.' },
    skirts: { eyebrow: 'CLASSIC SHAPES', tagline: 'Classic shapes, NAARZI colour.' },
  };
  const CATEGORY_ORDER = ['shirts', 'kurtis-tunics', 'co-ord-sets', 'suit-sets', 'skirts'];
  // Desktop columns by tile count (full class names so Tailwind generates them)
  const GRID_COLS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3' };
  const rank = (slug) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };

  // Once any of the brand's five categories exist, show only those; until then fall back to
  // whatever categories exist so the section is never empty.
  const brandCategories = categories.filter((c) => CATEGORY_ORDER.includes(c.slug));
  const shopCategories = [...(brandCategories.length > 0 ? brandCategories : categories)]
    .sort((a, b) => rank(a.slug) - rank(b.slug))
    .map((c) => ({
      id: c.slug,
      eyebrow: CATEGORY_COPY[c.slug]?.eyebrow || 'SHOP THE EDIT',
      name: c.name,
      desc: CATEGORY_COPY[c.slug]?.tagline || '',
      image: c.image || '/hero_image.png',
      href: `/shop?category=${encodeURIComponent(c.slug)}`,
    }));

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      {/* Hero Banner with Page Load Animations */}
      <section className="sticky top-0 w-full h-dvh flex items-end md:items-center overflow-hidden z-0">
        <div className="absolute inset-0 z-0">
          <img
            alt="Naarzi Resort Collection Hero"
            className="w-full h-full object-cover object-[30%_center] md:object-center"
            src="/hero_image.png"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/30 to-transparent hidden md:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent md:hidden"></div>
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <motion.div
            className="max-w-xl pb-40 md:pb-0 md:-translate-y-8"
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
          >
            <motion.div variants={heroChildVariants} className="w-10 h-[2px] bg-[var(--color-secondary)] mb-3" />
            <motion.span
              variants={heroChildVariants}
              className="font-label-caps text-xs text-primary tracking-widest block mb-3"
            >
              LAUNCH CAPSULE
            </motion.span>
            <motion.h1
              variants={heroChildVariants}
              className="font-display-lg text-[2.5rem] md:text-6xl text-on-surface mb-3 md:mb-5 leading-[1.1] md:leading-tight font-bold"
            >
              <span className="italic font-serif text-primary">Expression</span>,<br />Not Just Fashion
            </motion.h1>
            <motion.p
              variants={heroChildVariants}
              className="font-body-lg text-base md:text-lg text-on-surface-variant mb-5 md:mb-6 max-w-md"
            >
              Wear Your Colour.<br />Feel the Vibe.
            </motion.p>
            <motion.div
              variants={heroChildVariants}
              className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3 sm:gap-4"
            >
              <Link
                href="/shop?tag=new-arrival"
                className="w-full sm:w-auto px-4 sm:px-8 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer font-bold active:scale-[0.98] text-center"
              >
                Shop New Arrivals
              </Link>
              <Link
                href="/shop?tag=sale"
                className="w-full sm:w-auto px-4 sm:px-8 py-3.5 bg-surface/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none border border-primary/40 hover:border-primary text-primary hover:bg-primary/5 font-label-caps text-xs tracking-widest rounded-xl transition-all cursor-pointer font-bold active:scale-[0.98] text-center"
              >
                Shop Sale
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle Scroll Cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: shouldReduceMotion ? 0.6 : [0.4, 1, 0.4] }}
          transition={shouldReduceMotion ? { duration: 0.4 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        >
          <span className="font-label-caps text-[10px] text-on-surface-variant tracking-widest">SCROLL</span>
          <div className="w-[1px] h-8 bg-on-surface-variant/40" />
        </motion.div>
      </section>

      {/* Card + footer share one layer above the sticky hero; the footer sticks to the bottom inside it */}
      <div className="relative z-10 -mt-8 md:-mt-10">

      {/* Category Slider/Grid with Scroll Triggered Fade-in */}
      <div className="relative z-10 rounded-t-[32px] md:rounded-t-[40px] rounded-b-[32px] md:rounded-b-[40px] bg-surface shadow-[0_-12px_40px_rgba(107,34,51,0.04),0_24px_40px_-12px_rgba(30,25,27,0.35)] w-full">
        <motion.section
          className="py-12 md:py-20 max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: "0px 0px 100px 0px" }}
          variants={scrollFadeInVariants}
        >
          <div className="text-center max-w-xl mx-auto mb-6 md:mb-10">
            <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] font-bold block mb-2">SHOP BY CATEGORY</span>
            <h2 className="font-display-lg text-[1.75rem] md:text-4xl text-on-surface font-bold">
              Find Your <span className="italic font-normal text-primary">Shape</span>
            </h2>
            <p className="font-body-md text-sm md:text-base text-on-surface-variant mt-3">
              From tailored shirts to flowing co-ord sets — browse by the silhouette you reach for most.
            </p>
          </div>
          {shopCategories.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl md:rounded-2xl bg-surface-container animate-pulse lg:aspect-auto lg:h-[460px] ${i === 4 ? 'col-span-2 lg:col-span-1 aspect-[16/9]' : 'aspect-[3/4]'}`} />
              ))}
            </div>
          ) : (
          <motion.div
            className={`grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 ${GRID_COLS[shopCategories.length] || 'lg:grid-cols-4'}`}
            initial="rest"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={categoryGridVariants}
          >
            {shopCategories.map((item, i) => (
              <motion.div
                key={item.id}
                variants={categoryTileVariants}
                className={`group relative lg:aspect-auto ${shopCategories.length >= 5 ? 'lg:h-[460px]' : 'lg:h-[500px]'} rounded-xl md:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_12px_35px_rgba(107,34,51,0.06)] transition-shadow duration-300 ${
                  // An odd tile out on the 2-column phone grid spans the full width
                  shopCategories.length % 2 === 1 && i === shopCategories.length - 1 ? 'col-span-2 lg:col-span-1 aspect-[16/9]' : 'aspect-[3/4]'
                }`}
              >
                <Link href={item.href} aria-label={`Shop ${item.name}`} className="absolute inset-0 z-10" />
                {/* Image settles from a gentle zoom; the inner img keeps its CSS hover zoom */}
                <motion.div variants={categoryImageVariants} className="w-full h-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover category-tile-image"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:via-black/35 transition-all duration-300"></div>
                <motion.div variants={categoryTextVariants} className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 text-white">
                <div className="category-tile-text">
                  <span className="font-label-caps text-[8px] md:text-[9px] text-white/70 tracking-widest uppercase block mb-1 md:mb-2 font-semibold">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-display-lg text-xl md:text-3xl text-white font-bold md:mb-2">
                    {item.name}
                  </h3>
                  {item.desc && (
                    <p className="hidden sm:block font-body-md text-xs text-white/80 leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          )}
        </motion.section>

        {/* Main Product Feed & Trending Carousel (Single Row Alignment per Reference) */}
        <section className="py-12 md:py-16 bg-surface-container-lowest w-full border-t border-outline-variant/30">
          <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop">

            {/* Section Header: Title, CTA Button & Nav Controls */}
            <div className="flex flex-row justify-between items-end gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-outline-variant/30">
              <div>
                <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] font-bold block mb-1 uppercase">
                  CURATED SELECTION
                </span>
                <h2 className="font-display-lg text-[1.75rem] leading-tight md:text-4xl text-on-surface font-bold tracking-tight">
                  Trending this <span className="italic font-serif text-primary font-normal">Season</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/shop?tag=trending"
                  className="group px-3 py-2 sm:px-7 sm:py-3.5 sm:bg-[var(--color-primary)] sm:hover:bg-[var(--color-primary-container)] text-primary sm:text-white text-[11px] sm:text-xs font-label-caps tracking-widest rounded-xl font-bold transition-all duration-300 sm:shadow-md sm:hover:shadow-lg sm:hover:-translate-y-0.5 inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <span><span className="sm:hidden">VIEW ALL</span><span className="hidden sm:inline">SHOP ALL TRENDING</span></span>
                  <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1 sm:text-white" />
                </Link>
              </div>
            </div>

            {/* Single Row Horizontal Products Slider/Carousel */}
            {loading ? (
              <div className="flex gap-3 sm:gap-6 overflow-hidden py-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-[calc(50%-1.25rem)] sm:w-[280px] md:w-[300px] flex-shrink-0">
                    <div className="w-full aspect-[3/4] rounded-xl bg-surface-container animate-pulse mb-3" />
                    <div className="h-4 w-3/4 rounded bg-surface-container animate-pulse mb-2" />
                    <div className="h-4 w-1/3 rounded bg-surface-container animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative group/carousel">
                {/* Left Floating Arrow */}
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => handleScrollTrending('left')}
                    className="absolute -left-3 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-on-surface shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center z-20 cursor-pointer border border-outline-variant/30 hidden md:flex opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    aria-label="Previous Products"
                  >
                    <Icon name="chevron_left" size="md" />
                  </button>
                )}

                {/* Single Row Horizontal Scroll Container */}
                <div
                  ref={carouselRef}
                  onScroll={updateScrollButtons}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  className="flex flex-nowrap gap-3 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-1 cursor-grab active:cursor-grabbing select-none"
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      className="w-[calc(50%-1.25rem)] sm:w-[280px] md:w-[300px] flex-shrink-0 snap-start"
                    />
                  ))}
                </div>

                {/* Right Floating Arrow */}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => handleScrollTrending('right')}
                    className="absolute -right-3 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-on-surface shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center z-20 cursor-pointer border border-outline-variant/30 hidden md:flex opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    aria-label="Next Products"
                  >
                    <Icon name="chevron_right" size="md" />
                  </button>
                )}
              </div>
            )}

          </div>
        </section>

        {/* Shop by Occasion — editorial list with a photo that follows the active occasion */}
        <OccasionEdits products={products} />

        {/* Scroll-Driven Text Reveal Manifesto Section */}
        <ScrollRevealText />

        {/* Full-Screen Scroll-Driven Storytelling Section (GSAP Pin + Overlapping Card Deck) */}
        <ScrollStorytellingSection />

        {/* The Naarzi Story: scroll-animated editorial collage */}
        <NaarziStorySection />

        {/* Featured testimonials */}
        <ReviewsSection />

        {/* Instagram Gallery infinite loop marquee ticker */}
        <section className="py-12 md:py-16 overflow-hidden border-t border-outline-variant/20 w-full bg-white select-none">
          <div className="text-center max-w-xl mx-auto mb-6 md:mb-10 px-4">
            <span className="font-label-caps text-[10px] text-primary tracking-widest block mb-2 font-bold">#NAARZILIFE</span>
            <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold">Instagram Gallery</h2>
          </div>

          <div className="w-full relative overflow-hidden py-4">
            <div className="flex gap-4 w-max instagram-marquee-track">
              {instaMarqueeImages.map((img, idx) => (
                <div key={idx} className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer border border-outline-variant/10">
                  <img
                    src={img}
                    alt={`Instagram photo ${idx}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Icon name="photo_camera" size="xl" className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing promises strip — the last thing on the card before it lifts away */}
        <HighlightsStrip />

      </div> {/* Closing the content card */}

      {/* Footer revealed from underneath the card */}
      <RevealFooter />

      </div> {/* Closing the card + footer layer */}

      {/* Global Modals / Overlay components */}
      <CartDrawer />
      <AuthModal />
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
