'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const {
    user,
    logout,
    cartCount,
    setIsCartOpen,
    setIsAuthOpen,
    setAuthModalTab,
  } = useApp();

  return (
    <>
      <aside className="bg-primary text-white py-2 text-center text-[10px] md:text-xs font-label-caps tracking-widest">
        NEW CUSTOMERS SAVE 10% WITH CODE WELCOME10
      </aside>
      <header className="sticky top-0 w-full z-45 bg-surface/90 backdrop-blur-md transition-all duration-300 border-b border-outline-variant/30">
        <div className="h-20 max-w-container-max mx-auto px-6 md:px-margin-desktop flex items-center justify-between">
          
          {/* Nav Links */}
          <nav className="flex-1 hidden md:flex items-center gap-gutter">
            <Link href="/" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              HOME
            </Link>
            <Link href="/?category=apparel" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              APPAREL
            </Link>
            <Link href="/?tag=new arrival" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              NEW
            </Link>
            <Link href="/?tag=featured" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors">
              FEATURED
            </Link>
          </nav>

          {/* Logo */}
          <div className="flex justify-start md:justify-center flex-1">
            <Link href="/" className="font-display-lg text-2xl md:text-3xl tracking-widest text-primary font-bold">
              NAARZI
            </Link>
          </div>

          {/* Icons / Actions */}
          <div className="flex-1 flex items-center justify-end gap-4 md:gap-6">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              search
            </span>
            
            {/* Cart Icon */}
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
              <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Profile / Auth Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs font-label-caps text-on-surface-variant">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <div 
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer text-white"
                  title="Logout"
                  onClick={logout}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </div>
              </div>
            ) : (
              <div 
                className="w-8 h-8 rounded-full bg-outline flex items-center justify-center cursor-pointer text-white hover:bg-primary transition-colors"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthOpen(true);
                }}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
