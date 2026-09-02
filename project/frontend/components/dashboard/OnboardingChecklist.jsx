'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Info, MessageSquareText, Play, Sparkles, UserCircle2, Wand2, X } from 'lucide-react';
import Button from '@/components/ui/Button';

const STEPS = [
  {
    title: 'Complete your profile',
    description: 'We need a few more details to improve your experience on Wizob AI.',
    icon: UserCircle2,
    cta: 'Setup',
  },
  {
    title: 'Optimize your resume',
    description: 'Set up with relevant information such as profile picture, phone number etc.',
    icon: Wand2,
    cta: 'Optimize',
  },
  {
    title: 'Create your first resume',
    description: 'Set up AI agents (Wizbots) to automatically apply to jobs matching your criteria 24/7.',
    icon: Sparkles,
    cta: 'Create',
  },
  {
    title: 'Prepare for interviews',
    description: 'Set up with relevant information such as profile picture, phone number etc.',
    icon: MessageSquareText,
    cta: 'Prepare',
  },
];

function StepCard({ step, index, isDone, onInfo }) {
  const Icon = step.icon;
  return (
    <div className="flex flex-col rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={19} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-ink-900">{step.title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-ink-500">{step.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onInfo(index)}
          aria-label={`Why this matters: ${step.title}`}
          className="grid h-7 w-7 place-items-center rounded-full text-ink-300 hover:bg-ink-50 hover:text-ink-500"
        >
          <Info size={15} />
        </button>
        {isDone ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-accent-teal">
            <Check size={14} strokeWidth={3} /> Done
          </span>
        ) : (
          <Link href="/onboarding">
            <Button variant="secondary" className="h-8 px-3.5 text-xs">
              {step.cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function OnboardingChecklist({ onboardingStep = 0, onWatchDemo, onInfoStep }) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const completed = Math.min(Math.max(onboardingStep, 0), STEPS.length);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-900">Account setup</h2>
        <span className="text-sm font-medium text-ink-500">{completed}/4 completed</span>
      </div>

      {!bannerDismissed && (
        <div className="mt-4 flex items-center gap-3 rounded-xl2 border border-brand-100 bg-brand-50/60 px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-soft">
            <Sparkles size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">Introducing Wizbot AI</p>
            <p className="truncate text-xs text-ink-600">See how Wizbot can help you auto-apply to jobs on your behalf</p>
          </div>
          <Button className="hidden h-9 shrink-0 px-3.5 text-xs sm:inline-flex" onClick={onWatchDemo}>
            <Play size={13} /> Watch 1 min demo
          </Button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-white hover:text-ink-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} isDone={index < completed} onInfo={onInfoStep} />
        ))}
      </div>
    </section>
  );
}
