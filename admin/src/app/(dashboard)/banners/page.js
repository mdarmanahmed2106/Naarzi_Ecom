'use client';

import React from 'react';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function BannersPage() {
  const {
    promoBanners,
    handleToggleBanner,
    handleDeleteBanner,
  } = useAdmin();

  return (
      /* Banners Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Message</th>
                <th className="py-4 px-6">Link</th>
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {promoBanners.map((b) => (
                <tr key={b._id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6 font-semibold text-on-surface font-sans">{b.message}</td>
                  <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{b.link || '-'}</td>
                  <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">{b.order}</td>
                  <td className="py-4 px-6 font-mono text-xs">
                    <button 
                      onClick={() => handleToggleBanner(b)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {b.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDeleteBanner(b._id)} className="px-3 text-error text-[10px] font-bold">DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
