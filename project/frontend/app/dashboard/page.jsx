'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/lib/api';
import DashboardShell from '@/components/dashboard/DashboardShell';
import StatCard from '@/components/dashboard/StatCard';
import StatCardSkeleton from '@/components/dashboard/StatCardSkeleton';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import QuickActions from '@/components/dashboard/QuickActions';
import AiSummaryBanner from '@/components/dashboard/AiSummaryBanner';
import WelcomeModal from '@/components/modals/WelcomeModal';
import CompleteProfileModal from '@/components/modals/CompleteProfileModal';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import JobsGrid from '@/components/jobs/JobsGrid';

const WELCOME_SEEN_KEY = 'wizjobai_welcome_seen';

export default function DashboardHomePage() {
  const { user } = useAuth();

  const [metricsStatus, setMetricsStatus] = useState('loading'); // loading | error | ready
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [profileNudgeOpen, setProfileNudgeOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMetricsStatus('loading');
      try {
        const res = await analyticsApi.dashboard();
        if (!cancelled) {
          setMetrics(res.data?.metrics || null);
          setMetricsStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setMetricsError(err.message);
          setMetricsStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-show the welcome modal once per browser on first login, only for
  // users who haven't finished onboarding yet.
  useEffect(() => {
    if (!user || user.isOnboarded) return;
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(WELCOME_SEEN_KEY)) return;
    window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setWelcomeOpen(true);
  }, [user]);

  return (
    <DashboardShell title="Overview">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-sm text-ink-600">Here&apos;s what&apos;s happening with your job search today.</p>
        </div>
        <Link href="/dashboard/cvs">
          <Button className="mt-3 sm:mt-0">Create CV</Button>
        </Link>
      </div>

      {!user?.isOnboarded && (
        <OnboardingChecklist
          onboardingStep={user?.onboardingStep}
          onWatchDemo={() => setWelcomeOpen(true)}
          onInfoStep={() => setProfileNudgeOpen(true)}
        />
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink-900">Application Overview</h2>

        {metricsStatus === 'error' && (
          <Alert type="error" className="mt-4">
            Couldn&apos;t load your stats: {metricsError}
          </Alert>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsStatus === 'loading' &&
            Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}

          {metricsStatus === 'ready' && metrics && (
            <>
              <StatCard label="All Applications Sent" value={metrics.totalApplications} />
              <StatCard label="Interviews" value={metrics.interviews} />
              <StatCard label="Rejections" value={metrics.rejections} />
              <StatCard label="Offers received" value={metrics.offers} />
              <StatCard label="Success Rate" value={`${metrics.successRate}%`} accent="text-accent-teal" />
            </>
          )}
        </div>
      </section>

      <QuickActions />

      {metricsStatus === 'ready' && <AiSummaryBanner metrics={metrics} />}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Recommended for you</h2>
          <Link href="/dashboard/jobs" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            See all
          </Link>
        </div>
        <div className="mt-4">
          <JobsGrid limit={6} />
        </div>
      </section>

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
      <CompleteProfileModal open={profileNudgeOpen} onClose={() => setProfileNudgeOpen(false)} />
    </DashboardShell>
  );
}
