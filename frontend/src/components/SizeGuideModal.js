'use client';

import React, { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { lockPageScroll } from '@/lib/scrollLock';
import { SIZE_CHART, MEASURING_TIPS, toCm } from '@/lib/sizeGuide';

// Size chart popup for the product page. Sizes this product comes in are highlighted.
export default function SizeGuideModal({ open, onClose, availableSizes = [] }) {
  const [unit, setUnit] = useState('in');
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const unlock = lockPageScroll();
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const fmt = (inches) => (unit === 'in' ? inches : toCm(inches));

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="bg-surface w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/30">
          <h2 id="size-guide-title" className="font-display-lg text-2xl text-on-surface">Size Guide</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close size guide" className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-surface-container cursor-pointer">
            <Icon name="close" size="lg" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant">Body measurements. Between sizes? Choose the larger one.</p>
            <div className="flex flex-none border border-outline-variant/50 rounded-lg overflow-hidden text-xs font-label-caps tracking-wider" role="group" aria-label="Units">
              {['in', 'cm'].map((u) => (
                <button
                  key={u}
                  type="button"
                  aria-pressed={unit === u}
                  onClick={() => setUnit(u)}
                  className={`min-h-9 px-3 cursor-pointer ${unit === u ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm text-center">
            <thead>
              <tr className="font-label-caps text-[11px] tracking-widest text-on-surface-variant border-b border-outline-variant/40">
                <th scope="col" className="py-2.5 text-left font-bold">Size</th>
                <th scope="col" className="py-2.5 font-bold">Bust</th>
                <th scope="col" className="py-2.5 font-bold">Waist</th>
                <th scope="col" className="py-2.5 font-bold">Hip</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => {
                const offered = availableSizes.includes(row.size);
                return (
                  <tr key={row.size} className={`border-b border-outline-variant/20 ${offered ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
                    <th scope="row" className={`py-2.5 text-left ${offered ? 'font-bold text-primary' : 'font-medium'}`}>{row.size}</th>
                    <td className="py-2.5">{fmt(row.bust)}</td>
                    <td className="py-2.5">{fmt(row.waist)}</td>
                    <td className="py-2.5">{fmt(row.hip)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {availableSizes.length > 0 && (
            <p className="text-xs text-on-surface-variant -mt-3">Sizes in <span className="text-primary font-bold">rose</span> are available for this piece.</p>
          )}

          <div className="space-y-3">
            <h3 className="font-label-caps text-xs tracking-widest text-on-surface font-bold">How to measure</h3>
            <ul className="space-y-2">
              {MEASURING_TIPS.map((tip) => (
                <li key={tip.label} className="text-sm text-on-surface-variant leading-relaxed">
                  <span className="text-on-surface font-medium">{tip.label}:</span> {tip.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
