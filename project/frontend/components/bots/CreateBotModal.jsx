'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { botsApi } from '@/lib/api';
import { AVATAR_OPTIONS, BotAvatar } from './botStyles';
import AvatarPickerModal from './AvatarPickerModal';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['Remote', 'Hybrid', 'Onsite', 'Any'];

const initialForm = {
  name: '',
  avatar: AVATAR_OPTIONS[0],
  jobTitle: '',
  jobType: 'Full-time',
  workMode: 'Any',
  minSalary: '',
  excludedCompanies: '',
};

export default function CreateBotModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClose = () => {
    if (isSubmitting) return;
    setForm(initialForm);
    setErrors({});
    setServerError('');
    onClose();
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Give your bot a name (at least 2 characters).';
    if (form.jobTitle.trim().length < 2) next.jobTitle = 'Job title is required.';
    if (form.minSalary && Number(form.minSalary) < 0) next.minSalary = 'Minimum salary can\u2019t be negative.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await botsApi.create({
        name: form.name.trim(),
        avatar: form.avatar,
        config: {
          jobTitle: form.jobTitle.trim(),
          jobType: form.jobType,
          workMode: form.workMode,
          ...(form.minSalary ? { minSalary: Number(form.minSalary) } : {}),
          ...(form.excludedCompanies.trim()
            ? { excludedCompanies: form.excludedCompanies.split(',').map((c) => c.trim()).filter(Boolean) }
            : {}),
        },
      });
      onCreated?.(res.data.bot);
      handleClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal open={open && !avatarPickerOpen} onClose={handleClose} labelledBy="create-bot-title" className="max-w-lg">
        <h2 id="create-bot-title" className="font-display text-lg font-bold text-ink-900">
          Create New Bot
        </h2>
        <p className="mt-1 text-sm text-ink-600">Configure your AI job application agent.</p>

        {serverError && <Alert type="error" className="mt-4">{serverError}</Alert>}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="flex flex-col items-center gap-1.5 text-xs font-medium text-ink-600"
            >
              <BotAvatar avatar={form.avatar} size="lg" className="ring-2 ring-offset-2" />
              Choose Avatar
            </button>
            <Input
              label="Bot Name"
              placeholder="e.g. Software Engineer"
              hint="Give your bot a descriptive name to easily find it later."
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              containerClassName="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Job Title"
              placeholder="e.g. Software Engineer"
              value={form.jobTitle}
              onChange={set('jobTitle')}
              error={errors.jobTitle}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Job Type</label>
              <select
                value={form.jobType}
                onChange={set('jobType')}
                className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Work Mode</label>
              <select
                value={form.workMode}
                onChange={set('workMode')}
                className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <Input
              label="Minimum Salary"
              type="number"
              min="0"
              placeholder="e.g. 3000"
              value={form.minSalary}
              onChange={set('minSalary')}
              error={errors.minSalary}
            />
          </div>

          <Input
            label="Excluded Companies"
            placeholder="e.g. Company A, Company B"
            hint="Comma separated. Wizbot will skip postings from these companies."
            value={form.excludedCompanies}
            onChange={set('excludedCompanies')}
          />

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={handleClose} disabled={isSubmitting}>
              Close
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Create AI Agent
            </Button>
          </div>
        </form>
      </Modal>

      <AvatarPickerModal
        open={avatarPickerOpen}
        initialAvatar={form.avatar}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={(avatar) => setForm((prev) => ({ ...prev, avatar }))}
      />
    </>
  );
}
