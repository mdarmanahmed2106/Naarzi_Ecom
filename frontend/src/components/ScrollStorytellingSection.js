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

  // Scrubbed Scroll timeline across 350vh total scroll track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Continuous Left-Side Text Track Vertical Translation: 0% -> -75%
  const textTrackY = useTransform(
    scrollYProgress,
    [0, 0.3, 0.63, 0.93],
    ['0%', '-25%', '-50%', '-75%']
  );

  // Right-Side Card Overlapping Upward Slides:
  // Card 1 slides up from below to overlap Card 0 during step 1 (0 -> 0.3)
  const card1Y = useTransform(scrollYProgress, [0.03, 0.3], ['100%', '0%']);
  const card0Scale = useTransform(scrollYProgress, [0.03, 0.3], [1, 0.95]);

  // Card 2 slides up to overlap Card 1 during step 2 (0.33 -> 0.63)
  const card2Y = useTransform(scrollYProgress, [0.33, 0.63], ['100%', '0%']);
  const card1Scale = useTransform(scrollYProgress, [0.33, 0.63], [1, 0.95]);

  // Card 3 slides up to overlap Card 2 during step 3 (0.66 -> 0.93)
  const card3Y = useTransform(scrollYProgress, [0.66, 0.93], ['100%', '0%']);
  const card2Scale = useTransform(scrollYProgress, [0.66, 0.93], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[360vh] bg-[#FAF5EE] border-t border-b border-[#e8dfd2]"
      aria-label="Storytelling Lookbook Collection"
    >
      {/* DESKTOP PINNED VIEWPORT (>= 1024px) */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full max-w-[1360px] mx-auto px-10 xl:px-16 items-center justify-between gap-12 xl:gap-20 overflow-hidden">
        
        {/* Left Column: Continuously Scrolling Text Window */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] overflow-hidden flex flex-col justify-start">
          <motion.div
            style={{ y: shouldReduceMotion ? 0 : textTrackY }}
            className="w-full flex flex-col will-change-transform"
            style-height="400%"
          >
            {STORIES_DATA.map((story) => (
              <div
                key={story.id}
                className="w-full h-[68vh] max-h-[540px] flex flex-col justify-center items-start space-y-8 pr-6 xl:pr-10 select-none flex-shrink-0"
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
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Stacked Overlapping Visual Cards with Upward Slide Animation */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] flex items-center justify-center">
          {/* Card 0: Base Card */}
          <motion.div
            style={{ scale: shouldReduceMotion ? 1 : card0Scale, zIndex: 10 }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-xl border border-black/5 bg-[#eae2d5] select-none will-change-transform"
          >
            <img
              src={STORIES_DATA[0].img}
              alt={STORIES_DATA[0].title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>

          {/* Card 1: Slides up over Card 0 */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card1Y,
              scale: shouldReduceMotion ? 1 : card1Scale,
              zIndex: 20
            }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-2xl border border-black/5 bg-[#eae2d5] select-none will-change-transform"
          >
            <img
              src={STORIES_DATA[1].img}
              alt={STORIES_DATA[1].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Card 2: Slides up over Card 1 */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card2Y,
              scale: shouldReduceMotion ? 1 : card2Scale,
              zIndex: 30
            }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-2xl border border-black/5 bg-[#eae2d5] select-none will-change-transform"
          >
            <img
              src={STORIES_DATA[2].img}
              alt={STORIES_DATA[2].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* Card 3: Slides up over Card 2 */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card3Y,
              zIndex: 40
            }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-2xl border border-black/5 bg-[#eae2d5] select-none will-change-transform"
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
