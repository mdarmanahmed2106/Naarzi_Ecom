'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function CouponsPage() {
  const {
    coupons,
    user,
    openCouponEditModal,
    handleToggleCoupon,
    handleDeleteCoupon,
  } = useAdmin();

  return (
      /* Coupons Tab Dashboard */
      <div className="space-y-6 animate-fade-in">
        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-none">
              <span className="material-symbols-outlined text-2xl">local_offer</span>
            </div>
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant font-bold tracking-wider uppercase">Active Coupons</p>
              <p className="text-xl font-bold text-on-surface font-mono mt-0.5">
                {coupons.filter(c => c.isActive).length} <span className="text-xs text-on-surface-variant font-normal">/ {coupons.length} Total</span>
              </p>
            </div>
          </div>
  
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-accent-gold/15 text-accent-gold flex items-center justify-center flex-none">
              <span className="material-symbols-outlined text-2xl">redeem</span>
            </div>
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant font-bold tracking-wider uppercase">Total Redemptions</p>
              <p className="text-xl font-bold text-on-surface font-mono mt-0.5">
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </p>
            </div>
          </div>
  
          <div className="bg-white p-5 rounded-2xl border border-outline-variant/30 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-none border border-green-200">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
            <div>
              <p className="text-[10px] font-label-caps text-on-surface-variant font-bold tracking-wider uppercase">Top Performing Code</p>
              <p className="text-sm font-bold text-on-surface font-mono mt-1">
                {coupons.length > 0 
                  ? [...coupons].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))[0]?.code 
                  : 'None'}
              </p>
            </div>
          </div>
        </div>
  
        {/* Coupons Table */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                  <th className="py-4 px-6">Coupon & Details</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Safeguards & Rules</th>
                  <th className="py-4 px-6">Redemptions</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-on-surface-variant text-sm italic">
                      No coupons found. Click "ADD NEW COUPON" above to launch your first offer!
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-surface-container/10 transition-colors">
                      {/* Code & Description */}
                      <td className="py-4 px-6">
                        <span className="inline-block font-mono font-bold text-xs bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant/50 text-primary tracking-wider">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-xs text-on-surface-variant mt-1 max-w-xs leading-snug">
                            {c.description}
                          </p>
                        )}
                      </td>
  
                      {/* Discount & Cap */}
                      <td className="py-4 px-6 font-mono text-xs text-on-surface">
                        <span className="font-bold text-sm">
                          {c.discountType === 'percentage' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                        </span>
                        {c.discountType === 'percentage' && c.maxDiscountAmount && (
                          <span className="block text-[11px] text-on-surface-variant mt-0.5">
                            Capped at {formatCurrency(c.maxDiscountAmount)}
                          </span>
                        )}
                      </td>
  
                      {/* Safeguards & Rules */}
                      <td className="py-4 px-6 text-xs space-y-1">
                        {c.firstOrderOnly && (
                          <span className="inline-block font-label-caps text-[9px] bg-first-order-badge text-primary px-2 py-0.5 rounded font-bold mr-1.5">
                            FIRST ORDER ONLY
                          </span>
                        )}
                        {c.minOrderValue > 0 ? (
                          <span className="inline-block text-[11px] font-mono text-on-surface-variant">
                            Min: {formatCurrency(c.minOrderValue)}
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] text-on-surface-variant">
                            No min order
                          </span>
                        )}
                        {c.applicableCategories && c.applicableCategories.length > 0 ? (
                          <span className="block text-[10px] text-primary font-medium">
                            Only on: {c.applicableCategories.map(cat => cat.name || 'Category').join(', ')}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-on-surface-variant/70">
                            All Collections (Storewide)
                          </span>
                        )}
                        {c.maxUsesPerUser && (
                          <span className="block text-[10px] text-on-surface-variant/80">
                            {c.maxUsesPerUser} use per user
                          </span>
                        )}
                      </td>
  
                      {/* Uses Count */}
                      <td className="py-4 px-6 font-mono text-xs text-on-surface">
                        <span className="font-bold">{c.usedCount || 0}</span>
                        <span className="text-on-surface-variant"> / {c.maxUses ? c.maxUses : '∞'}</span>
                      </td>
  
                      {/* Status Toggle */}
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => handleToggleCoupon(c)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider font-label-caps transition-colors cursor-pointer ${
                            c.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
  
                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button 
                          onClick={() => openCouponEditModal(c)} 
                          className="px-2.5 py-1 text-primary hover:bg-primary/10 rounded text-xs font-bold font-label-caps transition-colors cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(c._id)} 
                          className="px-2.5 py-1 text-error hover:bg-error/10 rounded text-xs font-bold font-label-caps transition-colors cursor-pointer"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
