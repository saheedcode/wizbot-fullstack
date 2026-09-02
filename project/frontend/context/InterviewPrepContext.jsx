'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const InterviewPrepContext = createContext(null);
const STORAGE_KEY = 'wizjobai_interview_sessions';

function makeId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Tracks completed mock-interview practice sessions so the Interview Prep
 * page can show real progress (streaks, categories practiced, confidence
 * trend) instead of being a dead end. localStorage-backed, same pattern as
 * SavedJobsContext.
 */
export function InterviewPrepProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSessions(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // storage unavailable - stays in-memory for this session
    }
  }, [sessions, hydrated]);

  const recordSession = useCallback((session) => {
    const entry = {
      id: makeId(),
      categoryKey: session.categoryKey,
      categoryLabel: session.categoryLabel,
      totalQuestions: session.totalQuestions,
      confidentCount: session.confidentCount,
      completedAt: new Date().toISOString(),
    };
    setSessions((prev) => [entry, ...prev].slice(0, 100));
    return entry;
  }, []);

  const clearHistory = useCallback(() => setSessions([]), []);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
    const totalConfident = sessions.reduce((sum, s) => sum + (s.confidentCount || 0), 0);
    const byCategory = {};
    sessions.forEach((s) => {
      byCategory[s.categoryKey] = (byCategory[s.categoryKey] || 0) + 1;
    });
    const confidencePct = totalQuestions > 0 ? Math.round((totalConfident / totalQuestions) * 100) : null;
    return { totalSessions, totalQuestions, totalConfident, confidencePct, byCategory };
  }, [sessions]);

  const value = useMemo(
    () => ({ sessions, stats, hydrated, recordSession, clearHistory }),
    [sessions, stats, hydrated, recordSession, clearHistory]
  );

  return <InterviewPrepContext.Provider value={value}>{children}</InterviewPrepContext.Provider>;
}

export function useInterviewPrep() {
  const ctx = useContext(InterviewPrepContext);
  if (!ctx) throw new Error('useInterviewPrep must be used within an InterviewPrepProvider');
  return ctx;
}
