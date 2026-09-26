'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Word Component for Scroll Text Reveal
 * Matches reference styling: ghosted text (opacity: 0.16) progressively turning solid black (opacity: 1.0)
 */
function RevealWord({ word, progress, start, step, shouldReduceMotion }) {
  const flash = start + step * 0.4;
  const settle = start + step * 0.95;

  // Opacity: Ghost (0.16) -> Solid Contrast (1.0)
  const opacity = useTransform(
    progress,
    [0, Math.max(0, start - 0.01), start, flash, settle],
    [0.16, 0.16, 0.25, 1, 1]
  );

  // Subtle natural lift as active front passes
  const y = useTransform(
    progress,
    [0, Math.max(0, start - 0.01), start, flash, settle],
    [0, 0, -1.5, -3, 0]
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

  // Reveal timeline bounds: 0.06 to 0.88
  const revealStart = 0.06;
  const revealEnd = 0.88;
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
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
          </div>

          {/* Reveal Manifesto Statement - perfectly scaled so entire paragraph is visible */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[34px] leading-[1.38] sm:leading-[1.42] md:leading-[1.46] font-sans font-bold tracking-tight text-[#130f12] text-center mb-8 sm:mb-10 max-w-3xl mx-auto">
            {words.map((word, i) => {
              const start = revealStart + i * step;
              return (
                <RevealWord
                  key={i}
                  word={word}
                  progress={scrollYProgress}
                  start={start}
                  step={step}
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
