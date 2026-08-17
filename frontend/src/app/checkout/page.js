'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { ordersApi, paymentApi, couponsApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    clearCart,
    user,
    setIsAuthOpen,
    setAuthModalTab
  } = useApp();

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const finalTotal = appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal;

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(couponInput, cartTotal);
      if (res.success) {
        setAppliedCoupon({
          code: res.couponCode,
          discountAmount: res.discountAmount
        });
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in or register to complete your order.');
      setAuthModalTab('login');
      setIsAuthOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Add items to cart before checking out.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order in DB
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        size: item.size,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        couponCode: appliedCoupon?.code || null,
        shippingAddress: {
          street,
          city,
          state,
          postalCode,
          country,
          phone,
        },
      };

      const orderResponse = await ordersApi.create(orderData);
      
      if (orderResponse.success) {
        const orderId = orderResponse.order._id;
        
        // 2. Create Razorpay Payment order
        const paymentResponse = await paymentApi.createRazorpayOrder(orderId);
        
        if (paymentResponse.success) {
          const razorpayOrderId = paymentResponse.razorpayOrderId;
          
          // 3. Verify Payment (since we are in MOCK mode, we can verify instantly!)
          const verifyResponse = await paymentApi.verifyPayment({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
            razorpay_signature: 'mock_signature_verification_success'
          });

          if (verifyResponse.success) {
            setOrderSuccess(verifyResponse.order || orderResponse.order);
            clearCart();
          } else {
            throw new Error('Payment verification simulation failed.');
          }
        } else {
          throw new Error('Failed to create payment order.');
        }
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully completed, show success panel
  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <main className="max-w-md w-full mx-auto px-6 py-20 flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200 mb-6 text-green-700">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-2">
            Order Confirmed
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">
            Thank you for your purchase! Your payment has been successfully simulated and verified.
          </p>

          <div className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 text-left space-y-4 mb-8 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-label-caps text-[10px]">ORDER ID</span>
              <span className="font-mono text-on-surface font-medium">{orderSuccess._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-label-caps text-[10px]">TOTAL AMOUNT</span>
              <span className="text-primary font-bold">INR {orderSuccess.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-label-caps text-[10px]">PAYMENT STATUS</span>
              <span className="text-green-700 font-bold font-label-caps text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                PAID (MOCK)
              </span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <Link 
              href="/orders" 
              className="flex-1 py-4 bg-transparent border border-outline text-on-surface font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors text-center"
            >
              VIEW MY ORDERS
            </Link>
            <Link 
              href="/" 
              className="flex-1 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors text-center"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-8 pb-20">
        <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-8">
          Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 max-w-4xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Shipping Form Column */}
          <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
            <h3 className="font-headline-sm text-lg text-on-surface mb-4">
              Shipping Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  STREET ADDRESS
                </label>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="Flat No, Apartment, Street name"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  CITY
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-level2"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  STATE
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-level1"
                  placeholder="Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  POSTAL CODE
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="postal-code"
                  required
                  placeholder="400001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  COUNTRY
                </label>
                <input
                  type="text"
                  required
                  autoComplete="country-name"
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-1">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'PROCESSING PAYMENT...' : `PLACE ORDER & PAY INR ${finalTotal}`}
              </button>
            </div>
          </form>

          {/* Cart Summary Column */}
          <div className="lg:col-span-5 bg-surface-container/50 border border-outline-variant/30 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-headline-sm text-lg text-on-surface">
              Order Summary
            </h3>

            {cartItems.length > 0 && (
              <div className="mb-6 space-y-2">
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant">
                  GIFT CARD OR DISCOUNT CODE
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    disabled={appliedCoupon}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponInput}
                      className="w-full sm:w-auto px-6 py-4 sm:py-3 bg-tertiary text-white font-label-caps text-xs tracking-widest rounded-lg hover:bg-tertiary-container disabled:opacity-50 transition-colors font-bold"
                    >
                      {validatingCoupon ? '...' : 'APPLY'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
                      className="w-full sm:w-auto px-4 py-4 sm:py-3 bg-surface border border-error text-error font-label-caps text-xs tracking-widest rounded-lg hover:bg-error-container transition-colors font-bold"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
                {couponError && <p className="text-xs text-error mt-1">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-green-700 mt-1">Coupon {appliedCoupon.code} applied successfully!</p>}
              </div>
            )}

            {cartItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {cartItems.map((item) => {
                    const price = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null
                      ? item.product.discountedPrice
                      : item.product.price;
                    return (
                      <div key={`${item.product._id}-${item.size}`} className="flex justify-between items-center text-sm gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-surface-container rounded overflow-hidden flex-none">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-medium text-on-surface line-clamp-1">{item.product.name}</h4>
                            <span className="text-[10px] text-on-surface-variant font-label-caps">SIZE: {item.size} × {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-medium text-on-surface flex-none">INR {price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-outline-variant/30 pt-4 flex justify-between items-center">
                  <span className="font-label-caps text-xs text-on-surface-variant">SUBTOTAL</span>
                  <span className="text-xs font-medium text-on-surface">INR {cartTotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-xs text-on-surface-variant">DISCOUNT ({appliedCoupon.code})</span>
                    <span className="text-xs font-medium text-green-700">- INR {appliedCoupon.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-label-caps text-xs text-on-surface-variant">SHIPPING</span>
                  <span className="text-xs text-green-700 font-bold font-label-caps bg-green-50 px-2 py-0.5 rounded border border-green-200">FREE</span>
                </div>

                <div className="border-t border-outline-variant/30 pt-4 flex justify-between items-center font-bold text-base">
                  <span className="font-label-caps text-xs text-on-surface">TOTAL</span>
                  <span className="text-primary font-bold">INR {finalTotal}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <CartDrawer />
      <AuthModal />
      <Footer />
    </div>
  );
}
