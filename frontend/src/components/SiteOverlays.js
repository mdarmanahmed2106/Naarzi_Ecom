'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '@/context/AppContext';

// The sign-in window pulls in Firebase and Google's sign-in scripts (~150 KB), so it's loaded the
// first time someone opens it rather than with every page
const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });

export default function SiteOverlays() {
  const { isAuthOpen } = useApp();

  // Google Analytics (Firebase) starts once the page has loaded and gone quiet, so it never
  // competes with the page itself for the network or the main thread
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      setTimeout(() => idle(async () => {
        if (cancelled) return;
        const [{ getAnalytics, isSupported }, { default: app }] = await Promise.all([
          import('firebase/analytics'),
          import('@/lib/firebaseApp'),
        ]);
        if (!cancelled && (await isSupported())) getAnalytics(app);
      }), 4000);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
    };
  }, []);

  return isAuthOpen ? <AuthModal /> : null;
}
