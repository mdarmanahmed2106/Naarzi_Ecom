'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import { RefundBadge, OrderStatusControl, EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function OrdersPage() {
  const {
    handleUpdateOrderStatus,
    filteredOrders,
  } = useAdmin();

  if (filteredOrders.length === 0) return <EmptyState />;

  return (
      /* Orders Management Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Payment</th>
                <th className="py-4 px-6">Fulfillment Status</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-primary font-semibold">
                    #{o._id.substring(o._id.length - 8).toUpperCase()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-on-surface block leading-tight">{o.user?.name || 'Guest User'}</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5 font-light">
                      {o.user?.email || o.shippingAddress?.phone || 'No contact email'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 font-semibold text-on-surface">
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td className="py-4 px-6 flex flex-col items-start gap-1">
                    <span className={`inline-block text-[9px] font-label-caps px-2 py-1 rounded border tracking-wider font-bold uppercase ${
                      o.paymentStatus === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : o.paymentStatus === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {o.paymentStatus}
                    </span>
                    <RefundBadge status={o.refundStatus} />
                  </td>
                  <td className="py-4 px-6">
                    <OrderStatusControl
                      status={o.orderStatus}
                      onChange={(next) => handleUpdateOrderStatus(o._id, next)}
                    />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/orders/${o._id}`}
                      className="inline-block px-3.5 py-1.5 bg-transparent border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary text-[10px] font-label-caps tracking-widest rounded-lg transition-colors font-bold"
                    >
                      VIEW
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
