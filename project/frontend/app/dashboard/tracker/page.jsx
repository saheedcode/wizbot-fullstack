'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { applicationsApi } from '@/lib/api';
import { timeAgo } from '@/components/jobs/utils';

const COLUMNS = [
  { key: 'applied', label: 'Applied', dot: 'bg-ink-400' },
  { key: 'interview', label: 'Interview', dot: 'bg-amber-500' },
  { key: 'offer', label: 'Offer', dot: 'bg-emerald-500' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-red-500' },
];

function ApplicationCard({ application }) {
  const job = application.job;
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3.5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-50 text-xs font-bold text-ink-500">
          {job?.company?.[0]?.toUpperCase() || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{job?.title || 'Job no longer available'}</p>
          <p className="truncate text-xs text-ink-500">{job?.company}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-400">{timeAgo(application.createdAt)}</p>
    </div>
  );
}

export default function ApplicationTrackerPage() {
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

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = applications.filter((a) => a.status === col.key);
    return acc;
  }, {});

  return (
    <DashboardShell title="Application Tracker">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Application Tracker</h1>
          <p className="mt-1 text-sm text-ink-600">Every application you've sent, grouped by where it stands.</p>
        </div>
        <Link href="/dashboard/jobs">
          <Button variant="secondary" className="mt-3 sm:mt-0">
            Find more jobs
          </Button>
        </Link>
      </div>

      {error && (
        <Alert type="error" className="mt-4">
          Couldn&apos;t load your applications: {error}
        </Alert>
      )}

      {status === 'loading' && (
        <div className="grid min-h-[40vh] place-items-center">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {status === 'ready' && applications.length === 0 && (
        <div className="mt-6 rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Send size={20} />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No applications yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
            Applications you submit, or that Wizbot submits on your behalf, will show up here - sorted into Applied,
            Interview, Offer, and Rejected.
          </p>
          <Link href="/dashboard/jobs" className="mt-5 inline-block">
            <Button>Browse jobs</Button>
          </Link>
        </div>
      )}

      {status === 'ready' && applications.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <h2 className="text-sm font-semibold text-ink-900">{col.label}</h2>
                <span className="ml-auto rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                  {grouped[col.key].length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {grouped[col.key].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-ink-200 px-3 py-6 text-center text-xs text-ink-400">
                    Nothing here yet
                  </div>
                ) : (
                  grouped[col.key].map((application) => (
                    <ApplicationCard key={application._id} application={application} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
