'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Icon from '@/components/Icon';

/**
 * Scroll Text Highlight Word Component
 * Lifts each active word with an accent highlight color (Dusty Rose) before settling
 * back into solid dark text while unread words remain in a ghosted state.
 */
function HighlightWord({ word, progress, start, step, shouldReduceMotion }) {
  const flash = start + step * 0.35;
  const settle = start + step * 0.9;

  // Opacity: Ghost (0.16) -> Active Lift (1.0) -> Settled (1.0)
  const opacity = useTransform(
    progress,
    [0, Math.max(0, start - 0.01), start, flash, settle],
    [0.16, 0.16, 0.25, 1, 1]
  );

  // Y Lift: Resting (0) -> Active Lift (-6px) -> Settle (0)
  const y = useTransform(
    progress,
    [0, Math.max(0, start - 0.01), start, flash, settle],
    [0, 0, -2, -6, 0]
  );

  // Color: Ghost (#130f12) -> Accent Brand Highlight (#8f4d5c) -> Settle (#130f12)
  const color = useTransform(
    progress,
    [0, Math.max(0, start - 0.01), start, flash, settle],
    ['#130f12', '#130f12', '#8f4d5c', '#8f4d5c', '#130f12']
  );

  if (shouldReduceMotion) {
    return <span className="inline-block mr-[0.26em] my-[0.06em] text-[#130f12] font-bold">{word}</span>;
  }

  return (
    <motion.span
      style={{ opacity, y, color }}
      className="inline-block mr-[0.26em] my-[0.06em] font-bold will-change-transform"
    >
      {word}
    </motion.span>
  );
}

/**
 * Live Reading Coordinate & Scrub Track Indicator
 */
function ReadingCoordinate({ progress, totalWords }) {
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    return progress.on('change', (v) => {
      const count = Math.min(totalWords, Math.floor(v * totalWords));
      setCurrentCount(count);
    });
  }, [progress, totalWords]);

  return (
    <div className="w-full max-w-xl flex items-center justify-between gap-4 mt-8 text-xs text-[#130f12]/60 font-label-caps tracking-widest select-none">
      <span className="hidden sm:inline font-bold text-[10px]">READING SEQUENCE</span>
      <div className="flex-1 h-[2px] bg-[#130f12]/15 relative overflow-hidden rounded-full">
        <motion.div
          style={{ scaleX: progress, transformOrigin: 'left center' }}
          className="absolute inset-0 bg-primary rounded-full"
        />
      </div>
      <span className="font-mono text-[11px] font-bold text-[#130f12] min-w-[4rem] text-right">
        {String(currentCount).padStart(2, '0')} / {String(totalWords).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function ScrollRevealText({
  text = "Born from a love of craftsmanship and modern femininity, our brand exists to create clothing that feels considered, wearable, and quietly bold. Every piece is designed with intention—balancing structure and softness, ease and elegance, so you feel confident without trying too hard.",
  ctaText = "SHOP ALL PRODUCTS",
  ctaLink = "/shop"
}) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scrubbed ScrollTrigger timeline across the 225vh reading stage
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const words = text.split(" ");
  const totalWords = words.length;

  // Reveal timeline bounds: 0.05 to 0.88
  const revealStart = 0.05;
  const revealEnd = 0.88;
  const step = (revealEnd - revealStart) / totalWords;

  return (
    <section
      ref={containerRef}
      className="relative h-[225vh] bg-[#f7f2e7] w-full border-y border-outline-variant/20"
      aria-label="Scroll-controlled brand manifesto"
    >
      {/* Sticky reading stage locked in viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-between py-12 md:py-16 px-6 sm:px-10 md:px-16 overflow-hidden">
        
        {/* Stage Meta Header */}
        <div className="flex items-center justify-center gap-2.5 text-primary select-none" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label-caps text-[11px] tracking-[0.28em] text-[#130f12]/75 uppercase font-bold">
            SCROLL TO READ
          </span>
        </div>

        {/* Manifesto Highlight Reading Block */}
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center my-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-[1.35] sm:leading-[1.4] md:leading-[1.42] font-sans tracking-tight text-[#130f12] text-center max-w-3xl">
            {words.map((word, i) => {
              const start = revealStart + i * step;
              return (
                <HighlightWord
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

          {/* Reading Coordinate Track & Counter */}
          <ReadingCoordinate progress={scrollYProgress} totalWords={totalWords} />

          {/* Primary CTA Button */}
          {ctaText && (
            <div className="mt-8">
              <Link
                href={ctaLink}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-xs tracking-widest uppercase font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active:scale-95"
              >
                <span>{ctaText}</span>
                <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Bottom spacer for balanced grid layout */}
        <div className="h-4" aria-hidden="true" />
      </div>
    </section>
  );
}
