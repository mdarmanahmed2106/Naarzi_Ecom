'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const STORIES_DATA = [
  {
    id: 'story-1',
    topTag: 'NEW ARRIVALS',
    title: 'Designed to empower you to express your unique sense of style with confidence.',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'SHOP OUR COLLECTION',
    link: '/shop'
  },
  {
    id: 'story-2',
    topTag: 'LOOKBOOK 2026',
    title: 'Stand out wherever you go. Our latest lookbook has dropped and is ready to shop.',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'VIEW LOOKBOOK',
    link: '/shop?tag=new-arrival'
  },
  {
    id: 'story-3',
    topTag: 'SIGNATURE PIECES',
    title: 'Discover timeless pieces and chic ensembles to elevate your world.',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'SHOP BESTSELLERS',
    link: '/shop?tag=trending'
  },
  {
    id: 'story-4',
    topTag: 'COLOUR FIRST',
    title: 'Contemporary, colour-led ready-to-wear crafted for spontaneous days and inspired moments.',
    img: '/hero_image.png',
    ctaText: 'EXPLORE FULL CAPSULE',
    link: '/shop?category=apparel'
  }
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll timeline across 320vh
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // LEFT SIDE: Synchronized text transitions (no awkward bottom peeking)
  // Story 0
  const text0Opacity = useTransform(scrollYProgress, [0, 0.24, 0.32], [1, 1, 0]);
  const text0Y = useTransform(scrollYProgress, [0, 0.24, 0.32], ['0px', '0px', '-24px']);

  // Story 1
  const text1Opacity = useTransform(scrollYProgress, [0.24, 0.32, 0.57, 0.65], [0, 1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0.24, 0.32, 0.57, 0.65], ['24px', '0px', '0px', '-24px']);

  // Story 2
  const text2Opacity = useTransform(scrollYProgress, [0.57, 0.65, 0.88, 0.94], [0, 1, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.57, 0.65, 0.88, 0.94], ['24px', '0px', '0px', '-24px']);

  // Story 3
  const text3Opacity = useTransform(scrollYProgress, [0.88, 0.94, 1], [0, 1, 1]);
  const text3Y = useTransform(scrollYProgress, [0.88, 0.94, 1], ['24px', '0px', '0px']);

  const textMotions = [
    { opacity: text0Opacity, y: text0Y },
    { opacity: text1Opacity, y: text1Y },
    { opacity: text2Opacity, y: text2Y },
    { opacity: text3Opacity, y: text3Y }
  ];

  // RIGHT SIDE: Upward card wipe transitions (cards start hidden with opacity 0 so they NEVER peek at the bottom)
  // Card 1
  const card1Y = useTransform(scrollYProgress, [0.22, 0.32], ['100%', '0%']);
  const card1Opacity = useTransform(scrollYProgress, [0.22, 0.23, 1], [0, 1, 1]);

  // Card 2
  const card2Y = useTransform(scrollYProgress, [0.55, 0.65], ['100%', '0%']);
  const card2Opacity = useTransform(scrollYProgress, [0.55, 0.56, 1], [0, 1, 1]);

  // Card 3
  const card3Y = useTransform(scrollYProgress, [0.86, 0.94], ['100%', '0%']);
  const card3Opacity = useTransform(scrollYProgress, [0.86, 0.87, 1], [0, 1, 1]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] bg-[#FAF5EE] border-t border-b border-[#e8dfd2]"
      aria-label="Storytelling Lookbook Collection"
    >
      {/* DESKTOP PINNED VIEWPORT (>= 1024px) */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full max-w-[1360px] mx-auto px-10 xl:px-16 items-center justify-between gap-12 xl:gap-20 overflow-hidden">
        
        {/* Left Column: Clean Centered Text Container */}
        <div className="relative w-1/2 h-[380px] flex items-center">
          {STORIES_DATA.map((story, idx) => {
            const motionProps = textMotions[idx];
            return (
              <motion.div
                key={story.id}
                style={{
                  opacity: shouldReduceMotion ? (idx === 0 ? 1 : 0) : motionProps.opacity,
                  y: shouldReduceMotion ? 0 : motionProps.y
                }}
                className="absolute inset-0 flex flex-col justify-center items-start space-y-8 pr-6 xl:pr-10 select-none pointer-events-auto"
              >
                {/* Top Mini Tag */}
                {story.topTag && (
                  <span className="inline-block px-3.5 py-1.5 bg-black text-white text-[10px] font-label-caps tracking-[0.2em] font-bold uppercase rounded-[4px]">
                    {story.topTag}
                  </span>
                )}

                {/* Bold Headline Statement */}
                <h3 className="text-3xl xl:text-[44px] text-[#111111] font-bold leading-[1.16] tracking-tight max-w-xl">
                  {story.title}
                </h3>

                {/* Bottom CTA Button */}
                <div className="pt-2">
                  <Link
                    href={story.link}
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] hover:bg-[#2b2b2b] text-white font-label-caps text-xs tracking-[0.18em] uppercase font-bold rounded-[6px] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    {story.ctaText}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Clean Rounded Image Stage (No bottom peek or overflow) */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-xl border border-black/5 bg-[#eae2d5] select-none">
          {/* Card 0: Base */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={STORIES_DATA[0].img}
              alt={STORIES_DATA[0].title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Card 1: Upward slide (hidden until ready) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card1Y,
              opacity: shouldReduceMotion ? 1 : card1Opacity,
              zIndex: 20
            }}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <img
              src={STORIES_DATA[1].img}
              alt={STORIES_DATA[1].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Card 2: Upward slide (hidden until ready) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card2Y,
              opacity: shouldReduceMotion ? 1 : card2Opacity,
              zIndex: 30
            }}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <img
              src={STORIES_DATA[2].img}
              alt={STORIES_DATA[2].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Card 3: Upward slide (hidden until ready) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card3Y,
              opacity: shouldReduceMotion ? 1 : card3Opacity,
              zIndex: 40
            }}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <img
              src={STORIES_DATA[3].img}
              alt={STORIES_DATA[3].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>

      {/* MOBILE / TABLET FLOW (< 1024px) */}
      <div className="lg:hidden relative h-auto py-16 px-6 sm:px-10 space-y-16 max-w-xl mx-auto">
        {STORIES_DATA.map((story) => (
          <div key={story.id} className="space-y-6">
            {/* Mobile Image */}
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-lg border border-black/5 bg-[#eae2d5]">
              <img
                src={story.img}
                alt={story.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Mobile Text & CTA */}
            <div className="space-y-5">
              {story.topTag && (
                <span className="inline-block px-3 py-1 bg-black text-white text-[9px] font-label-caps tracking-widest font-bold uppercase rounded-[4px]">
                  {story.topTag}
                </span>
              )}
              <h3 className="text-2xl sm:text-3xl text-[#111111] font-bold leading-snug tracking-tight">
                {story.title}
              </h3>
              <div className="pt-1">
                <Link
                  href={story.link}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#111111] hover:bg-[#2b2b2b] text-white font-label-caps text-[11px] tracking-widest uppercase font-bold rounded-[6px]"
                >
                  {story.ctaText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
