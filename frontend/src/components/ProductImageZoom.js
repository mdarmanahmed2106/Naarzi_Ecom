'use client';

import { useState } from 'react';

const ZOOM = 2.25;

/**
 * Main product photo with hover-to-magnify (mouse only): a zoomed copy fades in over the photo
 * and follows the cursor, Myntra-style. Clicking opens the full-screen viewer.
 */
export default function ProductImageZoom({ src, alt, onOpen, className = '', children }) {
  const [zoomAt, setZoomAt] = useState(null); // { x, y } in % of the frame, or null when not hovering

  const track = (e) => {
    if (e.pointerType !== 'mouse') return; // touch / pen get the tap-to-open viewer instead
    const r = e.currentTarget.getBoundingClientRect();
    setZoomAt({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    });
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerMove={track}
      onPointerEnter={track}
      onPointerLeave={() => setZoomAt(null)}
      aria-label={`Open ${alt} full screen`}
      className={`relative block w-full overflow-hidden cursor-zoom-in ${className}`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
      {/* Magnified copy, revealed on hover and positioned under the cursor */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200"
        style={{
          opacity: zoomAt ? 1 : 0,
          transform: `scale(${ZOOM})`,
          transformOrigin: zoomAt ? `${zoomAt.x}% ${zoomAt.y}%` : 'center',
        }}
      />
      {children}
    </button>
  );
}
