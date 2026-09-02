'use client';

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import { applicationsApi } from '@/lib/api';
import { timeAgo } from '@/components/jobs/utils';

const STATUS_STYLES = {
  applied: 'bg-ink-100 text-ink-700',
  interview: 'bg-amber-50 text-amber-700',
  offer: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
};

function ApplicationRow({ application }) {
  const job = application.job;
  return (
    <div className="flex items-center gap-4 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-sm font-bold text-ink-500">
        {job?.company?.[0]?.toUpperCase() || '?'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink-900">{job?.title || 'Job no longer available'}</p>
        <p className="truncate text-xs text-ink-500">
          {job?.company} {job?.location ? `· ${job.location}` : ''}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
          STATUS_STYLES[application.status] || 'bg-ink-100 text-ink-700'
        }`}
      >
        {application.status}
      </span>
      <span className="hidden shrink-0 text-xs text-ink-400 sm:block">{timeAgo(application.createdAt)}</span>
    </div>
  );
}

export default function ApplicationsPage() {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const res = await applicationsApi.me({ limit: 50 });
        if (!cancelled) {
          setApplications(res.data?.applications || []);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell title="Applications">
      <div className="mx-auto max-w-3xl">
        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        {status === 'loading' && (
          <div className="grid place-items-center py-16">
            <Spinner className="h-6 w-6 text-brand-600" />
          </div>
        )}

        {status === 'ready' && applications.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Send size={20} />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No applications yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
              Applications you submit, or that Wizbot submits on your behalf, will show up here.
            </p>
          </div>
        )}

        {status === 'ready' && applications.length > 0 && (
          <div className="flex flex-col gap-3">
            {applications.map((application) => (
              <ApplicationRow key={application._id} application={application} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
