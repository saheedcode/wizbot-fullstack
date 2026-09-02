'use client';

import { ScanSearch, Send, SkipForward, TriangleAlert } from 'lucide-react';
import { StatusBadge } from './botStyles';

const LEVEL_STYLES = {
  scanned: { label: 'Scanning', className: 'bg-sky-50 text-sky-700', Icon: ScanSearch },
  applied: { label: 'Sent', className: 'bg-emerald-50 text-emerald-700', Icon: Send },
  skipped: { label: 'Skipped', className: 'bg-ink-100 text-ink-600', Icon: SkipForward },
  error: { label: 'Error', className: 'bg-red-50 text-red-700', Icon: TriangleAlert },
};

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
  });
}

function describeEntry(entry) {
  if (entry.message) return entry.message;
  if (entry.action === 'applied') return `Successfully submitted application${entry.jobTitle ? ` \u2014 ${entry.jobTitle}` : ''}${entry.company ? ` at ${entry.company}` : ''}`;
  if (entry.action === 'scanned') return `Searching for more opportunities${entry.jobTitle ? ` matching ${entry.jobTitle}` : ''}`;
  if (entry.action === 'skipped') return `Skipped application${entry.jobTitle ? ` \u2014 ${entry.jobTitle}` : ''}`;
  if (entry.action === 'error') return 'Bot action blocked or failed';
  return '';
}

export default function ActivityLog({ entries, botStatus }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink-900">Live Activity Log</h3>
        <StatusBadge status={botStatus} />
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 py-8 text-center text-sm text-ink-400">No activity recorded yet.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-ink-100">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/70 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-3.5 py-2.5">Log Level</th>
                <th className="px-3.5 py-2.5">Log Details</th>
                <th className="hidden px-3.5 py-2.5 text-right sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {entries.map((entry, i) => {
                const style = LEVEL_STYLES[entry.action] || LEVEL_STYLES.scanned;
                const Icon = style.Icon;
                return (
                  <tr key={i}>
                    <td className="whitespace-nowrap px-3.5 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}>
                        <Icon size={12} />
                        {style.label}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-ink-700">{describeEntry(entry)}</td>
                    <td className="hidden whitespace-nowrap px-3.5 py-2.5 text-right text-xs text-ink-400 sm:table-cell">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
