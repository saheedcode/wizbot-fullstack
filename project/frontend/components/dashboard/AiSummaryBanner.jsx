'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

/**
 * Builds a one-line summary strictly from real fields returned by
 * GET /api/analytics/dashboard - there's no "today" or "recruiter messages"
 * data in that response, so this never invents numbers for those; it only
 * ever states counts the backend actually returned.
 */
function buildSummary(metrics) {
  if (!metrics) return null;
  const parts = [];
  if (metrics.bots?.applied > 0) {
    parts.push(`Wizbot has applied to ${metrics.bots.applied} job${metrics.bots.applied === 1 ? '' : 's'} for you so far`);
  }
  if (metrics.interviews > 0) {
    parts.push(`you have ${metrics.interviews} interview${metrics.interviews === 1 ? '' : 's'} in your pipeline`);
  }
  if (parts.length === 0) return null;
  return `${parts.join(', and ')}.`;
}

export default function AiSummaryBanner({ metrics }) {
  const [dismissed, setDismissed] = useState(false);
  const summary = buildSummary(metrics);

  if (dismissed || !summary) return null;

  return (
    <div className="mt-8 flex items-start gap-2.5 rounded-xl2 border border-ink-100 bg-ink-50 px-4 py-3.5">
      <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-600" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-700">AI Summary:</p>
        <p className="mt-0.5 text-sm text-ink-700">{summary}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss summary"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-white hover:text-ink-700"
      >
        <X size={15} />
      </button>
    </div>
  );
}
