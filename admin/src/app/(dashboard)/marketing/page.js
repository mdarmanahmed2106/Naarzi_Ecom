'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function MarketingPage() {
  const {
    abandonedCarts,
    wishlistInsights,
    wishlistCustomers,
    abandonedThreshold,
    setAbandonedThreshold,
    customers,
  } = useAdmin();

  return (
      <div className="space-y-12 animate-fade-in">
        {/* Abandoned Carts Section */}
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-display-md text-on-surface font-bold">Abandoned Carts</h3>
              <p className="text-on-surface-variant text-sm mt-1">Carts left without checkout.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-label-caps font-bold text-on-surface-variant">Threshold:</label>
              <select
                value={abandonedThreshold}
                onChange={(e) => setAbandonedThreshold(Number(e.target.value))}
                className="border border-outline-variant rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value={1}>1 Hour+</option>
                <option value={2}>2 Hours+</option>
                <option value={6}>6 Hours+</option>
                <option value={24}>24 Hours+</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] font-label-caps text-on-surface-variant tracking-wider font-bold">
                  <th className="pb-4 pl-4 font-bold">CUSTOMER</th>
                  <th className="pb-4 font-bold">ITEMS</th>
                  <th className="pb-4 font-bold">VALUE</th>
                  <th className="pb-4 font-bold">LAST UPDATED</th>
                  <th className="pb-4 font-bold text-right pr-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {abandonedCarts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-on-surface-variant">No abandoned carts found for this threshold.</td>
                  </tr>
                ) : (
                  abandonedCarts.map((cart) => (
                    <tr key={cart._id} className="border-b border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                      <td className="py-4 pl-4">
                        <div className="font-bold">{cart.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-on-surface-variant">{cart.user?.email}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {cart.items.slice(0, 3).map((item, idx) => {
                            const imgSrc = item.product?.colors?.[0]?.images?.[0] || item.product?.images?.[0] || '/placeholder.png';
                            return (
                              <img key={idx} src={imgSrc} alt="Product" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" />
                            );
                          })}
                          {cart.items.length > 3 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-surface-container text-xs font-bold">
                              +{cart.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">{cart.items.length} items</div>
                      </td>
                      <td className="py-4 font-bold text-primary">
                        {formatCurrency(cart.cartValue || 0, { decimals: 2 })}
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant">
                        {new Date(cart.updatedAt).toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        {cart.user?.email && (
                          <button 
                            onClick={() => navigator.clipboard.writeText(cart.user.email)}
                            className="text-xs font-label-caps font-bold px-3 py-1.5 border border-primary/20 text-primary rounded hover:bg-primary/5 transition-colors"
                          >
                            COPY EMAIL
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Wishlist Insights Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-8">
            <h3 className="text-xl font-display-md text-on-surface font-bold mb-6">Most Wishlisted Products</h3>
            <div className="space-y-4">
              {wishlistInsights.length === 0 ? (
                <div className="text-on-surface-variant">No wishlist data available.</div>
              ) : (
                wishlistInsights.slice(0, 5).map((insight, idx) => {
                  const imgSrc = insight.colors?.[0]?.images?.[0] || insight.images?.[0] || '/placeholder.png';
                  return (
                    <div key={insight._id} className="flex items-center gap-4">
                      <span className="font-display-md text-xl text-on-surface-variant font-bold w-4">{idx + 1}</span>
                      <img src={imgSrc} alt={insight.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-bold text-sm truncate">{insight.name}</div>
                        <div className="text-xs text-on-surface-variant">{formatCurrency(insight.discountedPrice || insight.price)}</div>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold font-label-caps flex-shrink-0">
                        {insight.count} LIKES
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
  
          {/* Wishlist Customers */}
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-8">
            <h3 className="text-xl font-display-md text-on-surface font-bold mb-6">Customers with Wishlists</h3>
            <div className="space-y-4">
              {wishlistCustomers.length === 0 ? (
                <div className="text-on-surface-variant">No customers with wishlists.</div>
              ) : (
                wishlistCustomers.slice(0, 5).map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-outline-variant/10 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-sm">{customer.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-on-surface-variant">{customer.user?.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{customer.itemCount} items</div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(customer.user?.email || '')}
                        className="text-[10px] text-primary hover:underline font-label-caps font-bold mt-1"
                      >
                        COPY EMAIL
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
