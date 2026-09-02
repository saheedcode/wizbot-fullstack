import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', containerClassName = '', ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-[0.925rem] text-ink-900 placeholder:text-ink-400
          transition-colors focus:border-brand-400
          ${error ? 'border-red-400' : 'border-ink-200'} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
