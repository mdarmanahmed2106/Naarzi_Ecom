// Product and category photos are stored on Cloudinary at full upload size (often 300-500 KB).
// Cloudinary can resize and convert them on delivery, so each place asks for the width it
// actually shows: f_auto picks WebP/AVIF where the browser supports it, q_auto a visually
// lossless quality, c_limit never enlarges a smaller original. The originals are untouched.
// Anything that isn't a plain Cloudinary image URL (placeholders, local files) is returned as is.

// A few fixed sizes rather than exact pixel widths, so Cloudinary and browsers can reuse them
export const IMG = {
  thumb: 200,   // search results, cart, order lines
  card: 600,    // product cards and tiles
  large: 1200,  // product page gallery
  full: 2000,   // full-screen viewer
};

const MARKER = '/image/upload/';

export function cldImage(url, width = IMG.card) {
  if (typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
  const i = url.indexOf(MARKER);
  if (i < 0) return url;
  const rest = url.slice(i + MARKER.length);
  // Leave URLs that already carry their own transformations alone
  if (!/^v\d+\//.test(rest) && /^[a-z]{1,2}_[^/]*\//.test(rest)) return url;
  return `${url.slice(0, i + MARKER.length)}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}
