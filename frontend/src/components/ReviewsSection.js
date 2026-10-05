'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import Icon from '@/components/Icon';

const REVIEWS = [
  {
    text: 'Absolutely stunning fabric. The linen trousers drape beautifully and feel incredibly soft.',
    author: 'Emily R.',
    rating: 5,
  },
  {
    text: 'Naarzi has become my go-to for resort wear. Simple, elegant, and timeless silhouettes.',
    author: 'Sophia M.',
    rating: 5,
  },
  {
    text: 'The quality of the organic cotton ribbed tanks is unmatched. Soft texture with structure.',
    author: 'Alisha K.',
    rating: 5,
  },
  {
    text: 'Breathtaking color palette! The Wine slip dress fits like a dream. Highly recommend.',
    author: 'Carla L.',
    rating: 5,
  },
];

const AUTO_ADVANCE_MS = 6500;
const EASE = [0.215, 0.61, 0.355, 1];

function Stars({ count, className = '' }) {
  return (
    <div className={`flex gap-0.5 text-accent-gold ${className}`} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name="star"
          size="sm"
          className={i < count ? '' : 'opacity-25'}
          style={{ fontVariationSettings: '"FILL" 1' }}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const sectionRef = useRef(null);
  // Only rotate while the section is actually on screen
  const inView = useInView(sectionRef, { amount: 0.4 });
  const paused = hovered || !inView;

  const goTo = useCallback((index, dir) => {
    const next = (index + REVIEWS.length) % REVIEWS.length;
    setDirection(dir ?? (next > active ? 1 : -1));
    setActive(next);
  }, [active]);

  const next = useCallback(() => goTo(active + 1, 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1, -1), [active, goTo]);

  // Auto-advance; restarts whenever the active review changes
  useEffect(() => {
    if (paused || reduce) return;
    const timer = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, reduce, next]);

  const review = REVIEWS[active];
  const words = review.text.split(' ');

  return (
    <section
      className="py-14 md:py-24 border-t border-outline-variant/20 w-full bg-surface-container-low/40"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      ref={sectionRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop w-full">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-end justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] flex items-center gap-3 font-bold mb-2">
              <span className="inline-block w-8 h-[2px] bg-primary" />
              GUEST DIARIES
            </span>
            <h2 className="font-display-lg text-[1.75rem] md:text-4xl text-on-surface font-bold leading-tight">
              Loved by the <span className="italic font-normal text-primary">Naarzi</span> circle
            </h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="w-11 h-11 rounded-full border border-outline-variant/50 hover:border-primary hover:bg-primary hover:text-white text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer bg-surface-container-lowest"
            >
              <Icon name="arrow_back" size="md" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="w-11 h-11 rounded-full border border-outline-variant/50 hover:border-primary hover:bg-primary hover:text-white text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer bg-surface-container-lowest"
            >
              <Icon name="arrow_forward" size="md" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
          {/* Featured quote */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="lg:col-span-8 relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] md:rounded-[32px] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_-30px_rgba(107,34,51,0.35)] flex flex-col min-h-[22rem] md:min-h-[26rem]"
          >
            {/* Oversized decorative quotation mark */}
            <span
              aria-hidden="true"
              className="absolute -top-6 md:-top-10 right-4 md:right-10 font-display-lg text-[10rem] md:text-[16rem] leading-none text-primary/[0.07] select-none pointer-events-none"
            >
              “
            </span>

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={active}
                custom={direction}
                drag={reduce ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) next();
                  else if (info.offset.x > 60) prev();
                }}
                variants={{
                  enter: (dir) => ({ opacity: 0, x: reduce ? 0 : dir * 40 }),
                  center: { opacity: 1, x: 0 },
                  exit: (dir) => ({ opacity: 0, x: reduce ? 0 : dir * -40 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                className="relative flex-1 flex flex-col cursor-grab active:cursor-grabbing touch-pan-y"
                aria-live="polite"
              >
                <Stars count={review.rating} className="mb-5 md:mb-7" />

                <blockquote className="flex-1">
                  <p className="font-display-lg italic text-[1.5rem] leading-[1.35] sm:text-3xl md:text-[2.5rem] md:leading-[1.25] text-on-surface">
                    <span className="text-primary">“</span>
                    {words.map((word, i) => (
                      <motion.span
                        key={`${active}-${i}`}
                        className="inline-block mr-[0.25em]"
                        initial={reduce ? false : { opacity: 0, y: '0.4em' }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: EASE, delay: 0.1 + i * 0.035 }}
                      >
                        {word}
                      </motion.span>
                    ))}
                    <span className="text-primary -ml-[0.2em]">”</span>
                  </p>
                </blockquote>

                <div className="mt-8 flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-primary text-white font-display-lg text-lg font-bold flex items-center justify-center flex-none">
                    {review.author.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{review.author}</p>
                    <p className="text-[11px] text-green-700 font-label-caps tracking-wider flex items-center gap-1 font-bold">
                      <Icon name="verified" size="sm" /> VERIFIED CUSTOMER
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Story-style progress segments */}
            <div className="relative mt-8 flex gap-2" role="tablist" aria-label="Choose a review">
              {REVIEWS.map((r, i) => (
                <button
                  key={r.author}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Review by ${r.author}`}
                  onClick={() => goTo(i)}
                  className="group flex-1 py-2 cursor-pointer"
                >
                  <span className="block h-[3px] rounded-full bg-outline-variant/50 overflow-hidden">
                    {i < active && <span className="block h-full w-full bg-primary/60" />}
                    {i === active && (
                      <motion.span
                        key={`bar-${active}-${paused}`}
                        className="block h-full bg-primary origin-left"
                        initial={{ scaleX: reduce || paused ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduce || paused ? 0 : AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Reviewer list (desktop) */}
          <ul className="hidden lg:flex lg:col-span-4 flex-col gap-3">
            {REVIEWS.map((r, i) => {
              const isActive = i === active;
              return (
                <motion.li
                  key={r.author}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.15 + i * 0.1 }}
                  className="flex-1"
                >
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={isActive}
                    className={`relative w-full h-full text-left rounded-2xl border p-4 pl-5 transition-all duration-300 cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-surface-container-lowest border-primary/40 shadow-[0_12px_30px_-18px_rgba(107,34,51,0.45)]'
                        : 'bg-transparent border-outline-variant/40 hover:bg-surface-container-lowest/70'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-primary transition-transform duration-300 origin-top ${isActive ? 'scale-y-100' : 'scale-y-0'}`}
                    />
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-full font-display-lg font-bold flex items-center justify-center flex-none transition-colors ${
                          isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {r.author.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-on-surface">{r.author}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-1">{r.text}</p>
                      </div>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
