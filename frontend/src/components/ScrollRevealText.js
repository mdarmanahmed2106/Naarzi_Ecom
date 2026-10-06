'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * Word Component for Scroll Text Reveal
 * Maps strictly:
 * - progress <= start: opacity 0.15 (ghost preview)
 * - progress from start to end: smooth transition to opacity 1.0 (solid dark)
 * - progress >= end: permanently opacity 1.0 (solid dark)
 */
function RevealWord({ word, progress, start, end, shouldReduceMotion }) {
  const mid = (start + end) / 2;

  // Opacity: Ghost (0.15) -> Solid Contrast (1.0) and stays 1.0 permanently
  const opacity = useTransform(
    progress,
    [0, start, end, 1],
    [0.15, 0.15, 1, 1]
  );

  // Subtle natural word lift on active reading front
  const y = useTransform(
    progress,
    [0, start, mid, end, 1],
    [0, 0, -2, 0, 0]
  );

  if (shouldReduceMotion) {
    return (
      <span className="inline-block mr-[0.22em] my-[0.02em] text-[#130f12] font-bold">
        {word}
      </span>
    );
  }

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block mr-[0.22em] my-[0.02em] font-bold text-[#130f12] will-change-transform"
    >
      {word}
    </motion.span>
  );
}

export default function ScrollRevealText({
  text = "Born from a love of movement and quiet confidence, Naarzi exists to create pieces that feel effortless, not accidental. Every silhouette is designed with intention — balancing ease and elegance, comfort and character, so you feel like yourself, only more so.",
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

  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  const totalWords = words.length || 1;

  // Reveal timeline bounds: 0.05 to 0.65
  const revealStart = 0.05;
  const revealEnd = 0.65;
  const step = (revealEnd - revealStart) / totalWords;

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] bg-[#fbf8f5] w-full"
      aria-label="Brand manifesto"
    >
      {/* Sticky viewport stage locked while scrolling */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-6 sm:px-10 md:px-16 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center my-auto">

          {/* Top 3 Diamond Sparkles (Palo Alto Style) */}
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 text-[#130f12] select-none" aria-hidden="true">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
            </svg>
          </div>

          {/* Reveal Manifesto Statement matching reference image bold typography & line height */}
          <h2 className="font-display-lg font-bold text-2xl sm:text-3xl md:text-[32px] lg:text-[36px] xl:text-[38px] leading-[1.3] sm:leading-[1.32] md:leading-[1.35] tracking-tight text-[#130f12] text-center mb-8 sm:mb-10 max-w-4xl mx-auto">
            {words.map((word, i) => {
              const start = revealStart + i * step;
              const end = start + step;
              return (
                <RevealWord
                  key={`${word}-${i}`}
                  word={word}
                  progress={scrollYProgress}
                  start={start}
                  end={end}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </h2>

          {/* Bottom CTA Button matching reference image rectangular outline */}
          {ctaText && (
            <div>
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent border border-[#130f12] text-[#130f12] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white font-label-caps text-[11px] sm:text-xs tracking-[0.2em] uppercase font-bold rounded transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-95"
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
