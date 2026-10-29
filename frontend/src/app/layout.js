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
import AuthModal from "@/components/AuthModal";

// Only the icons the site uses are downloaded: about 50 KB instead of the full 4 MB set. Google
// needs the list in alphabetical order. A new <Icon name="..."> must be added here, or it
// shows as its name in plain text.
const ICON_NAMES = [
  'account_balance', 'account_balance_wallet', 'add', 'arrow_back', 'arrow_forward', 'auto_awesome', 'badge', 'cancel',
  'celebration', 'check', 'check_circle', 'chevron_left', 'chevron_right', 'close', 'credit_card', 'delete',
  'edit', 'error', 'expand_more', 'favorite', 'info', 'inventory_2', 'local_offer', 'local_shipping',
  'lock', 'login', 'logout', 'mail', 'manage_accounts', 'menu', 'notifications', 'person',
  'phone', 'progress_activity', 'qr_code_2', 'radio_button_checked', 'rate_review', 'receipt_long', 'remove', 'replay',
  'schedule', 'search', 'search_off', 'shopping_bag', 'star', 'straighten', 'tune', 'update',
  'verified', 'verified_user', 'warning', 'wb_sunny', 'work', 'zoom_in',
];

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased overflow-x-clip`}
    >
      <head>
        <link
          href={`https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${ICON_NAMES.join(',')}&display=block`}
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-body-md text-on-surface overflow-x-clip">
        <AppProvider>
          {children}
          {/* Site-wide overlays, mounted once so every page (shop, legal pages, 404...) has them */}
          <CartDrawer />
          <AuthModal />
          <QuickBuyDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
