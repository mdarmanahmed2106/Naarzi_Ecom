'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { couponsApi } from '@/lib/api';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    appliedCoupon,
    setAppliedCoupon,
  } = useApp();

  const [isDiscountsOpen, setIsDiscountsOpen] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(promoCode.trim(), cartTotal);
      if (res.success) {
        setAppliedCoupon({
          code: res.couponCode,
          discountAmount: res.discountAmount
        });
        setPromoCode('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError(error.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode('');
    setCouponError('');
  };

  if (!isCartOpen) return null;

  const finalTotal = cartTotal - (appliedCoupon ? appliedCoupon.discountAmount : 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        className="bg-white max-w-[440px] w-full h-full flex flex-col shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center bg-white">
          <h3 className="font-bold text-3xl text-on-surface flex items-baseline gap-2">
            Cart <span className="text-sm font-medium font-body-md text-on-surface">({cartItems.length} items)</span>
          </h3>
          <span 
            className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors text-on-surface-variant text-[28px] font-light"
            onClick={() => setIsCartOpen(false)}
          >
            close
          </span>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-4 border-t border-b border-outline-variant/30 bg-white">
          <p className="text-center text-sm font-medium text-on-surface mb-3">FREE shipping will be applied at checkout</p>
          <div className="w-full h-1.5 bg-[#FFF0E8] rounded-full overflow-hidden mx-auto max-w-[90%]">
            <div className="h-full bg-[#FFF0E8] w-full"></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-white">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body-md text-on-surface-variant mb-6">
                Your cart is currently empty.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-black text-white font-bold tracking-widest rounded-lg hover:bg-black/90 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const hasDiscount = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null;
              const price = hasDiscount ? item.product.discountedPrice : item.product.price;
              const originalPrice = item.product.price;

              return (
                <div key={`${item.product._id}-${item.size}`} className="flex gap-5 border-b border-outline-variant/30 pb-8">
                  {/* Product Image */}
                  <div className="w-[100px] h-[100px] bg-surface-container rounded-xl overflow-hidden flex-none">
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
                        <h4 className="font-bold text-on-surface text-base">
                          {item.product.name}
                        </h4>
                        <div className="text-right">
                          {hasDiscount ? (
                            <>
                              <p className="font-medium text-on-surface">${price.toFixed(2)}</p>
                              <p className="text-sm text-on-surface-variant line-through">${originalPrice.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="font-medium text-on-surface">${price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-on-surface-variant mt-1.5">
                        Size: {item.size}
                      </p>
                      <p className="text-[13px] text-on-surface-variant mt-0.5">
                        Color: {item.color || 'Default'}
                      </p>
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border border-outline-variant/60 bg-white">
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-light"
                        >
                          -
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[13px] text-on-surface font-medium border-l border-r border-outline-variant/60">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-light"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product._id, item.size)}
                        className="text-[13px] text-on-surface-variant underline decoration-1 underline-offset-[3px] hover:text-on-surface transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Cross-sell */}
          {cartItems.length > 0 && (
            <div className="border border-outline-variant/50 rounded-xl p-5 bg-[#FAF9F7] mt-4">
              <h4 className="text-[13px] text-on-surface-variant mb-4">Buy It With</h4>
              <div className="flex gap-4">
                <div className="w-[100px] h-[100px] bg-surface-container rounded-xl overflow-hidden flex-none">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3pAvrBBot7wDb-k_B5z0L-qaAozsKQsK8uo9Kz4QCK4TzSF_0iQRTClaKS4lF3lT7ZArRzxdaMbzt6vLVKEW_httHrEiFkzsljgbUoeHHoqv5TVFQ1BC4XbOSW9Gwv34L1EG4RxzCdc-W8t0qBjZHCpm0w5y6u_hdAo7rOGVOPbRsBy1-A10dj_EmSax-hlJvvYpWOlHcpsDTR0U2jdoRV4NcBxwHRRsSqnnjbvHTWHXxg6vBt_-JtA" className="w-full h-full object-cover" alt="Cross sell" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface text-sm">Tasha Top</h4>
                    <span className="text-on-surface text-[13px] font-medium">$90.00</span>
                  </div>
                  <button className="w-full py-2.5 bg-white border border-on-surface text-on-surface text-xs font-bold tracking-[0.15em] hover:bg-on-surface hover:text-white transition-colors mt-2 rounded">
                    QUICK BUY
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-5">
                <div className="w-6 h-1.5 rounded-full border border-on-surface bg-transparent"></div>
                <div className="w-1.5 h-1.5 rounded-full border border-on-surface/30 bg-transparent"></div>
              </div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mt-8">
              <div 
                className="border-t border-outline-variant/40 py-5 flex justify-between items-center cursor-pointer group"
                onClick={() => setIsDiscountsOpen(!isDiscountsOpen)}
              >
                <span className="text-[15px] text-on-surface">Discounts</span>
                <span className="text-2xl font-light text-on-surface-variant group-hover:text-on-surface transition-transform duration-300" style={{ transform: isDiscountsOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isDiscountsOpen ? 'max-h-32 mb-5' : 'max-h-0'}`}>
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    placeholder="Discount code" 
                    className="flex-1 border border-outline-variant/60 rounded px-3 py-2.5 text-[15px] focus:outline-none focus:border-on-surface"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={appliedCoupon || couponLoading}
                  />
                  <button 
                    className="bg-surface-variant text-on-surface font-medium px-4 py-2.5 rounded text-[15px] hover:bg-surface-variant/80 transition-colors disabled:opacity-50"
                    onClick={handleApplyCoupon}
                    disabled={appliedCoupon || couponLoading || !promoCode.trim()}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[#E55B5B] text-xs mt-2">{couponError}</p>}
                
                {appliedCoupon && (
                  <div className="mt-3 flex justify-between items-center bg-[#F4F4F4] px-3 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">sell</span>
                      <span className="text-sm font-medium">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs underline text-on-surface-variant hover:text-on-surface">Remove</button>
                  </div>
                )}
              </div>

              <div className="border-t border-b border-outline-variant/40 py-5 flex justify-between items-center cursor-pointer group">
                <span className="text-[15px] text-on-surface">Calculate shipping</span>
                <span className="text-2xl font-light text-on-surface-variant group-hover:text-on-surface transition-colors">+</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white pt-2">
            {appliedCoupon && (
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-on-surface-variant">Discount ({appliedCoupon.code})</span>
                <span className="text-[#E55B5B] font-medium">-${appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Link 
              href="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full py-[18px] bg-[#0A0A0A] text-white font-bold text-sm tracking-widest rounded-[4px] hover:bg-black/90 transition-colors flex justify-center items-center gap-2"
            >
              <span>CHECKOUT • ${finalTotal.toFixed(2)} USD</span>
            </Link>
            <p className="text-center text-on-surface-variant text-[13px] mt-4">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
