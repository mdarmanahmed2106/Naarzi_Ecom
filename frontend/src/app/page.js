'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { productsApi, categoriesApi } from '@/lib/api';
import Icon from '@/components/Icon';
import { ProductCardSkeleton } from '@/components/Skeletons';
import ProductCard from '@/components/ProductCard';
import ScrollRevealText from '@/components/ScrollRevealText';
import ScrollStorytellingSection from '@/components/ScrollStorytellingSection';
import NaarziStorySection from '@/components/NaarziStorySection';
import HighlightsStrip from '@/components/HighlightsStrip';
import RevealFooter from '@/components/RevealFooter';
import HeroCapsule from '@/components/HeroCapsule';
import CapsuleBand from '@/components/CapsuleBand';

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

  // New Arrivals Carousel Drag Scroll State & Boundary Visibility
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
        // Products tagged "new arrival" in the admin; the latest products if none are tagged yet
        let response = await productsApi.getAll({ tag: 'new-arrival', limit: 12 });
        if (response.success && !(response.data || []).length) {
          response = await productsApi.getAll({ limit: 12 });
        }
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
    kaftans: { eyebrow: 'FLUID DRAPE', tagline: 'Loose, flowing and made to move.' },
  };
  // The category is spelt a few ways in the admin; all of them get the kaftan copy
  CATEGORY_COPY.kaftan = CATEGORY_COPY.kaftans;
  CATEGORY_COPY.kafatan = CATEGORY_COPY.kaftans;
  const CATEGORY_ORDER = ['shirts', 'kurtis-tunics', 'co-ord-sets', 'suit-sets', 'skirts'];
  // Desktop columns by tile count (full class names so Tailwind generates them)
  const GRID_COLS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-3' };
  const rank = (slug) => {
    const i = CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };

  // Every top-level category the admin creates gets a tile: the brand's five in their set order,
  // then any others.
  const shopCategories = categories
    .filter((c) => !c.parentCategory)
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

      {/* Hero: launch capsule looks (from the brand reference) */}
      <HeroCapsule />

      {/* Card + footer share one layer above the sticky hero; the footer sticks to the bottom inside it */}
      <div className="relative z-10 -mt-8 md:-mt-10">

      {/* Category Slider/Grid with Scroll Triggered Fade-in */}
      <div className="relative z-10 bg-surface shadow-[0_-12px_40px_rgba(28,26,23,0.06),0_24px_40px_-12px_rgba(28,26,23,0.3)] w-full">
        <motion.section
          className="py-14 md:py-28 max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05, margin: "0px 0px 100px 0px" }}
          variants={scrollFadeInVariants}
        >
          <div className="text-center max-w-xl mx-auto mb-8 md:mb-14">
            <span className="font-label-caps text-[10px] text-gold-ink tracking-[0.35em] block mb-4">SHOP BY CATEGORY</span>
            <h2 className="font-display-lg text-[2rem] md:text-5xl text-on-surface">
              Find Your <span className="italic font-normal text-primary">Shape</span>
            </h2>
            <p className="font-body-md text-sm md:text-base font-light text-on-surface-variant mt-4">
              From tailored shirts to flowing co-ord sets, browse by the silhouette you reach for most.
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
                className={`group relative lg:aspect-auto ${shopCategories.length >= 5 ? 'lg:h-[460px]' : 'lg:h-[500px]'} overflow-hidden cursor-pointer ${
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
                    className="w-full h-full object-cover object-[50%_20%] category-tile-image"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                <motion.div variants={categoryTextVariants} className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 text-white">
                <div className="category-tile-text">
                  <span className="font-label-caps text-[10px] text-white/75 tracking-[0.25em] uppercase block mb-1 md:mb-2">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-display-lg text-xl md:text-[1.9rem] leading-tight text-white md:mb-2">
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

        {/* New Arrivals Carousel (Single Row Alignment per Reference) */}
        <section className="py-14 md:py-24 bg-surface-container-lowest w-full border-t border-outline-variant/30">
          <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop">

            {/* Section Header: Title, CTA Button & Nav Controls */}
            <div className="flex flex-row justify-between items-end gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-outline-variant/30">
              <div>
                <span className="font-label-caps text-[10px] text-gold-ink tracking-[0.35em] block mb-3 uppercase">
                  JUST IN
                </span>
                <h2 className="font-display-lg text-[2rem] leading-tight md:text-5xl text-on-surface">
                  New <span className="italic font-serif text-primary font-normal">Arrivals</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/shop?tag=new-arrival"
                  className="group px-3 py-2 sm:px-0 sm:py-2 text-primary text-[11px] font-label-caps tracking-[0.25em] border-b border-primary/0 hover:border-primary transition-colors duration-300 inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <span><span className="sm:hidden">VIEW ALL</span><span className="hidden sm:inline">SHOP ALL NEW ARRIVALS</span></span>
                  <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Single Row Horizontal Products Slider/Carousel */}
            {loading ? (
              <div className="flex gap-3 sm:gap-6 overflow-hidden py-6">
                {[1, 2, 3, 4].map((i) => (
                  <ProductCardSkeleton key={i} className="w-[calc(50%-1.25rem)] sm:w-[280px] md:w-[300px] flex-shrink-0" />
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

        {/* Launch capsule band (from the brand reference), right after the products */}
        <CapsuleBand />

        {/* Scroll-Driven Text Reveal Manifesto Section */}
        <ScrollRevealText />

        {/* Full-Screen Scroll-Driven Storytelling Section (GSAP Pin + Overlapping Card Deck) */}
        <ScrollStorytellingSection />

        {/* The Naarzi Story: scroll-animated editorial collage */}
        <NaarziStorySection />


        {/* Closing promises strip: the last thing on the card before it lifts away */}
        <HighlightsStrip />

      </div> {/* Closing the content card */}

      {/* Footer revealed from underneath the card */}
      <RevealFooter />

      </div> {/* Closing the card + footer layer */}

      {/* Global Modals / Overlay components */}
    </div>
  );
}

import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div aria-busy="true" aria-label="Loading" className="w-full h-[calc(100dvh-5rem)] animate-shimmer" />
        <Footer />
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
