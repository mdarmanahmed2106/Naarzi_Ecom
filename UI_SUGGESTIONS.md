# UI/UX Suggestions — Naarzi Storefront

Scope: `frontend/` (Next.js 16 App Router, Tailwind v4, Framer Motion, no component library). Based on a full read of `Header.js`, `Footer.js`, `CartDrawer.js`, `QuickBuyDrawer.js`, `AuthModal.js`, and every page under `src/app`, plus the last 30 commits.

Recently redesigned and **not** repeated below unless there's a specific follow-on polish item: Account page (tabs, mobile nav, order tracking, address editing), header search, checkout layout, coupon UX.

---

## 0. Fix before polishing (bugs / dead UI)

These aren't taste calls — they're broken or misleading UI currently shipping.

1. **Dead links in nav**: Header and Footer link to `/about`, `/faq`, `/contact` (`Header.js:328-331`, `Footer.js:53-64,74-81,207-211`) — none of these routes exist. Every visit 404s. Either build these pages or remove the links until they exist.
2. **Dead PDP controls**: the "Size Guide" button (`products/[slug]/page.js:357-359`) and the prev/next arrows on "You May Also Like" (`products/[slug]/page.js:655-661`) render but have no `onClick`. Wire them up or remove them — a button that visibly does nothing erodes trust right at the add-to-cart moment.
3. **Misleading free-shipping progress bar**: `CartDrawer.js:113-122` always renders the bar at 100% regardless of actual cart value. Either tie it to the real threshold or remove it — a fake progress indicator is worse than none.
4. **Fake "related products"**: PDP's "You May Also Like" (`products/[slug]/page.js:118-123`) is just "first 3 products excluding current," not related by category/tag. Cheap to fix, meaningfully improves cross-sell.
5. **Generic PDP copy for every product**: the Details accordion (`products/[slug]/page.js:456-465`) shows hardcoded "100% European Linen... Made ethically in Portugal" text regardless of what's actually being viewed. Shipping/Returns accordions are similarly static. This reads as unfinished/templated to a shopper comparing products.
6. **Leftover template copy**: `QuickBuyDrawer.js:156-158` still says "All products in this store are for demo purposes only... provided by Alohas" — this is boilerplate from a starter template and needs to go before this looks like a real store.
7. **Account page dead code**: the incomplete-email banner calls `setAuthModalTab('profile')` (`account/page.js:369`), a tab value `AuthModal` doesn't recognize — no-op. Low visual impact but worth cleaning up alongside any account polish pass.
8. **Checkout has no visible payment step**: `verifyPayment` is called with a mocked payment ID (`checkout/page.js:207-219`) — there's no Razorpay UI, no payment-method selection. Even pre-launch, the missing trust-building step (card/UPI logos, "secured by Razorpay") is worth flagging for the pre-launch checklist.

---

## 1. Cross-cutting: design system debt

The single highest-leverage change here isn't on any one page — it's that there **is no shared component layer**. Every button, card, badge, and accordion is hand-rolled Tailwind per file.

- **Extract a `<Button>` component.** The primary CTA classes (`px-8 py-4 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl hover:bg-primary-container`) are copy-pasted verbatim across home, shop, PDP, account, wishlist, and checkout. One component with `variant`/`size` props would kill dozens of duplicated lines and guarantee visual consistency when the brand palette inevitably shifts.
- **Unify `ProductCard`.** It's implemented three separate times (inline in `page.js`, a local function in `shop/page.js`, inline again in `wishlist/page.js`) and they've already drifted — e.g. shop's card shows a "N Colors" label the other two don't. Extract to `components/ProductCard.js` with props for context (show-colors, show-remove-vs-wishlist-heart, etc.).
- **Promote hardcoded hex colors into theme tokens.** `bg-[#0A0A0A]` (cart/quick-buy CTA — note this is *black*, while every other primary CTA in the app is the maroon `--color-primary: #4e0b1e`, so the cart checkout button currently looks like a different brand), `text-[#E55B5B]` (sale/discount red), `text-[#C5A059]` (gold accent used loosely for icons/taglines), `bg-[#FFF0E8]` (first-order badge). Add these to the `@theme` block in `globals.css` as `--color-sale`, `--color-accent-gold`, etc. so a future rebrand is a one-line change instead of a grep-and-replace.
- **Standardize icon sizing.** Material Symbols are used as raw `<span className="material-symbols-outlined">` everywhere with ad hoc sizes (`text-lg`, `text-[22px]`, `text-2xl`...). A small `<Icon name size>` wrapper with a fixed size scale (sm/md/lg) would tighten up visual rhythm across header, cards, and drawers.
- **`--spacing-section-gap: 120px` is defined but unused** — every page uses ad hoc `py-16`/`py-20`/`py-24` instead. Either start using the token for consistent section rhythm on long pages (home especially) or drop it.

