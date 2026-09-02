'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Minimal, accessible modal shell. Mirrors the mobile-drawer pattern already
 * used in components/layout/Navbar.jsx: a backdrop button (click to close),
 * Escape-to-close, and a body-scroll lock while open.
 */
export default function Modal({ open, onClose, children, className = '', labelledBy }) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative w-full max-w-sm animate-fade-up rounded-xl2 bg-white p-6 shadow-panel ${className}`}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
