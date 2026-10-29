'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// The three clips live on Cloudinary (cloud ogatxfhx) and are converted on delivery: 1280px wide,
// auto quality, H.264 so every browser plays them (the originals are iPhone HEVC), audio stripped.
const CLD = 'https://res.cloudinary.com/ogatxfhx/video/upload';
const clip = (id) => `${CLD}/q_auto,w_1280,ac_none,vc_h264/${id}.mp4`;
// First frame of the same clip, shown while it loads
const still = (id) => `${CLD}/so_0,w_1280,q_auto/${id}.jpg`;

const STORIES_DATA = [
  {
    id: 'story-1',
    topTag: '01 · The Design',
    title: 'It starts with intention.',
    body: 'Every silhouette begins with an idea. Measured, considered, and shaped with purpose, each detail sets the foundation for something distinctly yours.',
    mood: 'Thoughtful. Precise. Intentional.',
    video: clip('v1793273879/IMG_5682'),
    poster: still('v1793273879/IMG_5682'),
    ctaText: 'OUR STORY',
    link: '/about'
  },
  {
    id: 'story-2',
    topTag: '02 · The Craft',
    title: 'Made with a closer look.',
    body: 'From every stitch to every hand-finished detail, craftsmanship brings the design to life. It’s the little things that make a piece feel different.',
    mood: 'Artful. Detailed. Considered.',
    video: clip('v1793273876/IMG_5681'),
    poster: still('v1793273876/IMG_5681'),
    ctaText: 'SHOP NEW ARRIVALS',
    link: '/shop?tag=new-arrival'
  },
  {
    id: 'story-3',
    topTag: '03 · The Collection',
    title: 'Your next favourite, in the making.',
    body: 'Distinctive prints, expressive colours, and considered silhouettes. Pieces designed to find their place in your wardrobe, and feel entirely your own.',
    mood: 'Expressive. Confident. Individual.',
    video: clip('v1793273878/IMG_5684'),
    poster: still('v1793273878/IMG_5684'),
    ctaText: 'SHOP THE COLLECTION',
    link: '/shop'
  }
];

export default function ScrollStorytellingSection() {
  const containerRef = useRef(null);
  const videosRef = useRef(null);
  const mobileDeckRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll progress through the mobile card deck
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileDeckRef,
    offset: ['start start', 'end end']
  });

  // Ensure the muted autoplay clips start in every browser
  useEffect(() => {
    videosRef.current?.querySelectorAll('video').forEach((v) => v.play().catch(() => { }));
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
      ref={videosRef}
      className="relative w-full bg-[#fbf8f5] border-b border-outline-variant/20"
      aria-labelledby="story-heading"
    >
      <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 pb-4 lg:pb-0 text-center">
        <h2 id="story-heading" className="font-display-lg text-[2rem] md:text-5xl leading-[1.1] text-on-surface">
          Behind every piece, a point of view.
        </h2>
        <p className="mt-4 md:mt-5 text-base md:text-lg leading-relaxed text-on-surface-variant max-w-xl mx-auto">
          Every detail has a purpose. Every piece has a personality. Discover the thought and craft behind NAARZI.
        </p>
      </div>

      <div ref={containerRef} className="relative h-auto lg:h-[280vh]">
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
                <h3 className="font-display-lg text-3xl xl:text-[44px] text-[#111111] font-bold leading-[1.16] tracking-tight max-w-xl">
                  {story.title}
                </h3>
                <p className="-mt-2 text-base xl:text-lg leading-relaxed text-on-surface-variant max-w-md">
                  {story.body}
                </p>
                <p className="font-label-caps text-[11px] tracking-[0.24em] uppercase text-gold-ink">
                  {story.mood}
                </p>

                {/* Bottom CTA Button in Primary Dusty Rose */}
                <div className="pt-2">
                  <Link
                    href={story.link}
                    className="inline-flex items-center justify-center min-h-11 px-7 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-xs tracking-[0.18em] uppercase font-bold rounded-[6px] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
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
            className="absolute inset-0 w-full h-full rounded-[3px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <video
              src={STORIES_DATA[0].video}
              poster={STORIES_DATA[0].poster}
              aria-label={STORIES_DATA[0].title}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Card 1: Glides up from below with clean gap (120%) and locks on top of Card 0 (Video) */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : card1Y,
              scale: shouldReduceMotion ? 1 : card1Scale,
              zIndex: 20
            }}
            className="absolute inset-0 w-full h-full rounded-[3px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <video
              src={STORIES_DATA[1].video}
              poster={STORIES_DATA[1].poster}
              aria-label={STORIES_DATA[1].title}
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
            className="absolute inset-0 w-full h-full rounded-[3px] overflow-hidden border border-black/10 bg-[#eae2d5] select-none will-change-transform"
          >
            <video
              src={STORIES_DATA[2].video}
              poster={STORIES_DATA[2].poster}
              aria-label={STORIES_DATA[2].title}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* MOBILE / TABLET FLOW (< 1024px): sticky card deck: each card pins under the
          header and the next one slides up over it while the one behind shrinks back */}
      <div
        ref={mobileDeckRef}
        className="lg:hidden relative py-12 px-4 sm:px-10 max-w-xl mx-auto"
      >
        {STORIES_DATA.map((story, idx) => (
          <React.Fragment key={story.id}>
            <MobileStoryCard
              story={story}
              index={idx}
              total={STORIES_DATA.length}
              progress={mobileProgress}
              reduceMotion={shouldReduceMotion}
            />
            {/* The scroll gap between cards is its own element, not a margin on the card: a sticky
                card lets go when its box (margin included) reaches the end of the deck, so cards
                with a margin would unpin early and slide out above the last card */}
            {idx < STORIES_DATA.length - 1 && <div aria-hidden="true" className="h-[18vh]" />}
          </React.Fragment>
        ))}
        {/* Hold so the last card pins and fully covers the deck before the section scrolls away */}
        <div aria-hidden="true" className="h-[30vh]" />
      </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 md:pb-24 pt-4 text-center">
        <p className="font-display-lg italic text-[1.75rem] md:text-4xl leading-[1.2] text-primary">
          Not just what you wear. How you express yourself.
        </p>
        <p className="mt-4 font-label-caps text-[11px] md:text-xs tracking-[0.3em] uppercase text-gold-ink">
          NAARZI · Own the Moment
        </p>
      </div>
    </section>
  );
}

