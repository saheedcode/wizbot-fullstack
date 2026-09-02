'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SchedulerContext = createContext(null);
const STORAGE_KEY = 'wizjobai_scheduled_interviews';

function makeId() {
  return `intv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Frontend-only interview scheduler store (same localStorage-backed pattern
 * as SavedJobsContext / NotificationsContext). Every scheduled interview has
 * a date + time so it can be sorted into upcoming/past and rendered on the
 * scheduler's calendar and list views.
 */
export function SchedulerProvider({ children }) {
  const [interviews, setInterviews] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setInterviews(JSON.parse(raw));
    } catch {
      // corrupt/missing storage just starts empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
    } catch {
      // storage unavailable - stays in-memory for this session
    }
  }, [interviews, hydrated]);

  const scheduleInterview = useCallback((data) => {
    const entry = {
      id: makeId(),
      jobTitle: data.jobTitle?.trim() || 'Interview',
      company: data.company?.trim() || '',
      date: data.date, // 'YYYY-MM-DD'
      time: data.time || '', // 'HH:mm'
      type: data.type || 'Video call',
      location: data.location?.trim() || '',
      notes: data.notes?.trim() || '',
      status: 'upcoming', // upcoming | completed | cancelled
      createdAt: new Date().toISOString(),
    };
    setInterviews((prev) =>
      [...prev, entry].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    );
    return entry;
  }, []);

  const updateInterview = useCallback((id, patch) => {
    setInterviews((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, ...patch } : i))
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    );
  }, []);

  const cancelInterview = useCallback(
    (id) => updateInterview(id, { status: 'cancelled' }),
    [updateInterview]
  );

  const completeInterview = useCallback(
    (id) => updateInterview(id, { status: 'completed' }),
    [updateInterview]
  );

  const deleteInterview = useCallback((id) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () =>
      interviews.filter((i) => i.status === 'upcoming' && `${i.date}` >= todayStr),
    [interviews, todayStr]
  );

  const past = useMemo(
    () =>
      interviews.filter((i) => i.status !== 'upcoming' || `${i.date}` < todayStr),
    [interviews, todayStr]
  );

  const value = useMemo(
    () => ({
      interviews,
      upcoming,
      past,
      hydrated,
      scheduleInterview,
      updateInterview,
      cancelInterview,
      completeInterview,
      deleteInterview,
    }),
    [interviews, upcoming, past, hydrated, scheduleInterview, updateInterview, cancelInterview, completeInterview, deleteInterview]
  );

  return <SchedulerContext.Provider value={value}>{children}</SchedulerContext.Provider>;
}

export function useScheduler() {
  const ctx = useContext(SchedulerContext);
  if (!ctx) throw new Error('useScheduler must be used within a SchedulerProvider');
  return ctx;
}
