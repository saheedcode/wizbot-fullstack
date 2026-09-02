import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  error: 'bg-red-50 text-red-700 border-red-100',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  info: 'bg-amber-50 text-amber-800 border-amber-100',
};

const ICONS = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export default function Alert({ type = 'error', children, className = '' }) {
  if (!children) return null;
  const Icon = ICONS[type];
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${STYLES[type]} ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
