'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';

/**
 * Gate for every authenticated route.
 *
 * - Not signed in -> bounce to /login.
 * - Signed in but hasn't finished onboarding yet -> bounce to /onboarding
 *   (unless we're already there), so a freshly-registered/verified account
 *   always lands on onboarding before it can reach the dashboard, no matter
 *   which authenticated URL it was opened on.
 */
export default function RouteGuard({ children, requireOnboarding = true }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const needsOnboarding = requireOnboarding && isAuthenticated && user && !user.isOnboarded && pathname !== '/onboarding';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (needsOnboarding) {
      router.replace('/onboarding');
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  if (isLoading || !isAuthenticated || needsOnboarding) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  return children;
}
