'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  return (
    <footer className="bg-primary-container text-surface-container-lowest pt-16 md:pt-24 pb-8 mt-auto w-full">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-flex flex-col items-start justify-center group">
                <span className="font-display-lg text-3xl md:text-4xl tracking-widest text-surface font-bold leading-none group-hover:opacity-90 transition-opacity">
                  NAARZI
                </span>
                <span className="font-label-caps text-[9px] md:text-[10px] tracking-[0.4em] text-[#C5A059] font-bold mt-2 uppercase">
                  OWN THE MOMENT
                </span>
              </Link>
            </div>
            <p className="font-body-md text-surface-container-lowest/80 text-sm max-w-sm leading-relaxed">
              Contemporary, colour-led ready-to-wear. Turning simple fabrics into vibrant stories for effortless confidence. Not fashion. Expression.
            </p>
            <div className="pt-2 text-xs text-surface-container-lowest/70 space-y-1">
              <p className="font-medium text-surface">Customer Support</p>
              <p>care@naarzi.com · Mon – Sat, 10am – 7pm IST</p>
            </div>
          </div>

          {/* Column 2: Client Care */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              CLIENT CARE
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/faq" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Shipping & Delivery
              </Link>
              <Link href="/faq" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Returns & Exchanges
              </Link>
              <Link href="/faq" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Size & Fit Guide
              </Link>
              <Link href="/contact" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Contact Concierge
              </Link>
            </div>
          </div>

          {/* Column 3: The Brand */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              THE BRAND
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link href="/about" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Our Story
              </Link>
              <Link href="/shop?tag=new-arrival" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Launch Capsule
              </Link>
              <Link href="/about" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                Craft & Materials
              </Link>
              <Link href="/account" className="font-body-md text-surface-container-lowest/75 hover:text-surface transition-colors">
                My Account
              </Link>
            </div>
          </div>

          {/* Column 4: Newsletter & Community */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col gap-4">
            <h4 className="font-label-caps text-xs text-surface font-bold tracking-widest uppercase">
              JOIN THE CIRCLE
            </h4>
            <p className="font-body-md text-surface-container-lowest/75 text-xs leading-relaxed">
              Be the first to explore limited capsule drops, private previews, and colour-led stories.
            </p>
            
            <div className="space-y-3 pt-1">
              <form onSubmit={handleSubscribe} className="flex gap-2 border-b border-surface/30 focus-within:border-surface pb-2 transition-colors">
                <input 
                  className="bg-transparent outline-none flex-1 min-w-0 text-surface-container-lowest placeholder:text-surface-container-lowest/40 text-sm focus:ring-0" 
                  placeholder="Enter your email" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribed}
                />
                <button type="submit" className="font-label-caps text-xs text-surface hover:opacity-80 transition-opacity tracking-widest uppercase font-bold cursor-pointer flex items-center gap-1 px-2 py-1">
                  {isSubscribed ? (
                    <span className="material-symbols-outlined text-sm text-green-300">check</span>
                  ) : (
                    'SUBSCRIBE'
                  )}
                </button>
              </form>
              <div className={`text-xs text-green-300 font-medium transition-all duration-300 ${
                isSubscribed ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
              }`}>
                Welcome to Naarzi! You are on the private list.
              </div>
            </div>

            {/* Social Icons with Clean SVGs */}
            <div className="flex items-center gap-4 pt-3">
              <span className="text-[11px] font-label-caps tracking-widest text-surface/70 uppercase">Follow Our Journey</span>
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-surface/10 hover:bg-surface/25 flex items-center justify-center text-surface transition-colors"
                  aria-label="Naarzi Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Pinterest */}
                <a 
                  href="https://pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-surface/10 hover:bg-surface/25 flex items-center justify-center text-surface transition-colors"
                  aria-label="Naarzi Pinterest"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.369-.053.223-.176.27-.406.163-1.517-.706-2.463-2.922-2.463-4.704 0-3.834 2.785-7.356 8.034-7.356 4.221 0 7.502 3.008 7.502 7.029 0 4.194-2.645 7.571-6.316 7.571-1.233 0-2.392-.641-2.789-1.399l-.76 2.898c-.274 1.055-1.017 2.378-1.515 3.187 1.134.349 2.338.541 3.585.541 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a 
                  href="https://wa.me" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full bg-surface/10 hover:bg-surface/25 flex items-center justify-center text-surface transition-colors"
                  aria-label="Naarzi WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Trust Signals Bar */}
        <div className="py-6 border-y border-surface/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs text-surface/80 mb-12">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-[#C5A059]">lock</span>
            <span>100% Secure Checkout (UPI, Cards & Netbanking)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-[#C5A059]">local_shipping</span>
            <span>Pan-India Delivery</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base text-[#C5A059]">palette</span>
            <span>Thoughtful Design · Limited Collections</span>
          </div>
        </div>

        {/* Large Outlined NAARZI text */}
        <div className="relative mb-8 hidden md:flex justify-center items-center overflow-hidden h-24 md:h-48 select-none">
          <span 
            className="font-display-lg text-[100px] md:text-[200px] leading-none text-transparent pointer-events-none opacity-40"
            style={{
              WebkitTextStroke: '1px rgba(255,217,221,0.4)',
            }}
          >
            NAARZI
          </span>
        </div>

        {/* Bottom footer links & copyright */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pt-4 border-t border-surface/10 text-center lg:text-left">
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-label-caps opacity-75">
            <Link href="/terms" className="hover:opacity-100 transition-opacity text-surface">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:opacity-100 transition-opacity text-surface">
              Privacy Policy
            </Link>
            <Link href="/faq" className="hover:opacity-100 transition-opacity text-surface">
              Shipping & Returns
            </Link>
            <Link href="/contact" className="hover:opacity-100 transition-opacity text-surface">
              Help & Support
            </Link>
          </div>
          <p className="font-label-sm text-xs text-surface opacity-70">
            © {new Date().getFullYear()} Naarzi. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

