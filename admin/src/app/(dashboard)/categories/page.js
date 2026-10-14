'use client';

import React from 'react';
import { EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function CategoriesPage() {
  const {
    products,
    openCategoryEditModal,
    handleDeleteCategory,
    filteredCategories,
  } = useAdmin();

  if (filteredCategories.length === 0) return <EmptyState />;

  return (
      /* Categories Management Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Slug</th>
                <th className="py-4 px-6 text-center">Products Count</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredCategories.map((cat) => {
                const prodCount = products.filter(p => (p.category?._id || p.category) === cat._id).length;
                return (
                  <tr key={cat._id} className="hover:bg-surface-container/10 transition-colors">
                    <td className="py-4 px-6">
                      <img
                        src={cat.image || 'https://placehold.co/100x100?text=No+Image'}
                        alt={cat.name}
                        className="w-12 h-12 object-cover rounded-lg bg-surface-container border border-outline-variant/25"
                      />
                    </td>
                    <td className="py-4 px-6 font-semibold text-on-surface font-sans">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-on-surface-variant">
                      {cat.slug}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-primary font-sans">
                      {prodCount}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openCategoryEditModal(cat)}
                        className="px-3 py-1.5 bg-transparent border border-outline-variant/40 hover:border-primary text-on-surface-variant hover:text-primary text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="px-3 py-1.5 bg-transparent border border-error/30 hover:bg-error hover:text-white text-error text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                      >
                        DELETE
                      </button>
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
