'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Rocket } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import QuickActions from '@/components/dashboard/QuickActions';
import CompleteProfileModal from '@/components/modals/CompleteProfileModal';
import WelcomeModal from '@/components/modals/WelcomeModal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

/**
 * The sidebar's "Get Started" entry point - a dedicated home for the same
 * account-setup checklist shown on Overview, plus quick shortcuts, so new
 * users always have one obvious place to pick up where they left off.
 */
export default function GetStartedPage() {
  const { user } = useAuth();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [profileNudgeOpen, setProfileNudgeOpen] = useState(false);

  const completed = Math.min(Math.max(user?.onboardingStep || 0, 0), 4);
  const allDone = !!user?.isOnboarded || completed >= 4;

  return (
    <DashboardShell title="Get Started">
      <div className="overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-7 shadow-panel sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
              <Rocket size={22} />
            </span>
            <div>
              <h1 className="font-display text-xl font-bold text-white">
                {allDone ? `You're all set, ${user?.name?.split(' ')[0] || ''}!` : `Let's get you set up, ${user?.name?.split(' ')[0] || ''}`}
              </h1>
              <p className="mt-1 text-sm text-brand-100">
                {allDone
                  ? 'Your account is fully configured — jump back into your job search below.'
                  : `${completed}/4 steps complete — finish these to get the most out of WizJobAI.`}
              </p>
            </div>
          </div>
          <Link href="/dashboard/jobs">
            <Button className="text-brand-700 hover:bg-brand-50">Explore jobs</Button>
          </Link>
        </div>
      </div>    

      <OnboardingChecklist
        onboardingStep={user?.onboardingStep}
        onWatchDemo={() => setWelcomeOpen(true)}
        onInfoStep={() => setProfileNudgeOpen(true)}
      />

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Quick actions</h2>
        <QuickActions />
      </div>

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <CompleteProfileModal open={profileNudgeOpen} onClose={() => setProfileNudgeOpen(false)} />
    </DashboardShell>
  );
}
