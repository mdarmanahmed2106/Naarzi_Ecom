'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.215, 0.61, 0.355, 1];

/**
 * Launch-capsule band from the brand reference: an arched two-photo collage beside the brand
 * quote, on a full-width primary-colour band. Sits after the homepage product section.
 */
export default function CapsuleBand() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section aria-labelledby="capsule-quote" className="w-full bg-primary text-on-primary overflow-hidden">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-16 md:py-28 flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20">
        {/* Collage: tall arched photo with a smaller one overlapping its lower right */}
        <motion.div {...rise()} className="relative w-full lg:flex-1 max-w-[600px] mx-auto lg:mx-0 aspect-[15/16]">
          <img
            src="/capsule/crimson-kaftan-wall.jpg"
            alt="Model leaning on a white wall in a crimson kaftan"
            loading="lazy"
            className="absolute left-0 top-0 w-[66%] h-[87.5%] object-cover rounded-t-full"
          />
          <img
            src="/capsule/crimson-kaftan-ledge.jpg"
            alt="Crimson tiered ruffle sleeves resting on a white ledge"
            loading="lazy"
            className="absolute right-0 bottom-0 w-[46%] h-[53%] object-cover object-[30%_40%] border-[6px] md:border-8 border-primary"
          />
        </motion.div>

        {/* Quote */}
        <div className="lg:flex-1 max-w-[560px] flex flex-col gap-6 md:gap-7">
          <motion.p {...rise(0.1)} className="font-label-caps text-[11px] md:text-xs tracking-[0.3em] uppercase text-on-primary-container">
            Launch Capsule
          </motion.p>
          <motion.blockquote
            {...rise(0.2)}
            id="capsule-quote"
            className="font-display-lg italic text-[clamp(2.1rem,4vw,3.5rem)] leading-[1.12] text-on-primary"
          >
            “Because fashion should never hide who you are. It should reveal you.”
          </motion.blockquote>
          <motion.div {...rise(0.3)} aria-hidden="true" className="flex items-center gap-3.5">
            <span className="block w-14 h-px bg-accent-gold" />
            <span className="block w-1.5 h-1.5 bg-accent-gold rotate-45" />
            <span className="block w-14 h-px bg-accent-gold" />
          </motion.div>
          <motion.p {...rise(0.35)} className="text-base md:text-[17px] leading-[1.75] text-on-primary/85">
            Colour first, always. Flowing silhouettes in crimson, ivory and midnight — made to be worn in the moment, not saved for later.
          </motion.p>
          <motion.div {...rise(0.45)}>
            <Link
              href="/shop?tag=new-arrival"
              className="inline-flex items-center justify-center min-h-12 md:min-h-14 px-8 md:px-10 bg-surface text-primary font-label-caps text-xs md:text-[13px] tracking-[0.2em] uppercase hover:bg-on-primary-container transition-colors max-sm:w-full"
            >
              Explore the Capsule
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
