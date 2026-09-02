'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, KeyRound, UserCog } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AvatarPicker from '@/components/dashboard/AvatarPicker';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { authApi, userApi } from '@/lib/api';
import { validateName } from '@/lib/validators';

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function AccountDetailsForm() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dirty = name.trim() !== (user?.name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const res = await userApi.updateMe({ name: name.trim() });
      updateUser(res.data.user);
      setSuccess('Your details have been updated.');
    } catch (err) {
      setError(err.message || 'Could not save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <AvatarPicker size={20} />
        <div className="flex-1 space-y-4">
          <Input label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email address"
            value={user?.email || ''}
            disabled
            className="cursor-not-allowed bg-ink-50 text-ink-500"
            hint="Contact support to change the email on your account."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving} disabled={!dirty || isSaving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = 'Enter your current password.';
    if (form.newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.newPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsSaving(true);
    try {
      await authApi.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Your password has been updated.');
    } catch (err) {
      setServerError(err.message || 'Could not update your password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {serverError && <Alert type="error">{serverError}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <PasswordInput
        label="Current password"
        name="currentPassword"
        value={form.currentPassword}
        onChange={set('currentPassword')}
        error={errors.currentPassword}
        autoComplete="current-password"
      />
      <PasswordInput
        label="New password"
        name="newPassword"
        value={form.newPassword}
        onChange={set('newPassword')}
        error={errors.newPassword}
        showRules
        autoComplete="new-password"
      />
      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={set('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Update password
        </Button>
      </div>
    </form>
  );
}

export default function DashboardSettingsPage() {
  return (
    <DashboardShell title="Profile Settings">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <SectionCard
          title="Account details"
          description="Your name and photo are shown across WizJobAI, including to recruiters you apply to."
          icon={UserCog}
        >
          <AccountDetailsForm />
        </SectionCard>

        <SectionCard title="Password" description="Update the password you use to sign in." icon={KeyRound}>
          <ChangePasswordForm />
        </SectionCard>

        <Link
          href="/dashboard/settings/edit"
          className="flex items-center justify-between rounded-xl2 border border-dashed border-brand-200 bg-brand-50/60 p-5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          <span>
            Looking to update your headline, skills, or job preferences?
            <span className="block text-xs font-normal text-brand-600/80">Head to Edit Profile.</span>
          </span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </DashboardShell>
  );
}
