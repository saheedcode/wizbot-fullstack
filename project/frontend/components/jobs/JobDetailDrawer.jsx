'use client';

import { useEffect } from 'react';
import { Bookmark, Briefcase, Building2, MapPin, Pencil, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { timeAgo, formatSalary } from './utils';

/**
 * Slide-in detail view for a single job. Read-only for job seekers; when
 * `canManage` is true (recruiter who owns the posting, or admin) it also
 * surfaces Edit/Delete actions.
 */
export default function JobDetailDrawer({
  open,
  job,
  isLoading,
  saved,
  onClose,
  onToggleSave,
  canManage,
  onEdit,
  onDelete,
}) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const salary = job ? formatSalary(job) : null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close job details"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-panel"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 id="job-detail-title" className="font-display text-base font-bold text-ink-900">
            Job Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="grid place-items-center py-20">
              <Spinner className="h-6 w-6 text-brand-600" />
            </div>
          )}

          {!isLoading && job && (
            <>
              <div className="flex items-start gap-3.5">
                {job.companyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.companyLogoUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-ink-100"
                  />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700">
                    {job.company?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-ink-900">{job.title}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-600">
                    <Building2 size={14} /> {job.company}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                    <MapPin size={14} /> {job.location}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[job.employmentType, job.workMode, ...(job.skills || [])].filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink-50 px-2.5 py-1 text-[0.7rem] font-medium text-ink-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl2 border border-ink-100 bg-ink-50/60 px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
                  <Briefcase size={15} /> {salary || 'Salary not disclosed'}
                </div>
                <span className="text-xs text-ink-400">Posted {timeAgo(job.postedAt)}</span>
              </div>

              <section className="mt-6">
                <h4 className="font-display text-sm font-bold text-ink-900">About this role</h4>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                  {job.description}
                </p>
              </section>

              {job.requirements?.length > 0 && (
                <section className="mt-6">
                  <h4 className="font-display text-sm font-bold text-ink-900">Requirements</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-700">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {!isLoading && job && (
          <div className="flex items-center gap-3 border-t border-ink-100 px-6 py-4">
            {canManage ? (
              <>
                <Button variant="secondary" fullWidth onClick={() => onEdit?.(job)}>
                  <Pencil size={15} /> Edit
                </Button>
                <Button variant="danger" fullWidth onClick={() => onDelete?.(job)}>
                  <Trash2 size={15} /> Delete
                </Button>
              </>
            ) : (
              <Button variant={saved ? 'secondary' : 'primary'} fullWidth onClick={() => onToggleSave?.(job)}>
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save Job'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
