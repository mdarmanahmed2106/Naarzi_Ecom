'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import Icon from '@/components/Icon';

const EASE = [0.215, 0.61, 0.355, 1];

const BELIEFS = [
  { title: 'Colour comes first.', body: 'Every collection begins with a palette, not a trend forecast.' },
  { title: 'Design should have a reason.', body: 'Every seam, loop and cuff is considered, not decorative.' },
  { title: "Confidence shouldn't need an occasion.", body: 'Our pieces move from the desk to the evening without asking you to change.' },
  { title: 'Small runs matter.', body: "We design in limited collections — curated, not mass-produced — because expression doesn't scale the way inventory does." },
  { title: 'Clothing should say something true.', body: 'Not a slogan. Something real about the woman wearing it.' },
];

export default function AboutContent() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <main className="flex-1 w-full">
      {/* ── Story hero ── */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-12 md:pt-20 pb-14 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-6">
          <motion.span {...fadeUp(0)} className="font-label-caps text-[10px] text-primary tracking-[0.25em] flex items-center gap-3 font-bold">
            <span className="inline-block w-8 h-[2px] bg-primary" />
            OUR STORY
          </motion.span>

          {/* The h2 pattern from the homepage: lines rise out of a mask, triggered by the heading */}
          <motion.h1
            initial={reduce ? false : 'hidden'}
            animate="visible"
            className="font-display-lg text-[2.25rem] sm:text-5xl xl:text-6xl text-on-surface leading-[1.08] font-bold"
          >
            {['Beauty Where', 'Others Saw Waste'].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.1em]">
                <motion.span
                  className="block"
                  variants={{
                    hidden: { y: '110%' },
                    visible: { y: '0%', transition: { duration: 0.85, ease: EASE, delay: 0.1 + i * 0.12 } },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.div {...fadeUp(0.3)} className="space-y-4 font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed max-w-xl">
            <p>
              As a child, I saw beauty where others saw waste. A broken cup became sculpture. A scrap of cloth became
              possibility. Colour always spoke louder than the object it was sitting on.
            </p>
            <p>
              Years later, that same instinct became NAARZI. Every garment starts the same way — not with a trend, but
              with a colour, a feeling, a sketch that slowly turns into something someone can actually wear.
            </p>
          </motion.div>
        </div>

        <motion.figure
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="lg:col-span-6 relative rounded-[24px] md:rounded-[32px] overflow-hidden aspect-[4/3] lg:aspect-[5/4] bg-surface-container shadow-[0_24px_60px_-30px_rgba(107,34,51,0.45)]"
        >
          <img src="/hero_image.png" alt="Inside the NAARZI studio — colour, sketches and fabric" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <figcaption className="absolute bottom-4 left-5 right-5 text-white font-label-caps text-[10px] tracking-widest font-bold">
            WHERE EVERY COLLECTION BEGINS
          </figcaption>
        </motion.figure>
      </section>

      {/* ── Pull quote ── */}
      <section className="bg-surface-container-low border-y border-outline-variant/30">
        <motion.blockquote
          {...fadeUp(0)}
          className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 text-center"
        >
          <span aria-hidden="true" className="block font-display-lg text-6xl leading-none text-accent-gold mb-2">“</span>
          <p className="font-display-lg italic text-2xl sm:text-3xl md:text-4xl text-primary leading-snug">
            Because fashion should never hide who you are. It should reveal you.
          </p>
        </motion.blockquote>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop py-14 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        {[
          {
            label: 'OUR VISION',
            body: 'A wardrobe where colour is never diluted for mass appeal — where every piece a woman wears reads as unmistakably hers.',
          },
          {
            label: 'OUR MISSION',
            body: 'To design limited, colour-first collections that help women dress like themselves, every day — honest in fabric, considered in cut, without asking anyone to choose between comfort and statement.',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            {...fadeUp(i * 0.12)}
            className="relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-7 md:p-10 shadow-[0_20px_50px_-35px_rgba(107,34,51,0.4)]"
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] font-bold">{card.label}</span>
            <p className="font-headline-sm text-xl md:text-2xl text-on-surface leading-snug mt-4">{card.body}</p>
          </motion.div>
        ))}
      </section>

      {/* ── What we believe ── */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pb-14 md:pb-24">
        <motion.div {...fadeUp(0)} className="max-w-2xl mb-8 md:mb-12">
          <span className="font-label-caps text-[10px] text-primary tracking-[0.25em] flex items-center gap-3 font-bold mb-3">
            <span className="inline-block w-8 h-[2px] bg-primary" />
            WHAT WE BELIEVE
          </span>
          <h2 className="font-display-lg text-[1.75rem] md:text-4xl text-on-surface font-bold leading-tight">
            A design house, <span className="italic font-normal text-primary">not a fast-fashion label.</span>
          </h2>
        </motion.div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {BELIEFS.map((b, i) => (
            <motion.li
              key={b.title}
              {...fadeUp(i * 0.08)}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="font-display-lg text-3xl text-accent-gold leading-none">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-headline-sm text-lg text-on-surface leading-snug">{b.title}</p>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{b.body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ── Closing manifesto ── */}
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pb-16 md:pb-28">
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-primary text-white px-6 py-14 md:px-16 md:py-20 text-center"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-8 h-8 mx-auto mb-6 text-accent-gold">
            <path fill="currentColor" d="M12 0c.6 6.2 1.8 8.4 12 12-10.2 3.6-11.4 5.8-12 12-.6-6.2-1.8-8.4-12-12C10.2 8.4 11.4 6.2 12 0Z" />
          </svg>
          <p className="font-display-lg text-2xl sm:text-3xl md:text-[2.5rem] leading-snug max-w-3xl mx-auto">
            We are the dreamers, the trendsetters, the unapologetic generation — we don&apos;t just follow what&apos;s next,
            we colour it ourselves.
          </p>
          <p className="font-label-caps text-xs tracking-[0.3em] text-white/80 font-bold mt-8">
            NAARZI: OWN THE MOMENT. OWN THE LIGHT.
          </p>
          <Link
            href="/shop"
            className="group mt-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-label-caps text-xs tracking-widest rounded-xl font-bold hover:bg-surface transition-colors"
          >
            SHOP NAARZI
            <Icon name="arrow_forward" size="sm" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
