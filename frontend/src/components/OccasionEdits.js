'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { OCCASIONS } from '@/lib/occasions';

const EASE = [0.215, 0.61, 0.355, 1];
const CYCLE_MS = 4000;

// Used when no product tagged with the occasion has a photo yet
const FALLBACK_IMAGES = {
  workwear: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?q=80&w=1200&auto=format&fit=crop',
  festive: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
  everyday: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
};

const productPhoto = (p) => p?.colors?.[0]?.images?.[0] || p?.images?.[0] || null;

/**
 * Minimal "shop by occasion": a plain heading, the occasion names as a list (active one bold,
 * the rest muted) and a photo that follows the hovered/focused name. Quietly cycles while
 * nobody interacts, which is also how touch users see every occasion.
 */
export default function OccasionEdits({ products = [] }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);

  // First tagged product with a photo represents each occasion
  const edits = OCCASIONS.map((occ) => {
    const tagged = products.find(
      (p) => (p.occasion || []).some((o) => String(o).toLowerCase() === occ.slug) && productPhoto(p)
    );
    return { ...occ, image: productPhoto(tagged) || FALLBACK_IMAGES[occ.slug], imageAlt: tagged ? tagged.name : occ.name };
  });

  useEffect(() => {
    if (reduce || interacting || !inView) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % edits.length), CYCLE_MS);
    return () => clearTimeout(timer);
  }, [active, reduce, interacting, inView, edits.length]);

  const current = edits[active];

  return (
    <section ref={sectionRef} className="py-12 md:py-20 max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop w-full">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        onMouseLeave={() => setInteracting(false)}
      >
        <div className="lg:col-span-7">
          <h2 className="font-display-lg text-[2.25rem] sm:text-5xl lg:text-[3.5rem] text-on-surface font-bold leading-[1.05]">
            Dress for Where You&apos;re Going
          </h2>
          <p className="font-body-md text-sm md:text-base text-on-surface mt-5 md:mt-7">
            Style doesn&apos;t pause for the calendar. Shop by the day you&apos;re actually having.
          </p>

          <ul className="mt-6 md:mt-8" onMouseEnter={() => setInteracting(true)}>
            {edits.map((edit, i) => {
              const isActive = i === active;
              return (
                <li key={edit.slug}>
                  <Link
                    href={`/shop?occasion=${edit.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => { setActive(i); setInteracting(true); }}
                    onBlur={() => setInteracting(false)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`block py-1.5 md:py-2 font-display-lg text-[1.6rem] sm:text-[1.9rem] lg:text-[2.1rem] leading-tight transition-all duration-300 focus:outline-none ${
                      isActive
                        ? 'text-on-surface font-bold pl-4 md:pl-6'
                        : 'text-on-surface-variant/55 font-semibold hover:text-on-surface-variant'
                    }`}
                  >
                    {edit.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Photo that follows the active occasion */}
        <Link
          href={`/shop?occasion=${current.slug}`}
          aria-label={`Shop ${current.name}`}
          className="lg:col-span-5 lg:justify-self-end relative block aspect-square w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-[30rem] rounded-[22px] md:rounded-[28px] overflow-hidden bg-surface-container"
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={current.slug}
              src={current.image}
              alt={current.imageAlt}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </Link>
      </motion.div>
    </section>
  );
}
