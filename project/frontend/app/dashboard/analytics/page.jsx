'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Bot, Briefcase, Send, TrendingUp } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import StatCardSkeleton from '@/components/dashboard/StatCardSkeleton';
import Alert from '@/components/ui/Alert';
import { analyticsApi } from '@/lib/api';

const STATUS_COLORS = {
  Applied: '#4A6BC4',
  Interviews: '#F2A73B',
  Offers: '#12B3A8',
  Rejections: '#8992A3',
};

export default function AnalyticsPage() {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    analyticsApi
      .dashboard()
      .then((res) => {
        if (!cancelled) {
          setMetrics(res.data?.metrics || null);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pipeline = metrics
    ? [
        { name: 'Applied', value: metrics.applied },
        { name: 'Interviews', value: metrics.interviews },
        { name: 'Offers', value: metrics.offers },
        { name: 'Rejections', value: metrics.rejections },
      ]
    : [];

  const hasPipelineData = pipeline.some((p) => p.value > 0);

  return (
    <DashboardShell title="Analytics">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <BarChart3 size={20} />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Analytics</h1>
          <p className="text-sm text-ink-500">A real-time look at your job search performance.</p>
        </div>
      </div>

      {status === 'error' && (
        <Alert type="error" className="mb-5">
          Couldn&apos;t load your analytics: {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {status === 'loading' && Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        {status === 'ready' && metrics && (
          <>
            <StatCard label="Applications Sent" value={metrics.totalApplications} />
            <StatCard label="Interviews" value={metrics.interviews} />
            <StatCard label="Offers Received" value={metrics.offers} accent="text-accent-teal" />
            <StatCard label="Success Rate" value={`${metrics.successRate}%`} accent="text-accent-teal" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft lg:col-span-3">
          <h2 className="font-display text-sm font-bold text-ink-900">Application pipeline</h2>
          <p className="mt-0.5 text-xs text-ink-500">Where your applications currently stand.</p>

          {status === 'loading' && <div className="mt-6 h-64 animate-pulse rounded-xl bg-ink-50" />}

          {status === 'ready' && !hasPipelineData && (
            <div className="mt-6 grid h-56 place-items-center text-center">
              <div>
                <Send size={22} className="mx-auto text-ink-300" />
                <p className="mt-2 text-sm text-ink-500">Apply to a few jobs to see your pipeline here.</p>
              </div>
            </div>
          )}

          {status === 'ready' && hasPipelineData && (
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EEF0F4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4D5566' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4D5566' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F7F8FA' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {pipeline.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display text-sm font-bold text-ink-900">Outcome breakdown</h2>
          <p className="mt-0.5 text-xs text-ink-500">Share of applications by outcome.</p>

          {status === 'loading' && <div className="mt-6 h-56 animate-pulse rounded-full bg-ink-50" />}

          {status === 'ready' && !hasPipelineData && (
            <div className="mt-6 grid h-48 place-items-center text-center text-sm text-ink-500">No data yet.</div>
          )}

          {status === 'ready' && hasPipelineData && (
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pipeline} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {pipeline.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            {pipeline.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Bot size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              {status === 'ready' ? metrics?.bots?.active ?? 0 : '—'} active Wizbot{metrics?.bots?.active === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-ink-500">{status === 'ready' ? metrics?.bots?.jobsScanned ?? 0 : '—'} jobs scanned</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Briefcase size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              {status === 'ready' ? metrics?.totalJobsAvailable?.toLocaleString() : '—'} jobs on WizJobAI
            </p>
            <p className="text-xs text-ink-500">Across all companies and locations</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <TrendingUp size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">{status === 'ready' ? metrics?.chatSessions ?? 0 : '—'} Wizbot chats</p>
            <p className="text-xs text-ink-500">Conversations with your AI assistant</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
