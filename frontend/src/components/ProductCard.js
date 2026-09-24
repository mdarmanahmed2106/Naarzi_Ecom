'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
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
          <div className="w-full aspect-[3/4] bg-surface-container rounded-xl overflow-hidden mb-3 relative shadow-xs transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(107,34,51,0.06)] product-crossfade-container">
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
            
            {/* Quick-add bag icon */}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickBuyProduct(product);
                setIsQuickBuyOpen(true);
              }}
              className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-white text-primary flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all duration-200 product-quick-add cursor-pointer border border-outline-variant/30 z-20"
              title="Quick Add to Bag"
            >
              <Icon name="shopping_bag" size="sm" className="font-bold" />
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
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm text-primary flex items-center justify-center shadow-xs hover:bg-white transition-all duration-200 z-20 cursor-pointer overflow-visible"
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
              <span className="absolute top-3.5 left-3.5 bg-error text-white text-[10px] font-label-caps tracking-widest px-2.5 py-1 rounded shadow-xs z-10 flex gap-4 w-20 overflow-hidden">
                <div className="flex gap-4 w-max marquee-track whitespace-nowrap">
                  <span>SALE</span>
                  <span>SALE</span>
                  <span>SALE</span>
                </div>
              </span>
            )}
            {!product.isOnSale && product.tags && product.tags.length > 0 && (
              <span className="absolute top-3.5 left-3.5 bg-surface/90 text-primary text-[8px] font-label-caps tracking-widest px-2 py-1 rounded shadow-xs font-bold z-10">
                {product.tags[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Text Metadata (Redesigned per Reference) */}
          <div className="space-y-1 px-0.5">
            {/* Title: Bold Sans-serif */}
            <h3 className="font-bold text-[15px] leading-snug text-on-surface group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>

            {/* Price Line: Bold Price + Strikethrough Discount */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface">
                INR {price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-on-surface-variant line-through opacity-70 font-normal">
                  INR {originalPrice}
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
