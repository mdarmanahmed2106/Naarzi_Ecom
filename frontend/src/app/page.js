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
  const { addToCart, setIsCartOpen } = useApp();
  const shouldReduceMotion = useReducedMotion();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(true);

  // Trending Carousel Drag Scroll State
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Reviews Carousel State & Ref
  const reviewsRef = useRef(null);

  // "The Edits" Tab Switch state
  const [activeEditIdx, setActiveEditIdx] = useState(0);
  const editsData = [
    {
      id: 'linen-suits',
      name: 'Linen Suits',
      title: 'Tailored Resort Casual Suits',
      desc: 'Crafted from organic, high-breathability linen. Designed to transition smoothly from daytime leisure to sunset ocean breezes.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANXaWhzv-hWbVmkss7ImSrgKoDSoIr5CtV6o3rNsQyVb6TIpIJGxu342c2qbH7nDa1XAO6JbcrponuHaVimVIfWNzB6vR2WZzteVdbaqb31zHAE_AYSFkFGfoHUHZzioarS6_7721hyfNTh_b_JmebUtCTfxzKc5HAHwdZukVOS4Qt4dpf8A4w3-WriUh6df5qty2osKlqzXFNoANNN9lzx5s9OsKdZOBDH1r9iKUADNmbnSV5OmxvqA'
    },
    {
      id: 'silk-slips',
      name: 'Silk Slips',
      title: 'Flowing Silk & Satin Slips',
      desc: 'Liquid-like drape that contours naturally. A study in quiet luxury, featuring low-back detailing and adjustable custom straps.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3pAvrBBot7wDb-k_B5z0L-qaAozsKQsK8uo9Kz4QCK4TzSF_0iQRTClaKS4lF3lT7ZArRzxdaMbzt6vLVKEW_httHrEiFkzsljgbUoeHHoqv5TVFQ1BC4XbOSW9Gwv34L1EG4RxzCdc-W8t0qBjZHCpm0w5y6u_hdAo7rOGVOPbRsBy1-A10dj_EmSax-hlJvvYpWOlHcpsDTR0U2jdoRV4NcBxwHRRsSqnnjbvHTWHXxg6vBt_-JtA'
    },
    {
      id: 'ribbed-tanks',
      name: 'Ribbed Tanks',
      title: 'Fine Organic Plated Ribs',
      desc: 'An essential foundation for warm minimal layering. Knitted from premium long-staple cotton for architectural texture.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIeMBEfSxzipvrzE5_u8en_SqGEqsxK0LvLnoCn0Xu-R22dHxVwuAS40Vl72ubbo8b2o6TY40BkkMypYaSnjCixMXod5ksWMx_ci1JfqN27Tb4dyuARFXkHtP6I1jlzqPHqQnUvAnii9ckAUn5iP4Jc51V2JkGF10xGWYZjZLEP5Ka4W8sBilQCUQuGdxunTNtA58y46RGlC83URgUk-b20VP6TH3iMlhe7WsZqP4da0fxsAU1S5VDQw'
    }
  ];

  // Instagram ticker images
  const instaImages = [
    'https://lh3.googleusercontent.com/aida/AP1WRLuwbVtOXdrb3zdk3EkZNAYsYDMcjI2Uvg1gu0lmnIiVbCsJ1bPWsmB5lKQBX6yGZcratFfqfDaMiNBw4a3Oi_oBUGkzFJr7bXZIfG1d5Q324u_YsRt5ROKVe7C6amQF15jezlafwLwmfOftrQSejvgG3VxXAxoxwA8LhKSasDUvrk28pLa6Wp2bRRRJmAVGDmtgiccat1cYRCf8MSzUZvnEOYhctK22eXsBy3jDH1EYJeBwMmx3jM4bN7a1',
    'https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBLQNhD0BgxsXxd7P7czm7dqEpzbBox51lXdbu4amdoYSbdVfglnEoehmzAvyrwzwJ28VH91ZBwbNZVRvWtoLqTsMt51kQ9C0ytoc-CuGba8jWEAgaOSfB6ZApu0Yt9c8WJYykjpwLJg2Ovjv8ccwaSgHFTWY72RxKbHIEAwuHwQGqjM4uzEavkH5A6eWlFvZwIEtJ91FQOx89ZvcgbiLy5GrVAnABXmPPhMtLPDM4eZp5LiW3mEmubKA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3pAvrBBot7wDb-k_B5z0L-qaAozsKQsK8uo9Kz4QCK4TzSF_0iQRTClaKS4lF3lT7ZArRzxdaMbzt6vLVKEW_httHrEiFkzsljgbUoeHHoqv5TVFQ1BC4XbOSW9Gwv34L1EG4RxzCdc-W8t0qBjZHCpm0w5y6u_hdAo7rOGVOPbRsBy1-A10dj_EmSax-hlJvvYpWOlHcpsDTR0U2jdoRV4NcBxwHRRsSqnnjbvHTWHXxg6vBt_-JtA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIeMBEfSxzipvrzE5_u8en_SqGEqsxK0LvLnoCn0Xu-R22dHxVwuAS40Vl72ubbo8b2o6TY40BkkMypYaSnjCixMXod5ksWMx_ci1JfqN27Tb4dyuARFXkHtP6I1jlzqPHqQnUvAnii9ckAUn5iP4Jc51V2JkGF10xGWYZjZLEP5Ka4W8sBilQCUQuGdxunTNtA58y46RGlC83URgUk-b20VP6TH3iMlhe7WsZqP4da0fxsAU1S5VDQw'
  ];
  // Duplicate images for seamless marquee looping
  const instaMarqueeImages = [...instaImages, ...instaImages];

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
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  // Reviews smooth scroll trigger
  const handleScrollReview = (direction) => {
    if (reviewsRef.current) {
      const scrollAmt = direction === 'left' ? -350 : 350;
      reviewsRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
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

  // Map categories to Palo Alto Shop by Category structure
  const apparelCat = categories.find(c => c.slug === 'apparel') || {};
  const accessoriesCat = categories.find(c => c.slug === 'accessories') || {};
  const shoesCat = categories.find(c => c.slug === 'shoes') || {};

  const paloAltoCategories = [
    {
      id: 'new',
      eyebrow: 'JUST ADDED',
      name: 'New',
      desc: 'Shop the latest resort collections',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLQNhD0BgxsXxd7P7czm7dqEpzbBox51lXdbu4amdoYSbdVfglnEoehmzAvyrwzwJ28VH91ZBwbNZVRvWtoLqTsMt51kQ9C0ytoc-CuGba8jWEAgaOSfB6ZApu0Yt9c8WJYykjpwLJg2Ovjv8ccwaSgHFTWY72RxKbHIEAwuHwQGqjM4uzEavkH5A6eWlFvZwIEtJ91FQOx89ZvcgbiLy5GrVAnABXmPPhMtLPDM4eZp5LiW3mEmubKA',
      action: () => handleTagFilter('new arrival')
    },
    {
      id: 'apparel',
      eyebrow: 'LAYERS TO LOVE',
      name: 'Apparel',
      desc: 'Bundle up in linen & silk style',
      image: apparelCat.image || 'https://lh3.googleusercontent.com/aida/AP1WRLuwbVtOXdrb3zdk3EkZNAYsYDMcjI2Uvg1gu0lmnIiVbCsJ1bPWsmB5lKQBX6yGZcratFfqfDaMiNBw4a3Oi_oBUGkzFJr7bXZIfG1d5Q324u_YsRt5ROKVe7C6amQF15jezlafwLwmfOftrQSejvgG3VxXAxoxwA8LhKSasDUvrk28pLa6Wp2bRRRJmAVGDmtgiccat1cYRCf8MSzUZvnEOYhctK22eXsBy3jDH1EYJeBwMmx3jM4bN7a1',
      action: () => handleCategoryFilter('apparel')
    },
    {
      id: 'accessories',
      eyebrow: 'SLEEK STYLES',
      name: 'Accessories',
      desc: 'A look for every occasion',
      image: accessoriesCat.image || 'https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH',
      action: () => handleCategoryFilter('accessories')
    },
    {
      id: 'bestselling',
      eyebrow: 'MOST-WANTED',
      name: 'Bestselling',
      desc: 'Your favorites, selling fast!',
      image: shoesCat.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIeMBEfSxzipvrzE5_u8en_SqGEqsxK0LvLnoCn0Xu-R22dHxVwuAS40Vl72ubbo8b2o6TY40BkkMypYaSnjCixMXod5ksWMx_ci1JfqN27Tb4dyuARFXkHtP6I1jlzqPHqQnUvAnii9ckAUn5iP4Jc51V2JkGF10xGWYZjZLEP5Ka4W8sBilQCUQuGdxunTNtA58y46RGlC83URgUk-b20VP6TH3iMlhe7WsZqP4da0fxsAU1S5VDQw',
      action: () => handleTagFilter('trending')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      {/* Hero Banner with Page Load Animations */}
      <section className="sticky top-0 w-full h-screen h-[100dvh] flex items-center overflow-hidden z-0">
        <div className="absolute inset-0 z-0">
          <motion.img 
            alt="Naarzi Resort Collection Hero" 
            className="w-full h-full object-cover object-center" 
            src="/hero_resort_wear.jpg"
            animate={shouldReduceMotion ? { scale: 1 } : { scale: 1.05 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/30 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-container-max mx-auto px-6 md:px-margin-desktop">
          <motion.div 
            className="max-w-xl"
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
          >
            <motion.span 
              variants={heroChildVariants}
              className="font-label-caps text-label-caps text-primary tracking-widest block mb-4"
            >
              RESORT 2026
            </motion.span>
            <motion.h1 
              variants={heroChildVariants}
              className="font-display-lg text-4xl md:text-6xl text-on-surface mb-6 leading-tight font-bold"
            >
              Elevate your everyday
            </motion.h1>
            <motion.p 
              variants={heroChildVariants}
              className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md"
            >
              Consciously crafted pieces for the modern woman, blending coastal ease with timeless sophistication.
            </motion.p>
            <motion.div 
              variants={heroChildVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => handleTagFilter('new arrival')}
                className="px-8 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm cursor-pointer font-bold"
              >
                Shop New Arrivals
              </button>
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTag('');
                }}
                className="px-8 py-4 bg-transparent border border-outline text-on-surface font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container-highest transition-colors cursor-pointer font-bold"
              >
                Explore All
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Slider/Grid with Scroll Triggered Fade-in */}
      <div className="relative z-10 -mt-8 md:-mt-10 rounded-t-[32px] md:rounded-t-[40px] bg-surface shadow-[0_-12px_40px_rgba(107,34,51,0.04)] w-full">
        <motion.section 
          className="py-20 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={scrollFadeInVariants}
        >
          <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-10 text-center font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paloAltoCategories.map((item) => (
              <div 
                key={item.id}
                onClick={item.action}
                className="group relative h-[450px] md:h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_12px_35px_rgba(107,34,51,0.06)] transition-all duration-300"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover category-tile-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:via-black/35 transition-all duration-300"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white category-tile-text">
                  <span className="font-label-caps text-[9px] text-white/70 tracking-widest uppercase block mb-2 font-semibold">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-display-lg text-2xl md:text-3xl text-white font-bold mb-2">
                    {item.name}
                  </h3>
                  <p className="font-body-md text-xs text-white/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      {/* Trending Horizontal Drag Carousel */}
      <motion.section 
        className="py-16 bg-surface-container-low/40 border-t border-b border-outline-variant/20 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={scrollFadeInVariants}
      >
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="font-label-caps text-[10px] text-primary tracking-widest block font-bold">TRENDING NOW</span>
              <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold">The Editorial Edit</h2>
            </div>
            
            <div className="hidden md:flex gap-2">
              <span className="text-[10px] text-on-surface-variant font-label-caps mr-2 self-center select-none font-bold">DRAG TO EXPLORE</span>
            </div>
          </div>

          <div 
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-6 overflow-x-auto scrollbar-hide py-4 select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory scroll-smooth`}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.slice(0, 6).map((product, idx) => {
              const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
              const displayPrice = hasDiscount ? product.discountedPrice : product.price;

              return (
                <div 
                  key={product._id} 
                  className="group min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start bg-white rounded-xl overflow-hidden border border-outline-variant/20 p-3 shadow-sm hover:shadow-[0_8px_30px_rgba(107,34,51,0.04)] transition-all duration-300 pointer-events-auto"
                >
                  <div className="relative aspect-[3/4] bg-surface-container rounded-lg overflow-hidden mb-4 product-crossfade-container">
                    {/* Marquee badge text loop */}
                    {product.isOnSale ? (
                      <MarqueeBadge text="SALE" />
                    ) : (
                      <MarqueeBadge text={idx % 2 === 0 ? 'SELLING FAST' : 'STAFF PICK'} />
                    )}

                    {/* Stacked product images for crossfade */}
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover product-image-primary"
                    />
                    <img 
                      src={product.images[1] || product.images[0]} 
                      alt={`${product.name} alternate`} 
                      className="absolute inset-0 w-full h-full object-cover product-image-secondary"
                    />

                    {/* Quick-add bag icon */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product, product.sizes[0]?.size || 'M', 1);
                        setIsCartOpen(true);
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 product-quick-add cursor-pointer border border-outline-variant/30"
                      title="Quick Add to Bag"
                    >
                      <span className="material-symbols-outlined text-lg font-bold">shopping_bag</span>
                    </button>
                  </div>

                  <Link href={`/products/${product.slug}`} className="block px-1">
                    <h3 className="font-headline-sm text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex gap-2 items-center mt-1">
                      {hasDiscount ? (
                        <>
                          <span className="font-body-md text-sm text-primary font-medium">INR {displayPrice}</span>
                          <span className="font-body-md text-xs text-on-surface-variant line-through opacity-70">INR {product.price}</span>
                        </>
                      ) : (
                        <span className="font-body-md text-sm text-on-surface-variant">INR {product.price}</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Main Product Feed & Filtering */}
      <section className="py-16 bg-surface-container-lowest w-full border-t border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 pb-6 border-b border-outline-variant/30">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-5 py-2.5 rounded-full text-xs font-label-caps tracking-widest transition-colors cursor-pointer font-bold ${
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
                  className={`px-5 py-2.5 rounded-full text-xs font-label-caps tracking-widest transition-colors cursor-pointer font-bold ${
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
            <span className="text-xs font-label-caps text-on-surface-variant mr-2 font-bold">FILTER BY TAG:</span>
            {['new arrival', 'trending', 'featured'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagFilter(selectedTag === tag ? '' : tag)}
                className={`px-4 py-2 rounded-lg text-[10px] font-label-caps tracking-wider transition-colors cursor-pointer font-bold ${
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
            <div className="text-center py-20 bg-surface rounded-xl p-8 max-w-md mx-auto border border-outline-variant/30">
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
                className="mt-6 px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors cursor-pointer font-bold"
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
                        <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden mb-4 relative shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(107,34,51,0.05)] product-crossfade-container">
                          {/* Stacked product images for crossfade */}
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover product-image-primary"
                          />
                          <img 
                            src={product.images[1] || product.images[0]} 
                            alt={`${product.name} alternate`} 
                            className="absolute inset-0 w-full h-full object-cover product-image-secondary"
                          />
                          
                          {/* Quick-add bag icon */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(product, product.sizes[0]?.size || 'M', 1);
                              setIsCartOpen(true);
                            }}
                            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 product-quick-add cursor-pointer border border-outline-variant/30"
                            title="Quick Add to Bag"
                          >
                            <span className="material-symbols-outlined text-lg font-bold">shopping_bag</span>
                          </button>

                          {/* Tags floating */}
                          {product.isOnSale && (
                            <span className="absolute top-4 right-4 bg-error text-white text-[10px] font-label-caps tracking-widest px-3 py-1.5 rounded shadow-sm z-10 flex gap-4 w-24 overflow-hidden">
                              <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
                                <span>SALE</span>
                                <span>SALE</span>
                                <span>SALE</span>
                              </div>
                            </span>
                          )}
                          {!product.isOnSale && product.tags && product.tags.length > 0 && (
                            <span className="absolute top-4 left-4 bg-surface/90 text-primary text-[8px] font-label-caps tracking-widest px-2.5 py-1.5 rounded shadow-sm font-bold">
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

      {/* "The Edits" Tab Switching Lookbook Section */}
      <motion.section 
        className="py-24 bg-surface-container-low border-t border-b border-outline-variant/20 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={scrollFadeInVariants}
      >
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-label-caps text-[10px] text-primary tracking-widest block mb-2 font-bold">EDITORIAL CAPTION</span>
            <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold mb-4">The Edits</h2>
            <p className="font-body-md text-on-surface-variant text-sm">
              Focusing on slow luxury. A curated series of looks optimized for Mediterranean summers and sun-drenched settings.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex justify-center gap-8 border-b border-outline-variant/30 pb-4 mb-12">
            {editsData.map((edit, idx) => (
              <button
                key={edit.id}
                onClick={() => setActiveEditIdx(idx)}
                className="relative pb-2 font-label-caps text-xs tracking-wider cursor-pointer font-bold"
              >
                <span className={`transition-colors duration-200 ${
                  activeEditIdx === idx ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}>
                  {edit.name.toUpperCase()}
                </span>
                
                {/* layoutId underline */}
                {activeEditIdx === idx && !shouldReduceMotion && (
                  <motion.span 
                    layoutId="activeTabUnderlineEdits"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {activeEditIdx === idx && shouldReduceMotion && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Crossfade layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[450px]">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-label-caps text-[9px] text-primary tracking-widest block font-bold">LOOK DETAIL</span>
              
              <div className="relative min-h-[140px]">
                {editsData.map((edit, idx) => (
                  <div 
                    key={edit.id}
                    className={`transition-all duration-500 absolute inset-0 ${
                      activeEditIdx === idx ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-2 z-0 pointer-events-none'
                    }`}
                  >
                    <h3 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-4 font-bold leading-tight">
                      {edit.title}
                    </h3>
                    <p className="font-body-lg text-on-surface-variant leading-relaxed">
                      {edit.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link 
                  href="/?category=apparel"
                  className="inline-flex items-center gap-2 font-label-caps text-xs tracking-widest text-primary border-b border-primary pb-2 hover:opacity-85 transition-opacity font-bold"
                >
                  EXPLORE COLLECTION
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Crossfading images */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-surface-container border border-outline-variant/20">
                {editsData.map((edit, idx) => (
                  <img 
                    key={edit.id}
                    src={edit.img} 
                    alt={edit.name} 
                    className={`w-full h-full object-cover transition-opacity duration-500 absolute inset-0 ${
                      activeEditIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Editorial lookbook section with Scroll Triggered Fade-in */}
      <motion.section 
        className="py-24 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={scrollFadeInVariants}
      >
        <div className="lg:col-span-5 space-y-6">
          <span className="font-label-caps text-label-caps text-primary tracking-widest block font-bold">
            EDITORIAL LOOKBOOK
          </span>
          <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface leading-tight font-bold">
            Sun-Drenched Warm Minimalism
          </h2>
          <p className="font-body-lg text-on-surface-variant">
            Our visual language draws inspiration from Mediterranean beachside walls, organic cotton, linen wraps, and neutral plaster backdrops. We focus on breathing rooms, soft tactile shadows, and quiet luxury.
          </p>
          <div className="pt-4">
            <Link 
              href="/?category=apparel"
              className="inline-flex items-center gap-2 font-label-caps text-xs tracking-widest text-primary border-b border-primary pb-2 hover:opacity-80 transition-opacity font-bold"
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
              className="w-full h-full object-cover category-tile-image" 
              alt="Lookbook 1" 
            />
          </div>
          <div className="rounded-xl overflow-hidden h-96 mt-8 shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida/AP1WRLue8q7KBq8NRPdoVsB-Ss2K9mtkUh2W48y_oRra9g-28X3rBJUX9nYZVBgrNuftBmURFLGAxoWBDiHBtGKU_CQe5se06BdixWuKGd49AFd57SmE0ErJOYEyA8muHMaz4R7jZvrTaAMQhjBwli7O67zfycy9LcCqE8yzdB27X504m5RqJ8CuY3Zv-9RjPEwqkzHYKpAQamYiD9C4OoMwgfm2fOV1RD2goAyNz0dK-hZTHu8RApy-eagWqTbH" 
              className="w-full h-full object-cover category-tile-image" 
              alt="Lookbook 2" 
            />
          </div>
        </div>
      </motion.section>

      {/* Reviews Carousel testimonial section */}
      <motion.section 
        className="py-16 bg-surface-container-low/30 border-t border-outline-variant/20 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={scrollFadeInVariants}
      >
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="font-label-caps text-[10px] text-primary tracking-widest block font-bold">GUEST DIARIES</span>
              <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold">Reviews & Testimonials</h2>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleScrollReview('left')}
                className="w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer bg-white"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <button 
                onClick={() => handleScrollReview('right')}
                className="w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors cursor-pointer bg-white"
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          <div 
            ref={reviewsRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4"
          >
            {[
              {
                text: "Absolutely stunning fabric. The linen trousers drape beautifully and feel incredibly soft.",
                author: "Emily R.",
                rating: 5
              },
              {
                text: "Naarzi has become my go-to for resort wear. Simple, elegant, and timeless silhouettes.",
                author: "Sophia M.",
                rating: 5
              },
              {
                text: "The quality of the organic cotton ribbed tanks is unmatched. Soft texture with structure.",
                author: "Alisha K.",
                rating: 5
              },
              {
                text: "Breathtaking color palette! The Wine slip dress fits like a dream. Highly recommend.",
                author: "Carla L.",
                rating: 5
              }
            ].map((rev, idx) => (
              <div 
                key={idx}
                className="min-w-[300px] md:min-w-[350px] max-w-[350px] snap-start bg-white border border-outline-variant/20 rounded-xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-base fill-1" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
                <div className="mt-6 border-t border-outline-variant/10 pt-4 flex justify-between items-center">
                  <span className="font-label-caps text-[10px] text-on-surface font-bold">{rev.author}</span>
                  <span className="text-[10px] text-green-600 font-label-caps tracking-wider flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-xs">verified</span> VERIFIED CUSTOMER
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Instagram Gallery infinite loop marquee ticker */}
      <section className="py-16 overflow-hidden border-t border-outline-variant/20 w-full bg-white select-none">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="font-label-caps text-[10px] text-primary tracking-widest block mb-2 font-bold">#NAARZILIFE</span>
          <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-bold">Instagram Gallery</h2>
        </div>

        <div className="w-full relative overflow-hidden py-4">
          <div className="flex gap-4 w-max instagram-marquee-track">
            {instaMarqueeImages.map((img, idx) => (
              <div key={idx} className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer border border-outline-variant/10">
                <img 
                  src={img} 
                  alt={`Instagram photo ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    photo_camera
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      </div> {/* Closing the relative z-10 sticky cover wrapper */}

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
