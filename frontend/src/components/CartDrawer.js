'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="bg-surface max-w-md w-full h-full flex flex-col shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-sm text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined">shopping_bag</span>
            Your Cart
          </h3>
          <span 
            className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-on-surface-variant"
            onClick={() => setIsCartOpen(false)}
          >
            close
          </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
                sentiment_dissatisfied
              </span>
              <p className="font-body-md text-on-surface-variant mb-6">
                Your cart is currently empty.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const price = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null
                ? item.product.discountedPrice
                : item.product.price;

              return (
                <div key={`${item.product._id}-${item.size}`} className="flex gap-4 border-b border-outline-variant/30 pb-6">
                  {/* Product Image */}
                  <div className="w-20 h-24 bg-surface-container rounded-lg overflow-hidden flex-none">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-body-md text-sm text-on-surface font-medium line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button 
                          className="w-11 h-11 flex items-center justify-center text-on-surface-variant cursor-pointer hover:text-primary hover:bg-surface-container rounded-full transition-colors -mr-2 -mt-2"
                          onClick={() => removeFromCart(item.product._id, item.size)}
                          aria-label="Remove item"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 font-label-caps">
                        SIZE: {item.size}
                      </p>
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-outline/30 rounded-xl overflow-hidden h-11">
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity - 1)}
                          className="w-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors h-full text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 flex items-center justify-center text-xs text-on-surface font-medium h-full">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity + 1)}
                          className="w-11 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors h-full text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-body-md text-sm text-primary font-medium">
                        INR {price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-outline-variant bg-surface-container-low">
            <div className="flex justify-between items-center mb-6">
              <span className="font-label-caps text-xs text-on-surface-variant">SUBTOTAL</span>
              <span className="font-headline-sm text-lg text-primary font-bold">INR {cartTotal}</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm block text-center"
            >
              PROCEED TO CHECKOUT
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
