'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { ordersApi, authApi } from '@/lib/api';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { user, setUser, authLoading, logout, setIsAuthOpen, setAuthModalTab } = useApp();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'wallet' | 'loyalty' | 'details'
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Address State
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false
  });
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Sync user addresses if user updates
  useEffect(() => {
    if (user?.addresses) setAddresses(user.addresses);
    if (user) setProfileForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  // Fetch orders when activeTab is orders
  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoadingOrders(false);
        return;
      }
      setLoadingOrders(true);
      try {
        const response = await ordersApi.getMyOrders();
        if (response.success) {
          setOrders(response.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [user, activeTab]);

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    setCancellingId(orderId);
    try {
      const response = await ordersApi.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled', refundStatus: response.order?.refundStatus } : o))
      );
      setToastMessage(response.message);
    } catch (err) {
      setToastMessage(err.message || 'Unable to cancel this order. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    try {
      const response = await authApi.addAddress(addressForm);
      if (response.success) {
        setUser(response.user);
        setAddresses(response.user.addresses);
        setShowAddressForm(false);
        setAddressForm({ street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
        setToastMessage('Address added successfully');
      }
    } catch (err) {
      setToastMessage(err.message || 'Failed to add address');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const response = await authApi.deleteAddress(id);
      if (response.success) {
        setUser(response.user);
        setAddresses(response.user.addresses);
        setToastMessage('Address deleted');
      }
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete address');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    try {
      const response = await authApi.updateProfile(profileForm);
      if (response.success) {
        setUser(response.user);
        setToastMessage('Profile updated successfully');
      }
    } catch (err) {
      setToastMessage(err.message || 'Failed to update profile');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

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

  const tabs = [
    { id: 'orders', label: 'Order history', icon: 'inventory_2' },
    { id: 'address', label: 'Shipping Address', icon: 'person' },
    { id: 'details', label: 'Account details', icon: 'person' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-8 pb-20 flex-1">
        
        {!user ? (
          /* User Not Logged In */
          <div className="max-w-md mx-auto text-center py-20 bg-surface-container/20 rounded-xl p-8 border border-outline-variant/30 mt-10">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
              lock
            </span>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">
              Please log in to view your account details.
            </p>
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthOpen(true);
              }}
              className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm"
            >
              LOG IN
            </button>
          </div>
        ) : (
          <div className="bg-surface-container/20 border border-outline-variant/40 rounded-2xl flex flex-col md:flex-row min-h-[600px] mt-4 shadow-sm">
            
            {/* Sidebar */}
            <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-outline-variant/40 p-6 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-transparent text-primary font-bold'
                      : 'text-on-surface hover:bg-surface-container/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              
              <div className="mt-6 pt-6 border-t border-outline-variant/20 md:border-none md:mt-0 md:pt-0">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-lg text-sm font-medium text-on-surface hover:text-error hover:bg-error-container/20 transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-[22px]">logout</span>
                  Log out
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10">
              
              {user && !user.email && !bannerDismissed && (
                <div className="bg-secondary-container/40 border border-secondary/20 rounded-xl px-5 py-4 mb-8 flex items-center justify-between">
                  <p className="text-sm text-on-surface">Add your email to get order updates and receipts.</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        setAuthModalTab('profile'); // optional if you want a specific tab, else rely on state in modal, or you can just add a profile tab to AuthModal or handle it.
                        // Actually, AuthModal doesn't have a direct 'profile' trigger yet for existing users. 
                        // The user's spec says `setShowProfileModal(true)`. 
                        // I'll assume they can click it to open the auth modal if we add a way to open it to profile, or I will create a small update profile modal.
                        // Wait, they can just use the "Account details" tab which we already have!
                        setActiveTab('details');
                      }} 
                      className="text-sm underline font-medium text-primary hover:text-primary-container cursor-pointer"
                    >
                      Update Profile
                    </button>
                    <button onClick={() => setBannerDismissed(true)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                      <span className="material-symbols-outlined text-lg align-middle">close</span>
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'orders' && (
                <div className="animate-fade-in">
                  {toastMessage && (
                    <div className="mb-6 p-4 bg-primary-container/20 border border-primary/20 rounded-lg text-sm text-on-surface flex justify-between items-center">
                      <span>{toastMessage}</span>
                      <button onClick={() => setToastMessage('')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-lg align-middle">close</span>
                      </button>
                    </div>
                  )}

                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-on-surface-variant text-sm py-4">
                      You haven't placed any orders yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-surface border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden">
                          {/* Order Summary Header */}
                          <div className="bg-surface-container/60 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-outline-variant/30 text-xs font-label-caps text-on-surface-variant">
                            <div className="space-y-1">
                              <span>ORDER DATE</span>
                              <p className="font-sans text-on-surface font-medium text-sm mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span>TOTAL AMOUNT</span>
                              <p className="font-sans text-primary font-bold text-sm mt-0.5">
                                INR {order.totalAmount}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span>ORDER STATUS</span>
                              <p className="font-sans mt-0.5">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                                  order.orderStatus === 'delivered'
                                    ? 'text-green-700 bg-green-50 border-green-200'
                                    : order.orderStatus === 'cancelled'
                                    ? 'text-error bg-error-container/20 border-error/20'
                                    : 'text-secondary bg-secondary-container/20 border-secondary/20'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span>PAYMENT STATUS</span>
                              <p className="font-sans mt-0.5">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase border ${
                                  order.paymentStatus === 'paid'
                                    ? 'text-green-700 bg-green-50 border-green-200'
                                    : order.paymentStatus === 'failed'
                                    ? 'text-error bg-error-container/20 border-error/20'
                                    : 'text-secondary bg-secondary-container/20 border-secondary/20'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                                {order.refundStatus === 'pending' && (
                                  <span className="ml-2 px-2 py-0.5 rounded font-bold text-[10px] uppercase border text-yellow-700 bg-yellow-50 border-yellow-200">
                                    REFUND PENDING
                                  </span>
                                )}
                              </p>
                            </div>
                            {order.orderStatus === 'processing' && (
                              <div className="ml-auto">
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  disabled={cancellingId === order._id}
                                  className="text-xs font-bold tracking-widest text-error border border-error/20 rounded-lg px-4 py-2 hover:bg-error-container/20 disabled:opacity-50 transition-colors cursor-pointer uppercase"
                                >
                                  {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Purchased Items List */}
                          <div className="p-6 divide-y divide-outline-variant/30">
                            {order.items.map((item, index) => (
                              <div key={`${item.product?._id}-${item.size}-${index}`} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-16 bg-surface-container rounded overflow-hidden flex-none">
                                    {(item.product?.colors?.[0]?.images?.[0] || item.product?.images?.[0]) && (
                                      <img src={item.product.colors?.[0]?.images?.[0] || item.product.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div>
                                    {item.product ? (
                                      <Link href={`/products/${item.product.slug}`} className="font-medium text-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
                                        {item.product.name}
                                      </Link>
                                    ) : (
                                      <span className="font-medium text-sm text-on-surface line-clamp-1">[Product Removed]</span>
                                    )}
                                    <span className="text-[10px] text-on-surface-variant font-label-caps block mt-1">
                                      SIZE: {item.size} &nbsp;|&nbsp; QTY: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-medium text-sm text-on-surface font-sans">
                                  INR {item.priceAtPurchase * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'address' && (
                <div className="animate-fade-in">
                  {toastMessage && (
                    <div className="mb-6 p-4 bg-primary-container/20 border border-primary/20 rounded-lg text-sm text-on-surface flex justify-between items-center">
                      <span>{toastMessage}</span>
                      <button onClick={() => setToastMessage('')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-lg align-middle">close</span>
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold font-sans text-on-surface">Saved Addresses</h2>
                    <button 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="px-4 py-2 bg-primary text-white text-xs font-label-caps tracking-widest rounded-lg hover:bg-primary-container transition-colors"
                    >
                      {showAddressForm ? 'CANCEL' : 'ADD ADDRESS'}
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="mb-8 bg-surface-container/30 p-6 rounded-xl border border-outline-variant/30 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-label-caps text-on-surface-variant">Street Address</label>
                          <input type="text" required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-label-caps text-on-surface-variant">City</label>
                          <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-label-caps text-on-surface-variant">State</label>
                          <input type="text" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-label-caps text-on-surface-variant">Postal Code</label>
                          <input type="text" required value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-label-caps text-on-surface-variant">Country</label>
                          <input type="text" required value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                          <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 accent-primary" />
                          <label htmlFor="isDefault" className="text-sm text-on-surface">Set as default shipping address</label>
                        </div>
                      </div>
                      <button type="submit" disabled={isSubmittingAddress} className="w-full md:w-auto px-6 py-3 bg-primary text-white text-xs font-label-caps tracking-widest rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 mt-4">
                        {isSubmittingAddress ? 'SAVING...' : 'SAVE ADDRESS'}
                      </button>
                    </form>
                  )}

                  {addresses.length === 0 ? (
                    <div className="text-on-surface-variant text-sm py-4 border-t border-outline-variant/30 pt-6">
                      You haven't saved any addresses yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div key={addr._id} className="p-5 border border-outline-variant/50 rounded-xl bg-surface relative group">
                          {addr.isDefault && (
                            <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-label-caps tracking-widest px-2 py-1 rounded-bl-lg rounded-tr-xl">DEFAULT</span>
                          )}
                          <p className="font-sans text-sm text-on-surface font-medium">{addr.street}</p>
                          <p className="font-sans text-sm text-on-surface-variant mt-1">{addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="font-sans text-sm text-on-surface-variant">{addr.country}</p>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="mt-4 text-xs font-label-caps tracking-widest text-error hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="animate-fade-in">
                  {toastMessage && (
                    <div className="mb-6 p-4 bg-primary-container/20 border border-primary/20 rounded-lg text-sm text-on-surface flex justify-between items-center">
                      <span>{toastMessage}</span>
                      <button onClick={() => setToastMessage('')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-lg align-middle">close</span>
                      </button>
                    </div>
                  )}

                  <h2 className="text-lg font-bold font-sans text-on-surface mb-6">Account Details</h2>

                  <form onSubmit={handleUpdateProfile} className="bg-surface-container/30 p-6 rounded-xl border border-outline-variant/30 space-y-4 max-w-2xl">
                    <div className="space-y-1">
                      <label className="text-xs font-label-caps text-on-surface-variant">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                        className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-label-caps text-on-surface-variant">Email Address</label>
                      <input 
                        type="email" 
                        value={profileForm.email} 
                        onChange={e => setProfileForm({...profileForm, email: e.target.value})} 
                        className="w-full p-3 bg-surface border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-primary" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-label-caps text-on-surface-variant">Phone Number (Read Only)</label>
                      <input 
                        type="text" 
                        disabled 
                        value={user?.phone || ''} 
                        className="w-full p-3 bg-surface-container/50 border border-outline-variant/50 rounded-lg text-sm text-on-surface-variant cursor-not-allowed" 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmittingProfile} 
                      className="w-full md:w-auto px-6 py-3 bg-primary text-white text-xs font-label-caps tracking-widest rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 mt-6"
                    >
                      {isSubmittingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      <CartDrawer />
      <AuthModal />
      <Footer />
    </div>
  );
}
