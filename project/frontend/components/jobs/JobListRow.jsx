'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { timeAgo, companySlug } from './utils';

export default function JobListRow({ job, saved, selected, onSavedChange, onOpen, onOpenCompany }) {
  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSavedChange?.(job._id, !saved);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(job)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.(job);
        }
      }}
      className={`flex cursor-pointer items-start gap-3 rounded-xl2 border bg-white p-4 transition-colors ${
        selected ? 'border-brand-400 bg-brand-50/40 ring-1 ring-brand-200' : 'border-ink-100 hover:bg-ink-50/60'
      }`}
    >
      {job.companyLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={job.companyLogoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-ink-100" />
      ) : (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">
          {job.company?.[0]?.toUpperCase() || '?'}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{job.title}</p>
            {onOpenCompany ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenCompany(job.company);
                }}
                className="truncate text-xs text-ink-500 hover:text-brand-600 hover:underline"
              >
                {job.company}
              </button>
            ) : (
              <Link
                href={`/dashboard/jobs/company/${companySlug(job.company)}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate text-xs text-ink-500 hover:text-brand-600 hover:underline"
              >
                {job.company}
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${
              saved ? 'text-brand-600' : 'text-ink-300 hover:text-ink-500'
            }`}
          >
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[job.employmentType, job.workMode].filter(Boolean).map((tag) => (
            <span key={tag} className="rounded-full bg-ink-50 px-2 py-0.5 text-[0.65rem] font-medium text-ink-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
          <span className="truncate">{job.location}</span>
          <span className="shrink-0">{timeAgo(job.postedAt)}</span>
        </div>
      </div>
    </div>
  );
}
