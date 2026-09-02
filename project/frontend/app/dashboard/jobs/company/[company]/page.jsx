'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Briefcase, Building2, Clock, Globe2, MapPin } from 'lucide-react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import JobCard from '@/components/jobs/JobCard';
import { useSavedJobs } from '@/context/SavedJobsContext';
import { getJobsByCompany } from '@/lib/mockJobs';
import { companyBannerUrl, timeAgo } from '@/components/jobs/utils';

/**
 * The Company profile page: a photographic banner + logo, aggregate stats
 * derived from that company's mock postings (open roles, locations, most
 * common work mode), and the full list of open roles - each using the same
 * JobCard as Discover Jobs, save button included.
 *
 * Discover Jobs itself now opens company details in a modal
 * (see CompanyDetailModal); this page stays around so a direct/shared link
 * to a company still resolves to something real.
 */
export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyName = decodeURIComponent(params.company || '');
  const { savedIds, toggleSave } = useSavedJobs();

  const jobs = useMemo(() => getJobsByCompany(companyName), [companyName]);
  const companySize = jobs[0]?.companySize;

  const stats = useMemo(() => {
    if (jobs.length === 0) return null;
    const locations = new Set(jobs.map((j) => j.location).filter(Boolean));
    const modeCounts = jobs.reduce((acc, j) => {
      if (j.workMode) acc[j.workMode] = (acc[j.workMode] || 0) + 1;
      return acc;
    }, {});
    const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostRecent = jobs.reduce(
      (latest, j) => (!latest || new Date(j.postedAt) > new Date(latest) ? j.postedAt : latest),
      null
    );
    return {
      openRoles: jobs.length,
      locationCount: locations.size,
      locations: [...locations].slice(0, 3),
      topMode,
      mostRecent,
    };
  }, [jobs]);

  const openJob = (job) => router.push(`/dashboard/jobs?job=${job._id}`);

  return (
    <DashboardShell title="Company Profile">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Banner + identity card */}
      <div className="overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-soft">
        <div className="relative h-40 w-full overflow-hidden bg-ink-100 sm:h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={companyBannerUrl(companyName, { width: 1200, height: 320 })}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-ink-900/5 to-transparent" />
        </div>

        <div className="relative flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:px-8">
          <span className="-mt-10 grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-100 text-2xl font-bold text-brand-700 shadow-panel">
            {companyName?.[0]?.toUpperCase() || '?'}
          </span>

          <div className="min-w-0 flex-1 pt-2">
            <h1 className="truncate font-display text-2xl font-bold text-ink-900">{companyName}</h1>
            {stats && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <Briefcase size={14} /> {stats.openRoles} open role{stats.openRoles === 1 ? '' : 's'}
                </span>
                {companySize && (
                  <span className="flex items-center gap-1">{companySize} employees</span>
                )}
                {stats.locations.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {stats.locations.join(', ')}
                    {stats.locationCount > stats.locations.length ? ` +${stats.locationCount - stats.locations.length}` : ''}
                  </span>
                )}
                {stats.topMode && (
                  <span className="flex items-center gap-1">
                    <Globe2 size={14} /> Mostly {stats.topMode}
                  </span>
                )}
                {stats.mostRecent && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Last posted {timeAgo(stats.mostRecent)}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">
            Open roles {jobs.length > 0 ? `(${jobs.length})` : ''}
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-50 text-ink-400">
              <Building2 size={20} />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-ink-900">No open roles right now</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-600">
              {companyName} doesn&apos;t have any active postings on WizJobAI at the moment. Check back soon.
            </p>
            <Link href="/dashboard/jobs" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
              <Bookmark size={14} /> Browse other jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                saved={savedIds.has(job._id)}
                onSavedChange={(id) => toggleSave(id)}
                onOpen={openJob}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
