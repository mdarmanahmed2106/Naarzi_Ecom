'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatCurrency';
import Icon from './Icon';

export default function ProductCard({ product, className = '' }) {
  const { 
    wishlistItems = [], 
    addToWishlist, 
    removeFromWishlist, 
    setQuickBuyProduct, 
    setIsQuickBuyOpen, 
    user, 
    setIsAuthOpen, 
    setAuthModalTab 
  } = useApp();

  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  if (!product) return null;

  const isWishlisted = wishlistItems.some(item => item._id === product._id);
  const hasDiscount = product.discountedPrice !== undefined && 
                      product.discountedPrice !== null && 
                      product.discountedPrice < product.price;
  const price = hasDiscount ? product.discountedPrice : product.price;
  const originalPrice = product.price;

  // Active color images fallback logic
  const activeColorObj = product.colors?.[activeColorIdx];
  const colorImages = activeColorObj?.images?.length > 0 ? activeColorObj.images : [];
  const primaryImg = colorImages[0] || product.images?.[0] || '/placeholder.png';
  const secondaryImg = colorImages[1] || product.images?.[1] || primaryImg;

  return (
    <div className={`group cursor-pointer ${className}`}>
      <Link href={`/products/${product.slug}`}>
        <div>
          {/* Image Frame */}
          <div className="w-full aspect-[3/4] bg-surface-container overflow-hidden mb-4 relative product-crossfade-container">
            <img 
              src={primaryImg} 
              alt={product.name} 
              className="w-full h-full object-cover product-image-primary transition-transform duration-500 group-hover:scale-103"
            />
            <img 
              src={secondaryImg} 
              alt={`${product.name} alternate`} 
              className="absolute inset-0 w-full h-full object-cover product-image-secondary transition-transform duration-500 group-hover:scale-103"
            />
            
            {/* Quick buy: bag icon that expands into a "QUICK BUY" pill on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickBuyProduct(product);
                setIsQuickBuyOpen(true);
              }}
              className="group/qb absolute bottom-3.5 right-3.5 h-9 min-w-9 px-[9px] bg-white/95 backdrop-blur-sm text-primary flex items-center justify-center product-quick-add cursor-pointer z-20"
              aria-label="Quick buy"
            >
              <Icon name="shopping_bag" size="sm" className="flex-none" />
              <span className="max-w-0 opacity-0 overflow-hidden whitespace-nowrap font-label-caps text-[10px] tracking-[0.25em] leading-none transition-all duration-300 ease-out group-hover/qb:max-w-[7rem] group-hover/qb:opacity-100 group-hover/qb:ml-2 group-focus-visible/qb:max-w-[7rem] group-focus-visible/qb:opacity-100 group-focus-visible/qb:ml-2">
                QUICK BUY
              </span>
            </button>
            
            {/* Wishlist Icon with Heart Pop Animation */}
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!user) {
                  setAuthModalTab('login');
                  setIsAuthOpen(true);
                  return;
                }
                setIsPopping(true);
                setTimeout(() => setIsPopping(false), 500);
                if (isWishlisted) {
                  await removeFromWishlist(product._id, product.name);
                } else {
                  await addToWishlist(product._id, product.name);
                }
              }}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-primary flex items-center justify-center hover:bg-white transition-all duration-200 z-20 cursor-pointer overflow-visible"
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isPopping && (
                <span className="absolute inset-0 rounded-full bg-primary/25 animate-pulse-ring pointer-events-none" />
              )}
              <Icon
                name="favorite"
                size="sm"
                className={`transition-transform duration-200 ${isPopping ? 'animate-heart-pop text-primary' : ''} ${isWishlisted ? 'fill-1 text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
              />
            </button>

            {/* Floating Badges */}
            {product.isOnSale && (
              <span className="absolute top-3.5 left-3.5 bg-surface/90 backdrop-blur-sm text-sale text-[9px] font-label-caps tracking-[0.3em] px-2.5 py-1 z-10">
                SALE
              </span>
            )}
            {!product.isOnSale && product.tags && product.tags.length > 0 && (
              <span className="absolute top-3.5 left-3.5 bg-surface/90 backdrop-blur-sm text-primary text-[9px] font-label-caps tracking-[0.3em] px-2.5 py-1 z-10">
                {product.tags[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Text Metadata (Redesigned per Reference) */}
          <div className="space-y-1 px-0.5">
            {/* Title: quiet sans, tracked slightly */}
            <h3 className="text-[14px] tracking-[0.02em] leading-snug text-on-surface line-clamp-1 decoration-on-surface/40 underline-offset-4 group-hover:underline">
              {product.name}
            </h3>

            {/* Price Line: Price + Strikethrough Discount */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant tabular-nums">
                {formatCurrency(price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-on-surface-variant line-through opacity-60 tabular-nums">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            {/* Color Swatches: Rounded rectangular pill swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                {product.colors.map((color, idx) => {
                  const hex = color.hexCode || color.hex || (typeof color === 'string' ? color : '#1d1c15');
                  const isSelected = activeColorIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      title={color.name || `Color ${idx + 1}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveColorIdx(idx);
                      }}
                      onMouseEnter={() => setActiveColorIdx(idx)}
                      className={`w-5 h-2.5 rounded-[3px] border transition-all duration-150 cursor-pointer ${
                        isSelected 
                          ? 'border-on-surface ring-1 ring-on-surface/40 scale-105' 
                          : 'border-black/25 dark:border-white/30 hover:border-on-surface/70'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
