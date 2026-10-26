// Shrinks a photo in the browser before upload, so straight-from-camera files (often 15MB+)
// fit the 10MB upload limit and the site serves sensible sizes. A product photo is shown at
// most ~2,500px wide, so anything larger is resized to that on its longest side and saved as a
// high-quality JPEG; a typical 15-25MB photo comes out around 0.5-1.5MB with no visible change.

const MAX_EDGE = 2500; // px, longest side
const QUALITY = 0.85; // JPEG quality
const SKIP_UNDER_BYTES = 1.5 * 1024 * 1024; // already small and within MAX_EDGE: leave untouched

export async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  let bitmap;
  try {
    // 'from-image' applies the camera's EXIF rotation, so portrait photos stay upright
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // a format this browser can't decode (e.g. HEIC outside Safari): upload as is
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SKIP_UNDER_BYTES) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // JPEG has no transparency: transparent areas become white, not black
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob || blob.size >= file.size) return file; // never make a file bigger
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

// Runs async tasks a few at a time: decoding a large photo takes ~100MB of memory, so
// compressing a whole folder at once could crash the tab
export async function runWithLimit(items, limit, task) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift());
  });
  await Promise.all(workers);
}
