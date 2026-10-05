'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lottie } from 'lottie-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { ordersApi, paymentApi, couponsApi, authApi } from '@/lib/api';
import { loadRazorpayScript } from '@/lib/razorpay';
import { formatCurrency } from '@/lib/formatCurrency';
import Icon from '@/components/Icon';
import Toast from '@/components/Toast';
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
    authLoading,
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
  const [toast, setToast] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [couponInput, setCouponInput] = useState(appliedCoupon ? appliedCoupon.code : '');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const deliveryEstimate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const renderOrderItems = () => (
    <div className="space-y-4">
      {cartItems.map((item) => {
        const price = item.product.discountedPrice !== undefined && item.product.discountedPrice !== null
          ? item.product.discountedPrice
          : item.product.price;
        return (
          <div key={`${item.product._id}-${item.size}`} className="flex justify-between items-center text-sm gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-none">
                <div className="w-14 h-16 bg-surface-container rounded-lg overflow-hidden border border-outline-variant/30">
                  <img src={item.product.colors?.[0]?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-on-surface text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-on-surface line-clamp-1">{item.product.name}</h4>
                <span className="text-[10px] text-on-surface-variant font-label-caps tracking-wide">
                  SIZE: {item.size}{item.color ? ` · ${String(item.color).toUpperCase()}` : ''}
                </span>
              </div>
            </div>
            <span className="font-medium text-on-surface flex-none">{formatCurrency(price * item.quantity)}</span>
          </div>
        );
      })}
    </div>
  );

  // Preload Razorpay Checkout SDK
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Reset pendingOrderId if cart items or applied coupon change
  useEffect(() => {
    setPendingOrderId(null);
  }, [cartItems, appliedCoupon]);

  // Prompt login if user lands on checkout without being authenticated
  useEffect(() => {
    if (!authLoading && !user && !orderSuccess) {
      setAuthModalTab('login');
      setIsAuthOpen(true);
    }
  }, [authLoading, user, orderSuccess, setAuthModalTab, setIsAuthOpen]);

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
        setIsEditingAddress(false);
      }
    }
  }, [user]);

  const needsName = !user?.name || user?.name === 'New Customer';
  const needsEmail = !user?.email;

  const freeShippingThreshold = settings?.freeShippingThreshold || 0;
  const qualifiesForFreeShipping = freeShippingThreshold <= 0 || cartTotal >= freeShippingThreshold;
  const shippingCost = qualifiesForFreeShipping ? 0 : (settings?.shippingCost || 0);

  const finalTotal = (appliedCoupon ? cartTotal - appliedCoupon.discountAmount : cartTotal) + shippingCost;

  const notify = useCallback((type, title, message) => {
    setToast({ id: Date.now(), type, title, message });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

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
      notify('info', 'Sign in to continue', 'Please log in or register to complete your order.');
      setAuthModalTab('login');
      setIsAuthOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      notify('warning', 'Your cart is empty', 'Add items to your cart before checking out.');
      return;
    }

    if (needsName || needsEmail) {
      if ((needsName && !checkoutName.trim()) || (needsEmail && !checkoutEmail.trim())) {
        notify('warning', 'A few details missing', `Please provide your ${needsName ? 'name' : ''}${needsName && needsEmail ? ' and ' : ''}${needsEmail && !needsName ? 'email' : ''}${needsEmail && needsName ? 'email' : ''} to continue.`);
        return;
      }
      setLoading(true);
      try {
        const payload = {};
        if (needsName) payload.name = checkoutName.trim();
        if (needsEmail) payload.email = checkoutEmail.trim();
        
        const res = await authApi.completeProfile(payload);
        if (res.success) {
          setUser(res.user); // updates context
        }
      } catch (err) {
        notify('error', 'Could not save your details', err.message || 'Please check your details and try again.');
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      let orderId = pendingOrderId;

      // 1. Only create a new order in DB if we don't already have one pending from a previous attempt
      if (!orderId) {
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
        if (!orderResponse.success || !orderResponse.order?._id) {
          throw new Error(orderResponse.message || 'Failed to create order.');
        }

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

        orderId = orderResponse.order._id;
        setPendingOrderId(orderId);
      }

      // 2. Create / retrieve Razorpay payment order for this SAME orderId
      const paymentResponse = await paymentApi.createRazorpayOrder(orderId);
      
      if (paymentResponse.success) {
        const razorpayOrderId = paymentResponse.razorpayOrderId || paymentResponse.order_id;
        
        // 3. Ensure Razorpay checkout script is loaded
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection and try again.');
        }

        // Prefer the key ID returned with the order so the modal always matches the key that created it
        const razorpayKey = paymentResponse.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error('Payments are not configured yet. Please try again later.');
        }

        // 4. Open Razorpay Standard Checkout Modal
        const options = {
          key: razorpayKey,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency || 'INR',
          name: 'NAARZI',
          description: `Order #${orderId.slice(-6).toUpperCase()} · Own the Moment`,
          // Razorpay renders the logo inside its own iframe, so it needs an absolute URL
          image: `${window.location.origin}/naarzi-pay-logo.png`,
          order_id: razorpayOrderId,
          prefill: {
            name: user?.name || checkoutName || '',
            email: user?.email || checkoutEmail || '',
            contact: phone || '',
          },
          notes: {
            order_id: orderId,
          },
          // Match the Naarzi Dusty Rose brand colour (--color-primary)
          theme: {
            color: '#8f4d5c',
            backdrop_color: 'rgba(30, 25, 27, 0.6)',
          },
          handler: async function (response) {
            setLoading(true);
            try {
              // 5. Verify payment signature on backend
              const verifyResponse = await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.success) {
                setPendingOrderId(null);
                setOrderSuccess(verifyResponse.order);
                clearCart();
              } else {
                notify('error', 'Payment verification failed', verifyResponse.message || 'We could not confirm your payment. Please try again.');
              }
            } catch (verifyErr) {
              console.error('Payment verification error:', verifyErr);
              notify('error', 'Payment verification failed', verifyErr.message || 'Please contact support if your account was charged.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            confirm_close: true,
            ondismiss: function () {
              setLoading(false);
              notify('warning', 'Payment cancelled', "You closed the payment window before completing it. Your cart is saved — try again whenever you're ready.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setLoading(false);
          notify(
            'error',
            'Payment declined',
            response.error?.description
              ? `${response.error.description} Please try a different payment method.`
              : 'Your payment could not be processed. Please try a different payment method.'
          );
        });
        rzp.open();
      } else {
        throw new Error(paymentResponse.message || 'Failed to create payment order.');
      }
    } catch (err) {
      notify('error', 'Checkout failed', err.message || 'Something went wrong. Please try again.');
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
            Thank you for your purchase! Your payment has been successfully confirmed.
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
                PAID
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

  // Loading state while checking authentication
  if (authLoading) {
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

  // Gate screen if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <main className="max-w-md w-full mx-auto px-6 py-24 flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Icon name="lock" size="xl" />
          </div>
          <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-3">
            Please Sign In to Checkout
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mb-8 leading-relaxed max-w-sm">
            You must be logged in to your Naarzi account to access checkout and complete your order.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthOpen(true);
              }}
              className="w-full py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Icon name="login" size="sm" />
              LOG IN / REGISTER
            </button>
            <Link
              href="/shop"
              className="w-full py-3.5 bg-transparent border border-outline text-on-surface font-label-caps text-xs tracking-widest rounded-xl hover:bg-surface-container transition-colors text-center font-semibold"
            >
              RETURN TO SHOP
            </Link>
          </div>
        </main>
        <Footer />
        <CartDrawer />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="w-full flex-1 flex flex-col lg:flex-row">
        {/* Mobile: collapsible order summary */}
        {cartItems.length > 0 && (
          <div className="lg:hidden bg-surface-container-low border-b border-outline-variant/30">
            <button
              type="button"
              onClick={() => setIsSummaryOpen((open) => !open)}
              aria-expanded={isSummaryOpen}
              aria-controls="mobile-order-summary"
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm text-primary font-medium">
                <Icon name="shopping_bag" size="sm" />
                {isSummaryOpen ? 'Hide' : 'Show'} order summary
                <span className="text-on-surface-variant text-xs">({itemCount} item{itemCount === 1 ? '' : 's'})</span>
                <Icon name="expand_more" size="sm" className={`transition-transform duration-200 ${isSummaryOpen ? 'rotate-180' : ''}`} />
              </span>
              <span className="text-base font-bold text-on-surface">{formatCurrency(finalTotal)}</span>
            </button>
            {isSummaryOpen && (
              <div id="mobile-order-summary" className="px-4 pb-5 pt-1">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4">
                  {renderOrderItems()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Left side - Shipping Form */}
        <div className="w-full lg:w-[55%] xl:w-[60%] lg:border-r border-outline-variant/30 px-4 sm:px-6 py-6 lg:py-12 lg:px-12 xl:px-20 bg-surface">
          <div className="max-w-xl mx-auto lg:ml-auto lg:mr-0 xl:mr-10">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface">
                Checkout
              </h1>
              <Link href="/" aria-label="Naarzi home" className="hidden sm:flex items-center gap-2 group">
                <img src="/naarzi-pay-logo.png" alt="" className="w-9 h-9 rounded-full border border-outline-variant/40" />
                <span className="font-display-lg text-sm tracking-[0.3em] text-primary font-bold group-hover:text-primary-container transition-colors">
                  NAARZI
                </span>
              </Link>
            </div>
            <p className="text-xs text-on-surface-variant mb-6 lg:mb-8 flex items-center gap-1.5">
              <Icon name="lock" size="sm" />
              Encrypted &amp; secure checkout
            </p>


            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 lg:space-y-6">
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

              {selectedAddressId && !isEditingAddress ? (
                /* Compact Saved Address Summary */
                <div className="space-y-4">
                  {user?.addresses?.length > 1 && (
                    <div>
                      <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant mb-2">
                        SAVED ADDRESSES
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                        value={selectedAddressId}
                        onChange={(e) => {
                          const addrId = e.target.value;
                          setSelectedAddressId(addrId);
                          if (!addrId) {
                            setIsEditingAddress(true);
                            setStreet('');
                            setCity('');
                            setState('');
                            setPostalCode('');
                            setCountry('India');
                            setPhone(user?.phone || '');
                            return;
                          }
                          setIsEditingAddress(false);
                          const addr = user.addresses.find((a) => a._id === addrId);
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
                        {user.addresses.map((addr) => (
                          <option key={addr._id} value={addr._id}>
                            {addr.street}, {addr.city}, {addr.state} {addr.postalCode} {addr.phone ? `· Phone: ${addr.phone}` : ''} {addr.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                        <option value="">+ Add / Enter a new address</option>
                      </select>
                    </div>
                  )}

                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 flex items-start justify-between gap-4">
                    <div className="text-sm text-on-surface space-y-0.5">
                      <p className="font-medium">{street}</p>
                      <p className="text-on-surface-variant">{city}, {state} {postalCode}</p>
                      <p className="text-on-surface-variant">{country} · {phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="text-xs font-label-caps tracking-widest text-primary underline flex-none cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                /* Full Address Form (New Address or Editing) */
                <div>
                  {user?.addresses?.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-label-caps tracking-widest text-on-surface-variant">
                          USE A SAVED ADDRESS
                        </label>
                        {selectedAddressId && isEditingAddress && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="text-[11px] font-label-caps tracking-wider text-primary underline cursor-pointer"
                          >
                            Cancel edit
                          </button>
                        )}
                      </div>
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
                            setIsEditingAddress(true);
                            return;
                          }
                          setIsEditingAddress(false);
                          const addr = user.addresses.find((a) => a._id === addrId);
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
                        {user.addresses.map((addr) => (
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
              )}
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-none">2</span>
                <h3 className="font-headline-sm text-lg text-on-surface">
                  Payment
                </h3>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/naarzi-pay-logo.png"
                    alt="Naarzi"
                    className="w-11 h-11 rounded-full border border-accent-gold/40 bg-surface flex-none"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">Pay securely with Razorpay</p>
                    <p className="text-xs text-on-surface-variant">
                      Choose UPI, card, net banking or wallet in the next step.
                    </p>
                  </div>
                  <Icon name="radio_button_checked" size="md" className="text-primary flex-none" />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: 'UPI', icon: 'qr_code_2' },
                    { label: 'Cards', icon: 'credit_card' },
                    { label: 'Net Banking', icon: 'account_balance' },
                    { label: 'Wallets', icon: 'account_balance_wallet' },
                  ].map((method) => (
                    <span
                      key={method.label}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant bg-surface-container-lowest border border-outline-variant/40 rounded-full px-3 py-1.5"
                    >
                      <Icon name={method.icon} size="sm" className="text-primary" />
                      {method.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-on-surface-variant">
                <Icon name="verified_user" size="sm" className="text-accent-gold" />
                256-bit encrypted &middot; powered by Razorpay &middot; we never store your card details
              </div>
            </div>

              <div className="hidden lg:flex flex-row items-center justify-between gap-4 border-t border-outline-variant/30 mt-2 pt-6">
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
        <div className="w-full lg:w-[45%] xl:w-[40%] bg-surface lg:bg-surface-container-low px-4 sm:px-6 pt-2 pb-36 lg:py-12 lg:px-12 xl:px-20 relative">
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
          <div className="max-w-xl mx-auto lg:mr-auto lg:ml-0 xl:ml-10 lg:sticky lg:top-8 flex flex-col lg:block">
            <div className="flex items-baseline justify-between mb-4 lg:mb-6">
              <h3 className="font-headline-sm text-lg text-on-surface flex items-center gap-3">
                <span className="lg:hidden w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold font-body-md flex items-center justify-center flex-none">3</span>
                <span className="lg:hidden">Offers &amp; Price Details</span>
                <span className="hidden lg:inline">Order Summary</span>
              </h3>
              {cartItems.length > 0 && (
                <span className="hidden lg:inline text-xs text-on-surface-variant font-label-caps tracking-wide">
                  {itemCount} ITEM{itemCount === 1 ? '' : 'S'}
                </span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Your cart is empty.</p>
            ) : (
              <div className="max-lg:order-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm mb-6">
                <div className="hidden lg:block max-h-72 overflow-y-auto pr-2 pt-2 scrollbar-hide">
                  {renderOrderItems()}
                </div>

                <div className="lg:border-t border-outline-variant/30 lg:mt-4 lg:pt-4 flex justify-between items-center">
                  <span className="font-label-caps text-xs text-on-surface-variant">SUBTOTAL ({itemCount} ITEM{itemCount === 1 ? '' : 'S'})</span>
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
                <div className="flex flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    disabled={appliedCoupon}
                    placeholder="Enter code"
                    className="flex-1 min-w-0 px-4 py-3 bg-surface border border-outline/20 rounded-lg text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponInput}
                      className="flex-none px-5 sm:px-6 py-3 bg-tertiary text-white font-label-caps text-xs tracking-widest rounded-lg hover:bg-tertiary-container disabled:opacity-50 transition-colors font-bold"
                    >
                      {validatingCoupon ? '...' : 'APPLY'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
                      className="flex-none px-4 py-3 bg-surface border border-error text-error font-label-caps text-xs tracking-widest rounded-lg hover:bg-error-container transition-colors font-bold"
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
            <div className="max-lg:order-2 pt-2 flex flex-wrap items-center gap-2 text-on-surface-variant justify-center lg:justify-start">
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
      {/* Mobile sticky pay bar — submits the checkout form */}
      {cartItems.length > 0 && (
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/40 shadow-[0_-8px_24px_-12px_rgba(30,25,27,0.25)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-label-caps tracking-widest text-on-surface-variant">TOTAL</p>
              <p className="text-lg font-bold text-on-surface leading-tight">{formatCurrency(finalTotal)}</p>
              {appliedCoupon ? (
                <p className="text-[11px] text-green-700 font-medium truncate">You save {formatCurrency(appliedCoupon.discountAmount)}</p>
              ) : (
                <p className="text-[11px] text-on-surface-variant truncate">{shippingCost > 0 ? `incl. ${formatCurrency(shippingCost)} shipping` : 'Free shipping'}</p>
              )}
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="flex-none px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 font-bold"
            >
              {loading ? (
                <>
                  <Icon name="progress_activity" size="sm" className="animate-spin" />
                  PROCESSING
                </>
              ) : (
                <>
                  <Icon name="lock" size="sm" />
                  PAY NOW
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={dismissToast} />
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}
