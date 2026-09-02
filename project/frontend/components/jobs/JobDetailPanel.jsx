'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Flag,
  Link2,
  MapPin,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { MOCK_JOBS, getJobsByCompany } from '@/lib/mockJobs';
import { timeAgo, formatSalary, computeMatch, companyBannerUrl } from './utils';

const TABS = [
  { key: 'description', label: 'Job Description' },
  { key: 'company', label: 'Company' },
];

/**
 * Renders the full detail view for a single job: a photographic company
 * banner, header, stat chips, the Job Description / Company tabs, a
 * "Similar roles" strip, and the action bar (Apply, Save, Share, Report, or
 * Edit/Delete for the recruiter who owns it).
 *
 * Used both as the persistent right-hand pane on desktop and inside a
 * full-screen sheet on mobile - the caller controls the chrome around it.
 */
export default function JobDetailPanel({
  job,
  isLoading,
  error,
  saved,
  onToggleSave,
  canManage,
  onEdit,
  onDelete,
  onReport,
  onClose,
  showCloseButton,
  onOpenCompany,
}) {
  const { user } = useAuth();
  const [tab, setTab] = useState('description');
  const [applyState, setApplyState] = useState('idle'); // idle | applying | applied
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset local UI state whenever a different job is opened.
  useEffect(() => {
    setTab('description');
    setApplyState('idle');
    setLinkCopied(false);
  }, [job?._id]);

  // Other open roles at the same company, and similar roles by title -
  // both derived directly from the mock dataset, no fetch required.
  const companyJobs = useMemo(
    () => (job?.company ? getJobsByCompany(job.company).filter((j) => j._id !== job._id).slice(0, 4) : []),
    [job?.company, job?._id]
  );
  const similarJobs = useMemo(
    () =>
      job?.title
        ? MOCK_JOBS.filter((j) => j._id !== job._id && j.title === job.title).slice(0, 3)
        : [],
    [job?.title, job?._id]
  );

  if (isLoading) {
    return (
      <div className="grid h-full min-h-[24rem] place-items-center">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-full min-h-[24rem] place-items-center px-6">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="grid h-full min-h-[24rem] place-items-center px-6 text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-50 text-ink-400">
            <Briefcase size={20} />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">Select a job</h3>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-600">
            Choose a listing from the results to see the full details here.
          </p>
        </div>
      </div>
    );
  }

  const salary = formatSalary(job);
  const match = computeMatch(user, job);
  const canApply = !!user;

  // No backend for this mock experience - "applying" is simulated locally
  // (brief loading state, then a confirmed state) rather than calling out
  // to an application endpoint that doesn't exist yet.
  const handleApply = () => {
    setApplyState('applying');
    setTimeout(() => setApplyState('applied'), 500);
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/jobs?job=${job._id}` : '';
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard access can be blocked in some contexts; the button just won't confirm
    }
  };

  const applied = applyState === 'applied';

  return (
    <div className="flex h-full flex-col">
      {/* Photographic company banner */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-ink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={companyBannerUrl(job.company, { width: 800, height: 200 })}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {!canManage && (
            <button
              type="button"
              onClick={() => onReport?.(job)}
              aria-label="Report this job"
              title="Report this job"
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/85 text-ink-500 backdrop-blur-sm hover:bg-white hover:text-ink-800"
            >
              <Flag size={16} />
            </button>
          )}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/85 text-ink-500 backdrop-blur-sm hover:bg-white hover:text-ink-800"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 pb-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-3.5">
          {job.companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogoUrl}
              alt=""
              className="-mt-8 h-16 w-16 shrink-0 rounded-xl border-4 border-white object-cover shadow-soft"
            />
          ) : (
            <span className="-mt-8 grid h-16 w-16 shrink-0 place-items-center rounded-xl border-4 border-white bg-brand-50 text-lg font-bold text-brand-700 shadow-soft">
              {job.company?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          <div className="min-w-0 pt-1">
            <h2 className="truncate font-display text-lg font-bold text-ink-900">{job.title}</h2>
            <button
              type="button"
              onClick={() => onOpenCompany?.(job.company)}
              className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-600 hover:text-brand-600 hover:underline"
            >
              <Building2 size={14} className="shrink-0" /> {job.company}
            </button>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin size={14} className="shrink-0" /> {job.location} · {timeAgo(job.postedAt)}
            </p>
          </div>
        </div>

        {match !== null && (
          <span className="mt-1 hidden shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 sm:inline-flex">
            <Sparkles size={13} /> {match}% Match
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <StatChip label="Salary" value={salary || 'Not disclosed'} />
          <StatChip label="Job Type" value={job.employmentType} />
          <StatChip label="Work Mode" value={job.workMode} highlight />
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-ink-50 px-2.5 py-1 text-[0.7rem] font-medium text-ink-600">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-1 rounded-xl bg-ink-50 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'description' ? (
          <div className="mt-5">
            <section>
              <h4 className="font-display text-sm font-bold text-ink-900">Job Description</h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">{job.description}</p>
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

            {canApply && (
              <div className="mt-6 flex items-start gap-3 rounded-xl2 border border-brand-100 bg-brand-50/60 p-4">
                <Sparkles size={17} className="mt-0.5 shrink-0 text-brand-600" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">Tips for a great application</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">
                    Tailor your resume to the skills listed above before applying - recruiters spend
                    seconds scanning for keyword matches.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/dashboard/cvs" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                      Optimize resume for this role →
                    </Link>
                    <Link href="/dashboard/interview-prep" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                      Take interview prep →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {similarJobs && similarJobs.length > 0 && (
              <section className="mt-6">
                <h4 className="font-display text-sm font-bold text-ink-900">Similar roles you might like</h4>
                <div className="mt-3 space-y-2.5">
                  {similarJobs.map((sj) => (
                    <div key={sj._id} className="flex items-center gap-3 rounded-xl border border-ink-100 px-3.5 py-3">
                      {sj.companyLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sj.companyLogoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-ink-100" />
                      ) : (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                          {sj.company?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{sj.title}</p>
                        <p className="truncate text-xs text-ink-500">{sj.company} · {sj.location}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-400">{timeAgo(sj.postedAt)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center gap-3 rounded-xl2 border border-ink-100 bg-ink-50/60 p-4">
              {job.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.companyLogoUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-ink-100" />
              ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-100 text-base font-bold text-brand-700">
                  {job.company?.[0]?.toUpperCase() || '?'}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{job.company}</p>
                <p className="truncate text-xs text-ink-500">{job.location}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenCompany?.(job.company)}
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                View profile <ExternalLink size={12} />
              </button>
            </div>

            <h4 className="mt-5 font-display text-sm font-bold text-ink-900">
              {companyJobs.length > 0 ? `${companyJobs.length} other job${companyJobs.length === 1 ? '' : 's'} at ${job.company}` : 'Other jobs at this company'}
            </h4>

            {companyJobs.length === 0 && (
              <p className="mt-2 text-sm text-ink-500">No other open roles from {job.company} right now.</p>
            )}

            {companyJobs.length > 0 && (
              <div className="mt-3 space-y-2.5">
                {companyJobs.map((cj) => (
                  <div key={cj._id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">{cj.title}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-500">
                        {[cj.employmentType, cj.workMode].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-400">{timeAgo(cj.postedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-ink-100 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600"
          >
            {linkCopied ? <Check size={13} className="text-accent-teal" /> : <Link2 size={13} />}
            {linkCopied ? 'Link copied' : 'Share this job'}
          </button>
        </div>
        {canManage ? (
          <div className="flex items-center gap-3">
            <Button variant="secondary" fullWidth onClick={() => onEdit?.(job)}>
              <Pencil size={15} /> Edit
            </Button>
            <Button variant="danger" fullWidth onClick={() => onDelete?.(job)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant={saved ? 'secondary' : 'ghost'}
              className={saved ? '' : 'border border-ink-200'}
              onClick={() => onToggleSave?.(job)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
            >
              <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            </Button>
            {canApply ? (
              <Button
                fullWidth
                onClick={handleApply}
                isLoading={applyState === 'applying'}
                disabled={applied}
                variant={applied ? 'secondary' : 'primary'}
              >
                {applied ? (
                  <>
                    <CheckCircle2 size={15} /> Applied
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Sign in to apply
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${highlight ? 'border-brand-100 bg-brand-50' : 'border-ink-100 bg-ink-50/60'}`}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-semibold ${highlight ? 'text-brand-700' : 'text-ink-800'}`}>
        {value || '—'}
      </p>
    </div>
  );
}
