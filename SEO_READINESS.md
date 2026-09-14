# SEO Readiness — Naarzi Storefront

Scope: `frontend/` (Next.js 16 App Router). Based on a full read of `src/app/layout.js`, every route under `src/app`, `next.config.mjs`, and the `public/` directory. Cross-reference: `UI_SUGGESTIONS.md` for the frontend bugs/polish items that double as SEO issues.

**Nothing in this file has been implemented — it's a punch list for review.**

---

## 0. The core structural problem

Every content page — home (`app/page.js`), shop/PLP (`app/shop/page.js`), PDP (`app/products/[slug]/page.js`), account, checkout, wishlist — starts with `'use client'`. Only `app/layout.js`, `app/privacy/page.js`, and `app/terms/page.js` are server components.

This matters for SEO specifically because Next.js's metadata APIs (`export const metadata`, `generateMetadata`) only work in server components. The practical result: **every single page on the site — homepage, every product, every category filter — serves the exact same `<title>` and has no `<meta description>` at all**, because the only `metadata` export in the whole app is the static one in `layout.js`:

```js
// src/app/layout.js:15-17
export const metadata = {
  title: "Naarzi | Own The Moment",
};
```

This is the highest-leverage fix on this list — everything below is secondary until pages can each have their own title/description.

**Fix requires converting data-fetching to the server** (or wrapping just the metadata-relevant part in a server component with `generateMetadata`, keeping the interactive UI as a client child) — this is a structural change per page, not a one-line addition. Since this repo is on Next 16 and `AGENTS.md` at the frontend root warns the App Router conventions may differ from training data, **read `node_modules/next/dist/docs/` for the current `generateMetadata`/server-component-with-client-child pattern before implementing.**

---

## 1. Per-page metadata (title, description, canonical, Open Graph)

None of this exists beyond the one static site-wide title. Needed per route:

- **Homepage**: a real title ("Naarzi — Contemporary Indian Womenswear | Own The Moment") + meta description summarizing the brand.
- **PDP** (`products/[slug]/page.js`): title = product name + brand, description = product description (truncated), OG image = the product's first image, OG type = `product`. Right now sharing a product link on WhatsApp/Instagram (the two channels an Indian D2C fashion brand actually gets shared on) shows the generic site title and no preview image — a real conversion/reach loss, not just a search-engine issue.
- **Shop/PLP** (`shop/page.js`): title should reflect the active category/filter (e.g. "Kurtas | Shop | Naarzi") once query params are read — see §4 on why query-param filtering itself is a separate problem.
- **Canonical URLs**: none exist anywhere. Needed once query-param-driven pages (shop with filters, search) are live, so Google consolidates `/shop?sort=price` and `/shop` instead of treating them as separate thin-content pages.
- **`metadataBase`**: not set in `layout.js`. Needed so relative OG image URLs resolve to an absolute production domain instead of `localhost`.

## 2. Structured data (JSON-LD) — completely absent

No `application/ld+json` anywhere in the codebase. For a fashion e-commerce site, the missing schema types with real impact:

- **`Product`** on the PDP — price, availability (in/out of stock — the data already exists via `colors[].sizes[].stock`), rating/review count (the `Review` model already exists and is populated on PDP). This is what makes Google show star ratings and price directly in search results for product pages.
- **`BreadcrumbList`** — PDP and shop pages have no breadcrumb trail in the UI at all, so there's nothing to mark up yet; adding breadcrumbs would be a UI change with an SEO side benefit.
- **`Organization`** / **`WebSite`** (with `SearchAction` pointing at the shop search) — sitewide, once in `layout.js` or a shared component.

## 3. Sitemap & robots.txt — neither exists

Checked `public/` (only images + a Lottie animation) and `src/app/` (no `sitemap.js`/`sitemap.ts`, no `robots.js`/`robots.ts`). Result:

- **No `sitemap.xml`** — Google has to discover every product/category purely by crawling links, with no authoritative list and no signal about update frequency. For a catalog that changes (new arrivals, out-of-stock/back-in-stock), this meaningfully slows indexing of new products.
- **No `robots.txt`** — not blocking anything is *usually* fine by default, but there's also no `Sitemap:` directive pointing crawlers at a sitemap (moot until one exists), and no explicit disallow for pages that shouldn't be indexed at all: `/checkout`, `/account`, and cart/wishlist states that carry no unique content per visitor.

Next.js App Router supports both as file-based routes (`app/sitemap.js`, `app/robots.js`) that generate these dynamically from the database (products, categories) instead of a static file — the right approach here given the catalog isn't static. Confirm exact conventions against the local Next 16 docs before implementing, per the `AGENTS.md` warning.

## 4. URL structure — category browsing has no crawlable path

