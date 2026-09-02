'use client';

import Link from 'next/link';
import { Bookmark, Building2, MapPin } from 'lucide-react';
import { timeAgo, formatSalary, companySlug, companyBannerUrl } from './utils';

export default function JobCard({ job, saved, selected, onSavedChange, onOpen, onOpenCompany }) {
  const toggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSavedChange?.(job._id, !saved);
  };

  const salary = formatSalary(job);

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(job)}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(job);
        }
      }}
      className={`group flex h-full flex-col overflow-hidden rounded-xl2 border bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-panel ${
        selected ? 'border-brand-400 ring-2 ring-brand-100' : 'border-ink-100'
      } ${onOpen ? 'cursor-pointer' : ''}`}
    >
      {/* Company cover photo strip - purely visual, gives every card a distinct,
          photographic identity instead of a flat block of color. */}
      <div className="relative h-20 w-full shrink-0 overflow-hidden bg-ink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={companyBannerUrl(job.company, { width: 400, height: 120 })}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg backdrop-blur-sm transition-colors ${
            saved ? 'bg-white text-brand-600' : 'bg-white/80 text-ink-500 hover:bg-white hover:text-brand-600'
          }`}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {job.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.companyLogoUrl}
            alt=""
            className="absolute -bottom-4 left-4 h-11 w-11 rounded-lg border-2 border-white object-cover shadow-soft"
          />
        ) : (
          <span className="absolute -bottom-4 left-4 grid h-11 w-11 place-items-center rounded-lg border-2 border-white bg-brand-100 text-sm font-bold text-brand-700 shadow-soft">
            {job.company?.[0]?.toUpperCase() || '?'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-6">
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
              className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500 hover:text-brand-600 hover:underline"
            >
              <Building2 size={12} className="shrink-0" /> {job.company}
            </button>
          ) : (
            <Link
              href={`/dashboard/jobs/company/${companySlug(job.company)}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500 hover:text-brand-600 hover:underline"
            >
              <Building2 size={12} className="shrink-0" /> {job.company}
            </Link>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[job.employmentType, job.workMode, ...(job.skills?.slice(0, 2) || [])]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink-50 px-2.5 py-1 text-[0.7rem] font-medium text-ink-600"
              >
                {tag}
              </span>
            ))}
        </div>

        <div className="mt-4 flex flex-1 items-end justify-between gap-2 border-t border-ink-50 pt-3">
          {salary ? <span className="text-xs font-semibold text-ink-700">{salary}</span> : <span />}
          <span className="text-xs text-ink-400">{timeAgo(job.postedAt)}</span>
        </div>
      </div>
    </div>
  );
}
