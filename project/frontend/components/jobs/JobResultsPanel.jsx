'use client';

import { useEffect, useMemo } from 'react';
import { SearchX } from 'lucide-react';
import { MOCK_JOBS } from '@/lib/mockJobs';
import { useSavedJobs } from '@/context/SavedJobsContext';
import { filterJobs } from './utils';
import JobCard from './JobCard';
import JobListRow from './JobListRow';

/**
 * Filters/sorts/paginates the mock job dataset for the given query
 * (search/filters/tab) and renders it as a card grid or a compact list,
 * depending on `view`. Everything runs synchronously against
 * lib/mockJobs.js - no backend, no loading state needed.
 *
 * Reports the resulting count back via onMetaChange so the parent page can
 * show the total and drive pagination without a second data owner.
 */
export default function JobResultsPanel({
  limit = 12,
  query = {},
  view = 'grid',
  savedOnly = false,
  selectedId,
  onSelect,
  onMetaChange,
  onPageChange,
  onOpenCompany,
}) {
  const { savedIds, toggleSave } = useSavedJobs();
  const page = query.page || 1;
  const queryKey = JSON.stringify(query) + '::' + savedOnly + '::' + savedIds.size;

  const filtered = useMemo(() => {
    const source = savedOnly ? MOCK_JOBS.filter((j) => savedIds.has(j._id)) : MOCK_JOBS;
    return filterJobs(source, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const jobs = filtered.slice((safePage - 1) * limit, safePage * limit);

  useEffect(() => {
    onMetaChange?.({ total: filtered.length, page: safePage, totalPages }, jobs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, safePage]);

  const handleSavedChange = (jobId) => toggleSave(jobId);

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-50 text-ink-400">
          <SearchX size={20} />
        </span>
        <h3 className="mt-4 font-display text-base font-bold text-ink-900">
          {savedOnly ? 'No saved jobs yet' : 'No jobs found'}
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-600">
          {savedOnly
            ? 'Bookmark a job from Search Jobs to keep track of it here.'
            : 'Try adjusting your search or filters to see more results.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={view === 'grid' ? 'grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-2.5'}>
        {jobs.map((job) =>
          view === 'grid' ? (
            <JobCard
              key={job._id}
              job={job}
              saved={savedIds.has(job._id)}
              selected={selectedId === job._id}
              onSavedChange={handleSavedChange}
              onOpen={onSelect}
              onOpenCompany={onOpenCompany}
            />
          ) : (
            <JobListRow
              key={job._id}
              job={job}
              saved={savedIds.has(job._id)}
              selected={selectedId === job._id}
              onSavedChange={handleSavedChange}
              onOpen={onSelect}
              onOpenCompany={onOpenCompany}
            />
          )
        )}
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPageChange(i + 1)}
              className={`grid h-8 w-8 place-items-center rounded-lg font-medium transition-colors ${
                safePage === i + 1 ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-100'
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
