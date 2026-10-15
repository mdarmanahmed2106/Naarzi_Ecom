import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

// Same type system as the storefront: Cormorant Garamond for headings and figures, Jost for UI text.
// (The admin previously referenced fonts it never loaded, so it fell back to Times and Arial.)
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-sans-body',
});

export const metadata = {
  title: 'Naarzi Admin',
  description: 'Admin Dashboard for Naarzi Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="antialiased bg-surface text-on-surface">
        {children}
      </body>
    </html>
  );
}
