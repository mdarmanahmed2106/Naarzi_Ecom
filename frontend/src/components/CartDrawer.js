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
    setQuickBuyProduct,
    setIsQuickBuyOpen,
  } = useApp();

  const [isDiscountsOpen, setIsDiscountsOpen] = React.useState(true);
  const [promoCode, setPromoCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [availableCoupons, setAvailableCoupons] = React.useState([]);

  React.useEffect(() => {
    async function loadActiveCoupons() {
      try {
        const res = await couponsApi.getActive();
        if (res.success) {
          setAvailableCoupons(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load active coupons:', err);
      }
    }
    if (isCartOpen) {
      loadActiveCoupons();
    }
  }, [isCartOpen]);

  const handleApplyCoupon = async (codeToUse) => {
    const code = (typeof codeToUse === 'string' ? codeToUse : promoCode).trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(code, cartTotal, cartItems);
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

  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isCartOpen]);

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
        <div className="px-6 py-4 border-t border-b border-outline-variant/30 bg-surface-container/20">
          <p className="text-center text-xs font-medium text-on-surface mb-2 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#C5A059]">local_shipping</span>
            <span>FREE Pan-India Shipping Applied</span>
          </p>
          <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden mx-auto max-w-[90%]">
            <div className="h-full bg-primary w-full rounded-full"></div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-body-md text-on-surface-variant mb-6">
                Your cart is currently empty.
              </p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 bg-black text-white font-bold tracking-widest rounded-lg hover:bg-black/90 transition-colors cursor-pointer font-label-caps text-xs"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const hasDiscount = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null;
              const price = hasDiscount ? item.product.discountedPrice : item.product.price;
              const originalPrice = item.product.price;
              const colorObj = item.product.colors?.find((c) => c.name === item.color) || item.product.colors?.[0];
              const itemImage = colorObj?.images?.[0] || item.product.images?.[0] || '/placeholder.png';

              return (
                <div key={`${item.product._id}-${item.size}-${item.color || 'default'}`} className="flex gap-4 border-b border-outline-variant/30 pb-6">
                  {/* Product Image matching selected color */}
                  <div className="w-[88px] h-[105px] bg-surface-container rounded-lg overflow-hidden flex-none">
                    <img 
                      src={itemImage} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-on-surface text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="text-right flex-none">
                          {hasDiscount ? (
                            <>
                              <p className="font-bold text-on-surface text-sm">INR {price.toFixed(2)}</p>
                              <p className="text-xs text-on-surface-variant line-through">INR {originalPrice.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="font-bold text-on-surface text-sm">INR {price.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 font-medium">
                        Size: {item.size}{item.color ? ` · Color: ${item.color}` : ''}
                      </p>
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-outline-variant/60 rounded">
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-light cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs text-on-surface font-bold border-l border-r border-outline-variant/60">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors font-light cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                        className="text-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {cartItems.length > 0 && (
            <div className="mt-6 pt-2">
              <div 
                className="border-t border-outline-variant/40 py-4 flex justify-between items-center cursor-pointer group"
                onClick={() => setIsDiscountsOpen(!isDiscountsOpen)}
              >
                <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#C5A059]">local_offer</span>
                  Offers & Coupons
                </span>
                <span className="text-xl font-light text-on-surface-variant group-hover:text-on-surface transition-transform duration-300" style={{ transform: isDiscountsOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${isDiscountsOpen ? 'max-h-[600px] mb-4' : 'max-h-0'}`}>
                {/* Manual coupon input */}
                <div className="flex gap-2 relative mb-2">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    className="flex-1 border border-outline-variant/60 rounded px-3 py-2 text-xs uppercase focus:outline-none focus:border-primary tracking-wider"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={appliedCoupon || couponLoading}
                  />
                  <button 
                    className="bg-primary text-white font-bold px-4 py-2 rounded text-xs tracking-wider uppercase hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                    onClick={() => handleApplyCoupon()}
                    disabled={appliedCoupon || couponLoading || !promoCode.trim()}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-error text-xs mb-3">{couponError}</p>}
                
                {/* Applied coupon pill */}
                {appliedCoupon && (
                  <div className="mb-4 flex justify-between items-center bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-green-700">check_circle</span>
                      <div>
                        <span className="text-xs font-bold text-green-800">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-700 ml-1 font-medium">(₹{appliedCoupon.discountAmount} saved)</span>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-xs underline text-on-surface-variant hover:text-error font-medium cursor-pointer">Remove</button>
                  </div>
                )}

                {/* Available Offers Cards (Click to Apply) */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-label-caps tracking-widest text-on-surface-variant uppercase font-bold">
                      AVAILABLE OFFERS
                    </p>
                    {availableCoupons.map((c) => {
                      const qualifies = !c.minOrderValue || cartTotal >= c.minOrderValue;
                      const remaining = c.minOrderValue ? c.minOrderValue - cartTotal : 0;

                      return (
                        <div 
                          key={c._id} 
                          className={`p-3 rounded-lg border transition-all ${
                            qualifies 
                              ? 'border-dashed border-primary/40 bg-surface-container/30 hover:border-primary' 
                              : 'border-outline-variant/30 bg-surface-container-low/40'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="inline-block font-mono font-bold text-xs bg-white text-primary px-2 py-0.5 rounded border border-primary/30 tracking-wider">
                                {c.code}
                              </span>
                              <p className="text-xs text-on-surface mt-1 font-medium">
                                {c.description || (c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`)}
                                {c.maxDiscountAmount ? ` (Up to ₹${c.maxDiscountAmount})` : ''}
                              </p>
                              {c.applicableCategories && c.applicableCategories.length > 0 && (
                                <p className="text-[10px] text-primary font-medium mt-0.5">
                                  Only on: {c.applicableCategories.map(cat => cat.name).join(', ')}
                                </p>
                              )}
                              {c.firstOrderOnly && (
                                <p className="text-[10px] text-on-surface-variant font-label-caps mt-0.5">
                                  FIRST ORDER ONLY
                                </p>
                              )}
                              {!qualifies && remaining > 0 && (
                                <p className="text-[11px] text-[#C5A059] font-medium mt-1">
                                  Add ₹{remaining} more to unlock
                                </p>
                              )}
                            </div>
                            
                            {qualifies ? (
                              <button
                                onClick={() => handleApplyCoupon(c.code)}
                                disabled={couponLoading}
                                className="font-label-caps text-[11px] text-primary hover:text-white hover:bg-primary font-bold uppercase tracking-wider py-1 px-3 rounded bg-white border border-primary/30 transition-all cursor-pointer shadow-xs"
                              >
                                APPLY
                              </button>
                            ) : (
                              <span className="text-[10px] font-label-caps text-on-surface-variant/60 py-1 px-2">
                                LOCKED
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                <span className="text-[#E55B5B] font-medium">-INR {appliedCoupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Link 
              href="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full py-[18px] bg-[#0A0A0A] text-white font-bold text-sm tracking-widest rounded-[4px] hover:bg-black/90 transition-colors flex justify-center items-center gap-2"
            >
              <span>CHECKOUT • INR {finalTotal.toFixed(2)}</span>
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
