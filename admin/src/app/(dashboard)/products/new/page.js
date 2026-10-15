'use client';

import React, { useEffect } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import { useAdmin } from '@/components/admin/AdminProvider';

export default function NewProductPage() {
  const { resetProductForm, modalMode, currentProductId } = useAdmin();

  // Start from a blank form on every visit
  useEffect(() => {
    resetProductForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait until the form is in "add" mode, so a product edited earlier never shows here
  if (modalMode !== 'add' || currentProductId !== null) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return <ProductForm />;
}
