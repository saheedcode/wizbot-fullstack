'use client';

import { useState } from 'react';
import RouteGuard from '@/components/layout/RouteGuard';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardShell({ title, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  return (
    <RouteGuard>
      <div className="flex min-h-screen bg-ink-50">
        <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            title={title}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onRequestLogout={() => setLogoutModalOpen(true)}
          />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      <LogoutConfirmModal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />
    </RouteGuard>
  );
}
