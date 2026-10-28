'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.215, 0.61, 0.355, 1];
const SLIDE_MS = 6500;

// The three launch-capsule looks from the client's homepage reference. Each slide tints the hero
// background (from the theme colours). The looks aren't store products yet, so they link to new arrivals.
const SLIDES = [
  {
    name: 'Floral Co-ord Set',
    note: 'Launch Capsule',
    bg: 'var(--color-surface)',
    img: '/hero/floral-co-ord-set.jpg',
    pos: '50% 30%',
    alt: 'Model in a cream and gold floral co-ord set on sunlit steps',
    href: '/shop?tag=new-arrival',
  },
  {
    name: 'Crimson Ruffle-Sleeve Kaftan',
    note: 'New Arrival',
    bg: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-surface))',
    img: '/hero/crimson-ruffle-sleeve-kaftan.jpg',
    pos: '50% 35%',
    alt: 'Model in a crimson kaftan with tiered ruffle sleeves against a blue sky',
    href: '/shop?tag=new-arrival',
  },
  {
    name: 'Pearl-Cuff Tunic Set',
    note: 'Trending',
    bg: 'color-mix(in srgb, var(--color-accent-gold) 14%, var(--color-surface))',
    img: '/hero/pearl-cuff-tunic-set.jpg',
    pos: '50% 25%',
    alt: 'Model in an ivory tunic with pearl-button cuffs in dappled shade',
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
    <div className="flex items-center gap-1" role="group" aria-label="Choose a look">
      {SLIDES.map((s, i) => (
        <button
          key={s.name}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show look ${i + 1}: ${s.name}`}
          aria-current={i === active ? 'true' : undefined}
          className="w-11 h-11 inline-flex items-center justify-center cursor-pointer"
        >
          <span
            className={`block h-[3px] rounded-full transition-all duration-400 ${i === active ? 'w-10 bg-primary' : 'w-5 bg-primary/30'}`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Homepage hero from the brand reference: copy on the left, an arched photo with a gold offset
 * frame on the right, cycling through three looks. Pauses while hovered or focused, and doesn't
 * auto-advance for visitors who prefer reduced motion.
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
      // Desktop: pinned just below the sticky header so the page content slides up over it; the photo and heading
      // scale with screen height so it fits under the promo bars on load. Phones / portrait tablets: a normal section
      // sized by its content, so short screens and landscape never squeeze the photo away.
      className="relative lg:sticky lg:top-20 z-0 w-full lg:h-[calc(100dvh-5rem)] overflow-hidden transition-colors duration-900 ease-out"
      style={{ backgroundColor: current.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="lg:h-full max-w-container-max mx-auto px-6 md:px-margin-desktop pt-8 pb-16 lg:py-10 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">
        {/* Copy */}
        <motion.div
          className="lg:flex-1 lg:max-w-[640px] flex flex-col gap-4 lg:gap-[clamp(1rem,3dvh,1.75rem)] shrink-0"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.p variants={child} className="flex items-center gap-3 font-label-caps text-[11px] lg:text-xs tracking-[0.3em] uppercase text-gold-ink">
            <Sparkle className="w-4 h-4 text-accent-gold" />
            Launch Capsule
          </motion.p>
          <motion.h1
            variants={child}
            className="font-display-lg text-[clamp(3.25rem,min(8vw,13dvh),7.75rem)] leading-[0.92] text-on-surface"
          >
            Own the<br />
            <span className="italic text-primary">moment.</span>
          </motion.h1>
          <motion.p variants={child} className="max-w-[460px] text-base lg:text-lg leading-relaxed text-on-surface-variant">
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
              className="hidden sm:inline-flex items-center min-h-11 border-b border-accent-gold text-on-surface font-label-caps text-xs lg:text-[13px] tracking-[0.2em] uppercase hover:text-primary transition-colors"
            >
              Our Story
            </Link>
          </motion.div>
          {/* Look indicator (desktop; on small screens it sits under the photo) */}
          <motion.div variants={child} className="hidden lg:flex items-center gap-5 mt-2">
            <SlideDots active={active} onSelect={setActive} />
            <p className="text-sm text-on-surface-variant" aria-live="polite">
              <span className="text-primary tracking-[0.16em]">0{active + 1} / 0{SLIDES.length}</span>
              <span aria-hidden="true"> &nbsp;·&nbsp; </span>
              {current.name}
            </p>
          </motion.div>
        </motion.div>

        {/* Arched photo */}
        <motion.div
          className="lg:flex-1 lg:min-h-0 flex flex-col lg:items-center lg:justify-center"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.25 }}
        >
          <div className="relative w-[min(78vw,360px)] lg:w-auto lg:h-[min(640px,calc(100dvh-18rem))] aspect-[25/32] mx-auto lg:mx-0">
            {/* Gold offset frame */}
            <div aria-hidden="true" className="absolute left-3.5 top-3.5 -right-3.5 -bottom-3.5 lg:left-[22px] lg:top-[22px] lg:-right-[22px] lg:-bottom-[22px] border border-accent-gold rounded-t-full" />
            <div className="absolute inset-0 rounded-t-full overflow-hidden bg-surface-container">
              {SLIDES.map((s, i) => (
                <img
                  key={s.img}
                  src={s.img}
                  alt={s.alt}
                  aria-hidden={i !== active}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-[opacity,transform] ease-out"
                  style={{
                    objectPosition: s.pos,
                    opacity: i === active ? 1 : 0,
                    transform: !reduce && i === active ? 'scale(1.06)' : 'scale(1)',
                    transitionDuration: '0.9s, 7s',
                  }}
                />
              ))}
            </div>
            {/* Floating "shop this look" card (desktop) */}
            <Link
              href={current.href}
              className="hidden lg:flex absolute -left-9 bottom-14 flex-col gap-1 bg-surface px-6 py-[18px] shadow-[0_18px_40px_rgba(143,77,92,0.16)] max-w-60 text-on-surface hover:text-primary transition-colors"
            >
              <span className="font-label-caps text-[11px] tracking-[0.26em] uppercase text-gold-ink">{current.note}</span>
              <span className="font-display-lg text-2xl leading-[1.1]">{current.name}</span>
              <span className="font-label-caps text-xs tracking-[0.18em] uppercase text-primary mt-1.5">Shop this look →</span>
            </Link>
          </div>

          {/* Look caption + indicator (small screens) */}
          <div className="lg:hidden flex items-end justify-between gap-4 mt-6 shrink-0">
            <Link href={current.href} className="min-w-0">
              <span className="block font-label-caps text-[10px] tracking-[0.26em] uppercase text-gold-ink">{current.note}</span>
              <span className="block font-display-lg text-xl leading-tight text-on-surface truncate">{current.name}</span>
            </Link>
            <SlideDots active={active} onSelect={setActive} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