## 2. Home page (`app/page.js`)

Least-recently-touched major page (last real UX pass was `560642d`). Biggest opportunities:

- **Redundant filtering UI.** The homepage duplicates most of `/shop`'s filter pills + tag chips + search input (`page.js:382-592`) on top of its own product feed. A shopper landing on `/` gets two different filtering mental models before they've even reached the shop page. Recommend: simplify the homepage feed to a curated "New In" / "Bestsellers" rail (no filter chrome) and push all serious filtering to `/shop`, with a clear "Shop All" CTA bridging the two.
- **Hardcoded placeholder content.** The testimonials carousel (`page.js:791-873`) and Instagram gallery (`page.js:875-900`) use hardcoded data and several Unsplash/`lh3.googleusercontent.com` stock images. These read as unfinished as soon as a real customer scrolls past the hero. Replace with real reviews (you already have a review system on PDP — pull top-rated ones here) and a real Instagram feed embed or actual brand photography.
- **Sticky full-height hero + rounded-sheet reveal** (`page.js:280-337`) is a strong, distinctive pattern — keep it, but the two CTAs on it are generic ("Shop Now"-style). Consider one CTA to bestsellers and a secondary text link to the brand story anchor already present lower on the page, rather than two competing buttons.
- **Category tile grid** (`page.js:339-378`) mixes hardcoded categories with API-driven images — worth confirming this doesn't silently break when the catalog's category set changes; a CMS-driven or fully-API-driven version would remove the maintenance burden.

## 3. Shop / PLP (`app/shop/page.js`)

- **Grid density mismatch**: home shows a 4-column desktop grid, shop shows 3-column. Not wrong on its own, but worth being deliberate — if shop's 3-column is meant to give products more room (bigger imagery, more info per card), that's a fine reason; if it's incidental, align the two for a more predictable browsing experience across pages.
- **Native `<select>` for sort** (`shop/page.js:417-446`, duplicated for mobile/desktop) works but looks visually out of step with the rest of the custom-styled UI (accordion filters, pill buttons). A custom dropdown matching the filter panel's styling would look more finished, especially on iOS where native selects render with heavy default chrome.
- **Loading skeleton** is a plain pulsing div — a shimmer/gradient-sweep skeleton (cheap with a CSS `background-position` animation) reads as noticeably more polished for a fashion storefront where the perception of quality matters more than most categories.
- **Mobile filter trigger** (fixed pill button, bottom-center, `shop/page.js:311-320`) is a good pattern — just make sure it doesn't overlap the CartDrawer's mobile checkout bar or any future bottom nav; worth a real-device check.

## 4. Product Detail Page (`products/[slug]/page.js`)

Beyond the dead-UI fixes in §0:

- **Reviews section placement.** Currently below the fold after Details/Shipping/Returns accordions (`page.js:513-644`). Consider surfacing an aggregate star rating + review count directly under the product title (near price), the way most fashion PDPs do — it's a proven conversion lever and currently the shopper has no rating signal until they've scrolled past the entire fold.
- **Color/size selectors** are solid (stock-aware size disabling is a nice touch) — no change needed there.
- **Gallery**: swipeable snap-scroll on mobile / thumbnail rail on desktop (`page.js:234-294`) is a good pattern already; consider adding a pinch-to-zoom or tap-to-expand lightbox on mobile, since fabric/texture detail matters a lot for apparel conversion and there's currently no way to zoom in.
- **Sticky add-to-bag cluster** on mobile is good UX — keep it, just make sure it accounts for safe-area insets on notched devices if not already handled.

