'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function ProductsPage() {
  const {
    openEditModal,
    handleDeleteProduct,
    filteredProducts,
  } = useAdmin();

  if (filteredProducts.length === 0) return <EmptyState />;

  return (
      /* Products Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Featured</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredProducts.map((p) => {
                const hasDisc = p.discountedPrice !== undefined && p.discountedPrice !== null;
                return (
                  <tr key={p._id} className="hover:bg-surface-container/10 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-4 min-w-[280px]">
                      <img 
                        src={p.images?.[0] || p.colors?.[0]?.images?.[0] || '/placeholder.png'} 
                        alt={p.name} 
                        className="w-12 h-14 object-cover rounded-lg bg-surface-container border border-outline-variant/25"
                      />
                      <div>
                        <span className="font-semibold text-on-surface block leading-tight">{p.name}</span>
                        <span className="text-[10px] text-on-surface-variant block mt-1 uppercase tracking-wider font-label-caps">
                          {p.colors && p.colors.length > 0 
                            ? `${p.colors.reduce((total, c) => total + c.sizes.length, 0)} SIZES CONFIGURED`
                            : `${p.sizes ? p.sizes.length : 0} SIZES CONFIGURED`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {p.category?.name || 'APPAREL'}
                    </td>
                    <td className="py-4 px-6">
                      {hasDisc ? (
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-medium">{formatCurrency(p.discountedPrice)}</span>
                          <span className="text-xs text-on-surface-variant line-through opacity-70">{formatCurrency(p.price)}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface font-medium">{formatCurrency(p.price)}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {p.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-label-caps text-primary bg-primary/5 px-2.5 py-1 rounded border border-primary/20 tracking-wider font-bold">
                          FEATURED
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant/40">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer bg-transparent"
                          title="Edit product"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-colors cursor-pointer bg-transparent"
                          title="Delete product"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
  );
}
