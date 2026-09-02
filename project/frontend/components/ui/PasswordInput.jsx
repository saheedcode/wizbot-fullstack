'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { passwordRules } from '@/lib/validators';

const PasswordInput = forwardRef(function PasswordInput(
  { label = 'Password', error, id, name, showRules = false, value, className = '', ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || name;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          ref={ref}
          type={visible ? 'text' : 'password'}
          value={value}
          aria-invalid={!!error}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-[0.925rem] text-ink-900 placeholder:text-ink-400
            transition-colors focus:border-brand-400
            ${error ? 'border-red-400' : 'border-ink-200'} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}

      {showRules && (
        <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {passwordRules(value || '').map((rule) => (
            <li
              key={rule.label}
              className={`flex items-center gap-1.5 text-xs ${rule.met ? 'text-accent-teal' : 'text-ink-400'}`}
            >
              {rule.met ? <Check size={13} strokeWidth={3} /> : <X size={13} />}
              {rule.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default PasswordInput;
