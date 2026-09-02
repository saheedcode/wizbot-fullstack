'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Check, Sparkles, Target } from 'lucide-react';
import RouteGuard from '@/components/layout/RouteGuard';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import AvatarPicker from '@/components/dashboard/AvatarPicker';
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

const STEPS = [
  { key: 'goals', title: 'Your career goals', icon: Target },
  { key: 'preferences', title: 'Job preferences', icon: Briefcase },
  { key: 'details', title: 'Skills & compensation', icon: Sparkles },
];

const initialForm = {
  headline: '',
  industry: INDUSTRIES[0],
  experienceLevel: EXPERIENCE_LEVELS[0],
  jobTypes: [],
  openToRemote: true,
  availability: AVAILABILITY_OPTIONS[0],
  location: '',
  phone: '',
  skills: '',
  desiredSalaryMin: '',
  desiredSalaryMax: '',
};

function OnboardingWizard() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLastStep = stepIndex === STEPS.length - 1;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleJobType = (type) => {
    setForm((prev) => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(type)
        ? prev.jobTypes.filter((t) => t !== type)
        : [...prev.jobTypes, type],
    }));
  };

  const validateStep = () => {
    const next = {};
    if (stepIndex === 0) {
      if (form.headline.trim().length < 2) next.headline = 'Tell us the role you\u2019re targeting.';
    }
    if (stepIndex === 1) {
      if (form.jobTypes.length === 0) next.jobTypes = 'Pick at least one job type.';
    }
    if (stepIndex === 2) {
      if (
        form.desiredSalaryMin &&
        form.desiredSalaryMax &&
        Number(form.desiredSalaryMin) > Number(form.desiredSalaryMax)
      ) {
        next.desiredSalaryMax = 'Max should be greater than min.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Saves whatever's been filled in so far to the backend. Called after every
  // step so a user who abandons the wizard partway through doesn't lose progress.
  const persistStep = async (finalStep) => {
    const profile = {
      headline: form.headline.trim(),
      industry: form.industry,
      experienceLevel: form.experienceLevel,
      jobTypes: form.jobTypes,
      openToRemote: form.openToRemote,
      availability: form.availability,
      ...(form.location.trim() ? { location: form.location.trim() } : {}),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.skills.trim()
        ? { skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(form.desiredSalaryMin ? { desiredSalaryMin: Number(form.desiredSalaryMin) } : {}),
      ...(form.desiredSalaryMax ? { desiredSalaryMax: Number(form.desiredSalaryMax) } : {}),
    };

    const body = {
      profile,
      onboardingStep: Math.max(user?.onboardingStep || 0, finalStep ? 1 : 0),
      ...(finalStep ? { isOnboarded: true } : {}),
    };

    const res = await userApi.updateMe(body);
    updateUser(res.data.user);
  };

  const handleNext = async () => {
    setServerError('');
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await persistStep(isLastStep);
      if (isLastStep) {
        router.replace('/dashboard');
      } else {
        setStepIndex((i) => i + 1);
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0 || isSubmitting) return;
    setStepIndex((i) => i - 1);
  };

  const handleSkip = () => router.replace('/dashboard');

  const StepIcon = STEPS[stepIndex].icon;

  return (
    <div className="flex min-h-screen flex-col items-center bg-ink-50 px-4 py-10">
      <Logo className="mb-6" />

      <div className="w-full max-w-lg rounded-xl2 border border-ink-100 bg-white p-6 shadow-panel sm:p-8">
        <div className="mb-6">
          <AvatarPicker />
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  i < stepIndex
                    ? 'bg-accent-teal text-white'
                    : i === stepIndex
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 text-ink-400'
                }`}
              >
                {i < stepIndex ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`h-0.5 flex-1 rounded ${i < stepIndex ? 'bg-accent-teal' : 'bg-ink-100'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <StepIcon size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <h1 className="font-display text-lg font-bold text-ink-900">{STEPS[stepIndex].title}</h1>
          </div>
        </div>

        {serverError && (
          <Alert type="error" className="mt-5">
            {serverError}
          </Alert>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {stepIndex === 0 && (
            <>
              <Input
                label="What role are you targeting?"
                placeholder="e.g. Senior Frontend Engineer"
                value={form.headline}
                onChange={set('headline')}
                error={errors.headline}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Industry</label>
                <select
                  value={form.industry}
                  onChange={set('industry')}
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Experience level</label>
                <select
                  value={form.experienceLevel}
                  onChange={set('experienceLevel')}
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
                >
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {stepIndex === 1 && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  What kind of roles are you open to?
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                {errors.jobTypes && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.jobTypes}</p>}
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">When can you start?</label>
                <select
                  value={form.availability}
                  onChange={set('availability')}
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[0.925rem] text-ink-900 transition-colors focus:border-brand-400"
                >
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {stepIndex === 2 && (
            <>
              <Input
                label="Skills"
                placeholder="e.g. React, Node.js, SQL"
                hint="Comma separated \u2014 helps Wizbot match you to the right postings."
                value={form.skills}
                onChange={set('skills')}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Desired minimum salary"
                  type="number"
                  min="0"
                  placeholder="e.g. 80000"
                  value={form.desiredSalaryMin}
                  onChange={set('desiredSalaryMin')}
                />
                <Input
                  label="Desired maximum salary"
                  type="number"
                  min="0"
                  placeholder="e.g. 120000"
                  value={form.desiredSalaryMax}
                  onChange={set('desiredSalaryMax')}
                  error={errors.desiredSalaryMax}
                />
              </div>
              <Input
                label="Location"
                placeholder="e.g. Austin, TX"
                value={form.location}
                onChange={set('location')}
                hint="Optional"
              />
              <Input
                label="Phone number"
                placeholder="e.g. +1 555 010 1234"
                value={form.phone}
                onChange={set('phone')}
                hint="Optional \u2014 used only for interview scheduling."
              />
            </>
          )}
        </div>

        <div className="mt-7 flex items-center gap-3">
          {stepIndex > 0 && (
            <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
            Skip for now
          </Button>
          <Button className="ml-auto" onClick={handleNext} isLoading={isSubmitting}>
            {isLastStep ? 'Finish setup' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <RouteGuard>
      <OnboardingWizard />
    </RouteGuard>
  );
}
