'use client';

import Link from 'next/link';
import { Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { BotAvatar, StatusBadge } from './botStyles';

function formatCreated(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BotCard({ bot, onEdit, onDelete, onToggle, isToggling }) {
  const isActive = bot.status === 'active';

  return (
    <div className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-panel">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <BotAvatar avatar={bot.avatar} />
          <button
            type="button"
            onClick={() => onEdit(bot)}
            aria-label="Edit bot"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <Pencil size={14} />
          </button>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      <Link href={`/dashboard/wizbot/${bot._id}`} className="mt-3 block min-w-0">
        <p className="truncate font-display font-bold text-ink-900 hover:text-brand-700">{bot.name}</p>
        <p className="truncate text-xs text-ink-400">Created {formatCreated(bot.createdAt)}</p>
      </Link>

      <div className="mt-4 flex items-center gap-6">
        <div>
          <p className="font-display text-lg font-bold text-ink-900">{bot.stats?.jobsScanned ?? 0}</p>
          <p className="text-xs text-ink-500">Jobs Scanned</p>
        </div>
        <div>
          <p className="font-display text-lg font-bold text-ink-900">{bot.stats?.applied ?? 0}</p>
          <p className="text-xs text-ink-500">Applied</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onDelete(bot)}
          aria-label="Delete bot"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => onToggle(bot)}
          disabled={isToggling}
          className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition-colors disabled:opacity-60 ${
            isActive
              ? 'border-ink-200 text-ink-700 hover:bg-ink-50'
              : 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
          }`}
        >
          {isActive ? <Pause size={13} /> : <Play size={13} />}
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  );
}