function MobileStoryCard({ story, index, total, progress, reduceMotion }) {
  const isLast = index === total - 1;

  // A card stays full size while it's on top, then shrinks only while the next card slides over it
  const coverStart = index / (total - 1);
  const coverEnd = Math.min(1, (index + 1) / (total - 1));
  const scale = useTransform(progress, [coverStart, coverEnd], [1, isLast ? 1 : 0.9]);
  const dim = useTransform(progress, [coverStart, coverEnd], [0, isLast ? 0 : 0.35]);

  return (
    <div
      className="sticky"
      // Every card pins at the same spot under the 80px header so the next one fully covers it
      style={{ top: '5.5rem' }}
    >
      <motion.div
        style={{ scale: reduceMotion ? 1 : scale, transformOrigin: 'center center' }}
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        className="relative bg-[#fbf8f5] rounded-[3px] border border-black/10 shadow-[0_-10px_30px_-12px_rgba(30,25,27,0.18)] overflow-hidden will-change-transform"
      >
        {/* Visual (Image or Video) */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#eae2d5]">
          <video
            src={story.video}
            poster={story.poster}
            aria-label={story.title}
            autoPlay
            loop
            muted
            playsInline
            preload={index === 0 ? 'auto' : 'metadata'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text & CTA: fixed min-height keeps every card the same size so none peeks out behind another */}
        <div className="p-5 space-y-3 min-h-[22rem] sm:min-h-[20rem]">
          {story.topTag && (
            <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-white text-[9px] font-label-caps tracking-widest font-bold uppercase rounded-[4px]">
              {story.topTag}
            </span>
          )}
          <h3 className="font-display-lg text-[1.5rem] sm:text-3xl text-[#111111] font-bold leading-snug tracking-tight">
            {story.title}
          </h3>
          <p className="text-[15px] leading-relaxed text-on-surface-variant">{story.body}</p>
          <p className="font-label-caps text-[10px] tracking-[0.22em] uppercase text-gold-ink">{story.mood}</p>
          <div className="pt-1">
            <Link
              href={story.link}
              className="inline-flex items-center justify-center min-h-11 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-label-caps text-[11px] tracking-widest uppercase font-bold rounded-[6px] active:scale-95 transition-transform"
            >
              {story.ctaText}
            </Link>
          </div>
        </div>

        {/* Dims the card as it recedes behind the next one */}
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: dim }}
            className="absolute inset-0 bg-[#1e191b] pointer-events-none"
          />
        )}
      </motion.div>
    </div>
  );
}
