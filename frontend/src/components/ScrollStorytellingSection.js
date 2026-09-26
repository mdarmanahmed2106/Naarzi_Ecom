'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Icon from '@/components/Icon';

const STORIES_DATA = [
  {
    id: 'coord-sets',
    tag: '01 / 04',
    eyebrow: 'SIGNATURE PIECE · ₹5,999',
    title: 'Two-Tone Statement Sets',
    desc: 'Designed with playful contrast notch collars, relaxed modern tailoring, and breathable all-day comfort. Featuring our signature Pink & Yellow and White & Pinky colourblocks.',
    img: '/hero_image.png',
    badge: 'COLOUR FIRST · 2026',
    ctaText: 'SHOP CO-ORD SETS',
    link: '/shop?tag=new-arrival'
  },
  {
    id: 'kurti-sets',
    tag: '02 / 04',
    eyebrow: '9 CURATED DESIGNS · ₹4,999',
    title: 'Artistic Everyday Silhouettes',
    desc: 'A contemporary reimagining of effortless Indian designer ready-to-wear. Fluid cuts meet thoughtful artisanal accents for versatile dressing from creative studio mornings to evening gatherings.',
    img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    badge: 'ARTISANAL SILHOUETTE',
    ctaText: 'SHOP KURTI SETS',
    link: '/shop?category=apparel'
  },
  {
    id: 'colour-first',
    tag: '03 / 04',
    eyebrow: 'LAUNCH CAPSULE · EXPRESSION',
    title: 'Wear Your Colour. Feel the Vibe.',
    desc: 'Intentional palettes crafted to elevate your mood. Turning simple fabrics into vibrant stories with colour-led design that celebrates self-expression. Not fashion. Expression.',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop',
    badge: 'NOT FASHION. EXPRESSION.',
    ctaText: 'EXPLORE FULL CAPSULE',
    link: '/shop'
  },
  {
    id: 'atelier-craft',
    tag: '04 / 04',
    eyebrow: 'LIMITED RUN · CRAFT ATELIER',
    title: 'Art from the Overlooked',
    desc: 'Each piece is cut with intention, honoring timeless craft traditions while embracing contemporary effortless wearability. A friend who inspires, not a brand that shouts.',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    badge: 'TIMELESS LUXURY',
    ctaText: 'VIEW THE ATELIER',
    link: '/shop?tag=trending'
  }
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef(null);
  const textContainerRef = useRef(null);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop & Tablet Pinned Animation (>= 1024px)
      mm.add('(min-width: 1024px)', () => {
        const textBlocks = gsap.utils.toArray('.story-text-block');
        const cards = gsap.utils.toArray('.story-card');
        const count = cards.length;

        if (count <= 1) return;

        // Set initial positions:
        // Text 0 visible, others hidden and shifted down
        gsap.set(textBlocks, { autoAlpha: 0, y: 30 });
        gsap.set(textBlocks[0], { autoAlpha: 1, y: 0 });

        // Card 0 active and in place, Cards 1..N starting below viewport
        gsap.set(cards, { yPercent: 120, scale: 1, transformOrigin: 'center top' });
        gsap.set(cards[0], { yPercent: 0, scale: 1 });

        // Master Scrubbed Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${(count - 0.5) * 120}%`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // Sequence through each subsequent slide (1 -> 2 -> 3...)
        for (let i = 1; i < count; i++) {
          const stepLabel = `step-${i}`;
          tl.addLabel(stepLabel);

          // 1. Crossfade left text
          tl.to(
            textBlocks[i - 1],
            { autoAlpha: 0, y: -25, duration: 0.6, ease: 'power2.inOut' },
            stepLabel
          );
          tl.to(
            textBlocks[i],
            { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' },
            `${stepLabel}+=0.2`
          );

          // 2. Scale down previous cards subtly to create a physical stacked deck feel
          for (let j = 0; j < i; j++) {
            const scaleTarget = 1 - (i - j) * 0.045;
            const yOffset = -(i - j) * 12;
            tl.to(
              cards[j],
              {
                scale: scaleTarget,
                y: yOffset,
                filter: `brightness(${1 - (i - j) * 0.08})`,
                duration: 0.9,
                ease: 'power2.inOut'
              },
              stepLabel
            );
          }

          // 3. Slide next card upward to overlap the deck
          tl.to(
            cards[i],
            {
              yPercent: 0,
              scale: 1,
              duration: 1,
              ease: 'power2.out'
            },
            stepLabel
          );
        }

        // Slight resting pause at the end of the timeline before unpinning
        tl.to({}, { duration: 0.4 });
      });

      // Mobile / Compact Layout (< 1024px)
      mm.add('(max-width: 1023px)', () => {
        // Natural mobile flow: ensure all text blocks and cards are visible and stacked
        gsap.set('.story-text-block', { autoAlpha: 1, y: 0 });
        gsap.set('.story-card', { yPercent: 0, scale: 1, filter: 'none' });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#fdfbf7] border-t border-b border-outline-variant/20 overflow-hidden"
      aria-label="Storytelling Capsule Collection"
    >
      {/* DESKTOP PINNED EXPERIENCE (>= 1024px) */}
      <div className="hidden lg:flex h-screen w-full max-w-container-max mx-auto px-margin-desktop items-center justify-between gap-16 xl:gap-24">
        
        {/* Left Column: Synchronized Story Text Blocks */}
        <div ref={textContainerRef} className="relative w-1/2 min-h-[420px] flex items-center">
          {STORIES_DATA.map((story, idx) => (
            <div
              key={story.id}
              className="story-text-block absolute inset-0 flex flex-col justify-center space-y-6"
            >
              {/* Capsule Tag & Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-primary/10 text-primary font-mono text-xs font-bold tracking-wider">
                  {story.tag}
                </span>
                <span className="font-label-caps text-xs text-primary font-bold tracking-[0.2em] uppercase">
                  {story.eyebrow}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{ fontFamily: 'var(--font-bodoni-moda), var(--font-playfair-display), serif' }}
                className="text-4xl xl:text-5xl text-[#1e191b] font-bold leading-[1.18] tracking-tight"
              >
                {story.title}
              </h3>

              {/* Description */}
              <p className="font-body-lg text-on-surface-variant text-base xl:text-lg leading-relaxed max-w-xl">
                {story.desc}
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  href={story.link}
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-xs tracking-[0.16em] uppercase font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active:scale-95"
                >
                  <span>{story.ctaText}</span>
                  <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1 text-white" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Stacked Overlapping Visual Cards */}
        <div
          ref={cardsContainerRef}
          className="relative w-1/2 h-[72vh] max-h-[640px] flex items-center justify-center"
        >
          {STORIES_DATA.map((story, idx) => (
            <div
              key={story.id}
              style={{ zIndex: idx + 10 }}
              className="story-card absolute inset-0 w-full h-full rounded-[32px] xl:rounded-[40px] overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-high select-none will-change-transform"
            >
              <img
                src={story.img}
                alt={story.title}
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Aesthetic Dark Gradient & Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs">
                <span className="font-label-caps text-[10px] tracking-widest text-[#1e191b] font-bold uppercase">
                  {story.tag}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-label-caps text-[10px] tracking-widest uppercase font-bold">
                  {story.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE / TABLET FLOW (< 1024px) */}
      <div className="lg:hidden py-16 px-6 sm:px-10 space-y-16 max-w-2xl mx-auto">
        {STORIES_DATA.map((story, idx) => (
          <div key={story.id} className="space-y-6">
            {/* Mobile Image Card */}
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30 bg-surface-container-high">
              <img
                src={story.img}
                alt={story.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-white/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                <span className="font-label-caps text-[10px] tracking-widest text-[#1e191b] font-bold">
                  {story.tag}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-label-caps text-[9px] tracking-widest uppercase font-bold">
                  {story.badge}
                </span>
              </div>
            </div>

            {/* Mobile Story Text */}
            <div className="space-y-4">
              <span className="font-label-caps text-[10px] text-primary font-bold tracking-widest block uppercase">
                {story.eyebrow}
              </span>
              <h3
                style={{ fontFamily: 'var(--font-bodoni-moda), var(--font-playfair-display), serif' }}
                className="text-2xl sm:text-3xl text-on-surface font-bold leading-tight"
              >
                {story.title}
              </h3>
              <p className="font-body-md text-on-surface-variant text-sm sm:text-base leading-relaxed">
                {story.desc}
              </p>
              <div className="pt-2">
                <Link
                  href={story.link}
                  className="inline-flex items-center gap-2 font-label-caps text-xs tracking-widest text-primary font-bold uppercase border-b-2 border-primary pb-1.5"
                >
                  <span>{story.ctaText}</span>
                  <Icon name="arrow_forward" size="sm" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
