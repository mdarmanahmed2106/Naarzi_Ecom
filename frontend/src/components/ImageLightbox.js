'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const TAP_ZOOM = 2.5;
const MAX_ZOOM = 4;
const SWIPE_PX = 60;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Full-screen product photo viewer. Click (desktop) or double-tap (touch) zooms in at that spot,
 * pinch zooms up to 4x, drag or mouse-move pans, swipe / arrows / thumbnails switch photos,
 * Esc or the close button exits.
 */
export default function ImageLightbox({ images, startIndex = 0, alt, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  // True while a finger / mouse button is down, so the photo follows it without easing
  const [gesturing, setGesturing] = useState(false);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const closeRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef(0);

  const count = images.length;
  const go = useCallback((delta) => {
    setIndex((i) => (i + delta + count) % count);
    setView({ scale: 1, x: 0, y: 0 });
  }, [count]);

  // How far the zoomed photo may move each way before its edge would leave the screen. Based on
  // the photo's displayed (object-contain) size, which is usually narrower than the stage.
  const panLimits = (scale) => {
    const r = stageRef.current?.getBoundingClientRect();
    const img = imgRef.current;
    if (!r) return { mx: 0, my: 0 };
    const fit = img?.naturalWidth ? Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight) : 1;
    const w = img?.naturalWidth ? img.naturalWidth * fit : r.width;
    const h = img?.naturalHeight ? img.naturalHeight * fit : r.height;
    return { mx: Math.max(0, (w * scale - r.width) / 2), my: Math.max(0, (h * scale - r.height) / 2) };
  };

  // Keep the zoomed photo from being dragged off-screen
  const bound = (scale, x, y) => {
    const { mx, my } = panLimits(scale);
    return { scale, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  };

  // Zoom to `scale`, keeping the point under the pointer where it is
  const zoomAt = (scale, clientX, clientY) => {
    const r = stageRef.current.getBoundingClientRect();
    const px = clientX - (r.left + r.width / 2);
    const py = clientY - (r.top + r.height / 2);
    setView(bound(scale, px * (1 - scale), py * (1 - scale)));
  };

  // Scroll lock, keyboard controls and focus handling while open
  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [go, onClose]);

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setGesturing(true);
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      gesture.current = { type: 'pinch', dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), scale: view.scale, x: view.x, y: view.y };
    } else if (pts.length === 1) {
      gesture.current = { type: 'drag', sx: e.clientX, sy: e.clientY, x: view.x, y: view.y, t: Date.now(), moved: false };
    }
  };

  const onPointerMove = (e) => {
    // Desktop: when zoomed, moving the mouse (no button held) pans across the photo
    if (e.pointerType === 'mouse' && !pointers.current.has(e.pointerId)) {
      if (view.scale > 1) {
        const r = stageRef.current.getBoundingClientRect();
        const fx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const fy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        // Pointer at an edge of the screen shows that edge of the photo
        setView((v) => {
          const { mx, my } = panLimits(v.scale);
          return { scale: v.scale, x: -clamp(fx, -1, 1) * mx, y: -clamp(fy, -1, 1) * my };
        });
      }
      return;
    }
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    const pts = [...pointers.current.values()];
    if (g.type === 'pinch' && pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const scale = clamp((g.scale * dist) / g.dist, 1, MAX_ZOOM);
      setView(scale === 1 ? { scale: 1, x: 0, y: 0 } : bound(scale, g.x, g.y));
    } else if (g.type === 'drag') {
      const dx = e.clientX - g.sx;
      const dy = e.clientY - g.sy;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
      if (view.scale > 1) setView((v) => bound(v.scale, g.x + dx, g.y + dy));
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    const wasPinch = g?.type === 'pinch';
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return; // still one finger down after a pinch
    gesture.current = null;
    setGesturing(false);
    if (!g || wasPinch) return;

    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    // Swipe between photos when not zoomed
    if (view.scale === 1 && g.moved && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
      return;
    }
    if (g.moved || Date.now() - g.t > 300) return;
    // A tap: click toggles zoom on desktop; touch needs a double-tap (single taps stay free)
    const now = Date.now();
    const isDoubleTap = now - lastTap.current < 300;
    lastTap.current = now;
    if (e.pointerType === 'mouse' || isDoubleTap) {
      if (view.scale > 1) setView({ scale: 1, x: 0, y: 0 });
      else zoomAt(TAP_ZOOM, e.clientX, e.clientY);
      lastTap.current = 0;
    }
  };

  const zoomed = view.scale > 1;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${alt} photos`} className="fixed inset-0 z-[200] bg-surface flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16 shrink-0">
        <span className="font-label-caps text-xs tracking-[0.2em] text-on-surface-variant tabular-nums">
          {index + 1} / {count}
        </span>
        <span className="hidden md:block text-xs text-on-surface-variant">
          {zoomed ? 'Move to look around · click to zoom out' : 'Click to zoom'}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 -mr-2 inline-flex items-center justify-center text-on-surface hover:text-primary transition-colors">
          <Icon name="close" size="lg" />
        </button>
      </div>

      {/* Photo stage */}
      <div
        ref={stageRef}
        className={`relative flex-1 min-h-0 overflow-hidden select-none touch-none ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          ref={imgRef}
          key={images[index]}
          src={images[index]}
          alt={`${alt} view ${index + 1}`}
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: gesturing ? 'none' : 'transform 0.25s ease-out',
          }}
        />
        {count > 1 && !zoomed && (
          <>
            <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface/90 shadow-sm inline-flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <Icon name="chevron_left" size="lg" />
            </button>
            <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface/90 shadow-sm inline-flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <Icon name="chevron_right" size="lg" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails, plus a touch hint */}
      <div className="shrink-0 py-3 md:py-4 flex flex-col items-center gap-2">
        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full px-4">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => { setIndex(i); setView({ scale: 1, x: 0, y: 0 }); }}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`w-12 h-16 md:w-14 md:h-[72px] shrink-0 overflow-hidden border transition-opacity ${i === index ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
        <p className="md:hidden text-[11px] text-on-surface-variant">Pinch or double-tap to zoom</p>
      </div>
    </div>,
    document.body
  );
}
