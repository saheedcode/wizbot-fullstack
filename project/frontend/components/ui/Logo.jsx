export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold text-ink-900 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-teal text-sm text-white shadow-soft">
        W
      </span>
      <span className="text-[1.05rem] tracking-tight">
        WizJob<span className="text-brand-600">AI</span>
      </span>
    </span>
  );
}
