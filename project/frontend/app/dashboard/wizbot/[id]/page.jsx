'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Pause, Play, Settings2 } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { botsApi } from '@/lib/api';
import { BotAvatar, StatusBadge } from '@/components/bots/botStyles';
import BotConfigModal from '@/components/bots/BotConfigModal';
import ConversionFunnel from '@/components/bots/ConversionFunnel';
import ActivityLog from '@/components/bots/ActivityLog';

export default function BotDetailPage() {
  const { id } = useParams();

  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [bot, setBot] = useState(null);
  const [funnel, setFunnel] = useState({ applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [error, setError] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const load = async () => {
    setStatus('loading');
    try {
      const res = await botsApi.get(id);
      setBot(res.data.bot);
      setFunnel(res.data.conversionFunnel || { applied: 0, interview: 0, offer: 0, rejected: 0 });
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggle = async () => {
    if (!bot) return;
    setIsToggling(true);
    setError('');
    try {
      const res = bot.status === 'active' ? await botsApi.pause(bot._id) : await botsApi.resume(bot._id);
      setBot(res.data.bot);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsToggling(false);
    }
  };

  const isActive = bot?.status === 'active';

  return (
    <DashboardShell title={bot?.name || 'Bot Details'}>
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-500">
        <Link href="/dashboard" className="hover:text-ink-800">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/dashboard/wizbot" className="hover:text-ink-800">Manage Wizbot</Link>
        {bot && (
          <>
            <ChevronRight size={14} />
            <span className="font-medium text-ink-800">{bot.name}</span>
          </>
        )}
      </nav>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {status === 'loading' && (
        <div className="grid place-items-center py-20">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {status === 'error' && !bot && (
        <div className="rounded-xl2 border border-dashed border-red-200 bg-red-50/50 px-6 py-14 text-center">
          <p className="text-sm font-medium text-red-700">Couldn&apos;t load this bot.</p>
          <button type="button" onClick={load} className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && bot && (
        <>
          <div className="flex flex-col gap-4 rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <BotAvatar avatar={bot.avatar} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg font-bold text-ink-900">{bot.name}</h1>
                  <StatusBadge status={bot.status} />
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  {bot.config?.jobTitle} &middot; {bot.config?.workMode || 'Any'} &middot; {bot.config?.jobType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setConfigOpen(true)}>
                <Settings2 size={15} /> Bot Configuration
              </Button>
              <Button variant={isActive ? 'secondary' : 'primary'} isLoading={isToggling} onClick={handleToggle}>
                {!isToggling && (isActive ? <Pause size={15} /> : <Play size={15} />)}
                {isActive ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>

          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink-900">Performance Metrics</h2>
              <span className="text-xs font-medium text-ink-400">All time</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard label="Applications Sent" value={funnel.applied} />
              <MetricCard label="Interviews" value={funnel.interview} />
              <MetricCard label="Rejections" value={funnel.rejected} />
              <MetricCard label="Offers received" value={funnel.offer} />
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityLog entries={bot.activityLog || []} botStatus={bot.status} />
            </div>
            <ConversionFunnel
              funnel={{ ...funnel, errors: bot.stats?.errors || 0 }}
              jobsScanned={bot.stats?.jobsScanned}
            />
          </div>

          <BotConfigModal
            open={configOpen}
            bot={bot}
            onClose={() => setConfigOpen(false)}
            onUpdated={(updated) => setBot(updated)}
          />
        </>
      )}
    </DashboardShell>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <p className="truncate text-sm font-medium text-ink-600">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-ink-900">{value ?? 0}</p>
    </div>
  );
}
