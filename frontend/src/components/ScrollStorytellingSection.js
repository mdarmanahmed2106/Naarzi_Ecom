'use client';

import React from 'react';
import Link from 'next/link';

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
  return (
    <section
      className="relative w-full bg-[#FAF5EE] border-t border-b border-[#e8dfd2]"
      aria-label="Storytelling Lookbook Collection"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 xl:px-16 py-16 md:py-24 space-y-24 md:space-y-36">
        {STORIES_DATA.map((story) => (
          <div
            key={story.id}
            className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 xl:gap-24 min-h-[70vh] md:min-h-[80vh]"
          >
            {/* Left Column: Bold Headline & CTA Button */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-start space-y-7 xl:space-y-8 pr-0 lg:pr-6">
              {story.topTag && (
                <span className="inline-block px-3.5 py-1.5 bg-black text-white text-[10px] font-label-caps tracking-[0.2em] font-bold uppercase rounded-[4px]">
                  {story.topTag}
                </span>
              )}

              <h3 className="text-3xl sm:text-4xl xl:text-[44px] text-[#111111] font-bold leading-[1.16] tracking-tight max-w-xl">
                {story.title}
              </h3>

              <div className="pt-2">
                <Link
                  href={story.link}
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] hover:bg-[#2b2b2b] text-white font-label-caps text-xs tracking-[0.18em] uppercase font-bold rounded-[6px] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  {story.ctaText}
                </Link>
              </div>
            </div>

            {/* Right Column: High-Res Editorial Image Card */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] md:aspect-[1.15/1] rounded-[28px] xl:rounded-[36px] overflow-hidden shadow-xl border border-black/5 bg-[#eae2d5]">
                <img
                  src={story.img}
                  alt={story.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
