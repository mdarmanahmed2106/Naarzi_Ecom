'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AdminHeader({ user, logout, notifications, unreadCount, markAsRead, markAllAsRead }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://naarzi.com';
  return (
    <header className="sticky top-0 z-40 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/50 px-5 md:px-8">
      <div className="h-full w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="Naarzi admin home">
            <span className="brand-wordmark font-display-lg text-[1.6rem] tracking-[0.18em] text-primary leading-none">
              NAARZI
            </span>
          </Link>
          <span className="h-5 w-px bg-outline-variant" aria-hidden="true"></span>
          <span className="font-label-caps text-[10px] tracking-[0.3em] uppercase text-on-surface-variant">Admin</span>
        </div>

        {user ? (
          <div className="relative flex items-center gap-1 md:gap-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 font-label-caps text-[11px] tracking-[0.2em] uppercase text-on-surface-variant hover:text-on-surface transition-colors"
            >
              View store
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </a>

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              aria-expanded={isDropdownOpen}
              className="relative w-9 h-9 inline-flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-medium leading-4 text-center tabular-nums">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <>
                {/* Click anywhere else to close */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} aria-hidden="true" />
                <div className="absolute top-full right-0 mt-2 w-[22rem] max-w-[calc(100vw-2.5rem)] max-h-[26rem] overflow-y-auto bg-surface-container-lowest border border-outline-variant/60 shadow-[0_18px_40px_-20px_rgba(28,26,23,0.35)] z-50">
                  <div className="sticky top-0 bg-surface-container-lowest flex items-center justify-between px-4 py-3 border-b border-outline-variant/50">
                    <span className="font-label-caps text-[11px] tracking-[0.25em] uppercase text-on-surface">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[11px] text-primary hover:underline underline-offset-4 cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-on-surface-variant">You&apos;re all caught up.</div>
                  ) : (
                    <ul className="divide-y divide-outline-variant/40">
                      {notifications.map(notif => (
                        <li key={notif._id}>
                          <button
                            type="button"
                            className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${notif.isRead ? 'hover:bg-surface-container-low' : 'bg-primary/[0.04] hover:bg-primary/[0.08]'}`}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              if (notif.referenceModel === 'Order') {
                                // Open the order itself; older notifications without a reference land on the list
                                router.push(notif.referenceId ? `/orders/${notif.referenceId}` : '/orders');
                                setIsDropdownOpen(false);
                              }
                            }}
                          >
                            <div className="flex justify-between items-baseline gap-3 mb-0.5">
                              <span className={`text-[13px] flex items-center gap-1.5 ${notif.isRead ? 'text-on-surface' : 'text-primary font-medium'}`}>
                                {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />}
                                {notif.title}
                              </span>
                              <span className="text-[11px] text-on-surface-variant shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-snug">{notif.message}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            <span className="hidden md:block h-5 w-px bg-outline-variant mx-2" aria-hidden="true"></span>
            <span className="hidden md:block text-[13px] text-on-surface max-w-[12rem] truncate" title={user.email}>{user.name || user.email}</span>
            <button
              onClick={logout}
              className="h-9 px-3 font-label-caps text-[11px] tracking-[0.2em] uppercase text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

// Which status an order may move to FROM its current status; [] = final state.
// Mirrors backend/src/utils/orderStatusTransitions.js (the backend is the real enforcement : 
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
