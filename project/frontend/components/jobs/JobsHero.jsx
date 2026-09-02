'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, List as ListIcon, MapPin, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { COMPANY_SIZES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, SORT_OPTIONS, WORK_MODES } from './utils';

/**
 * The navy "Let's find your dream job" hero + filter bar from the design.
 * Filters run entirely against the mock dataset in lib/mockJobs.js (see
 * filterJobs in ./utils) - no backend required.
 */
export default function JobsHero({
  totalCount,
  filters,
  onFiltersChange,
  view,
  onViewChange,
  canPostJobs,
  onPostJob,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState(filters.search);
  const [locationInput, setLocationInput] = useState(filters.location);

  // Keep a live ref to the latest committed filters so the debounce effect
  // below never closes over a stale `filters` object.
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Live filtering: apply the keyword/location as the person types, instead
  // of requiring the Search button to be pressed. A short debounce avoids
  // re-filtering on every single keystroke while still feeling instant.
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = filtersRef.current;
      const nextSearch = keywordInput.trim();
      const nextLocation = locationInput.trim();
      if (nextSearch !== current.search || nextLocation !== current.location) {
        onFiltersChange({ ...current, search: nextSearch, location: nextLocation });
      }
    }, 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInput, locationInput]);

  const activeFilterCount = [
    filters.employmentType,
    filters.workMode,
    filters.experienceLevel,
    filters.companySize,
    filters.minSalary,
  ].filter(Boolean).length;

  const submitSearch = (e) => {
    e?.preventDefault();
    onFiltersChange({ ...filters, search: keywordInput.trim(), location: locationInput.trim() });
  };

  const setFilter = (key) => (value) => onFiltersChange({ ...filters, [key]: value });

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      employmentType: '',
      workMode: '',
      experienceLevel: '',
      companySize: '',
      minSalary: '',
      sort: 'newest',
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Discover Jobs</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {typeof totalCount === 'number' ? `${totalCount.toLocaleString()} job` : 'Job'}
            {totalCount === 1 ? '' : 's'} matching your search
          </p>
        </div>
        {canPostJobs && (
          <Button onClick={onPostJob}>
            <Plus size={16} /> Post a Job
          </Button>
        )}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-5 py-6 shadow-panel sm:px-8 sm:py-8">
        {/* decorative diagonal sheen, purely visual - matches the hero artwork in the mockup */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 45%, transparent 60%)',
          }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-white sm:text-xl">
            Let&rsquo;s find your dream job
          </h2>
          {typeof totalCount === 'number' && (
            <p className="text-xs font-medium text-brand-100 sm:text-sm">
              {totalCount.toLocaleString()}+ available job vacancies here
            </p>
          )}
        </div>

        <form onSubmit={submitSearch} className="relative mt-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Job title, company or keyword"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3.5 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-sm focus:border-white/40 focus:bg-white/15"
            />
          </div>
          <div className="relative flex-1">
            <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Location"
              className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3.5 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-sm focus:border-white/40 focus:bg-white/15"
            />
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-label="Toggle filters"
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 transition-colors ${
              panelOpen ? 'bg-white text-brand-700' : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <SlidersHorizontal size={17} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-accent-amber text-[0.6rem] font-bold text-brand-900">
                {activeFilterCount}
              </span>
            )}
          </button>
          <Button type="submit" className="shrink-0  text-brand-700 hover:bg-brand-50">
            Search
          </Button>
        </form>

        {panelOpen && (
          <div className="relative mt-3 grid grid-cols-1 gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-6">
            <FilterSelect
              label="Job Type"
              value={filters.employmentType}
              onChange={setFilter('employmentType')}
              options={EMPLOYMENT_TYPES}
              allLabel="All types"
            />
            <FilterSelect
              label="Experience level"
              value={filters.experienceLevel}
              onChange={setFilter('experienceLevel')}
              options={EXPERIENCE_LEVELS}
              allLabel="All levels"
            />
            <FilterSelect
              label="Work location"
              value={filters.workMode}
              onChange={setFilter('workMode')}
              options={WORK_MODES}
              allLabel="All Locations"
            />
            <div>
              <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-brand-100">
                Min. Salary
              </label>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={filters.minSalary}
                onChange={(e) => setFilter('minSalary')(e.target.value)}
                placeholder="e.g. $100,000"
                className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
              />
            </div>
            <FilterSelect
              label="Company Size"
              value={filters.companySize}
              onChange={setFilter('companySize')}
              options={COMPANY_SIZES}
              allLabel="Any size"
            />
            <FilterSelect
              label="Sort by"
              value={filters.sort}
              onChange={setFilter('sort')}
              options={SORT_OPTIONS.map((o) => o.value)}
              optionLabels={Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, o.label]))}
              allLabel={null}
            />
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="col-span-full flex w-fit items-center gap-1 text-xs font-semibold text-brand-100 hover:text-white"
              >
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {typeof totalCount === 'number' ? `${totalCount.toLocaleString()} job result${totalCount === 1 ? '' : 's'}` : ''}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            className={`grid h-7 w-8 place-items-center rounded-md transition-colors ${
              view === 'grid' ? 'bg-brand-600 text-white' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-pressed={view === 'list'}
            aria-label="List view"
            className={`grid h-7 w-8 place-items-center rounded-md transition-colors ${
              view === 'list' ? 'bg-brand-600 text-white' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            <ListIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel, optionLabels }) {
  return (
    <div>
      <label className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-brand-100">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-white/15 bg-white/10 px-2.5 text-sm text-white outline-none focus:border-white/40 [&>option]:text-ink-900"
      >
        {allLabel !== null && <option value="">{allLabel}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {optionLabels?.[opt] || opt}
          </option>
        ))}
      </select>
    </div>
  );
}
