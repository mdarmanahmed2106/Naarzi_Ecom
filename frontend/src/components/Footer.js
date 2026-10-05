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
  { label: 'Naarzi Instagram', href: 'https://instagram.com', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { label: 'Naarzi Pinterest', href: 'https://pinterest.com', path: 'M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.369-.053.223-.176.27-.406.163-1.517-.706-2.463-2.922-2.463-4.704 0-3.834 2.785-7.356 8.034-7.356 4.221 0 7.502 3.008 7.502 7.029 0 4.194-2.645 7.571-6.316 7.571-1.233 0-2.392-.641-2.789-1.399l-.76 2.898c-.274 1.055-1.017 2.378-1.515 3.187 1.134.349 2.338.541 3.585.541 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z' },
  { label: 'Naarzi WhatsApp', href: 'https://wa.me', path: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z' },
];

const PAYMENT_METHODS = ['UPI', 'VISA', 'Mastercard', 'RuPay', 'Netbanking'];

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
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-6 md:pt-12 pb-4 md:pb-5 flex flex-col gap-5 md:gap-8 h-[calc(100svh-5rem)] min-h-[32rem]">

        {/* ── Top row: about · help · company · newsletter ── */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-5 md:gap-y-7 lg:gap-10">
          <div className="col-span-2 lg:col-span-4 space-y-1.5 md:space-y-3">
            <p className="font-body-lg text-sm md:text-lg leading-relaxed text-surface/90 max-w-sm">
              Contemporary, colour-led ready-to-wear — turning simple fabrics into vibrant stories. Not fashion. Expression.
            </p>
            <p className="text-xs text-surface/70">
              <a href="mailto:care@naarzi.com" className="underline underline-offset-2 hover:text-surface transition-colors">care@naarzi.com</a>
              {' '}· Mon – Sat, 10am – 7pm IST
            </p>
          </div>

          <nav aria-label="Help" className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase mb-2 md:mb-4">Help</h4>
            <ul className="space-y-1.5 md:space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm md:text-[15px] text-surface/80 hover:text-surface transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2 lg:col-start-8">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase mb-2 md:mb-4">Company</h4>
            <ul className="space-y-1.5 md:space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm md:text-[15px] text-surface/80 hover:text-surface transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-3 lg:col-start-10">
            <h4 className="font-display-lg text-lg md:text-2xl font-bold leading-tight uppercase tracking-wide">
              Sign up for offers &amp; get 10% off
            </h4>
            <p className="hidden sm:block text-sm text-surface/80 leading-relaxed mt-2">
              Join the circle for capsule drops, private previews and 10% off your first order.
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
                className="w-9 h-9 rounded-lg flex items-center justify-center text-surface hover:bg-surface/15 transition-colors cursor-pointer flex-none"
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
                className="w-9 h-9 rounded-full bg-surface/10 hover:bg-surface/25 flex items-center justify-center text-surface transition-colors"
              >
                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>

          <div className="text-center space-y-1 lg:space-y-1.5 order-last lg:order-none">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] font-label-caps tracking-wide text-surface/75">
              <Link href="/terms" className="hover:text-surface transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-surface transition-colors">Privacy</Link>
              <Link href="/faq" className="hover:text-surface transition-colors">Shipping &amp; Returns</Link>
              <Link href="/contact" className="hover:text-surface transition-colors">Help</Link>
            </div>
            <p className="text-xs text-surface/70">© {new Date().getFullYear()} Naarzi. All rights reserved.</p>
          </div>

          <ul aria-label="Accepted payment methods" className="flex flex-wrap justify-center lg:justify-end gap-1.5 lg:justify-self-end">
            {PAYMENT_METHODS.map((m) => (
              <li
                key={m}
                className="px-2.5 py-1 rounded-md bg-surface text-primary text-[10px] font-bold tracking-wide leading-none"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
