'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { productsApi, reviewsApi } from '@/lib/api';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToCart, user, setIsAuthOpen, setAuthModalTab, wishlistItems, addToWishlist, removeFromWishlist } = useApp();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  // Layout & Interactive States matching mockups
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [currentColorVariant, setCurrentColorVariant] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product, selectedColor]);

  useEffect(() => {
    if (product && product.colors) {
      const variant = product.colors.find(c => c.name === selectedColor);
      setCurrentColorVariant(variant || null);
      setActiveImage(0); // reset image index on color change
      setSelectedSize(''); // reset size
    }
  }, [selectedColor, product]);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (product && wishlistItems) {
      setIsWishlisted(wishlistItems.some(item => item._id === product._id));
    }
  }, [product, wishlistItems]);

  const handleWishlistToggle = async () => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthOpen(true);
      return;
    }

    const productId = product._id;
    const nextState = !isWishlisted;

    // Optimistic UI update
    setIsWishlisted(nextState);

    try {
      if (nextState) {
        await addToWishlist(productId);
      } else {
        await removeFromWishlist(productId);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      // Revert on error
      setIsWishlisted(!nextState);
    }
  };

  // Load product, reviews, and related products
  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const prodResponse = await productsApi.getBySlug(slug);
        if (prodResponse.success) {
          const loadedProduct = prodResponse.data;
          setProduct(loadedProduct);
          
          if (loadedProduct.colors && loadedProduct.colors.length > 0) {
            const firstColor = loadedProduct.colors[0];
            setSelectedColor(firstColor.name);
            setCurrentColorVariant(firstColor);
            if (firstColor.sizes && firstColor.sizes.length === 1) {
              setSelectedSize(firstColor.sizes[0].size);
            }
          }

          // Load reviews
          const reviewsResponse = await reviewsApi.getByProduct(loadedProduct._id);
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.data);
          }

          // Load related products of the category, excluding current product
          const allProdsResponse = await productsApi.getAll();
          if (allProdsResponse.success) {
            const filtered = allProdsResponse.data.filter(p => p._id !== loadedProduct._id);
            setRelatedProducts(filtered.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Handle Review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalTab('login');
      setIsAuthOpen(true);
      return;
    }
    
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await reviewsApi.create(product._id, { rating, comment });
      if (response.success) {
        setReviewSuccess('Review added successfully! Thank you.');
        setComment('');
        setRating(5);
        // Refresh reviews list
        const refreshedReviews = await reviewsApi.getByProduct(product._id);
        if (refreshedReviews.success) {
          setReviews(refreshedReviews.data);
        }
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Note: You must have purchased and paid for this product to leave a review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex-1 flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-40 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">
            warning
          </span>
          <h2 className="font-display-lg text-2xl mb-4 text-on-surface">Product Not Found</h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link href="/" className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl">
            RETURN HOME
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
  const price = hasDiscount ? product.discountedPrice : product.price;
  const originalPrice = product.price;

  // Check stock of selected size
  const selectedSizeObj = currentColorVariant?.sizes?.find(s => s.size === selectedSize);
  const isOutOfStock = selectedSizeObj ? selectedSizeObj.stock <= 0 : false;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="w-full pt-8 bg-surface">
        {/* Product Inner Container */}
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop pb-20">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-caps font-label-caps text-on-surface-variant mb-8 text-[10px]">
            <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/?category=${product.category.slug}`} className="hover:text-primary transition-colors uppercase">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-on-surface uppercase">{product.name}</span>
          </nav>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mb-24">
            
            {/* Gallery Column */}
            <div className="lg:col-span-7">
              {/* Mobile Swipeable Gallery */}
              <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 gap-4 pb-4">
                {currentColorVariant?.images?.map((img, index) => (
                  <div key={index} className="w-full shrink-0 snap-center aspect-[3/4] rounded-xl overflow-hidden relative bg-surface-container">
                    {product.isOnSale && index === 0 && (
                      <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-label-caps tracking-widest px-3 py-1.5 rounded shadow-sm z-10 flex gap-4 w-24 overflow-hidden">
                        <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
                          <span>SALE</span>
                          <span>SALE</span>
                          <span>SALE</span>
                        </div>
                      </div>
                    )}
                    <img 
                      src={img} 
                      alt={`${product.name} view ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Gallery (Active + Thumbnails) */}
              <div className="hidden md:flex flex-row-reverse gap-4">
                {/* Main Active Image */}
                <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm relative bg-surface-container">
                  {product.isOnSale && (
                    <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-label-caps tracking-widest px-3 py-1.5 rounded shadow-sm z-10 flex gap-4 w-24 overflow-hidden">
                      <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
                        <span>SALE</span>
                        <span>SALE</span>
                        <span>SALE</span>
                      </div>
                    </div>
                  )}
                  <img 
                    src={currentColorVariant?.images?.[activeImage]} 
                    alt={`${product.name} active`} 
                    className="w-full h-full object-cover transition-all duration-500" 
                  />
                </div>
                
                {/* Gallery Thumbnails */}
                {currentColorVariant?.images?.length > 1 && (
                  <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide w-24 shrink-0 max-h-[800px] pr-1">
                    {currentColorVariant?.images?.map((img, index) => (
                      <button 
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`w-full aspect-[3/4] shrink-0 rounded-xl overflow-hidden border transition-all cursor-pointer focus:outline-none ${
                          activeImage === index ? 'border-primary opacity-100 ring-1 ring-primary' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`${product.name} thumb ${index}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Details & Action Column */}
            <div className="lg:col-span-5 lg:pl-8 flex flex-col pt-8 lg:pt-0">
              <span className="text-secondary font-label-caps text-label-caps mb-4 tracking-widest text-xs">RESORT 2024</span>
              <h1 className="font-display-lg text-3xl md:text-4xl text-primary mb-2">
                {product.name}
              </h1>

              {/* Price Frame */}
              <div className="flex items-center gap-4 mb-6">
                {hasDiscount ? (
                  <>
                    <span className="font-body-lg text-lg text-primary font-bold">
                      INR {price}
                    </span>
                    <span className="font-body-md text-sm text-on-surface-variant line-through opacity-70">
                      INR {originalPrice}
                    </span>
                    <span className="text-[10px] font-label-caps text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200 uppercase tracking-widest font-bold">
                      SAVE INR {originalPrice - price}
                    </span>
                  </>
                ) : (
                  <span className="font-body-lg text-lg text-on-surface font-semibold">
                    INR {price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label-caps text-xs text-on-surface font-bold tracking-widest">
                    COLOR: <span className="opacity-80">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {product.colors.map((c) => (
                    <button 
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={`Select ${c.name}`} 
                      className="w-10 h-10 rounded-full border border-outline/20 hover:border-outline focus:outline-none shadow-sm relative cursor-pointer"
                      style={{ backgroundColor: c.hexCode || '#000000' }}
                    >
                      {selectedColor === c.name && (
                        <span className="absolute -inset-1 rounded-full border border-primary transition-all scale-110"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label-caps text-xs text-on-surface font-bold tracking-widest">SIZE</span>
                  <button className="font-label-caps text-xs text-on-surface-variant underline underline-offset-4 hover:text-primary transition-colors cursor-pointer">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentColorVariant?.sizes?.map((s) => {
                    const outOfStock = s.stock <= 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        onClick={() => !outOfStock && setSelectedSize(s.size)}
                        className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all focus:outline-none flex items-center justify-center cursor-pointer ${
                          outOfStock
                            ? 'bg-surface-container text-on-surface-variant/40 border-outline-variant/20 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-primary bg-surface-container text-primary font-bold shadow-sm'
                            : 'border-outline-variant/50 bg-transparent text-on-surface hover:border-primary hover:text-primary hover:bg-surface-container/30'
                        }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions: Qty, Add to Bag, Wishlist */}
              <div className="sticky bottom-0 z-40 bg-surface p-4 -mx-6 md:mx-0 md:p-0 border-t border-outline-variant/20 md:border-none shadow-[0_-12px_24px_rgba(107,34,51,0.06)] md:shadow-none flex items-center gap-3 md:gap-4 mb-8 md:mb-12 mt-4 md:mt-0 transition-all duration-300">
                {/* Quantity Selector */}
                <div className="flex items-center border border-outline-variant/50 rounded-xl h-14 bg-transparent px-1">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity" 
                    className="w-10 h-14 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <span className="w-6 md:w-8 text-center font-body-md text-body-md text-on-surface select-none">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    aria-label="Increase quantity" 
                    className="w-10 h-14 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={() => selectedSize && !isOutOfStock && addToCart(product, selectedSize, quantity, selectedColor)}
                  disabled={!selectedSize || isOutOfStock}
                  className="flex-1 h-14 bg-primary text-on-primary font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-sm hidden sm:block">shopping_bag</span>
                  {!selectedSize
                    ? 'SELECT A SIZE'
                    : isOutOfStock
                    ? 'OUT OF STOCK'
                    : 'ADD TO BAG'}
                </button>

                {/* Wishlist Button */}
                <button 
                  onClick={handleWishlistToggle}
                  aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"} 
                  className={`w-14 h-14 shrink-0 rounded-xl border flex items-center justify-center transition-colors focus:outline-none cursor-pointer ${
                    isWishlisted
                      ? 'border-primary text-primary bg-primary/5 hover:bg-primary/10'
                      : 'border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isWishlisted ? 'fill-1' : ''}`} style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                </button>
              </div>

              {/* Accordions */}
              <div className="border-t border-outline-variant/30 space-y-1">
                {/* Details Accordion */}
                <div className="border-b border-outline-variant/30">
                  <button 
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="w-full py-5 flex justify-between items-center focus:outline-none cursor-pointer"
                  >
                    <span className="font-label-caps text-xs text-on-surface font-bold tracking-widest">DETAILS</span>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${detailsOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {detailsOpen && (
                    <div className="pb-5 transition-all duration-300">
                      <ul className="list-disc pl-5 font-body-md text-sm text-on-surface-variant space-y-2">
                        <li>100% European Linen</li>
                        <li>Concealed side zipper</li>
                        <li>Adjustable shoulder straps</li>
                        <li>Dry clean only</li>
                        <li>Made ethically in Portugal</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Shipping Accordion */}
                <div className="border-b border-outline-variant/30">
                  <button 
                    onClick={() => setShippingOpen(!shippingOpen)}
                    className="w-full py-5 flex justify-between items-center focus:outline-none cursor-pointer"
                  >
                    <span className="font-label-caps text-xs text-on-surface font-bold tracking-widest">SHIPPING</span>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${shippingOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {shippingOpen && (
                    <div className="pb-5 transition-all duration-300">
                      <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                        Complimentary express shipping on all orders over $250. Standard delivery takes 3-5 business days.
                      </p>
                    </div>
                  )}
                </div>

                {/* Returns Accordion */}
                <div className="border-b border-outline-variant/30">
                  <button 
                    onClick={() => setReturnsOpen(!returnsOpen)}
                    className="w-full py-5 flex justify-between items-center focus:outline-none cursor-pointer"
                  >
                    <span className="font-label-caps text-xs text-on-surface font-bold tracking-widest">RETURNS</span>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${returnsOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {returnsOpen && (
                    <div className="pb-5 transition-all duration-300">
                      <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                        We accept returns within 30 days of delivery. Items must be unworn with original tags attached.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Reviews Section */}
          <section className="border-t border-outline-variant/30 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Write a Review Form */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-display-lg text-xl md:text-2xl text-on-surface font-semibold">
                Write a review
              </h3>
              
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30">
                  {reviewError && (
                    <div className="p-3 bg-error-container text-error text-xs rounded-lg border border-error/20">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200">
                      {reviewSuccess}
                    </div>
                  )}
                  
                  {/* Rating Input */}
                  <div>
                    <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-2">
                      RATING (1-5 STARS)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`material-symbols-outlined cursor-pointer text-2xl transition-colors ${
                            rating >= star ? 'text-secondary fill-1' : 'text-on-surface-variant/40'
                          }`}
                          onClick={() => setRating(star)}
                          style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                      YOUR FEEDBACK
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your purchase and experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full sm:w-auto px-6 py-4 sm:py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 font-bold"
                  >
                    {reviewLoading ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                  </button>
                </form>
              ) : (
                <div className="bg-surface-container/50 p-6 rounded-xl border border-outline-variant/30 text-center">
                  <p className="font-body-md text-on-surface-variant mb-4 text-sm">
                    Please log in to share your purchase feedback.
                  </p>
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setIsAuthOpen(true);
                    }}
                    className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm animate-pulse"
                  >
                    LOG IN TO REVIEW
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-display-lg text-xl md:text-2xl text-on-surface flex items-center gap-2 font-semibold font-display-lg">
                Reviews ({reviews.length})
              </h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-surface-container/20 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-3 block">
                    rate_review
                  </span>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    No reviews for this product yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border-b border-outline-variant/30 pb-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`material-symbols-outlined text-sm ${
                                rev.rating >= star ? 'text-secondary fill-1' : 'text-on-surface-variant/20'
                              }`}
                              style={{ fontVariationSettings: rev.rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-label-caps text-on-surface-variant">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className="font-body-md text-xs font-bold text-on-surface">
                        Verified Buyer: {rev.user?.name || 'Anonymous'}
                      </h5>
                      <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* You May Also Like Section (Full-width block outside inner wrapper) */}
        {relatedProducts.length > 0 && (
          <div className="w-full bg-surface-container-low py-20 md:py-[120px] border-t border-surface-container-highest">
            <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
              <div className="flex justify-between items-end mb-12">
                <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold">You May Also Like</h2>
                <div className="hidden md:flex gap-4">
                  <button className="w-12 h-12 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer bg-transparent">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <button className="w-12 h-12 rounded-full border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer bg-transparent">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="flex sm:grid sm:grid-cols-3 gap-4 md:gap-gutter overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 sm:pb-0">
                {relatedProducts.map((p) => {
                  const hasDisc = p.discountedPrice !== undefined && p.discountedPrice !== null;
                  const currPrice = hasDisc ? p.discountedPrice : p.price;
                  return (
                    <div key={p._id} className="group min-w-[280px] sm:min-w-0 snap-center">
                      <Link href={`/products/${p.slug}`} className="block">
                        <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow relative">
                          <img 
                            alt={p.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                            src={p.images[0]} 
                          />
                        </div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-headline-sm text-lg text-on-surface group-hover:text-primary transition-colors font-semibold">
                            {p.name}
                          </h3>
                          <span className="font-body-md text-on-surface whitespace-nowrap font-medium">
                            INR {currPrice}
                          </span>
                        </div>
                        <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                          {p.category?.name || 'APPAREL'}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <CartDrawer />
      <AuthModal />

      <Footer />
    </div>
  );
}

