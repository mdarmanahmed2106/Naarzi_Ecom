'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.215, 0.61, 0.355, 1];
const SLIDE_MS = 6500;

// The client's campaign photos: wide shots with the model on the right and open wall on the left,
// so the copy sits over the left. pos = desktop crop, mobilePos = the tighter phone crop on the model.
const SLIDES = [
  {
    name: 'Mint Green Suit Set',
    note: 'Launch Capsule',
    img: '/hero/mint-suit-dupatta.jpg',
    pos: '50% 0%',
    mobilePos: '82% 40%',
    alt: 'Model in a mint green suit set with a flowing organza dupatta',
    href: '/products/mint-green-suit-set',
  },
  {
    name: 'Ivory Tunic & Trousers',
    note: 'New Arrival',
    img: '/hero/ivory-tunic-arch.jpg',
    pos: '50% 45%',
    mobilePos: '76% 45%',
    alt: 'Model in an ivory tunic and wide trousers in front of a carved arch',
    href: '/shop?tag=new-arrival',
  },
  {
    name: 'Mint Green Suit Set',
    note: 'Launch Capsule',
    img: '/hero/mint-suit-window.jpg',
    pos: '50% 8%',
    mobilePos: '78% 30%',
    alt: 'Smiling model in a mint green kurta and organza dupatta at a teal window',
    href: '/products/mint-green-suit-set',
  },
  {
    name: 'Ivory Tunic & Trousers',
    note: 'New Arrival',
    img: '/hero/ivory-tunic-chair.jpg',
    pos: '50% 15%',
    mobilePos: '80% 40%',
    alt: 'Model in an ivory striped tunic seated on a carved wooden chair against an orange wall',
    href: '/shop?tag=new-arrival',
  },
];

