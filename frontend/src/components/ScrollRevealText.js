'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Word Component for Scroll Text Reveal
 * Maps:
 * - progress <= start: strictly opacity 0.16 (ghost preview)
 * - progress from start to end: smooth transition to opacity 1.0 (solid black)
 * - progress >= end (and throughout the rest of scroll): permanently opacity 1.0 (solid black)
 */
function RevealWord({ word, progress, start, end, shouldReduceMotion }) {
  const mid = (start + end) / 2;

  // Opacity: Ghost (0.16) -> Solid Contrast (1.0) and stays 1.0 permanently once revealed
  const opacity = useTransform(
    progress,
    [0, start, end, 1],
    [0.16, 0.16, 1, 1]
  );

  // Natural subtle word lift on active front
  const y = useTransform(
    progress,
    [0, start, mid, end, 1],
    [0, 0, -3, 0, 0]
  );

  if (shouldReduceMotion) {
    return <span className="inline-block mr-[0.24em] my-[0.02em] text-[#130f12] font-bold">{word}</span>;
  }

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block mr-[0.24em] my-[0.02em] font-bold text-[#130f12] will-change-transform"
    >
      {word}
    </motion.span>
  );
}

export default function ScrollRevealText({
  text = "Born from a love of craftsmanship and modern femininity, our brand exists to create clothing that feels considered, wearable, and quietly bold. Every piece is designed with intention—balancing structure and softness, ease and elegance, so you feel confident without trying too hard.",
  ctaText = "SHOP ALL PRODUCTS",
  ctaLink = "/shop"
}) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll timeline locked through sticky pin
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const words = text.split(" ");
  const totalWords = words.length;

  // All words reveal progressively between 0.05 and 0.65 of the scroll track.
  // From 0.65 to 1.0 (final 35% of scroll), 100% of all words remain fully solid black.
  const revealStart = 0.05;
  const revealEnd = 0.65;
  const step = (revealEnd - revealStart) / totalWords;

  return (
    <section
      ref={containerRef}
      className="relative h-[225vh] bg-[#fbf8f5] w-full border-y border-outline-variant/20"
      aria-label="Brand manifesto"
    >
      {/* Sticky viewport stage locked while scrolling, padded to clear sticky header */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 px-6 sm:px-10 md:px-16 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center my-auto">
          
          {/* Top 3 Diamond Sparkles (Palo Alto Style) */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 text-[#130f12] select-none" aria-hidden="true">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
          </div>

          {/* Reveal Manifesto Statement - scaled so entire paragraph fits with 100% full reveal */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[34px] leading-[1.38] sm:leading-[1.42] md:leading-[1.46] font-sans font-bold tracking-tight text-[#130f12] text-center mb-8 sm:mb-10 max-w-3xl mx-auto">
            {words.map((word, i) => {
              const start = revealStart + i * step;
              const end = start + step;
              return (
                <RevealWord
                  key={i}
                  word={word}
                  progress={scrollYProgress}
                  start={start}
                  end={end}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </h2>

          {/* Bottom Primary CTA Button */}
          {ctaText && (
            <div>
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-xs tracking-[0.18em] uppercase font-bold rounded-lg transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
