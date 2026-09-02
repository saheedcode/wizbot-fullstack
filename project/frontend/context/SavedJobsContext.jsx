'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_JOBS } from '@/lib/mockJobs';

const SavedJobsContext = createContext(null);
const STORAGE_KEY = 'wizjobai_saved_job_ids';

/**
 * Frontend-only "saved jobs" store. Backed by localStorage so bookmarks
 * survive a refresh, and shared through context so every card, the detail
 * panel, and the Saved Jobs tab all read/write the exact same state - no
 * network round-trip, no stale copies.
 */
export function SavedJobsProvider({ children }) {
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client-only - localStorage doesn't exist during SSR).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch {
      // corrupt/missing storage just starts from an empty saved list
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist on every change (after the initial hydration read above).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedIds]));
    } catch {
      // storage can be unavailable (private browsing, quota); saving stays in-memory for this session
    }
  }, [savedIds, hydrated]);

  const isSaved = useCallback((jobId) => savedIds.has(jobId), [savedIds]);

  const saveJob = useCallback((jobId) => {
    setSavedIds((prev) => (prev.has(jobId) ? prev : new Set(prev).add(jobId)));
  }, []);

  const unsaveJob = useCallback((jobId) => {
    setSavedIds((prev) => {
      if (!prev.has(jobId)) return prev;
      const next = new Set(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  const toggleSave = useCallback((jobId) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  // The full job records for everything currently saved, newest-saved-ish
  // (falls back to the dataset's own order) - this is what the Saved Jobs
  // tab renders directly, no fetch required.
  const savedJobs = useMemo(
    () => MOCK_JOBS.filter((job) => savedIds.has(job._id)),
    [savedIds]
  );

  const value = useMemo(
    () => ({ savedIds, savedJobs, isSaved, saveJob, unsaveJob, toggleSave, hydrated }),
    [savedIds, savedJobs, isSaved, saveJob, unsaveJob, toggleSave, hydrated]
  );

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  return ctx;
}
