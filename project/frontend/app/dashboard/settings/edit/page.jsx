'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AvatarPicker from '@/components/dashboard/AvatarPicker';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';

const INDUSTRIES = [
  'Software & Engineering',
  'Product & Design',
  'Data & Analytics',
  'Marketing & Growth',
  'Sales & Customer Success',
  'Operations & Finance',
  'Other',
];

const EXPERIENCE_LEVELS = ['Entry level', 'Mid level', 'Senior', 'Lead / Manager', 'Executive'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 2 weeks', 'Within a month', 'Just exploring'];

function formFromUser(user) {
  const profile = user?.profile || {};
  return {
    headline: profile.headline || '',
    bio: profile.bio || '',
    industry: profile.industry || INDUSTRIES[0],
    experienceLevel: profile.experienceLevel || EXPERIENCE_LEVELS[0],
    jobTypes: profile.jobTypes || [],
    openToRemote: profile.openToRemote ?? true,
    availability: profile.availability || AVAILABILITY_OPTIONS[0],
    location: profile.location || '',
    phone: profile.phone || '',
    skills: (profile.skills || []).join(', '),
    desiredSalaryMin: profile.desiredSalaryMin ?? '',
    desiredSalaryMax: profile.desiredSalaryMax ?? '',
  };
}

const selectClasses =
  'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(() => formFromUser(user));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Re-sync the form once the user profile finishes loading (it can arrive
  // after this page's first render on a hard refresh).
  useEffect(() => {
    setForm(formFromUser(user));
  }, [user?.profile, user]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleJobType = (type) => {
    setForm((prev) => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(type)
        ? prev.jobTypes.filter((t) => t !== type)
        : [...prev.jobTypes, type],
    }));
  };

  const validate = () => {
    const next = {};
    if (form.headline.trim().length > 0 && form.headline.trim().length < 2) {
      next.headline = 'Headline is too short.';
    }
    if (
      form.desiredSalaryMin &&
      form.desiredSalaryMax &&
      Number(form.desiredSalaryMin) > Number(form.desiredSalaryMax)
    ) {
      next.desiredSalaryMax = 'Max should be greater than min.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;

    const profile = {
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      industry: form.industry,
      experienceLevel: form.experienceLevel,
      jobTypes: form.jobTypes,
      openToRemote: form.openToRemote,
      availability: form.availability,
      location: form.location.trim(),
      phone: form.phone.trim(),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      ...(form.desiredSalaryMin !== '' ? { desiredSalaryMin: Number(form.desiredSalaryMin) } : {}),
      ...(form.desiredSalaryMax !== '' ? { desiredSalaryMax: Number(form.desiredSalaryMax) } : {}),
    };

    setIsSaving(true);
    try {
      const res = await userApi.updateMe({ profile });
      updateUser(res.data.user);
      setSuccess('Your profile has been updated.');
    } catch (err) {
      setServerError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardShell title="Edit Profile">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href="/dashboard/settings"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft size={15} /> Back to Profile Settings
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Sparkles size={18} />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-ink-900">Your details</h2>
                <p className="mt-0.5 text-sm text-ink-500">
                  This is what Wizbot and recruiters see when matching you to roles.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex justify-center sm:justify-start">
                <AvatarPicker size={18} />
              </div>

              {serverError && <Alert type="error">{serverError}</Alert>}
              {success && <Alert type="success">{success}</Alert>}

              <Input
                label="Headline"
                placeholder="e.g. Senior Frontend Engineer"
                value={form.headline}
                onChange={set('headline')}
                error={errors.headline}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="A short summary of your experience and what you're looking for."
                  className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[0.925rem] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Industry</label>
                  <select value={form.industry} onChange={set('industry')} className={selectClasses}>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Experience level</label>
                  <select value={form.experienceLevel} onChange={set('experienceLevel')} className={selectClasses}>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Location" placeholder="City, Country" value={form.location} onChange={set('location')} />
                <Input label="Phone" placeholder="Optional" value={form.phone} onChange={set('phone')} />
              </div>

              <Input
                label="Skills"
                placeholder="e.g. React, Node.js, SQL"
                hint="Comma separated — helps Wizbot match you to the right postings."
                value={form.skills}
                onChange={set('skills')}
              />
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-base font-bold text-ink-900">Job preferences</h2>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  What kind of roles are you open to?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {JOB_TYPES.map((type) => {
                    const active = form.jobTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleJobType(type)}
                        className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'border-brand-400 bg-brand-50 text-brand-700'
                            : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                        }`}
                      >
                        {active && <Check size={13} strokeWidth={3} className="mr-1.5 inline" />}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Work mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, openToRemote: true }))}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      form.openToRemote
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    Open to remote
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, openToRemote: false }))}
                    className={`rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      !form.openToRemote
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    On-site / hybrid only
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">When can you start?</label>
                  <select value={form.availability} onChange={set('availability')} className={selectClasses}>
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Desired salary — min"
                  type="number"
                  min="0"
                  placeholder="e.g. 60000"
                  value={form.desiredSalaryMin}
                  onChange={set('desiredSalaryMin')}
                />
                <Input
                  label="Desired salary — max"
                  type="number"
                  min="0"
                  placeholder="e.g. 90000"
                  value={form.desiredSalaryMax}
                  onChange={set('desiredSalaryMax')}
                  error={errors.desiredSalaryMax}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/settings">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSaving}>
              Save profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
