'use client';

import { useCallback, useEffect, useState } from 'react';
import { SearchX } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';

export default function JobsGrid({
  limit = 6,
  query = {},
  columns = 'sm:grid-cols-2 lg:grid-cols-3',
  onPageChange,
  onOpenJob,
  refreshKey,
}) {
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [error, setError] = useState('');

  // Re-fetch whenever the caller's query filters change (search/workMode/employmentType/page),
  // or when the caller bumps refreshKey after creating/editing/deleting a job.
  const queryKey = JSON.stringify(query) + '::' + String(refreshKey ?? '');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [jobsRes, savedRes] = await Promise.all([
        jobsApi.list({ limit, ...query }),
        jobsApi.saved({ limit: 100 }).catch(() => null), // saved state is a nice-to-have, don't block the grid on it
      ]);
      setJobs(jobsRes.data?.jobs || []);
      setMeta(jobsRes.meta || null);
      if (savedRes) {
        setSavedIds(new Set((savedRes.data?.jobs || []).map((j) => j._id)));
      }
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, queryKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSavedChange = (jobId, isSaved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  };

  if (status === 'loading') {
    return (
      <div className={`grid grid-cols-1 gap-4 ${columns}`}>
        {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl2 border border-dashed border-red-200 bg-red-50/50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-red-700">Couldn&apos;t load jobs: {error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-50 text-ink-400">
          <SearchX size={20} />
        </span>
        <h3 className="mt-4 font-display text-base font-bold text-ink-900">No jobs found</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-600">
          Try adjusting your search or filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 ${columns}`}>
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            saved={savedIds.has(job._id)}
            onSavedChange={handleSavedChange}
            onOpen={onOpenJob}
          />
        ))}
      </div>
      {meta && meta.totalPages > 1 && onPageChange && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: meta.totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPageChange(i + 1)}
              className={`grid h-8 w-8 place-items-center rounded-lg font-medium transition-colors ${
                meta.page === i + 1 ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
