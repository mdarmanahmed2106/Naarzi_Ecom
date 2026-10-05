import Footer from '@/components/Footer';

/**
 * Footer that sits "underneath" the page: it is pinned to the bottom of the screen with
 * CSS sticky positioning while the content card above (z-10, rounded bottom) slides up
 * off it — the inverse of the hero → categories transition at the top of the homepage.
 *
 * Sticky is handled by the browser's compositor, so the footer stays perfectly still
 * (a scroll-driven JS transform lags a frame behind and makes it judder).
 *
 * The holder is pulled up one screen behind the card, so the footer can only stick within
 * the final screen of the page — it never travels far enough up to peek through the
 * card's rounded top corners near the hero.
 */
export default function RevealFooter() {
  return (
    <div className="relative z-0 -mt-[100svh] pointer-events-none">
      {/* Fills the screen-height behind the card's last stretch; ends 2rem/2.5rem early so the
          footer tucks under the card's rounded bottom corners */}
      <div aria-hidden="true" className="h-[calc(100svh-2rem)] md:h-[calc(100svh-2.5rem)]" />
      <div className="sticky bottom-0 bg-primary-container pointer-events-auto">
        <div aria-hidden="true" className="h-8 md:h-10" />
        <Footer />
      </div>
    </div>
  );
}
