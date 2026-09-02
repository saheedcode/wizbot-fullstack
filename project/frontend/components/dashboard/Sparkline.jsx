'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

/**
 * Tiny inline trend line for a stat card. `series` must be a real array of
 * numbers (e.g. from a future `GET /api/analytics/dashboard` trend field) -
 * this component intentionally has no fallback/random data generator, so it
 * simply renders nothing when no series is supplied rather than inventing one.
 */
export default function Sparkline({ series, color = '#4A3FD9', className = 'h-8 w-20' }) {
  if (!Array.isArray(series) || series.length < 2) return null;

  const data = series.map((value, i) => ({ i, value }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
