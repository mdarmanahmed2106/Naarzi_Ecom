'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lottie } from 'lottie-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { ordersApi, paymentApi, couponsApi, authApi } from '@/lib/api';
import { formatCurrency } from '@/lib/formatCurrency';
import Icon from '@/components/Icon';
import orderConfirmedAnimation from '../../../public/animations/One Click Order.json';
import confettiAnimation from '../../../public/animations/Confetti.json';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    clearCart,
    setIsAuthOpen,
    setAuthModalTab,
    appliedCoupon,
    setAppliedCoupon,
    user,
    setUser,
    settings
  } = useApp();

  const [checkoutName, setCheckoutName] = useState(user?.name === 'New Customer' ? '' : user?.name || '');
  const [checkoutEmail, setCheckoutEmail] = useState(user?.email || '');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [couponInput, setCouponInput] = useState(appliedCoupon ? appliedCoupon.code : '');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const deliveryEstimate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  // Load active coupons
  useEffect(() => {
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
    loadActiveCoupons();
  }, []);

  // Auto-fill address and phone if user is logged in
  React.useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone);
      if (user.name !== 'New Customer') setCheckoutName(user.name || '');
      if (user.email) setCheckoutEmail(user.email || '');
      if (user.addresses?.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setStreet(defaultAddr.street || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || '');
        setPostalCode(defaultAddr.postalCode || '');
        setCountry(defaultAddr.country || 'India');
        if (defaultAddr.phone) {
          setPhone(defaultAddr.phone);
        } else if (user.phone) {
          setPhone(user.phone);
        }
        setSelectedAddressId(defaultAddr._id);
      }
    }
  }, [user]);

  const needsName = !user?.name || user?.name === 'New Customer';
  const needsEmail = !user?.email;

  const freeShippingThreshold = settings?.freeShippingThreshold || 0;
  const qualifiesForFreeShipping = freeShippingThreshold <= 0 || cartTotal >= freeShippingThreshold;
  const shippingCost = qualifiesForFreeShipping ? 0 : (settings?.shippingCost || 0);

  const finalTotal = (appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal) + shippingCost;

  const handleApplyCoupon = async (codeToUse) => {
    const code = (typeof codeToUse === 'string' ? codeToUse : couponInput).trim();
    if (!code) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await couponsApi.validate(code, cartTotal, cartItems);
      if (res.success) {
        setAppliedCoupon({
          code: res.couponCode,
          discountAmount: res.discountAmount
        });
        setCouponInput(res.couponCode);
        setShowConfetti(true);
      } else {
        setCouponError(res.message || 'Invalid coupon');
        setAppliedCoupon(null);
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

    if (needsName || needsEmail) {
      if ((needsName && !checkoutName.trim()) || (needsEmail && !checkoutEmail.trim())) {
        setError(`Please provide your ${needsName ? 'name' : ''}${needsName && needsEmail ? ' and ' : ''}${needsEmail && !needsName ? 'email' : ''}${needsEmail && needsName ? 'email' : ''} to continue.`);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const payload = {};
        if (needsName) payload.name = checkoutName.trim();
        if (needsEmail) payload.email = checkoutEmail.trim();
        
        const res = await authApi.completeProfile(payload);
        if (res.success) {
          setUser(res.user); // updates context
        }
      } catch (err) {
        setError(err.message || 'Please check your details and try again.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order in DB
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        size: item.size,
        color: item.color || (item.product.colors && item.product.colors.length > 0 ? item.product.colors[0].name : undefined),
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
        if (saveAddressToProfile && !selectedAddressId) {
          try {
            const addrRes = await authApi.addAddress({
              street,
              city,
              state,
              postalCode,
              country,
              phone
            });
            if (addrRes.success) {
              setUser(addrRes.user);
            }
          } catch (addrErr) {
            console.error('Failed to save address to profile:', addrErr);
          }
        }
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
          <div className="w-40 h-40 md:w-48 md:h-48 -mb-2">
            <Lottie
              src={orderConfirmedAnimation}
              loop={false}
              autoplay
              segment={[0, 74]}
              style={{ width: '100%', height: '100%' }}
            />
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
              <span className="text-primary font-bold">{formatCurrency(orderSuccess.totalAmount)}</span>
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
              href="/account" 
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

      <main className="w-full flex-1 flex flex-col lg:flex-row">
        {/* Left side - Shipping Form */}
        <div className="w-full lg:w-[55%] xl:w-[60%] lg:border-r border-outline-variant/30 px-6 py-8 lg:py-12 lg:px-12 xl:px-20 bg-surface">
          <div className="max-w-xl mx-auto lg:ml-auto lg:mr-0 xl:mr-10">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface">
                Checkout
              </h1>
              <Link href="/" className="hidden sm:block text-xs font-label-caps tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                NAARZI
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant mb-8 flex items-center gap-1.5">
              <Icon name="lock" size="sm" />
              Encrypted &amp; secure checkout
            </p>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-error text-sm rounded-xl border border-error/20 w-full flex items-start gap-2">
                <Icon name="error" size="md" className="flex-none" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {(needsName || needsEmail) && (
              <div className="bg-secondary-container/40 border border-secondary/20 rounded-xl p-5 mb-2">
                <p className="text-sm font-medium mb-4 text-on-surface">We need a couple more details to complete your order:</p>
                <div className="space-y-4">
                  {needsName && (
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="Full Name"
                      required
                      className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  )}
                  {needsEmail && (
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="Email Address"
                      required
                      className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-none">1</span>
                <h3 className="font-headline-sm text-lg text-on-surface">
                  Shipping Address
                </h3>
              </div>

              <div className="mb-4 flex items-center gap-2 text-[11px] font-medium text-on-surface-variant bg-surface-container/60 border border-outline-variant/30 rounded-lg px-3 py-2 w-fit">
                <Icon name="local_shipping" size="sm" className="text-primary" />
                Estimated delivery: <span className="text-on-surface font-bold">{deliveryEstimate}</span>
              </div>

            {user?.addresses?.length > 0 && (
              <div className="mb-4">
                <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-2">
                  USE A SAVED ADDRESS
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  value={selectedAddressId}
                  onChange={(e) => {
                    const addrId = e.target.value;
                    setSelectedAddressId(addrId);
                    if (!addrId) {
                      setStreet('');
                      setCity('');
                      setState('');
                      setPostalCode('');
                      setCountry('India');
                      setPhone(user?.phone || '');
                      return;
                    }
                    const addr = user.addresses.find(a => a._id === addrId);
                    if (addr) {
                      setStreet(addr.street);
                      setCity(addr.city);
                      setState(addr.state);
                      setPostalCode(addr.postalCode);
                      setCountry(addr.country);
                      setPhone(addr.phone || user?.phone || '');
                    }
                  }}
                >
                  <option value="">-- Enter a new address --</option>
                  {user.addresses.map(addr => (
                    <option key={addr._id} value={addr._id}>
                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode} {addr.phone ? `· Phone: ${addr.phone}` : ''} {addr.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

              {!selectedAddressId && user && (
                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="saveAddressCheckout"
                    checked={saveAddressToProfile}
                    onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="saveAddressCheckout" className="text-xs text-on-surface cursor-pointer">
                    Save this address and contact number to my account
                  </label>
                </div>
              )}
            </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-none">2</span>
                <h3 className="font-headline-sm text-lg text-on-surface">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'upi', label: 'UPI', icon: 'qr_code_2' },
                  { id: 'card', label: 'Card', icon: 'credit_card' },
                  { id: 'netbanking', label: 'Net Banking', icon: 'account_balance' },
                ].map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border text-xs font-medium transition-colors ${
                      paymentMethod === method.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline/20 text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <Icon name={method.icon} size="md" />
                    {method.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-on-surface-variant">
                <Icon name="verified_user" size="sm" />
                Payments are secured and encrypted &middot; powered by Razorpay
              </div>
            </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant/30 mt-2 pt-6">
                <Link href="/shop" className="text-sm text-primary hover:underline flex items-center justify-center sm:justify-start gap-1">
                  <Icon name="chevron_left" size="sm" />
                  Return to shop
                </Link>
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="px-8 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icon name="progress_activity" size="sm" className="animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size="sm" />
                      {`PAY ${formatCurrency(finalTotal)}`}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Order Summary */}
        <div className="w-full lg:w-[45%] xl:w-[40%] bg-surface-container-low px-6 py-8 lg:py-12 lg:px-12 xl:px-20 border-t lg:border-t-0 border-outline-variant/30 relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              <Lottie
                src={confettiAnimation}
                loop={false}
                autoplay
                style={{ width: '100%', height: '100%' }}
                subscriptions={{ complete: () => setShowConfetti(false) }}
              />
            </div>
          )}
          <div className="max-w-xl mx-auto lg:mr-auto lg:ml-0 xl:ml-10 lg:sticky lg:top-8">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="font-headline-sm text-lg text-on-surface">
                Order Summary
              </h3>
              {cartItems.length > 0 && (
                <span className="text-xs text-on-surface-variant font-label-caps tracking-wide">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)} ITEM{cartItems.reduce((sum, i) => sum + i.quantity, 0) === 1 ? '' : 'S'}
                </span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Your cart is empty.</p>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm mb-6">
                <div className="max-h-60 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {cartItems.map((item) => {
                    const price = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null
                      ? item.product.discountedPrice
                      : item.product.price;
                    return (
                      <div key={`${item.product._id}-${item.size}`} className="flex justify-between items-center text-sm gap-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 bg-surface-container rounded-lg overflow-hidden flex-none">
                            <img src={item.product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover" />
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-on-surface text-white text-[10px] font-bold flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-on-surface line-clamp-1">{item.product.name}</h4>
                            <span className="text-[10px] text-on-surface-variant font-label-caps">SIZE: {item.size}</span>
                          </div>
                        </div>
                        <span className="font-medium text-on-surface flex-none">{formatCurrency(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-label-caps text-xs text-on-surface-variant">SUBTOTAL</span>
                  <span className="text-xs font-medium text-on-surface">{formatCurrency(cartTotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-label-caps text-xs text-on-surface-variant">DISCOUNT ({appliedCoupon.code})</span>
                    <span className="text-xs font-medium text-green-700">- {formatCurrency(appliedCoupon.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3">
                  <span className="font-label-caps text-xs text-on-surface-variant">SHIPPING</span>
                  {shippingCost > 0 ? (
                    <span className="text-xs font-medium text-on-surface">{formatCurrency(shippingCost)}</span>
                  ) : (
                    <span className="text-xs text-green-700 font-bold font-label-caps bg-green-50 px-2 py-0.5 rounded border border-green-200">FREE</span>
                  )}
                </div>

                <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between items-center font-bold text-base">
                  <span className="font-label-caps text-xs text-on-surface">TOTAL</span>
                  <span className="text-primary font-bold">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            )}

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
                {appliedCoupon && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 mt-1 font-medium">
                    <Icon name="check_circle" size="sm" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied — you saved {formatCurrency(appliedCoupon.discountAmount)}!</span>
                  </div>
                )}

                {/* Available Offers Cards */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="pt-3 space-y-2">
                    <p className="text-[10px] font-label-caps tracking-widest text-on-surface-variant uppercase font-bold flex items-center gap-1">
                      <Icon name="local_offer" size="sm" className="text-accent-gold" />
                      AVAILABLE OFFERS
                    </p>
                    <div className="space-y-2">
                      {availableCoupons.map((c) => {
                        const qualifies = !c.minOrderValue || cartTotal >= c.minOrderValue;
                        const remaining = c.minOrderValue ? c.minOrderValue - cartTotal : 0;

                        return (
                          <div
                            key={c._id}
                            className={`p-3 rounded-lg border transition-all ${
                              qualifies
                                ? 'border-dashed border-primary/40 bg-surface hover:border-primary'
                                : 'border-outline/20 bg-surface-container/40'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs bg-surface-container px-2 py-0.5 rounded border border-outline/20 text-primary tracking-wider">
                                    {c.code}
                                  </span>
                                  {c.firstOrderOnly && (
                                    <span className="text-[9px] font-label-caps bg-first-order-badge text-primary px-1.5 py-0.5 rounded font-bold">
                                      FIRST ORDER
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-on-surface mt-1 font-medium">
                                  {c.description || (c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} FLAT OFF`)}
                                  {c.maxDiscountAmount ? ` (Up to ${formatCurrency(c.maxDiscountAmount)})` : ''}
                                </p>
                                {c.applicableCategories && c.applicableCategories.length > 0 && (
                                  <p className="text-[10px] text-primary font-medium mt-0.5">
                                    Only on: {c.applicableCategories.map(cat => cat.name).join(', ')}
                                  </p>
                                )}
                                {!qualifies && remaining > 0 && (
                                  <p className="text-[11px] text-accent-gold font-medium mt-0.5">
                                    Add {formatCurrency(remaining)} more to unlock
                                  </p>
                                )}
                              </div>

                              {qualifies ? (
                                <button
                                  type="button"
                                  onClick={() => handleApplyCoupon(c.code)}
                                  disabled={validatingCoupon}
                                  className="font-label-caps text-xs text-primary hover:text-white hover:bg-primary font-bold uppercase tracking-wider py-1.5 px-3 rounded bg-surface border border-primary/30 transition-all cursor-pointer shadow-xs"
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
                  </div>
                )}
              </div>
            )}

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-on-surface-variant justify-center lg:justify-start">
              <div className="flex items-center gap-1.5 text-[11px] font-medium bg-surface-container-lowest border border-outline-variant/30 rounded-full px-3 py-1.5">
                <Icon name="lock" size="sm" className="text-primary" />
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium bg-surface-container-lowest border border-outline-variant/30 rounded-full px-3 py-1.5">
                <Icon name="verified" size="sm" className="text-primary" />
                Quality guaranteed
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium bg-surface-container-lowest border border-outline-variant/30 rounded-full px-3 py-1.5">
                <Icon name="replay" size="sm" className="text-primary" />
                Easy 7-day returns
              </div>
            </div>

          </div>
        </div>
      </main>

      <CartDrawer />
      <AuthModal />
      <Footer />
    </div>
  );
}
