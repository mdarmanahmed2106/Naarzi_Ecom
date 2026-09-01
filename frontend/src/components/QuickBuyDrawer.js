'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function QuickBuyDrawer() {
  const {
    isQuickBuyOpen,
    setIsQuickBuyOpen,
    quickBuyProduct,
    setQuickBuyProduct,
    addToCart,
  } = useApp();

  const [selectedSize, setSelectedSize] = useState('');

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isQuickBuyOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Auto-select size if only one exists
      const currentSizes = quickBuyProduct?.colors?.[0]?.sizes || quickBuyProduct?.sizes || [];
      if (currentSizes.length === 1) {
        setSelectedSize(currentSizes[0].size);
      } else {
        setSelectedSize('');
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setTimeout(() => setQuickBuyProduct(null), 300); // Clear product after animation
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isQuickBuyOpen, quickBuyProduct, setQuickBuyProduct]);

  if (!isQuickBuyOpen && !quickBuyProduct) return null;

  const product = quickBuyProduct || {};

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    const color = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default';
    addToCart(product, selectedSize, 1, color);
    setIsQuickBuyOpen(false);
  };

  const price = product.discountedPrice !== undefined && product.discountedPrice !== null
    ? product.discountedPrice
    : product.price;

  const currentSizes = product.colors?.[0]?.sizes || product.sizes || [];
  // Check if item is entirely out of stock
  const isOutOfStock = currentSizes.length === 0 || !currentSizes.some(s => s.stock > 0);

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isQuickBuyOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsQuickBuyOpen(false)}
    >
      <div 
        className={`w-full max-w-[400px] h-full bg-surface shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isQuickBuyOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
          <button 
            onClick={() => setIsQuickBuyOpen(false)}
            className="text-on-surface-variant hover:text-on-surface ml-auto"
          >
            <span className="material-symbols-outlined font-light text-[28px]">close</span>
          </button>
        </div>

        {/* Content */}
        {product.name && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Product Info */}
            <div className="flex gap-4">
              <div className="w-24 h-32 bg-surface-container rounded overflow-hidden flex-none">
                <img 
                  src={product.colors?.[0]?.images?.[0] || 'https://placehold.co/400x600'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-display-md text-xl text-on-surface leading-tight mb-2">{product.name}</h2>
                <div className="font-medium text-on-surface">INR {price?.toFixed(2)}</div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm text-on-surface">
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-error' : 'bg-green-500'}`}></span>
              {isOutOfStock ? 'Out of stock' : 'Item is in stock'}
            </div>

            {/* Color */}
            {product.color && (
              <div>
                <span className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-2 uppercase">COLOR</span>
                <div className="w-8 h-8 rounded border border-on-surface flex items-center justify-center relative overflow-hidden bg-[#e6d5c3]">
                  {/* Ideally dynamic color from DB, but hardcoding beige-ish for design match if none provided */}
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </span>
                </div>
              </div>
            )}

            {/* Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-label-caps tracking-widest text-on-surface-variant uppercase">SIZE</span>
                <button className="text-[10px] font-label-caps tracking-widest text-on-surface-variant flex items-center gap-1 hover:text-on-surface">
                  <span className="material-symbols-outlined text-[14px]">straighten</span>
                  SIZE GUIDE
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {currentSizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const isSoldOut = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(s.size)}
                      className={`
                        py-3 text-sm font-medium border rounded transition-colors
                        ${isSelected ? 'border-on-surface bg-on-surface text-surface' : 'border-outline-variant text-on-surface hover:border-on-surface'}
                        ${isSoldOut ? 'opacity-30 cursor-not-allowed line-through' : ''}
                      `}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demo text */}
            <p className="text-sm text-on-surface-variant leading-relaxed">
              All products in this store are for demo purposes only. They have been generously provided by Alohas.
            </p>

          </div>
        )}

        {/* Footer */}
        {product.name && (
          <div className="p-6 border-t border-outline-variant/30 space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-4 bg-[#0A0A0A] text-white font-bold text-sm tracking-widest rounded flex justify-center items-center gap-2 hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              <span>ADD TO CART • INR {price?.toFixed(2)}</span>
            </button>
            <div className="text-center">
              <Link 
                href={`/products/${product.slug}`}
                onClick={() => setIsQuickBuyOpen(false)}
                className="text-sm text-on-surface underline hover:text-on-surface-variant transition-colors"
              >
                View all details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
