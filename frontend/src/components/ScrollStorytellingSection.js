'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  const textTrackRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop & Large Screens (>= 1024px)
      mm.add('(min-width: 1024px)', () => {
        const cards = gsap.utils.toArray('.story-card');
        const count = cards.length;

        if (count <= 1) return;

        // Card 0 starts in place, Cards 1..N start below viewport
        gsap.set(cards, { yPercent: 120, scale: 1 });
        gsap.set(cards[0], { yPercent: 0, scale: 1 });

        // Left text track starts at position 0
        gsap.set(textTrackRef.current, { yPercent: 0 });

        // Timeline linked to scroll without pin: true to keep React DOM pure
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            invalidateOnRefresh: true
          }
        });

        // Total vertical scroll translation for left track: -(count - 1) * (100 / count) %
        const totalTextShift = -((count - 1) / count) * 100;

        // Animate left text track continuously upward
        tl.to(
          textTrackRef.current,
          {
            yPercent: totalTextShift,
            ease: 'none',
            duration: count - 1
          },
          0
        );

        // Animate each subsequent card upward to overlap the deck in sync
        for (let i = 1; i < count; i++) {
          const startTime = i - 1;
          tl.to(
            cards[i],
            {
              yPercent: 0,
              ease: 'power1.inOut',
              duration: 1
            },
            startTime
          );
        }

        // Buffer pause at the end
        tl.to({}, { duration: 0.3 });
      });

      // Mobile / Compact Layout (< 1024px)
      mm.add('(max-width: 1023px)', () => {
        gsap.set(textTrackRef.current, { yPercent: 0 });
        gsap.set('.story-card', { yPercent: 0, scale: 1 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] lg:h-[320vh] bg-[#FAF5EE] border-t border-b border-[#e8dfd2]"
      aria-label="Storytelling Lookbook Collection"
    >
      {/* DESKTOP PINNED VIEWPORT (>= 1024px) - Continuous synchronized vertical scroll */}
      <div className="hidden lg:flex sticky top-0 h-screen w-full max-w-[1360px] mx-auto px-10 xl:px-16 items-center justify-between gap-12 xl:gap-20 overflow-hidden">
        
        {/* Left Column: Continuously Scrolling Text Viewport Window */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] overflow-hidden flex flex-col justify-start">
          <div
            ref={textTrackRef}
            className="w-full flex flex-col will-change-transform"
            style={{ height: `${STORIES_DATA.length * 100}%` }}
          >
            {STORIES_DATA.map((story) => (
              <div
                key={story.id}
                className="w-full h-[68vh] max-h-[540px] flex flex-col justify-center items-start space-y-8 pr-6 xl:pr-10 select-none"
              >
                {/* Top Mini Tag */}
                {story.topTag && (
                  <span className="inline-block px-3.5 py-1.5 bg-black text-white text-[10px] font-label-caps tracking-[0.2em] font-bold uppercase rounded-[4px]">
                    {story.topTag}
                  </span>
                )}

                {/* Bold Statement Title */}
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
          </div>
        </div>

        {/* Right Column: Rounded Overlapping Image Cards */}
        <div className="relative w-1/2 h-[68vh] max-h-[540px] flex items-center justify-center">
          {STORIES_DATA.map((story, idx) => (
            <div
              key={story.id}
              style={{ zIndex: idx + 10 }}
              className="story-card absolute inset-0 w-full h-full rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-xl border border-black/5 bg-[#eae2d5] select-none will-change-transform"
            >
              <img
                src={story.img}
                alt={story.title}
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
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
