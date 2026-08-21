'use client';

import { Lottie } from 'lottie-react';
import Link from 'next/link';
import animationData from '../../public/animations/404-not-found.json';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-[var(--color-surface)]">
      <div className="w-48 md:w-64">
        <Lottie animationData={animationData} loop autoplay />
      </div>

      <h1 className="text-2xl md:text-3xl font-serif text-[var(--color-on-surface)] mt-4 mb-2">
        We couldn't find that page
      </h1>
      <p className="text-[var(--color-on-surface-variant)] mb-8 max-w-md">
        The page you're looking for may have been moved or no longer exists. Let's get you back to shopping.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="px-6 py-3 border border-[var(--color-outline)] text-[var(--color-on-surface)] rounded-lg font-medium hover:bg-[var(--color-surface-container)] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
