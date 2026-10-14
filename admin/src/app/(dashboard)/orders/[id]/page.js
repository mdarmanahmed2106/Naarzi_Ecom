'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import { ALLOWED_TRANSITIONS, RefundBadge, OrderStatusControl } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';
import { useParams } from 'next/navigation';

export default function OrderDetailPage() {
  const { id } = useParams();
  const {
    selectedOrder,
    setSelectedOrder,
    refundingId,
    handleUpdateOrderStatus,
    handleRetryRefund,
    handleSaveTracking,
    openOrderDetails,
  } = useAdmin();

  // Load (or reload) whenever the order in the URL changes
  useEffect(() => {
    if (id) openOrderDetails(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!selectedOrder || selectedOrder._id !== id) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="font-body-md text-sm text-on-surface-variant">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl bg-white border border-outline-variant/30 rounded-2xl p-6 md:p-8 text-sm font-body-md text-on-surface">
        {/* Title */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-6">
          <div>
            <h2 className="font-display-lg text-2xl text-primary font-bold">
              Order Details
            </h2>
            <span className="font-mono text-xs text-on-surface-variant">ID: {selectedOrder._id}</span>
          </div>
          <Link
            href="/orders"
            className="text-[10px] font-label-caps tracking-widest font-bold text-on-surface-variant hover:text-primary flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            ALL ORDERS
          </Link>
        </div>
  
        {/* Quick Status Control */}
        <div className="bg-surface-container/40 border border-outline-variant/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold">ORDER STATUS</span>
            <span className="text-xs text-on-surface font-semibold block mt-1 uppercase">
              {selectedOrder.orderStatus}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-semibold">
              {(ALLOWED_TRANSITIONS[selectedOrder.orderStatus] || []).length ? 'Change Fulfillment:' : 'Final state:'}
            </span>
            <OrderStatusControl
              status={selectedOrder.orderStatus}
              onChange={(next) => handleUpdateOrderStatus(selectedOrder._id, next)}
              size="lg"
            />
          </div>
        </div>
  
        {/* Refund — cancelling a paid order refunds it automatically; retry here if it failed */}
        {selectedOrder.orderStatus === 'cancelled' && ['paid', 'refunded'].includes(selectedOrder.paymentStatus) && (
          <div className="bg-surface-container/40 border border-outline-variant/20 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold">REFUND</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-on-surface font-semibold">{formatCurrency(selectedOrder.totalAmount)}</span>
                <RefundBadge status={selectedOrder.refundStatus} />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                {selectedOrder.refundStatus === 'completed'
                  ? `Refunded${selectedOrder.refundedAt ? ` on ${new Date(selectedOrder.refundedAt).toLocaleDateString()}` : ''} to the original payment method.`
                  : selectedOrder.refundStatus === 'pending'
                  ? 'Initiated with Razorpay — it completes automatically.'
                  : selectedOrder.refundStatus === 'failed'
                  ? 'The automatic refund failed. Retry it, or refund from the Razorpay dashboard.'
                  : 'Not refunded yet.'}
                {selectedOrder.razorpayRefundId && selectedOrder.razorpayRefundId !== 'claimed' && (
                  <span className="block font-mono mt-0.5">{selectedOrder.razorpayRefundId}</span>
                )}
              </p>
            </div>
            {selectedOrder.paymentStatus === 'paid' && ['failed', 'not_applicable'].includes(selectedOrder.refundStatus) && (
              <button
                type="button"
                onClick={() => handleRetryRefund(selectedOrder._id)}
                disabled={refundingId === selectedOrder._id}
                className="px-4 py-2 bg-primary text-white text-[11px] font-label-caps tracking-widest rounded-xl font-bold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                {refundingId === selectedOrder._id ? 'REFUNDING…' : 'RETRY REFUND'}
              </button>
            )}
          </div>
        )}
  
        {/* Tracking Details — powers the customer-facing order tracker */}
        <div className="bg-surface-container/40 border border-outline-variant/20 p-4 rounded-xl mb-6">
          <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold mb-3">
            TRACKING DETAILS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1">Tracking Number</label>
              <input
                type="text"
                value={selectedOrder.trackingNumber || ''}
                onChange={(e) => setSelectedOrder(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="e.g. AWB1234567890"
                className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-xs focus:outline-none focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1">Carrier</label>
              <input
                type="text"
                value={selectedOrder.carrier || ''}
                onChange={(e) => setSelectedOrder(prev => ({ ...prev, carrier: e.target.value }))}
                placeholder="e.g. Delhivery"
                className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-xs focus:outline-none focus:border-primary bg-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1">Estimated Delivery</label>
              <input
                type="date"
                value={selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toISOString().slice(0, 10) : ''}
                onChange={(e) => setSelectedOrder(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                className="w-full px-3 py-2 border border-outline-variant/40 rounded-lg text-xs focus:outline-none focus:border-primary bg-white"
              />
            </div>
          </div>
          <button
            onClick={() => handleSaveTracking(selectedOrder._id)}
            className="mt-3 px-4 py-2 bg-primary text-white text-xs font-label-caps tracking-widest rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
          >
            SAVE TRACKING DETAILS
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Shipping Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
              Shipping Information
            </h3>
            <div className="space-y-2 text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-on-surface">{selectedOrder.user?.name || 'Guest Customer'}</p>
              <p className="text-xs">{selectedOrder.user?.email || 'No email associated'}</p>
              <p className="text-xs font-mono">{selectedOrder.shippingAddress?.phone || 'No phone number'}</p>
              <div className="text-xs pt-1 border-t border-outline-variant/5 mt-2">
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                <p>{selectedOrder.shippingAddress?.postalCode}</p>
                <p className="font-medium text-on-surface">{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>
          </div>
  
          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
              Payment Summary
            </h3>
            <div className="space-y-2 text-on-surface-variant text-xs">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-semibold uppercase text-on-surface">{selectedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span className="font-medium text-on-surface">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              {selectedOrder.razorpayOrderId && (
                <div className="flex justify-between font-mono text-[10px] mt-1 pt-1 border-t border-outline-variant/5">
                  <span>Gateway Order ID:</span>
                  <span>{selectedOrder.razorpayOrderId}</span>
                </div>
              )}
              {selectedOrder.razorpayPaymentId && (
                <div className="flex justify-between font-mono text-[10px]">
                  <span>Transaction ID:</span>
                  <span>{selectedOrder.razorpayPaymentId}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-bold text-primary pt-3 border-t border-outline-variant/20">
                <span>Total Amount Paid:</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-label-caps text-primary tracking-wider font-bold border-b border-outline-variant/10 pb-1 uppercase">
            Items Configured ({selectedOrder.items?.length || 0})
          </h3>
          <div className="border border-outline-variant/20 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container/20 font-label-caps text-[9px] text-on-surface-variant tracking-wider uppercase">
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4 text-center">Size</th>
                  <th className="py-2.5 px-4 text-center">Quantity</th>
                  <th className="py-2.5 px-4 text-right">Price per unit</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {selectedOrder.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-surface-container/5">
                    <td className="py-2.5 px-4 font-semibold text-on-surface">
                      {item.product?.name || 'Deleted Product'}
                    </td>
                    <td className="py-2.5 px-4 text-center text-on-surface-variant font-medium">
                      {item.size}
                    </td>
                    <td className="py-2.5 px-4 text-center text-on-surface-variant">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right text-on-surface-variant font-mono">
                      {formatCurrency(item.priceAtPurchase)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-primary">
                      {formatCurrency(item.priceAtPurchase * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Actions */}
        <div className="flex gap-4 border-t border-outline-variant/20 pt-6 mt-8 justify-end">
          <Link
            href="/orders"
            className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container transition-colors font-bold"
          >
            BACK TO ORDERS
          </Link>
        </div>
    </div>
  );
}
