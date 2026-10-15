'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function EditProductPage() {
  const { id } = useParams();
  const { products, loadProductIntoForm, modalMode, currentProductId } = useAdmin();
  const product = products.find((p) => p._id === id);

  // Load the product into the form once per product. Deliberately not re-run when the product
  // list refreshes in the background, so edits in progress aren't overwritten.
  useEffect(() => {
    if (product) loadProductIntoForm(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, Boolean(product)]);

  if (!product) {
    return (
      <div className="py-24 text-center bg-white rounded-2xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">inventory_2</span>
        <p className="font-body-md text-on-surface-variant text-sm mb-4">This product doesn&apos;t exist or was deleted.</p>
        <Link href="/products" className="text-xs font-label-caps tracking-widest font-bold text-primary hover:underline">
          BACK TO PRODUCTS
        </Link>
      </div>
    );
  }

  if (modalMode !== 'edit' || currentProductId !== id) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return <ProductForm />;
}
