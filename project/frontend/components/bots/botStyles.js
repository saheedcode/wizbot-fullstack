import { Bot as BotIcon } from 'lucide-react';

// Mirrors backend/src/models/Bot.js BOT_AVATARS exactly - the avatar picker
// only ever offers these six, and any bot fetched from the API will have one
// of these values (or falls back to bot-blue below).
export const AVATAR_STYLES = {
  'bot-blue': { ring: 'ring-sky-200', bg: 'bg-sky-100', fg: 'text-sky-600', swatch: 'bg-sky-400' },
  'bot-green': { ring: 'ring-emerald-200', bg: 'bg-emerald-100', fg: 'text-emerald-600', swatch: 'bg-emerald-400' },
  'bot-red': { ring: 'ring-rose-200', bg: 'bg-rose-100', fg: 'text-rose-600', swatch: 'bg-rose-400' },
  'bot-purple': { ring: 'ring-violet-200', bg: 'bg-violet-100', fg: 'text-violet-600', swatch: 'bg-violet-400' },
  'bot-orange': { ring: 'ring-amber-200', bg: 'bg-amber-100', fg: 'text-amber-600', swatch: 'bg-amber-400' },
  'bot-teal': { ring: 'ring-teal-200', bg: 'bg-teal-100', fg: 'text-teal-600', swatch: 'bg-teal-400' },
};

export const AVATAR_OPTIONS = Object.keys(AVATAR_STYLES);

export function BotAvatar({ avatar, size = 'md', className = '' }) {
  const style = AVATAR_STYLES[avatar] || AVATAR_STYLES['bot-blue'];
  const sizes = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-14 w-14' };
  const iconSizes = { sm: 16, md: 19, lg: 24 };
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ring-1 ${style.bg} ${style.fg} ${style.ring} ${sizes[size]} ${className}`}
    >
      <BotIcon size={iconSizes[size]} strokeWidth={2} />
    </span>
  );
}

// Semantic colors reused elsewhere in the app (see app/dashboard/applications
// STATUS_STYLES): emerald = healthy/active, amber = paused/attention.
export const BOT_STATUS_STYLES = {
  active: { label: 'Running', className: 'bg-emerald-50 text-emerald-700' },
  paused: { label: 'Paused', className: 'bg-amber-50 text-amber-700' },
};

export function StatusBadge({ status, className = '' }) {
  const style = BOT_STATUS_STYLES[status] || BOT_STATUS_STYLES.paused;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      {style.label}
    </span>
  );
}
