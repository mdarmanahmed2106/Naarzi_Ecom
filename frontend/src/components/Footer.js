'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';

const HELP_LINKS = [
  { label: 'Shipping & Delivery', href: '/faq' },
  { label: 'Returns & Exchanges', href: '/faq' },
  { label: 'Size & Fit Guide', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
];

const COMPANY_LINKS = [
  { label: 'Our Story', href: '/about' },
  { label: 'Launch Capsule', href: '/shop?tag=new-arrival' },
  { label: 'Craft & Materials', href: '/about' },
  { label: 'My Account', href: '/account' },
];

const SOCIALS = [
  { label: 'Naarzi Instagram', href: 'https://www.instagram.com/naarzi.official/', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
];

// Simplified marks in each network's own colours, shown beside its name. Visa's mark is its name,
// so it shows the wordmark alone; RuPay's arrow sits after the name, as in its logo.
const PAYMENT_METHODS = [
  {
    name: 'UPI',
    logo: (
      <svg viewBox="0 0 20 16" className="h-3.5 w-auto" aria-hidden="true">
        <path d="M4 1l7 7-7 7z" fill="#097939" />
        <path d="M9 1l7 7-7 7z" fill="#ED752E" />
      </svg>
    ),
  },
  {
    name: 'Visa',
    wordmark: true,
    logo: (
      <svg viewBox="0 0 34 12" className="h-3 w-auto" aria-hidden="true">
        <text x="0" y="10.5" fill="#1A1F71" fontSize="12.5" fontWeight="800" fontStyle="italic" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.3">VISA</text>
      </svg>
    ),
  },
  {
    name: 'Mastercard',
    logo: (
      <svg viewBox="0 0 26 16" className="h-3.5 w-auto" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#EB001B" />
        <circle cx="18" cy="8" r="8" fill="#F79E1B" />
        <path d="M13 1.8a8 8 0 0 1 0 12.4a8 8 0 0 1 0-12.4z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    name: 'RuPay',
    logoAfter: true,
    logo: (
      <svg viewBox="0 0 14 16" className="h-3.5 w-auto" aria-hidden="true">
        <path d="M2 1l7 7-7 7z" fill="#F58220" />
        <path d="M6 3.5l4.5 4.5L6 12.5z" fill="#00A651" />
      </svg>
    ),
  },
  {
    name: 'Netbanking',
    logo: (
      <svg viewBox="0 0 24 24" className="h-3.5 w-auto" fill="currentColor" aria-hidden="true">
        <path d="M12 2 2 7v2h20V7L12 2zM4 11v7h3v-7H4zm6.5 0v7h3v-7h-3zM17 11v7h3v-7h-3zM2 20v2h20v-2H2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 6000);
    }
  };

  // One screen tall (minus the 80px header); the wordmark absorbs whatever space is left
  return (
    <footer className="bg-primary-container text-surface w-full mt-auto">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-6 md:pt-12 pb-4 md:pb-5 flex flex-col gap-5 md:gap-8 min-h-[max(32rem,calc(100svh-5rem))]">

        {/* ── Top row: about · help · company · newsletter ── */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-5 md:gap-y-7 lg:gap-10">
          <div className="col-span-2 lg:col-span-4 space-y-1.5 md:space-y-3">
            <p className="font-body-lg text-sm md:text-lg leading-relaxed text-surface/90 max-w-sm">
              Contemporary, colour-led ready-to-wear, turning simple fabrics into vibrant stories. Not fashion. Expression.
            </p>
            <p className="text-xs text-surface/70">
              <a href="mailto:support@naarzi.com" className="inline-flex items-center min-h-9 md:min-h-0 underline underline-offset-2 hover:text-surface transition-colors">support@naarzi.com</a>
              {' '}· Mon – Sat, 10am – 7pm IST
            </p>
          </div>

          <nav aria-label="Help" className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase mb-2 md:mb-4">Help</h4>
            <ul className="md:space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex items-center min-h-9 md:min-h-0 text-sm md:text-[15px] text-surface/80 hover:text-surface transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2 lg:col-start-8">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase mb-2 md:mb-4">Company</h4>
            <ul className="md:space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="inline-flex items-center min-h-9 md:min-h-0 text-sm md:text-[15px] text-surface/80 hover:text-surface transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-3 lg:col-start-10">
            <h4 className="font-display-lg text-lg md:text-2xl font-bold leading-tight uppercase tracking-wide">
              Be first to the next drop.
            </h4>
            <p className="hidden sm:block text-sm text-surface/80 leading-relaxed mt-2">
              Join for capsule drops, private previews, and 10% off your first order.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="mt-3 md:mt-4 flex items-center border border-surface/50 focus-within:border-surface rounded-xl pl-4 pr-1.5 py-1.5 transition-colors"
            >
              <input
                className="bg-transparent outline-none flex-1 min-w-0 text-surface placeholder:text-surface/55 text-sm md:text-base py-1.5"
                placeholder="Your email"
                aria-label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribed}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-surface hover:bg-surface/15 transition-colors cursor-pointer flex-none"
              >
                <Icon name={isSubscribed ? 'check' : 'arrow_forward'} size="md" className={isSubscribed ? 'text-green-300' : ''} />
              </button>
            </form>
            {/* Only takes up space once subscribed, so the footer stays one screen tall */}
            <p aria-live="polite" className="text-xs text-green-200 font-medium empty:hidden mt-2">
              {isSubscribed ? 'Welcome to Naarzi! You are on the private list.' : ''}
            </p>
          </div>
        </div>

        {/* ── Outlined wordmark, full container width ── */}
        <div className="relative flex-1 min-h-[3.5rem]">
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 205"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
        >
          <text
            x="500"
            y="196"
            textAnchor="middle"
            textLength="996"
            lengthAdjust="spacingAndGlyphs"
            className="font-display-lg"
            style={{ fontSize: 268, fontWeight: 700 }}
            fill="none"
            stroke="rgba(255, 219, 226, 0.85)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          >
            NAARZI
          </text>
        </svg>
        </div>

        {/* ── Bottom row: socials · legal · payments ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 items-center gap-3 lg:gap-6">
          <div className="flex items-center gap-3 lg:justify-self-start">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-11 h-11 rounded-full bg-surface/10 hover:bg-surface/25 flex items-center justify-center text-surface transition-colors"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>

          <div className="text-center space-y-1 lg:space-y-1.5 order-last lg:order-none">
            <div className="flex flex-wrap justify-center gap-x-2 text-[11px] font-label-caps tracking-wide text-surface/75">
              <Link href="/terms" className="inline-flex items-center min-h-9 px-1.5 hover:text-surface transition-colors">Terms</Link>
              <Link href="/privacy" className="inline-flex items-center min-h-9 px-1.5 hover:text-surface transition-colors">Privacy</Link>
              <Link href="/faq" className="inline-flex items-center min-h-9 px-1.5 hover:text-surface transition-colors">Shipping &amp; Returns</Link>
              <Link href="/contact" className="inline-flex items-center min-h-9 px-1.5 hover:text-surface transition-colors">Help</Link>
            </div>
            <p className="text-xs text-surface/70">© {new Date().getFullYear()} Naarzi. All rights reserved.</p>
          </div>

          <ul aria-label="Accepted payment methods" className="flex flex-wrap justify-center lg:justify-end gap-1.5 lg:justify-self-end">
            {PAYMENT_METHODS.map(({ name, logo, wordmark, logoAfter }) => (
              <li
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface text-primary text-[11px] font-bold tracking-wide leading-none"
              >
                {!logoAfter && logo}
                <span className={wordmark ? 'sr-only' : undefined}>{name}</span>
                {logoAfter && logo}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
