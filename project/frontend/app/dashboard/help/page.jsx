'use client';

import DashboardShell from '@/components/dashboard/DashboardShell';
import ComingSoon from '@/components/dashboard/ComingSoon';

export default function HelpCenterPage() {
  return (
    <DashboardShell title="Help Center">
      <ComingSoon
        title="Help Center is on its way"
        description="FAQs and guides for getting the most out of WizJobAI and Wizbot are coming soon. Need help now? Reach out at support@wizjob.ai."
      />
    </DashboardShell>
  );
}
