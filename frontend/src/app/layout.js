import { Cormorant_Garamond, Jost } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

// Type system (from the client's brand reference): Cormorant Garamond for headings and italic
// accents, Jost for body, UI, labels and prices.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const jost = Jost({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-sans-body",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NAARZI | Own The Moment",
    template: "%s | NAARZI",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "NAARZI | Own The Moment",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/hero_image.png", alt: "NAARZI" }],
  },
  twitter: { card: "summary_large_image", title: "NAARZI | Own The Moment", description: SITE_DESCRIPTION },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Naarzi-Brand-Mark.png`,
  email: "support@naarzi.com",
  telephone: "+91 88516 26034",
  address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
};
const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

import QuickBuyDrawer from "@/components/QuickBuyDrawer";
import CartDrawer from "@/components/CartDrawer";
import SiteOverlays from "@/components/SiteOverlays";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        {/* Icon font served by the site (see scripts/update-icon-font.mjs); preloaded so header
            icons are ready with the first paint */}
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <AppProvider>
          {children}
          {/* Site-wide overlays, mounted once so every page (shop, legal pages, 404...) has them */}
          <CartDrawer />
          <SiteOverlays />
          <QuickBuyDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
