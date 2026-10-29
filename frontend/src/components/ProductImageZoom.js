'use client';

import Icon from './Icon';
import { cldImage, IMG } from '@/lib/cloudinary';

/**
 * Main product photo. Zoom is only on demand: clicking / tapping opens the full-screen viewer,
 * where the shopper can zoom in.
 */
export default function ProductImageZoom({ src, alt, onOpen, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${alt} full screen to zoom`}
      className={`relative block w-full overflow-hidden cursor-zoom-in ${className}`}
    >
      <img src={cldImage(src, IMG.large)} alt={alt} className="w-full h-full object-cover" draggable={false} />
      {/* Hint that the photo can be opened and zoomed */}
      <span aria-hidden="true" className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-surface/90 inline-flex items-center justify-center text-on-surface">
        <Icon name="zoom_in" size="sm" />
      </span>
      {children}
    </button>
  );
}
