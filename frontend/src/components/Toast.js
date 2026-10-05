'use client';

import { useEffect } from 'react';
import Icon from '@/components/Icon';

const VARIANTS = {
  error: { icon: 'error', accent: 'bg-error', iconColor: 'text-error', iconBg: 'bg-error-container' },
  warning: { icon: 'info', accent: 'bg-accent-gold', iconColor: 'text-accent-gold', iconBg: 'bg-first-order-badge' },
  success: { icon: 'check_circle', accent: 'bg-green-700', iconColor: 'text-green-700', iconBg: 'bg-green-50' },
  info: { icon: 'notifications', accent: 'bg-primary', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
};

/**
 * Floating notification card. Pass `toast` as { id, type, title, message } or null.
 * Auto-dismisses after `duration` ms.
 */
export default function Toast({ toast, onClose, duration = 6000 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const variant = VARIANTS[toast.type] || VARIANTS.info;

  return (
    <div
      className="fixed z-[100] left-4 right-4 top-[5.5rem] sm:left-auto sm:right-6 sm:top-24 sm:w-[380px] pointer-events-none"
    >
      <div
        key={toast.id}
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        className="toast-enter pointer-events-auto relative overflow-hidden bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-[0_12px_40px_-12px_rgba(30,25,27,0.35)]"
      >
        <span className={`absolute left-0 top-0 bottom-0 w-1 ${variant.accent}`} />

        <div className="flex items-start gap-3 p-4 pl-5">
          <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-none ${variant.iconBg}`}>
            <Icon name={variant.icon} size="md" className={variant.iconColor} />
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            {toast.title && (
              <p className="font-headline-sm text-[15px] text-on-surface leading-snug">{toast.title}</p>
            )}
            {toast.message && (
              <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{toast.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="w-7 h-7 -mr-1 -mt-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer flex-none"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        <span
          className={`toast-progress absolute left-0 bottom-0 h-[2px] w-full origin-left ${variant.accent} opacity-60`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
}
