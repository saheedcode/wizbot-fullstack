'use client';

const PROVIDERS = [
  {
    id: 'linkedin',
    label: 'Linkedin',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <rect width="24" height="24" rx="5" fill="#0A66C2" />
        <path
          fill="#fff"
          d="M7.12 9.6H4.4V19h2.72V9.6ZM5.76 8.4a1.58 1.58 0 1 0 0-3.16 1.58 1.58 0 0 0 0 3.16ZM19.6 19h-2.72v-4.94c0-1.18-.02-2.69-1.64-2.69-1.65 0-1.9 1.29-1.9 2.6V19H10.6V9.6h2.61v1.28h.04c.36-.69 1.26-1.42 2.6-1.42 2.78 0 3.75 1.83 3.75 4.2V19Z"
        />
      </svg>
    ),
  },
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.04H2.18a11 11 0 0 0 0 9.92l3.66-2.85Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.04l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38Z"
        />
      </svg>
    ),
  },
  {
    id: 'greenhouse',
    label: 'Greenhouse',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="none" stroke="#24A47F" strokeWidth="2" />
        <path
          fill="none"
          stroke="#24A47F"
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 7v10M8.5 9.5c0 2 1.5 3 3.5 3s3.5-1 3.5-3"
        />
      </svg>
    ),
  },
];

/**
 * Matches the reference design's LinkedIn / Google / Greenhouse row.
 * These providers aren't wired to a real OAuth backend yet (WizJobAI only ships
 * email + password auth today), so clicking simply surfaces `onUnavailable`
 * rather than pretending to sign the user in.
 */
export default function SocialAuthButtons({ onUnavailable, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onUnavailable?.(p.label)}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          {p.icon}
          {p.label}
        </button>
      ))}
    </div>
  );
}
