// Shared page-scroll lock for drawers, popups and overlays. Each one that opens takes a lock and
// releases it on close; the page stays locked while any lock is held. Without the count, one
// overlay closing (e.g. the login popup) would unlock the page under another that just opened
// (e.g. the cart reopening after login).
let locks = 0;

const apply = () => {
  const locked = locks > 0;
  document.body.style.overflow = locked ? 'hidden' : '';
  document.body.style.overscrollBehavior = locked ? 'none' : '';
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};

// Returns the release function, so it can be returned straight from a useEffect
export function lockPageScroll() {
  locks += 1;
  apply();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    apply();
  };
}
