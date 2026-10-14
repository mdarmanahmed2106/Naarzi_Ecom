'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AdminHeader({ user, logout, notifications, unreadCount, markAsRead, markAllAsRead }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-outline-variant/30 py-4 px-6 md:px-10 lg:px-16">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col items-start justify-center hover:opacity-85 transition-opacity">
            <span className="font-display-lg text-xl md:text-2xl tracking-widest text-primary font-bold leading-none">
              NAARZI
            </span>
            <span className="font-label-caps text-[6px] md:text-[8px] tracking-[0.4em] text-accent-gold font-bold mt-1 uppercase">
              OWN THE MOMENT
            </span>
          </Link>
          <span className="h-4 w-px bg-outline-variant/60"></span>
          <span className="text-[9px] font-label-caps text-on-surface-variant tracking-wider font-bold">ADMIN PORTAL</span>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] font-label-caps font-bold">
          {user ? (
            <div className="relative flex items-center gap-6">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative text-on-surface hover:text-primary transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error text-[8px] items-center justify-center text-white font-bold">{unreadCount}</span>
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-outline-variant/30 rounded-xl z-50 flex flex-col p-2">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/20 mb-2">
                    <span className="font-label-caps text-xs tracking-wider text-on-surface font-bold">NOTIFICATIONS</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[9px] text-primary hover:underline">
                        MARK ALL READ
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-on-surface-variant italic">No new notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`p-3 rounded-lg mb-1 cursor-pointer transition-colors ${notif.isRead ? 'bg-surface hover:bg-surface-container' : 'bg-primary/5 hover:bg-primary/10'}`}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                          if (notif.referenceModel === 'Order') {
                            // Open the order itself; older notifications without a reference land on the list
                            router.push(notif.referenceId ? `/orders/${notif.referenceId}` : '/orders');
                            setIsDropdownOpen(false);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-bold text-xs ${notif.isRead ? 'text-on-surface' : 'text-primary'}`}>{notif.title}</span>
                          <span className="text-[9px] text-on-surface-variant">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-on-surface leading-tight">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              <button 
                onClick={logout}
                className="text-on-surface hover:text-error transition-colors tracking-widest cursor-pointer bg-transparent border-none font-bold text-[10px] font-label-caps"
              >
                LOG OUT
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

// Which status an order may move to FROM its current status; [] = final state.
// Mirrors backend/src/utils/orderStatusTransitions.js (the backend is the real enforcement —
// this just keeps the UI from offering a change the API will reject).
export const ALLOWED_TRANSITIONS = {
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const STATUS_STYLES = {
  delivered: 'bg-green-50 text-green-700 border-green-200',
  shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export const REFUND_BADGES = {
  pending: { label: 'Refund Pending', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  completed: { label: 'Refunded', className: 'bg-green-50 text-green-700 border-green-200' },
  failed: { label: 'Refund Failed', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function RefundBadge({ status }) {
  const badge = REFUND_BADGES[status];
  if (!badge) return null;
  return (
    <span className={`inline-block text-[9px] font-label-caps px-2 py-1 rounded border tracking-wider font-bold uppercase ${badge.className}`}>
      {badge.label}
    </span>
  );
}

// Status dropdown that only offers legal next steps; read-only badge once an order is final
export function OrderStatusControl({ status, onChange, size = 'sm' }) {
  const allowedNext = ALLOWED_TRANSITIONS[status] || [];
  const sizing = size === 'lg' ? 'px-3 py-2 rounded-xl' : 'px-2 py-1.5 rounded-lg';
  const style = STATUS_STYLES[status] || STATUS_STYLES.cancelled;

  if (allowedNext.length === 0) {
    return (
      <span
        title="This order is in a final state and can't be changed"
        className={`inline-flex items-center gap-1 border text-xs font-semibold ${sizing} ${style}`}
      >
        <span className="material-symbols-outlined leading-none" style={{ fontSize: 14 }}>lock</span>
        {status}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={`border text-xs font-semibold focus:outline-none cursor-pointer ${sizing} ${style}`}
    >
      <option value={status} disabled className="text-on-surface bg-white">{status}</option>
      {allowedNext.map((next) => (
        <option key={next} value={next} className="text-on-surface bg-white">→ {next}</option>
      ))}
    </select>
  );
}

// Shown by list sections when nothing matches the search / filters
export function EmptyState() {
  return (
    <div className="py-24 text-center bg-white rounded-2xl border border-outline-variant/30">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">inventory_2</span>
      <p className="font-body-md text-on-surface-variant text-sm">No items match your search or filter settings.</p>
    </div>
  );
}
