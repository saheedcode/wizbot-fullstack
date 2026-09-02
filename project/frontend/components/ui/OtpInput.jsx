'use client';

import { useRef } from 'react';

export default function OtpInput({ value, onChange, length = 6, error }) {
  const inputsRef = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setDigit = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(''));
  };

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(index, char);
    if (char && index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, '').slice(0, length).trimEnd());
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1} of code`}
            className={`h-12 w-full max-w-[3rem] rounded-xl border text-center text-lg font-semibold text-ink-900
              transition-colors focus:border-brand-400
              ${error ? 'border-red-400' : 'border-ink-200'}`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
