'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const STORIES_DATA = [
  {
    id: 'story-1',
    topTag: 'SIGNATURE SETS',
    title: 'Artistic colour-blocks and relaxed tailoring crafted for effortless confidence.',
    img: '/hero_image.png',
    type: 'image',
    ctaText: 'SHOP CO-ORD SETS',
    link: '/shop?tag=new-arrival'
  },
  {
    id: 'story-2',
    topTag: 'COLOUR FIRST · 2026',
    title: 'Turning simple fabrics into vibrant stories with colour-led design that moves with you.',
    video: '/ZAINUL0001.MP4',
    poster: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop',
    type: 'video',
    ctaText: 'EXPLORE THE CAPSULE',
    link: '/shop?tag=trending'
  },
  {
    id: 'story-3',
    topTag: 'LIMITED EDITION',
    title: 'Fluid contemporary cuts meeting timeless Indian artisanal craft for inspired moments.',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    type: 'image',
    ctaText: 'SHOP BESTSELLERS',
    link: '/shop?category=apparel'
  }
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef(null);
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Ensure autoplay video plays reliably across all browsers
  useEffect(() => {
    if (desktopVideoRef.current) {
      desktopVideoRef.current.play().catch(() => {});
    }
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Scroll timeline linked to the sticky stage (3 stories)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Continuous Left-Side Text Track: 0% -> -33.33% -> -66.66%
  const textTrackY = useTransform(
    scrollYProgress,
    [0, 0.48, 0.95],
    ['0%', '-33.333%', '-66.666%']
  );

  // Card 1 (Video) starts below Card 0 with a clear gap (120%), glides up from the bottom and locks/sits at 0%
  const card1Y = useTransform(
    scrollYProgress,
    [0, 0.48, 1],
    ['120%', '0%', '0%']
  );
  const card0Scale = useTransform(
    scrollYProgress,
    [0, 0.48, 0.95],
    [1, 0.96, 0.92]
  );

  // Card 2 starts at 240%, glides to 120% at step 1, then to 0% at step 2, clamping at 0%
  const card2Y = useTransform(
    scrollYProgress,
    [0, 0.48, 0.95, 1],
    ['240%', '120%', '0%', '0%']
  );
  const card1Scale = useTransform(
    scrollYProgress,
    [0, 0.48, 0.95],
    [1, 1, 0.96]
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[280vh] bg-[#FAF5EE] border-t border-b border-[#e8dfd2]"
      aria-label="Naarzi Storytelling Capsule"
    >
      {/* DESKTOP PINNED VIEWPORT (>= 1024px) */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full max-w-[1360px] mx-auto px-10 xl:px-16 items-center justify-between gap-12 xl:gap-20 overflow-hidden">
        
        {/* Left Column: Full-Height Continuous Text Track */}
        <div className="relative w-1/2 h-screen overflow-hidden flex flex-col justify-start">
          <motion.div
            style={{ y: shouldReduceMotion ? 0 : textTrackY }}
            className="w-full flex flex-col will-change-transform"
          >
            {STORIES_DATA.map((story) => (
              <div
                key={story.id}
                className="w-full h-screen flex flex-col justify-center items-start space-y-8 pr-6 xl:pr-10 select-none flex-shrink-0"
              >
                {/* Top Mini Tag in Primary Dusty Rose */}
                {story.topTag && (
                  <span className="inline-block px-3.5 py-1.5 bg-[var(--color-primary)] text-white text-[10px] font-label-caps tracking-[0.2em] font-bold uppercase rounded-[4px] shadow-2xs">
                    {story.topTag}
                  </span>
                )}

                {/* Bold Headline Statement */}
                <h3 className="text-3xl xl:text-[44px] text-[#111111] font-bold leading-[1.16] tracking-tight max-w-xl">
                  {story.title}
                </h3>

                {/* Bottom CTA Button in Primary Dusty Rose */}
                <div className="pt-2">
                  <Link
                    href={story.link}
                    className="inline-flex items-center justify-center px-7 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-xs tracking-[0.18em] uppercase font-bold rounded-[6px] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    {story.ctaText}
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Continuous Stream of Photos/Video with Clean Separation Gap as they Approach */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] flex items-center justify-center overflow-visible">
          {/* Card 0: Base Card (Image) */}
          <motion.div
            style={{ scale: shouldReduceMotion ? 1 : card0Scale, zIndex: 10 }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <img
              src={STORIES_DATA[0].img}
              alt={STORIES_DATA[0].title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>

          {/* Card 1: Glides up from below with clean gap (120%) and locks on top of Card 0 (Video) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card1Y,
              scale: shouldReduceMotion ? 1 : card1Scale,
              zIndex: 20
            }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <video
              ref={desktopVideoRef}
              src={STORIES_DATA[1].video}
              poster={STORIES_DATA[1].poster}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Card 2: Glides up from below with clean gap (240% -> 120% -> 0%) and locks on top of Card 1 (Image) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card2Y,
              zIndex: 30
            }}
            className="absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <img
              src={STORIES_DATA[2].img}
              alt={STORIES_DATA[2].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>

      {/* MOBILE / TABLET FLOW (< 1024px) */}
      <div className="lg:hidden relative h-auto py-16 px-6 sm:px-10 space-y-16 max-w-xl mx-auto">
        {STORIES_DATA.map((story, idx) => (
          <div key={story.id} className="space-y-6">
            {/* Mobile Visual (Image or Video) */}
            <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-black/10 bg-[#eae2d5]">
              {idx === 1 ? (
                <video
                  ref={mobileVideoRef}
                  src={story.video}
                  poster={story.poster}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={story.img}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {/* Mobile Text & CTA */}
            <div className="space-y-5">
              {story.topTag && (
                <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-white text-[9px] font-label-caps tracking-widest font-bold uppercase rounded-[4px]">
                  {story.topTag}
                </span>
              )}
              <h3 className="text-2xl sm:text-3xl text-[#111111] font-bold leading-snug tracking-tight">
                {story.title}
              </h3>
              <div className="pt-1">
                <Link
                  href={story.link}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-[11px] tracking-widest uppercase font-bold rounded-[6px]"
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
