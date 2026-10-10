import { Bodoni_Moda, Jost } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

// Type system: Bodoni Moda (high-contrast Didone, set light) for headings and italic accents;
// Jost (geometric sans) for body, UI, labels and prices. The opsz axis is loaded so globals.css
// can pin it to a size where the hairlines survive on screen.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
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

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${jost.variable} h-full antialiased overflow-x-clip`}
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
