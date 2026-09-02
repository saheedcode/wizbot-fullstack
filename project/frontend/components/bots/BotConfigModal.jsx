'use client';

import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { botsApi } from '@/lib/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'Onsite', 'Any'];

function ConfigRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-semibold text-ink-900">{value || '\u2014'}</p>
    </div>
  );
}

export default function BotConfigModal({ open, bot, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bot) {
      setForm({
        jobTitle: bot.config?.jobTitle || '',
        jobType: bot.config?.jobType || 'Full-time',
        workMode: bot.config?.workMode || 'Any',
        minSalary: bot.config?.minSalary ?? '',
        excludedCompanies: (bot.config?.excludedCompanies || []).join(', '),
      });
      setEditing(false);
      setError('');
    }
  }, [bot, open]);

  if (!open || !bot || !form) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const res = await botsApi.update(bot._id, {
        config: {
          jobTitle: form.jobTitle.trim(),
          jobType: form.jobType,
          workMode: form.workMode,
          minSalary: form.minSalary === '' ? undefined : Number(form.minSalary),
          excludedCompanies: form.excludedCompanies
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
        },
      });
      onUpdated?.(res.data.bot);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="bot-config-title" className="max-w-md">
      <div className="flex items-start justify-between pr-8">
        <h2 id="bot-config-title" className="font-display text-lg font-bold text-ink-900">
          Bot Configuration
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Pencil size={13} /> Edit
          </button>
        )}
      </div>

      {error && <Alert type="error" className="mt-4">{error}</Alert>}

      {!editing ? (
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
          <ConfigRow label="Target Jobs" value={bot.config?.jobTitle} />
          <ConfigRow label="Job Type" value={bot.config?.jobType} />
          <ConfigRow label="Work Mode" value={bot.config?.workMode} />
          <ConfigRow label="Min Salary" value={bot.config?.minSalary ? `$${bot.config.minSalary.toLocaleString()}` : null} />
          <div className="col-span-2">
            <ConfigRow
              label="Excluded Companies"
              value={bot.config?.excludedCompanies?.length ? bot.config.excludedCompanies.join(', ') : null}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
          <Input label="Job Title" value={form.jobTitle} onChange={set('jobTitle')} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Job Type</label>
              <select
                value={form.jobType}
                onChange={set('jobType')}
                className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 focus:border-brand-400"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Work Mode</label>
              <select
                value={form.workMode}
                onChange={set('workMode')}
                className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 focus:border-brand-400"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Minimum Salary" type="number" min="0" value={form.minSalary} onChange={set('minSalary')} />
          <Input
            label="Excluded Companies"
            hint="Comma separated"
            value={form.excludedCompanies}
            onChange={set('excludedCompanies')}
          />
          <div className="mt-1 flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {!editing && (
        <Button variant="secondary" fullWidth className="mt-6" onClick={onClose}>
          Close
        </Button>
      )}
    </Modal>
  );
}