## 5. Cart Drawer / Quick Buy

- Fix the fake shipping-progress bar and the leftover "Alohas" template text (§0).
- **CTA color mismatch**: cart/quick-buy checkout buttons are raw black (`#0A0A0A`) while the rest of the app's primary action color is maroon. Align to the theme's `--color-primary` unless black was a deliberate "highest urgency" choice — if so, make that intent explicit (e.g. reserve black only for the final "Place Order" step, not general "Checkout").
- **Coupon/offers panel** (`CartDrawer.js:212-326`) with lock/qualify states is genuinely good UX (recently overhauled per `85f3d48`) — no changes suggested, just noting it's a strong pattern worth reusing verbatim wherever else discounts surface.
- **QuickBuyDrawer's swatch** is hardcoded beige regardless of actual product color (`QuickBuyDrawer.js:112-122`) — should reflect the real selected variant color, otherwise a shopper adding a black item to bag sees a beige swatch confirming it.

## 6. Checkout (`app/checkout/page.js`)

- Add a visible **payment method step** before order confirmation — even a simple "Pay with Razorpay" button with UPI/card/netbanking logos communicates security and matches shopper expectations; right now the flow jumps straight from address to a mocked success state with no visible payment moment at all (see §0.8 — this one has real conversion-trust implications, not just polish).
- Trust badges (secure checkout, quality guarantee) are already present in the sticky summary — consider adding a small delivery-estimate line ("Arrives by [date]") near the address form, since delivery timing is one of the top cart-abandonment reasons in fashion e-commerce and isn't currently shown anywhere in the checkout flow.

## 7. Wishlist (`app/wishlist/page.js`)

Simplest, least-attended page — no sorting/filtering at all.

- Add basic sort (price, recently added) once the wishlist has more than a few items — currently there's no way to organize a long wishlist.
- Consider a "Move to Bag" bulk action or per-item quick-add directly from the wishlist grid (it currently only supports remove), reducing the number of taps between "I like this" and "I bought this."

## 8. Header & Footer

- Header's mega-menu/hover nav, search overlay (recently optimized), and mobile drawer are all solid and recently touched — no major changes suggested.
- Footer's large outlined "NAARZI" watermark is a nice editorial touch — keep it, but double check it doesn't cause horizontal overflow on narrow viewports (there's a known history of mobile overflow bugs in this footer per commits `7dd74e7`/`5863df7`).
- Once `/about`, `/faq`, `/contact` exist (§0.1), the footer's Client Care column becomes genuinely useful rather than a set of dead links — worth prioritizing `/faq` first since it directly reduces support load (shipping/returns/sizing questions).

## 9. Missing pages worth building

- `/about` — brand story exists as a homepage section (`page.js:700-789`); a dedicated page lets it rank in search and gives the footer link somewhere real to go.
- `/faq` — highest ROI of the three; deflects shipping/sizing/returns questions that otherwise land as support tickets.
- `/contact` — even a simple form + support email (already shown in the footer) resolves the dead link.

---

## Suggested prioritization

**P0 — fix now (bugs, not opinions):**
Dead nav links (§0.1), dead PDP buttons (§0.2), fake shipping bar (§0.3), leftover template copy (§0.6), missing checkout payment step (§0.8/§6).

**P1 — high-impact polish (next sprint):**
Shared `<Button>`/`<ProductCard>` components (§1), home page redundant filters + placeholder content (§2), PDP related-products logic + generic copy (§0.4/§0.5), CTA color consistency (§5).

**P2 — nice-to-have:**
Shop sort dropdown restyle, skeleton shimmer, wishlist sort/bulk-add, `/about` `/faq` `/contact` pages, PDP gallery zoom, delivery-estimate line at checkout.

---

*Generated from a full read of the frontend codebase and git history as of the `main` branch. File paths and line numbers reflect the state at the time of writing — re-check before acting if the codebase has moved on.*
