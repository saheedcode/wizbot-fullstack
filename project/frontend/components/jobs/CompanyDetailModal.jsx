'use client';

import { useEffect, useMemo } from 'react';
import { Briefcase, Building2, Globe2, MapPin, Users, X } from 'lucide-react';
import { useSavedJobs } from '@/context/SavedJobsContext';
import { getJobsByCompany } from '@/lib/mockJobs';
import { companyBannerUrl, timeAgo } from './utils';
import JobCard from './JobCard';

/**
 * Company Detail view, rendered as a modal over Discover Jobs (matches the
 * "Job Detail & Company Detail views (modal or drawer panel)" requirement).
 * Everything shown - open roles, locations, size, most common work mode -
 * is derived from the mock dataset, same as the standalone company page.
 */
export default function CompanyDetailModal({ company, onClose, onSelectJob }) {
  const { savedIds, toggleSave } = useSavedJobs();

  useEffect(() => {
    if (!company) return undefined;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [company, onClose]);

  const jobs = useMemo(() => (company ? getJobsByCompany(company) : []), [company]);
  const companySize = jobs[0]?.companySize;

  const stats = useMemo(() => {
    if (jobs.length === 0) return null;
    const locations = [...new Set(jobs.map((j) => j.location))];
    const modeCounts = jobs.reduce((acc, j) => {
      acc[j.workMode] = (acc[j.workMode] || 0) + 1;
      return acc;
    }, {});
    const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostRecent = jobs.reduce(
      (latest, j) => (!latest || new Date(j.postedAt) > new Date(latest) ? j.postedAt : latest),
      null
    );
    return { locations, topMode, mostRecent };
  }, [jobs]);

  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close company details"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-detail-title"
        className="absolute inset-x-0 bottom-0 top-8 mx-auto flex w-full max-w-3xl animate-slide-in-right flex-col overflow-hidden rounded-t-2xl bg-white shadow-panel sm:inset-0 sm:top-1/2 sm:my-auto sm:h-[85vh] sm:max-h-[42rem] sm:-translate-y-1/2 sm:rounded-xl2"
      >
        <div className="relative h-32 w-full shrink-0 overflow-hidden bg-ink-100 sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyBannerUrl(company, { width: 1000, height: 260 })}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white/85 text-ink-500 backdrop-blur-sm hover:bg-white hover:text-ink-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-end gap-3.5 border-b border-ink-100 px-5 pb-4 sm:px-6">
          <span className="-mt-8 grid h-16 w-16 shrink-0 place-items-center rounded-xl border-4 border-white bg-brand-50 text-lg font-bold text-brand-700 shadow-soft">
            {company?.[0]?.toUpperCase() || '?'}
          </span>
          <div className="min-w-0 pt-1">
            <h2 id="company-detail-title" className="truncate font-display text-lg font-bold text-ink-900">
              {company}
            </h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 sm:text-sm">
              <span className="flex items-center gap-1">
                <Briefcase size={13} /> {jobs.length} open role{jobs.length === 1 ? '' : 's'}
              </span>
              {companySize && (
                <span className="flex items-center gap-1">
                  <Users size={13} /> {companySize} employees
                </span>
              )}
              {stats?.topMode && (
                <span className="flex items-center gap-1">
                  <Globe2 size={13} /> Mostly {stats.topMode}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {stats?.locations?.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {stats.locations.slice(0, 4).map((loc) => (
                <span
                  key={loc}
                  className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1 text-[0.7rem] font-medium text-ink-600"
                >
                  <MapPin size={11} /> {loc}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-display text-sm font-bold text-ink-900">
            Open roles at {company}
          </h3>

          {jobs.length === 0 ? (
            <div className="mt-4 rounded-xl2 border border-dashed border-ink-200 px-6 py-10 text-center">
              <Building2 size={20} className="mx-auto text-ink-400" />
              <p className="mt-3 text-sm text-ink-600">No open roles from {company} right now.</p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  saved={savedIds.has(job._id)}
                  onSavedChange={(id) => toggleSave(id)}
                  onOpen={(j) => {
                    onSelectJob?.(j);
                    onClose?.();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
