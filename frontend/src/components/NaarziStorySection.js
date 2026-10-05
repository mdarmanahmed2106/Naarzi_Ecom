'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Icon from '@/components/Icon';

const HERO_IMAGE = {
  src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
  label: 'COLOUR FIRST · 2026',
  alt: 'Naarzi colour-led ready-to-wear',
};

const SECOND_IMAGE = {
  src: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?q=80&w=1000&auto=format&fit=crop',
  label: 'ART FROM THE OVERLOOKED',
  alt: 'Naarzi atelier and thoughtful design',
};

const PILLARS = [
  { num: '01', title: 'Colour First', desc: 'Mood-defining palettes that speak before you do.' },
  { num: '02', title: 'Thoughtful Design', desc: 'Fluid, relaxed cuts crafted for everyday confidence.' },
  { num: '03', title: 'Limited Drops', desc: 'Small, intentional capsules made to be cherished.' },
];

const EASE = [0.215, 0.61, 0.355, 1];

export default function NaarziStorySection() {
  const collageRef = useRef(null);
  const reduce = useReducedMotion();

  // Collage scroll progress: 0 as it enters the bottom of the screen, 1 as it leaves the top
  const { scrollYProgress } = useScroll({ target: collageRef, offset: ['start end', 'end start'] });

  // Layers drift at different speeds for depth
  const mainY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const secondY = useTransform(scrollYProgress, [0, 1], [90, -90]);
  const quoteY = useTransform(scrollYProgress, [0, 1], [50, -70]);
  const starRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <section
      className="relative py-16 md:py-28 max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center overflow-x-clip"
      aria-labelledby="naarzi-story-heading"
    >
      {/* ── Copy ── */}
      <div className="lg:col-span-6 space-y-6">
        <motion.span {...fadeUp(0)} className="font-label-caps text-[10px] text-primary tracking-[0.25em] flex items-center gap-3 font-bold">
          <motion.span
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="inline-block w-8 h-[2px] bg-primary origin-left"
          />
          THE NAARZI STORY
        </motion.span>

        {/* Headline: each line rises out of a mask; "Waste" gets a hand-drawn underline */}
        {/* The h2 itself is observed: the masked lines start out of view, so they can't trigger their own reveal */}
        <motion.h2
          id="naarzi-story-heading"
          initial={reduce ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="font-display-lg text-[2rem] sm:text-4xl md:text-5xl xl:text-6xl text-on-surface leading-[1.1] font-bold"
        >
          {[
            <>“Beauty Where Others</>,
            <>
              Saw{' '}
              <span className="relative inline-block">
                Waste
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="absolute left-0 -bottom-[0.12em] w-full h-[0.3em] overflow-visible"
                >
                  <motion.path
                    d="M3 14 C 40 4, 90 4, 120 10 S 180 16, 197 6"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    variants={{
                      hidden: { pathLength: 0 },
                      visible: { pathLength: 1, transition: { duration: 0.9, ease: 'easeInOut', delay: 0.6 } },
                    }}
                  />
                </svg>
              </span>
              ”
            </>,
          ].map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="block"
                variants={{
                  hidden: { y: '110%' },
                  visible: { y: '0%', transition: { duration: 0.8, ease: EASE, delay: i * 0.12 } },
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <motion.p {...fadeUp(0.25)} className="font-headline-sm text-lg md:text-xl text-primary italic">
          Turning simple fabrics into vibrant stories.
        </motion.p>

        <motion.p {...fadeUp(0.35)} className="font-body-lg text-[15px] md:text-base text-on-surface-variant leading-relaxed max-w-xl">
          Naarzi was born from a singular belief: that art lives in the overlooked. We don’t chase transient
          fashion seasons — we design for pure, unapologetic self-expression. Every garment is colour-led,
          thoughtfully crafted, and cut for effortless confidence. Wear the vibe. Feel the colour.
        </motion.p>

        {/* Pillars: a rose thread draws across (down on phones) and each point lands in turn */}
        <div className="relative pt-4">
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="hidden sm:block absolute top-[calc(1rem+5px)] left-[5px] right-0 h-px bg-primary/40 origin-left"
          />
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="sm:hidden absolute top-[calc(1rem+5px)] bottom-4 left-[5px] w-px bg-primary/40 origin-top"
          />
          <ol className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5">
            {PILLARS.map((p, i) => (
              <motion.li
                key={p.num}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.25 + i * 0.18 }}
                className="relative pl-7 sm:pl-0 sm:pt-7"
              >
                <motion.span
                  aria-hidden="true"
                  initial={reduce ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.3 + i * 0.18 }}
                  className="absolute left-0 top-[5px] sm:top-0 w-[11px] h-[11px] rounded-full bg-primary ring-4 ring-surface"
                />
                <span className="font-label-caps text-xs text-primary font-bold block tracking-wider mb-1">
                  {p.num} · {p.title.toUpperCase()}
                </span>
                <p className="font-body-md text-xs text-on-surface-variant leading-normal">{p.desc}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div {...fadeUp(0.2)} className="pt-2">
          <Link
            href="/shop?tag=new arrival"
            className="group relative inline-flex items-center gap-2 font-label-caps text-xs tracking-widest text-primary pb-2 font-bold"
          >
            EXPLORE THE LAUNCH CAPSULE
            <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-primary origin-left transition-transform duration-500 scale-x-100 group-hover:scale-x-50" />
          </Link>
        </motion.div>
      </div>

      {/* ── Collage ── */}
      <div ref={collageRef} className="lg:col-span-6 relative grid grid-cols-2 gap-3 md:gap-5 items-start">
        {/* Brand-mark sparkle that turns as you scroll */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          style={{ rotate: reduce ? 0 : starRotate }}
          className="absolute -top-6 left-[46%] w-8 h-8 md:w-10 md:h-10 text-accent-gold z-20"
        >
          <path fill="currentColor" d="M12 0c.6 6.2 1.8 8.4 12 12-10.2 3.6-11.4 5.8-12 12-.6-6.2-1.8-8.4-12-12C10.2 8.4 11.4 6.2 12 0Z" />
        </motion.svg>

        {/* Main image */}
        <motion.figure
          style={{ y: reduce ? 0 : mainY }}
          className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md bg-surface-container mt-10 md:mt-16"
        >
          <motion.img
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            initial={reduce ? false : { scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, ease: EASE }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
          <figcaption className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 text-white font-label-caps text-[9px] md:text-[10px] tracking-widest font-bold">
            {HERO_IMAGE.label}
          </figcaption>
        </motion.figure>

        <div className="space-y-3 md:space-y-5">
          <motion.figure
            style={{ y: reduce ? 0 : secondY }}
            className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md bg-surface-container"
          >
            <motion.img
              src={SECOND_IMAGE.src}
              alt={SECOND_IMAGE.alt}
              initial={reduce ? false : { scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: EASE }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <figcaption className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 text-white font-label-caps text-[9px] md:text-[10px] tracking-widest font-bold">
              {SECOND_IMAGE.label}
            </figcaption>
          </motion.figure>

          <motion.blockquote
            style={{ y: reduce ? 0 : quoteY }}
            initial={reduce ? false : { opacity: 0, rotate: -4, scale: 0.92 }}
            whileInView={{ opacity: 1, rotate: -2, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.2 }}
            className="relative bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 md:p-5 text-center shadow-[0_12px_30px_-14px_rgba(107,34,51,0.35)]"
          >
            <span aria-hidden="true" className="absolute -top-3 left-4 font-display-lg text-4xl leading-none text-accent-gold">“</span>
            <p className="font-headline-sm text-[12px] sm:text-sm md:text-base text-primary font-bold italic leading-snug">
              A friend who inspires, not a brand that shouts.
            </p>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
