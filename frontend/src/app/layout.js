import { Cormorant_Garamond, Jost } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
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
  title: "Naarzi | Own The Moment",
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