// Four-point star used for eyebrows in the brand reference
function Sparkle({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M12 0C12 7 17 12 24 12 17 12 12 17 12 24 12 17 7 12 0 12 7 12 12 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

function SlideDots({ active, onSelect }) {
  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Choose a look">
      {SLIDES.map((s, i) => (
        <button
          key={s.img}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show look ${i + 1}: ${s.name}`}
          aria-current={i === active ? 'true' : undefined}
          className="w-11 h-11 inline-flex items-center justify-center cursor-pointer"
        >
          <span
            className={`block h-[3px] rounded-full transition-all duration-400 ${i === active ? 'w-10 bg-primary lg:bg-white' : 'w-5 bg-primary/30 lg:bg-white/45'}`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Homepage hero: a full-width campaign photo with the copy over its open left side, cycling through
 * four looks. On phones the photo crops in on the model and the copy sits below it. Pauses while
 * hovered or focused, and doesn't auto-advance for visitors who prefer reduced motion.
 */
export default function HeroCapsule() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    // Restarts after a manual pick, so a chosen look gets its full time on screen
    const t = setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  const current = SLIDES[active];

  const container = { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } } };
  const child = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Launch capsule looks"
      // Desktop: pinned just below the sticky header so the page content slides up over it, filling the
      // screen. Phones / portrait tablets: photo on top, copy below, sized by content.
      className="relative flex flex-col lg:block lg:sticky lg:top-20 z-0 w-full lg:h-[calc(100dvh-5rem)] overflow-hidden bg-surface"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Photos. Phones / tablets: an arched crop on the model with a gold offset frame, below the
          copy. Desktop: the full photo behind the copy. */}
      <motion.div
        className="order-2 lg:order-none relative w-[min(78vw,360px)] aspect-[25/32] mx-auto max-lg:-translate-x-[7px] mt-2 mb-2 lg:m-0 lg:w-auto lg:aspect-auto lg:absolute lg:inset-0"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div aria-hidden="true" className="lg:hidden absolute left-3.5 top-3.5 -right-3.5 -bottom-3.5 border border-accent-gold rounded-t-full" />
        <div className="absolute inset-0 overflow-hidden rounded-t-full lg:rounded-none bg-surface-container">
        {SLIDES.map((s, i) => (
          <img
            key={s.img}
            src={s.img}
            alt={s.alt}
            aria-hidden={i !== active}
            fetchPriority={i === 0 ? 'high' : undefined}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-(--pos-m) lg:object-(--pos) transition-[opacity,transform] ease-out"
            style={{
              '--pos': s.pos,
              '--pos-m': s.mobilePos,
              opacity: i === active ? 1 : 0,
              transform: !reduce && i === active ? 'scale(1.05)' : 'scale(1)',
              transitionDuration: '0.9s, 7s',
            }}
          />
        ))}
        {/* Darkens the open left side so the copy reads on every photo (desktop) */}
        <div aria-hidden="true" className="hidden lg:block absolute inset-0 bg-linear-to-r from-black/60 via-black/30 via-45% to-transparent to-70%" />
        </div>
      </motion.div>

      {/* Current look + picker under the arch (phones / tablets) */}
      <div className="order-3 lg:hidden flex flex-col items-center gap-1 w-[min(78vw,360px)] mx-auto -translate-x-[7px] mt-7 pb-12 text-center">
        <Link href={current.href} className="max-w-full">
          <span className="block font-label-caps text-[10px] tracking-[0.26em] uppercase text-gold-ink">{current.note}</span>
          <span className="block font-display-lg text-xl leading-tight text-on-surface truncate">{current.name}</span>
        </Link>
        <SlideDots active={active} onSelect={setActive} />
      </div>

      {/* Copy */}
      <div className="order-1 lg:order-none relative w-full lg:h-full max-w-container-max mx-auto px-6 md:px-margin-desktop pt-8 pb-8 lg:py-10 flex lg:items-center">
        <motion.div
          className="w-full lg:max-w-[600px] flex flex-col gap-4 lg:gap-[clamp(1rem,3dvh,1.75rem)]"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.p variants={child} className="flex items-center gap-3 font-label-caps text-[11px] lg:text-xs tracking-[0.3em] uppercase text-gold-ink lg:text-accent-gold">
            <Sparkle className="w-4 h-4 text-accent-gold" />
            Launch Capsule
          </motion.p>
          <motion.h1
            variants={child}
            className="font-display-lg text-[clamp(3.25rem,min(8vw,13dvh),7.75rem)] leading-[0.92] text-on-surface lg:text-white"
          >
            Own the<br />
            <span className="italic text-primary lg:text-on-primary-container">moment.</span>
          </motion.h1>
          <motion.p variants={child} className="max-w-[440px] text-base lg:text-lg leading-relaxed text-on-surface-variant lg:text-white/85">
            Contemporary, colour-led ready-to-wear: simple fabrics turned into vibrant stories.
          </motion.p>
          <motion.div variants={child} className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link
              href="/shop?tag=new-arrival"
              className="inline-flex items-center justify-center min-h-12 lg:min-h-14 px-8 lg:px-10 bg-primary text-on-primary font-label-caps text-xs lg:text-[13px] tracking-[0.2em] uppercase hover:bg-primary-container transition-colors max-sm:w-full"
            >
              Shop the Capsule
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center min-h-11 border-b border-accent-gold text-on-surface lg:text-white font-label-caps text-xs lg:text-[13px] tracking-[0.2em] uppercase hover:text-primary lg:hover:text-accent-gold transition-colors"
            >
              Our Story
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Current look + picker, bottom right over the photo (desktop; on smaller screens it sits under the arch) */}
      <div className="hidden lg:block absolute inset-x-0 bottom-0 pointer-events-none">
        <div aria-hidden="true" className="absolute inset-0 -top-24 bg-linear-to-tl from-black/55 via-black/15 via-30% to-transparent to-55%" />
        <motion.div
          className="relative max-w-container-max mx-auto px-margin-desktop pb-16 flex items-center justify-end gap-6"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: reduce ? 0 : 0.6 }}
        >
          <div className="pointer-events-auto"><SlideDots active={active} onSelect={setActive} /></div>
          <Link href={current.href} className="group min-w-0 text-right pointer-events-auto" aria-live="polite">
            <span className="block font-label-caps text-[11px] tracking-[0.26em] uppercase text-accent-gold">
              0{active + 1} / 0{SLIDES.length} &nbsp;·&nbsp; {current.note}
            </span>
            <span className="block font-display-lg text-2xl leading-tight text-white truncate">
              {current.name}
            </span>
            <span className="block font-label-caps text-[11px] tracking-[0.18em] uppercase text-white/85 mt-1 group-hover:underline underline-offset-4">
              Shop this look →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
