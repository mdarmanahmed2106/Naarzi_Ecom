'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/formatCurrency';

const EASE = [0.215, 0.61, 0.355, 1];

// Closing strip of store promises at the bottom of the homepage card
export default function HighlightsStrip() {
  const { settings } = useApp();
  const reduce = useReducedMotion();

  // Kept in sync with the store settings so the promise always matches checkout
  const threshold = settings?.freeShippingThreshold || 0;

  const items = [
    { title: 'New customers get 10% off', sub: 'on your first order' },
    {
      title: 'Free shipping',
      sub: threshold > 0 ? `on orders over ${formatCurrency(threshold)}` : 'on every order',
    },
    { title: 'Secure payments', sub: 'UPI, cards & netbanking via Razorpay' },
  ];

  return (
    <section aria-label="Naarzi promises" className="w-full border-t border-outline-variant/30">
      <ul className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop grid grid-cols-1 md:grid-cols-3">
        {items.map((item, i) => (
          <motion.li
            key={item.title}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.12 }}
            className={`relative text-center py-7 md:py-12 ${i > 0 ? 'border-t md:border-t-0 border-outline-variant/40' : ''}`}
          >
            {/* Vertical divider on desktop, drawn top-down */}
            {i > 0 && (
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.12 }}
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-[70%] w-px bg-on-surface/60 origin-top"
              />
            )}
            <p className="font-headline-sm text-lg md:text-2xl text-on-surface font-bold">{item.title}</p>
            <p className="font-body-md text-sm text-on-surface-variant mt-1.5">{item.sub}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
