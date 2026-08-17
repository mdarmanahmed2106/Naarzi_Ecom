'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { promoBannersApi } from '@/lib/api';

export default function Header() {
  const {
    user,
    logout,
    cartCount,
    setIsCartOpen,
    setIsAuthOpen,
    setAuthModalTab,
  } = useApp();

  const [banners, setBanners] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await promoBannersApi.getAll();
        if (res.success) {
          setBanners(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch banners', err);
      }
    }
    fetchBanners();
  }, []);

  return (
    <>
      {banners.length > 0 && (
        <aside className="bg-surface-container text-on-surface border-b border-on-surface overflow-hidden relative">
          <div className="flex w-[200%] marquee-track text-[9px] md:text-[10px] font-label-caps tracking-widest">
            {/* First set for seamless loop */}
            <div className="flex w-1/2">
              {banners.map((banner) => (
                <div key={banner._id} className="flex-1 text-center py-2 px-4 flex items-center justify-center whitespace-nowrap">
                  {banner.message}
                  {banner.link && (
                    <Link href={banner.link} className="font-bold underline underline-offset-2 hover:text-primary transition-colors ml-1">
                      SHOP NOW
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {/* Duplicated set for seamless loop */}
            <div className="flex w-1/2">
              {banners.map((banner) => (
                <div key={`${banner._id}-dup`} className="flex-1 text-center py-2 px-4 flex items-center justify-center whitespace-nowrap">
                  {banner.message}
                  {banner.link && (
                    <Link href={banner.link} className="font-bold underline underline-offset-2 hover:text-primary transition-colors ml-1">
                      SHOP NOW
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
      <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-md transition-all duration-300 border-b border-on-surface">
        <div className="h-20 max-w-container-max mx-auto px-6 md:px-margin-desktop flex items-center justify-between">
          
          {/* Mobile Hamburger & Desktop Nav Links */}
          <div className="flex-1 flex items-center justify-start">
            <button 
              className="lg:hidden flex items-center justify-center p-2 -ml-2 mr-2 text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/?category=apparel" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">
                APPAREL
              </Link>
              <Link href="/?tag=new arrival" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">
                NEW
              </Link>
              <Link href="/lookbook" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">
                LOOKBOOK
              </Link>
              <Link href="/?tag=sale" className="font-label-caps text-[11px] text-[#E55B5B] hover:opacity-80 transition-opacity font-bold flex items-center gap-2">
                SALE <span className="bg-[#E55B5B] text-white px-2 py-0.5 rounded text-[9px] font-bold">15% OFF</span>
              </Link>
            </nav>
          </div>

          {/* Logo */}
          <div className="flex justify-center flex-1">
            <Link href="/" className="flex flex-col items-center justify-center">
              <span className="font-display-lg text-3xl md:text-4xl tracking-widest text-primary font-bold leading-none">
                NAARZI
              </span>
              <span className="font-label-caps text-[8px] md:text-[10px] tracking-[0.4em] text-[#C5A059] font-bold mt-2 uppercase">
                OWN THE MOMENT
              </span>
            </Link>
          </div>

          {/* Icons / Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
            <nav className="hidden xl:flex items-center gap-6 mr-4">
              <Link href="/about" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">ABOUT US</Link>
              <Link href="/blog" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">BLOG</Link>
              <Link href="/faq" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">FAQ</Link>
              <Link href="/contact" className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary transition-colors font-bold">CONTACT</Link>
            </nav>

            <span className="hidden md:block material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors text-[22px]">
              search
            </span>
            
            <Link href="/wishlist" className="hidden md:flex items-center">
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-[22px]" title="My Wishlist">
                favorite
              </span>
            </Link>

            {/* User Icon */}
            {user ? (
              <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={logout} title="Logout">
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">person</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center cursor-pointer" onClick={() => { setAuthModalTab('login'); setIsAuthOpen(true); }}>
                <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">person</span>
              </div>
            )}

            {/* Cart Icon */}
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[22px]">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Bottom Trust Banner */}
      <div className="bg-surface-container text-on-surface py-2.5 text-center text-[10px] font-label-caps tracking-widest border-b border-on-surface hidden md:block">
        Loved by over 10,000+ customers since 2016
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Drawer Content */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-surface transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <span className="font-display-lg text-xl tracking-widest text-primary font-bold">NAARZI</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
          {/* Main Links */}
          <nav className="flex flex-col gap-6">
            <Link href="/?category=apparel" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest">
              APPAREL
            </Link>
            <Link href="/?tag=new arrival" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest">
              NEW ARRIVAL
            </Link>
            <Link href="/lookbook" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-on-surface hover:text-primary transition-colors font-bold tracking-widest">
              LOOKBOOK
            </Link>
            <Link href="/?tag=sale" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-sm text-[#E55B5B] font-bold flex items-center gap-2 tracking-widest">
              SALE <span className="bg-[#E55B5B] text-white px-2 py-0.5 rounded text-[9px] font-bold">15% OFF</span>
            </Link>
          </nav>
          
          <hr className="border-outline-variant/30" />
          
          {/* Secondary Links */}
          <nav className="flex flex-col gap-4">
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">ABOUT US</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">BLOG</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors tracking-wider">CONTACT</Link>
          </nav>
        </div>
        
        <div className="p-6 border-t border-outline-variant/30 bg-surface-container/30 flex flex-col gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); }}>
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
            <span className="font-label-caps text-xs font-bold">SEARCH</span>
          </div>
          <Link href="/wishlist" className="flex items-center gap-3 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">favorite</span>
            <span className="font-label-caps text-xs font-bold">MY WISHLIST</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">logout</span>
              <span className="font-label-caps text-xs font-bold">LOGOUT</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); setAuthModalTab('login'); setIsAuthOpen(true); }}>
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">person</span>
              <span className="font-label-caps text-xs font-bold">LOGIN / REGISTER</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
