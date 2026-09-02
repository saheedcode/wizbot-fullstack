'use client';

import { useEffect, useState } from 'react';
import { Bot as BotIcon, Plus } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { botsApi } from '@/lib/api';
import BotCard from '@/components/bots/BotCard';
import BotCardSkeleton from '@/components/bots/BotCardSkeleton';
import CreateBotModal from '@/components/bots/CreateBotModal';
import EditBotModal from '@/components/bots/EditBotModal';
import DeleteBotModal from '@/components/bots/DeleteBotModal';

export default function WizbotPage() {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [bots, setBots] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [deletingBot, setDeletingBot] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const res = await botsApi.list();
      setBots(res.data?.bots || []);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (bot) => {
    setTogglingId(bot._id);
    setError('');
    try {
      const res = bot.status === 'active' ? await botsApi.pause(bot._id) : await botsApi.resume(bot._id);
      setBots((prev) => prev.map((b) => (b._id === bot._id ? res.data.bot : b)));
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <DashboardShell title="Manage Wizbot">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">My bots</h1>
          <p className="mt-1 text-sm text-ink-600">
            Manage your AI job application bots &mdash; Wizbot scans postings that match your criteria and applies on your behalf, 24/7.
          </p>
        </div>
        <Button className="mt-3 shrink-0 sm:mt-0" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Create Bot
        </Button>
      </div>

      {error && <Alert type="error" className="mt-6">{error}</Alert>}

      {status === 'loading' && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <BotCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'ready' && bots.length === 0 && (
        <div className="mt-6 rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <BotIcon size={22} />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No Wizbot set up yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
            Create your first Wizbot to start auto-applying to jobs that match your criteria.
          </p>
          <Button className="mt-5" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Create Bot
          </Button>
        </div>
      )}

      {status === 'ready' && bots.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bots.map((bot) => (
            <BotCard
              key={bot._id}
              bot={bot}
              onToggle={handleToggle}
              isToggling={togglingId === bot._id}
              onEdit={setEditingBot}
              onDelete={setDeletingBot}
            />
          ))}
        </div>
      )}

      <CreateBotModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(bot) => setBots((prev) => [bot, ...prev])}
      />

      <EditBotModal
        open={!!editingBot}
        bot={editingBot}
        onClose={() => setEditingBot(null)}
        onUpdated={(bot) => setBots((prev) => prev.map((b) => (b._id === bot._id ? bot : b)))}
      />

      <DeleteBotModal
        open={!!deletingBot}
        bot={deletingBot}
        onClose={() => setDeletingBot(null)}
        onDeleted={(id) => setBots((prev) => prev.filter((b) => b._id !== id))}
      />
    </DashboardShell>
  );
}
