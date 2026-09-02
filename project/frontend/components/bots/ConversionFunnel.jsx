'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const SLICES = [
  { key: 'applied', label: 'Applications Sent', color: '#4A3FD9' },
  { key: 'interview', label: 'Interviews', color: '#12B3A8' },
  { key: 'offer', label: 'Offers received', color: '#10B981' },
  { key: 'rejected', label: 'Rejections', color: '#F43F5E' },
  { key: 'errors', label: 'Errors', color: '#F2A73B' },
];

export default function ConversionFunnel({ funnel, jobsScanned }) {
  const total = SLICES.reduce((sum, s) => sum + (funnel[s.key] || 0), 0);
  const data = SLICES.map((s) => ({ ...s, value: funnel[s.key] || 0 }));

  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
      <h3 className="font-display text-base font-bold text-ink-900">Conversion Funnel</h3>

      <div className="relative mt-2 h-48">
        {total === 0 ? (
          <div className="grid h-full place-items-center text-center text-sm text-ink-400">
            No activity recorded yet
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius="65%" outerRadius="100%" paddingAngle={2} isAnimationActive={false}>
                  {data.map((slice) => (
                    <Cell key={slice.key} fill={slice.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="font-display text-2xl font-bold text-ink-900">{jobsScanned ?? 0}</p>
              <p className="text-xs text-ink-500">Scanned</p>
            </div>
          </>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              {slice.label}
            </span>
            <span className="font-semibold text-ink-900">
              {total ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
