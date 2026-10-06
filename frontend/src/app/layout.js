import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

// Type system: Playfair Display for headings and italic accents, Source Sans 3 for body, UI,
// labels and prices. Italics are loaded so accent words use Playfair's real italic.
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-sans-3",
});

export const metadata = {
  title: "Naarzi | Own The Moment",
};

import QuickBuyDrawer from "@/components/QuickBuyDrawer";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${sourceSans3.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface overflow-x-clip">
        <AppProvider>
          {children}
          <QuickBuyDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
