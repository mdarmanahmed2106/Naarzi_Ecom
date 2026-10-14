'use client';

import React from 'react';
import { EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function CustomersPage() {
  const {
    filteredCustomers,
  } = useAdmin();

  if (filteredCustomers.length === 0) return <EmptyState />;

  return (
      /* Customers Directory Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Signup Date</th>
                <th className="py-4 px-6 text-center font-sans">Orders Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredCustomers.map((cust) => (
                <tr key={cust._id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6 font-semibold text-on-surface font-sans">
                    {cust.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                    {cust.email}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-xs font-sans">
                    {new Date(cust.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-primary font-sans">
                    {cust.orderCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
