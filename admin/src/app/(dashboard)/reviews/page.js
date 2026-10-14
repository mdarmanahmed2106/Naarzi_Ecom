'use client';

import React from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/admin/shared';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function ReviewsPage() {
  const {
    handleDeleteReview,
    filteredReviews,
  } = useAdmin();

  if (filteredReviews.length === 0) return <EmptyState />;

  return (
      /* Reviews Moderation Tab Table */
      <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/30 text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Reviewer</th>
                <th className="py-4 px-6">Rating</th>
                <th className="py-4 px-6">Comment</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md">
              {filteredReviews.map((rev) => (
                <tr key={rev._id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6 font-semibold text-primary font-sans">
                    {rev.product ? (
                      <Link href={`/products/${rev.product.slug}`} className="hover:underline">
                        {rev.product.name}
                      </Link>
                    ) : (
                      '[Deleted Product]'
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-on-surface block leading-tight">{rev.user?.name || 'Anonymous'}</span>
                    <span className="text-[10px] text-on-surface-variant block mt-0.5 font-light">{rev.user?.email || ''}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-0.5 text-secondary">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={`material-symbols-outlined text-sm ${rev.rating >= star ? 'fill-1' : 'opacity-25'}`}
                          style={{ fontVariationSettings: rev.rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant max-w-xs truncate" title={rev.comment}>
                    {rev.comment}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-xs font-sans">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleDeleteReview(rev._id)}
                      className="px-3.5 py-1.5 bg-transparent border border-error/30 hover:bg-error hover:text-white text-error text-[10px] font-label-caps tracking-widest rounded-lg transition-colors cursor-pointer font-bold inline-block"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
