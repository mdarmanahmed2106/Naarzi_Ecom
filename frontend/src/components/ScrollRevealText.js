'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Icon from '@/components/Icon';

function Word({ word, progress, range, shouldReduceMotion }) {
  const opacity = useTransform(progress, range, [0.15, 1]);

  if (shouldReduceMotion) {
    return <span className="inline-block mr-[0.28em] my-[0.05em] text-[#130f12]">{word}</span>;
  }

  return (
    <span className="relative inline-block mr-[0.28em] my-[0.05em]">
      {/* Ghost background word for layout clarity */}
      <span className="opacity-15 text-[#130f12] select-none pointer-events-none">{word}</span>
      {/* Animated progressive reveal word */}
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-[#130f12] select-text font-medium"
      >
        {word}
      </motion.span>
    </span>
  );
}

export default function ScrollRevealText({
  text = "Born from a love of craftsmanship and modern femininity, our brand exists to create clothing that feels considered, wearable, and quietly bold. Every piece is designed with intention—balancing structure and softness, ease and elegance, so you feel confident without trying too hard.",
  ctaText = "SHOP ALL PRODUCTS",
  ctaLink = "/shop"
}) {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Track scroll through the sticky pinned container (start start -> end end)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const words = text.split(" ");
  const totalWords = words.length;

  // Reveal words progressively across 5% to 85% of sticky scroll distance
  const revealStart = 0.05;
  const revealEnd = 0.85;
  const revealSpan = revealEnd - revealStart;

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] bg-[#f7f2e7] w-full border-y border-outline-variant/20"
    >
      {/* Sticky viewport frame that locks in place while scrolling */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 sm:px-10 md:px-16 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center">
          
          {/* Top 3 Diamond / Sparkle Motif */}
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10 text-primary select-none" aria-hidden="true">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          {/* Reveal Manifesto Text */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-[1.35] sm:leading-[1.4] md:leading-[1.48] font-serif tracking-tight text-[#130f12] text-center mb-10 md:mb-12 max-w-3xl">
            {words.map((word, i) => {
              const start = revealStart + (i / totalWords) * revealSpan;
              const end = Math.min(1, start + 1.5 * (revealSpan / totalWords));
              return (
                <Word
                  key={i}
                  word={word}
                  progress={scrollYProgress}
                  range={[start, end]}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </h2>

          {/* Bottom CTA Button in Primary Color */}
          {ctaText && (
            <div>
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
      </div>
    </section>
  );
}
