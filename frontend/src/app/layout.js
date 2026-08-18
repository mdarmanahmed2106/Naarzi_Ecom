import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3",
});

export const metadata = {
  title: "Naarzi | Quiet Luxury Resort Wear",
  description: "Consciously crafted pieces for the modern woman, blending coastal ease with timeless sophistication.",
};

import QuickBuyDrawer from "@/components/QuickBuyDrawer";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface">
        <AppProvider>
          {children}
          <QuickBuyDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