`shop/page.js` reads all filtering state from query params (`shop/page.js:161-170`: `?category=`, `?tag=`, `?sort=`, `?search=`, etc.) via `useSearchParams`. There is **no dedicated route** like `/category/kurtas` or `/shop/kurtas` — every category is just `/shop?category=<id>`.

This matters for SEO specifically because:
- Query-param URLs are harder for Google to treat as distinct, authoritative landing pages compared to clean paths — category pages are exactly the kind of page that should rank for "buy kurtas online india"-type searches, and right now there's no stable URL for that to attach to.
- Combined with §1 (no per-page metadata), a category filter view has literally nothing distinguishing it from the base shop page in `<head>` even if it were crawled.

**Fix** would be a real route (`app/category/[slug]/page.js` using the existing `Category` model's slug) that server-renders the category's products with its own metadata, likely keeping the current query-param shop page for the interactive multi-filter case and using clean category routes as the primary crawlable/shareable entry point.

## 5. Content quality issues that actively hurt rankings

These are functional bugs already tracked in `UI_SUGGESTIONS.md`, called out here specifically for their SEO angle:

- **Generic PDP copy for every product** (`UI_SUGGESTIONS.md` §0.5, `products/[slug]/page.js:456-465`) — the Details/Shipping/Returns accordion text is identical hardcoded copy on every single product page. Google treats near-duplicate content across hundreds of product pages as low-value/thin content, which actively suppresses rankings for the whole catalog, not just an individual page.
- **Fake testimonials** (`UI_SUGGESTIONS.md` §2, homepage) — hardcoded reviewer names disconnected from the real `Review` model. Beyond the trust problem already noted, this is a missed opportunity to surface real review-based content and structured data (see §2) on the page Google is most likely to land users on.
- **Missing `/about`, `/faq`, `/contact`** (`UI_SUGGESTIONS.md` §0.1, §9) — these aren't just dead nav links; they're exactly the pages that build topical depth and internal links for a brand's SEO footprint, and `/faq` in particular is the kind of page that ranks for long-tail "does naarzi ship to..." / "naarzi return policy" queries.

## 6. Images & Core Web Vitals

Raw `<img>` tags are used everywhere instead of `next/image` (already flagged by `eslint`'s `@next/next/no-img-element` across `page.js`, `shop/page.js`, `products/[slug]/page.js`, `wishlist/page.js`, `Header.js`, `QuickBuyDrawer.js`). This isn't purely cosmetic for SEO:

- No automatic lazy-loading below the fold, no responsive `srcset`, no format optimization (WebP/AVIF) — all of which affect **LCP (Largest Contentful Paint)**, a direct Google ranking factor (part of Core Web Vitals).
- Alt text is present on most images (`alt={product.name}` pattern is used consistently — this part is already reasonably good) but generic on a few (`alt={`${product.name} alternate`}`, `alt={`Instagram photo ${idx}`}` in `page.js:888`) rather than descriptive of what's actually shown.

## 7. Technical baseline checklist

Quick items not covered above, worth confirming before/alongside the bigger fixes:

- **Custom 404 handling**: `not-found.js` exists and is a client component — Next.js's file convention still returns a real 404 status code regardless, so this is likely fine, but worth a manual check (`curl -I` a broken URL) once deployed.
- **`hreflang`**: not applicable — single-market (India), single-language site. No action needed unless that changes.
- **Mobile responsiveness**: already solid per recent commits (per `ADMIN_GAPS.md`/`UI_SUGGESTIONS.md` context) — Google is mobile-first-index, so this is a genuine existing strength, not a gap.
- **HTTPS / canonical domain**: not verifiable from source — confirm production deploy forces HTTPS and a single canonical host (`www` vs. bare domain) once a domain is live.

---

## Suggested priority order

**P0 — structural, blocks everything else:**
Per-page `generateMetadata` (§1) — nothing else on this list matters much until individual pages can have their own title/description/OG tags. This requires the client/server component split discussed in §0.

**P1 — cheap once P0 unlocks it:**
Sitemap + robots.txt (§3, straightforward with the DB already in place), `Product` JSON-LD (§2, data already exists via `colors[].sizes[].stock` and the `Review` model), fixing generic PDP copy (§5 — also a `UI_SUGGESTIONS.md` conversion item, not SEO-only).

**P2 — larger scope:**
Dedicated category routes (§4), `next/image` migration (§6, also flagged in `UI_SUGGESTIONS.md` §1 as general perf debt), `/about` + `/faq` + `/contact` pages (§5, also in `UI_SUGGESTIONS.md` §9).

---

*Generated from a full read of the frontend source as of the `main` branch. File paths and line numbers reflect the state at the time of writing — re-check before acting if the codebase has moved on. Cross-reference `UI_SUGGESTIONS.md` and `ADMIN_GAPS.md` for related items.*
