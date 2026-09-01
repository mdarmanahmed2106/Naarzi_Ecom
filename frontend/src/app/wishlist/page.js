'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';

export default function WishlistPage() {
  const { 
    user, 
    authLoading, 
    setIsAuthOpen, 
    setAuthModalTab, 
    wishlistItems, 
    wishlistLoading, 
    removeFromWishlist 
  } = useApp();

  // Show loading spinner while loading user or loading wishlist
  if (authLoading || (wishlistLoading && user)) {
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

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-8 pb-20 flex-1">
        <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-8 font-bold">
          My Wishlist
        </h1>

        {!user ? (
          /* User Not Logged In State */
          <div className="max-w-md mx-auto text-center py-20 bg-surface-container/20 rounded-xl p-8 border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
              lock
            </span>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">
              Please log in to view and manage your saved wishlist items.
            </p>
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthOpen(true);
              }}
              className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm cursor-pointer font-bold"
            >
              LOG IN
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Wishlist is Empty State */
          <div className="max-w-md mx-auto text-center py-20 bg-surface-container/20 rounded-xl p-8 border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
              favorite
            </span>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">
              Your wishlist is empty — start saving items you love.
            </p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm font-bold inline-block"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          /* Wishlisted Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {wishlistItems.map((product) => {
              const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice !== null;
              const price = hasDiscount ? product.discountedPrice : product.price;

              return (
                <div key={product._id} className="group relative cursor-pointer">
                  {/* Card Main Link */}
                  <Link href={`/products/${product.slug}`} className="block">
                    {/* Image frame */}
                    <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden mb-4 relative shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(107,34,51,0.05)] product-crossfade-container">
                      <img 
                        src={product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'} 
                        alt={product.name} 
                        className="w-full h-full object-cover product-image-primary"
                      />
                      <img 
                        src={product.colors?.[0]?.images?.[1] || product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'} 
                        alt={`${product.name} alternate`} 
                        className="absolute inset-0 w-full h-full object-cover product-image-secondary"
                      />
                    </div>

                    {/* Metadata details */}
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
                              INR {product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-body-md text-sm text-on-surface-variant">
                            INR {price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Float Remove Action Trigger Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(product._id);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm text-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer z-20 border border-outline-variant/30"
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CartDrawer />
      <AuthModal />
      <Footer />
    </div>
  );
}
