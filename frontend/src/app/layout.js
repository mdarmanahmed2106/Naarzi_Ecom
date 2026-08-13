import { Playfair_Display, DM_Sans } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Naarzi | Quiet Luxury Resort Wear",
  description: "Consciously crafted pieces for the modern woman, blending coastal ease with timeless sophistication.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
