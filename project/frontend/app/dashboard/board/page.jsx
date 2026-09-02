'use client';

import DashboardShell from '@/components/dashboard/DashboardShell';
import ComingSoon from '@/components/dashboard/ComingSoon';

export default function MyBoardPage() {
  return (
    <DashboardShell title="My Board">
      <ComingSoon
        title="Your job board is on its way"
        description="Organize saved roles, applications, and offers on one drag-and-drop board. This section is under construction."
      />
    </DashboardShell>
  );
}
