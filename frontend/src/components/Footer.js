'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-container text-surface-container-lowest pt-20 md:pt-[120px] pb-6 mt-auto w-full">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        <div className="grid grid-cols-12 gap-gutter mb-16 md:mb-24">
          
          {/* Brand Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6 mb-10 lg:mb-0">
            <div className="mb-8">
              <Link href="/">
                <span className="font-display-lg text-2xl md:text-3xl tracking-widest text-surface font-bold">
                  NAARZI
                </span>
              </Link>
            </div>
            <p className="font-body-md text-surface-container-lowest/80 text-sm max-w-xs leading-relaxed">
              A curation of effortless elegance and sun-drenched coastal aesthetics for the modern discerning individual.
            </p>
          </div>

          {/* Column 2: FAQ */}
          <div className="col-span-6 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              FAQ
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Shipping
              </Link>
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Returns
              </Link>
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Sizing
              </Link>
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Column 3: Company */}
          <div className="col-span-6 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              COMPANY
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Our Story
              </Link>
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Careers
              </Link>
              <Link href="#" className="font-body-md text-surface-container-lowest/70 hover:text-surface transition-colors">
                Sustainability
              </Link>
            </div>
          </div>

          {/* Column 4: Find The Stitch */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 mt-10 lg:mt-0">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              FIND THE STITCH
            </h4>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex border-b border-surface/20 py-2">
              <input 
                className="bg-transparent border-none outline-none flex-1 text-surface-container-lowest placeholder:text-surface-container-lowest/40 text-sm" 
                placeholder="Your email address" 
                type="email"
                required
              />
              <button type="submit" className="font-label-caps text-xs text-surface hover:opacity-85 transition-opacity tracking-wider uppercase font-bold cursor-pointer">
                JOIN
              </button>
            </form>

            <div className="flex gap-6 mt-2">
              <span className="material-symbols-outlined text-surface opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                public
              </span>
              <span className="material-symbols-outlined text-surface opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                share
              </span>
              <span className="material-symbols-outlined text-surface opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                camera_alt
              </span>
            </div>
          </div>

        </div>

        {/* Large Outlined NAARZI text */}
        <div className="relative mb-12 flex justify-center items-center overflow-hidden h-32 md:h-64 select-none">
          <span 
            className="font-display-lg text-[120px] md:text-[240px] leading-none text-transparent pointer-events-none opacity-20"
            style={{
              WebkitTextStroke: '1px rgba(255,217,221,0.2)',
            }}
          >
            NAARZI
          </span>
        </div>

        {/* Bottom footer links & copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-surface/10">
          <div className="flex gap-6 text-[10px] font-label-caps opacity-60">
            <Link href="#" className="hover:opacity-100 transition-opacity text-surface">
              T&Cs
            </Link>
            <Link href="#" className="hover:opacity-100 transition-opacity text-surface">
              PRIVACY POLICY
            </Link>
            <Link href="#" className="hover:opacity-100 transition-opacity text-surface">
              SITEMAP
            </Link>
            <Link href="#" className="hover:opacity-100 transition-opacity text-surface text-nowrap">
              PRESS
            </Link>
          </div>
          <p className="font-label-sm text-xs text-surface opacity-60">
            © {new Date().getFullYear()} Naarzi. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

