'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import JobsHero from '@/components/jobs/JobsHero';
import JobResultsPanel from '@/components/jobs/JobResultsPanel';
import JobDetailPanel from '@/components/jobs/JobDetailPanel';
import CompanyDetailModal from '@/components/jobs/CompanyDetailModal';
import { useSavedJobs } from '@/context/SavedJobsContext';
import { getJobById } from '@/lib/mockJobs';

const DEFAULT_FILTERS = {
  search: '',
  location: '',
  employmentType: '',
  workMode: '',
  experienceLevel: '',
  companySize: '',
  minSalary: '',
  sort: 'newest',
};

const TABS = [
  { key: 'search', label: 'Search Jobs' },
  { key: 'saved', label: 'Saved Jobs' },
];

function DiscoverJobsPageInner() {
  const { isSaved, toggleSave } = useSavedJobs();
  const router = useRouter();
  const searchParams = useSearchParams();

  // The sidebar's "Saved jobs" sub-link deep-links here via ?tab=saved, so the
  // tab state is seeded from (and kept in sync with) the URL.
  const initialTab = searchParams?.get('tab') === 'saved' ? 'saved' : 'search';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const urlTab = searchParams?.get('tab') === 'saved' ? 'saved' : 'search';
    setActiveTab((prev) => (prev === urlTab ? prev : urlTab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [view, setView] = useState('grid'); // grid | list
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(null);

  // Selected job (right-hand detail pane) - resolved straight out of the
  // mock dataset, synchronously, no fetch/loading state needed.
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [companyModal, setCompanyModal] = useState(null); // company name | null

  const detailJob = selectedId ? getJobById(selectedId) : null;

  // Deep-link support for "Share this job" links that carry a ?job=<id>
  // param - opens that job's detail pane on load.
  useEffect(() => {
    const jobId = searchParams?.get('job');
    if (!jobId) return;
    setSelectedId(jobId);
    setMobileDetailOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const changeTab = (key) => {
    setActiveTab(key);
    setPage(1);
    setSelectedId(null);
    router.replace(key === 'saved' ? '/dashboard/jobs?tab=saved' : '/dashboard/jobs');
  };

  const handleSelect = (job) => {
    setSelectedId(job._id);
    setMobileDetailOpen(true);
  };

  const handleResultsMeta = (meta) => {
    setTotalCount(meta?.total ?? null);
  };

  const handleToggleSave = (job) => toggleSave(job._id);

  const closeMobileDetail = () => setMobileDetailOpen(false);

  const query = {
    ...filters,
    page,
  };

  return (
    <DashboardShell title="Job Search">
      <JobsHero
        totalCount={totalCount}
        filters={filters}
        onFiltersChange={changeFilters}
        view={view}
        onViewChange={setView}
        canPostJobs={false}
      />

      <div className="mb-5 flex gap-1 rounded-xl border border-ink-100 bg-white p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => changeTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${
              activeTab === t.key ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0">
          <JobResultsPanel
            limit={12}
            query={query}
            view={view}
            savedOnly={activeTab === 'saved'}
            selectedId={selectedId}
            onSelect={handleSelect}
            onMetaChange={handleResultsMeta}
            onPageChange={setPage}
            onOpenCompany={setCompanyModal}
          />
        </div>

        {/* Desktop detail pane - always visible, sits beside the results */}
        <div className="hidden overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-soft lg:block">
          <div className="h-full max-h-[calc(100vh-14rem)] overflow-hidden">
            <JobDetailPanel
              job={detailJob}
              saved={detailJob ? isSaved(detailJob._id) : false}
              onToggleSave={handleToggleSave}
              canManage={false}
              onOpenCompany={setCompanyModal}
            />
          </div>
        </div>
      </div>

      {/* Mobile detail sheet */}
      {mobileDetailOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close job details"
            onClick={closeMobileDetail}
            className="absolute inset-0 animate-fade-in bg-ink-900/50 backdrop-blur-[2px]"
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-lg animate-slide-in-right flex-col bg-white shadow-panel">
            <JobDetailPanel
              job={detailJob}
              saved={detailJob ? isSaved(detailJob._id) : false}
              onToggleSave={handleToggleSave}
              canManage={false}
              onOpenCompany={setCompanyModal}
              onClose={closeMobileDetail}
              showCloseButton
            />
          </div>
        </div>
      )}

      <CompanyDetailModal
        company={companyModal}
        onClose={() => setCompanyModal(null)}
        onSelectJob={(job) => {
          setSelectedId(job._id);
          setMobileDetailOpen(true);
        }}
      />
    </DashboardShell>
  );
}

export default function DiscoverJobsPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverJobsPageInner />
    </Suspense>
  );
}
