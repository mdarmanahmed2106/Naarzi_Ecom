'use client';

import React from 'react';
import { EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function InventoryPage() {
  const {
    standardSizesList,
    editingStockId,
    openStockEditModal,
    filteredProducts,
  } = useAdmin();

  if (filteredProducts.length === 0) return <EmptyState />;

  return (
      /* Inventory Management Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6 min-w-[240px]">Product</th>
                {standardSizesList.map(size => (
                  <th key={size} className="py-4 px-3 text-center">{size}</th>
                ))}
                <th className="py-4 px-6 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredProducts.map((p) => {
                const isEditing = editingStockId === p._id;
                return (
                  <tr key={p._id} className="hover:bg-surface-container/10 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-on-surface block leading-tight">{p.name}</span>
                      <span className="text-[10px] text-on-surface-variant block mt-1 uppercase tracking-wider font-label-caps">
                        {p.category?.name || 'APPAREL'}
                      </span>
                    </td>
                    
                    {standardSizesList.map((size) => {
                      let currentStock = 0;
                      let isConfigured = false;
                      
                      if (p.colors && p.colors.length > 0) {
                        p.colors.forEach(c => {
                          const sizeObj = c.sizes.find(s => s.size === size);
                          if (sizeObj) {
                            isConfigured = true;
                            currentStock += sizeObj.stock;
                          }
                        });
                      } else if (p.sizes) {
                        // Legacy support
                        const sizeObj = p.sizes.find(s => s.size === size);
                        if (sizeObj) {
                          isConfigured = true;
                          currentStock += sizeObj.stock;
                        }
                      }
                      
                      return (
                        <td key={size} className="py-4 px-3 text-center">
                          {isConfigured ? (
                            <span className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                              currentStock <= 0 
                                ? 'bg-red-50 text-red-700 border border-red-100 line-through'
                                : currentStock <= 3
                                ? 'bg-amber-50 text-amber-700 border border-amber-100 font-bold'
                                : 'text-on-surface'
                            }`}>
                              {currentStock}
                            </span>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant/30 font-light">-</span>
                          )}
                        </td>
                      );
                    })}
  
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openStockEditModal(p)}
                        className="text-[10px] font-label-caps tracking-widest text-primary hover:text-primary-container transition-colors cursor-pointer font-bold"
                      >
                        EDIT STOCK
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
