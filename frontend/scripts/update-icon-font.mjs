// Rebuilds public/fonts/material-symbols-outlined.woff2 with only the icons the site uses.
// The site serves this file itself (styles in src/app/globals.css) instead of loading Google's
// stylesheet, which blocked the first paint on phones.
//
// When you add an <Icon name="..."> the font doesn't have yet, add the name below (keep the list
// alphabetical, Google requires it) and run:  node scripts/update-icon-font.mjs
import { writeFile } from 'node:fs/promises';

const ICON_NAMES = [
  'account_balance', 'account_balance_wallet', 'add', 'arrow_back', 'arrow_forward', 'auto_awesome', 'badge', 'cancel',
  'celebration', 'check', 'check_circle', 'chevron_left', 'chevron_right', 'close', 'credit_card', 'delete',
  'edit', 'error', 'expand_more', 'favorite', 'info', 'inventory_2', 'local_offer', 'local_shipping',
  'lock', 'login', 'logout', 'mail', 'manage_accounts', 'menu', 'notifications', 'person',
  'phone', 'progress_activity', 'qr_code_2', 'radio_button_checked', 'rate_review', 'receipt_long', 'remove', 'replay',
  'schedule', 'search', 'search_off', 'shopping_bag', 'star', 'straighten', 'tune', 'update',
  'verified', 'verified_user', 'warning', 'wb_sunny', 'work', 'zoom_in',
];

const sorted = [...ICON_NAMES].sort();
if (sorted.join() !== ICON_NAMES.join()) throw new Error('Keep ICON_NAMES in alphabetical order');

// A modern browser user agent, so Google answers with WOFF2
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=${ICON_NAMES.join(',')}&display=block`;
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const fontUrl = css.match(/url\(([^)]+)\)/)?.[1];
if (!fontUrl) throw new Error(`No font URL in Google's response:\n${css}`);
const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
await writeFile(new URL('../public/fonts/material-symbols-outlined.woff2', import.meta.url), font);
console.log(`Saved ${ICON_NAMES.length} icons (${Math.round(font.length / 1024)} KB)`);
