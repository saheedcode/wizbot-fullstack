import Sparkline from './Sparkline';

export default function StatCard({ label, value, series, accent = 'text-ink-900' }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <p className="truncate text-sm font-medium text-ink-600">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className={`font-display text-2xl font-bold ${accent}`}>{value}</p>
        <Sparkline series={series} />
      </div>
    </div>
  );
}
