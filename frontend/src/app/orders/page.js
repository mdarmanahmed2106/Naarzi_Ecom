'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { useApp } from '@/context/AppContext';
import { ordersApi } from '@/lib/api';

export default function MyOrdersPage() {
  const { user, authLoading, setIsAuthOpen, setAuthModalTab } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await ordersApi.getMyOrders();
        if (response.success) {
          setOrders(response.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  if (authLoading || (loading && user)) {
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

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />

      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop w-full pt-8 pb-20 flex-1">
        <h1 className="font-display-lg text-2xl md:text-3xl text-on-surface mb-8">
          My Orders
        </h1>

        {!user ? (
          /* User Not Logged In */
          <div className="max-w-md mx-auto text-center py-20 bg-surface-container/20 rounded-xl p-8 border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
              lock
            </span>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">
              Please log in to view your purchase and order history.
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
        ) : orders.length === 0 ? (
          /* User Has No Orders */
          <div className="max-w-md mx-auto text-center py-20 bg-surface-container/20 rounded-xl p-8 border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4 block">
              shopping_bag
            </span>
            <p className="font-body-md text-on-surface-variant mb-6 text-sm">
              You haven't placed any orders yet.
            </p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors shadow-sm"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          /* Orders History Feed */
          <div className="space-y-8 max-w-4xl mx-auto">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-surface border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden"
              >
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
                    </p>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="p-6 divide-y divide-outline-variant/30">
                  {order.items.map((item, index) => (
                    <div 
                      key={`${item.product?._id}-${item.size}-${index}`}
                      className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-surface-container rounded overflow-hidden flex-none">
                          {item.product?.images?.[0] && (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div>
                          {item.product ? (
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="font-medium text-sm text-on-surface hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-sm text-on-surface line-clamp-1">
                              [Product Removed]
                            </span>
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
      </main>

      <CartDrawer />
      <AuthModal />
      <Footer />
    </div>
  );
}
