'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);
const STORAGE_KEY = 'wizjobai_notifications';
const MAX_NOTIFICATIONS = 50;

function makeId() {
  return `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function seedNotifications() {
  const now = Date.now();
  return [
    {
      id: makeId(),
      type: 'system',
      title: 'Welcome to WizJobAI',
      message: 'Complete your profile and add your skills to get better job matches.',
      link: '/dashboard/settings',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    {
      id: makeId(),
      type: 'tip',
      title: 'Sharpen your interview skills',
      message: 'Try a mock interview session in Interview Prep - it only takes a few minutes.',
      link: '/dashboard/interview-prep',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];
}

/**
 * Frontend notification center. Backed by localStorage (mirrors the pattern
 * used by SavedJobsContext) so notifications persist across refreshes and
 * every part of the app - the bell in TopBar, the scheduler, interview prep -
 * reads and writes the same shared list.
 */
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setNotifications(JSON.parse(raw));
      } else {
        setNotifications(seedNotifications());
      }
    } catch {
      setNotifications(seedNotifications());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // storage unavailable (private browsing, quota) - stays in-memory for this session
    }
  }, [notifications, hydrated]);

  const addNotification = useCallback(({ type = 'system', title, message, link } = {}) => {
    if (!title) return;
    setNotifications((prev) => {
      const next = [
        {
          id: makeId(),
          type,
          title,
          message: message || '',
          link: link || null,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
      return next.slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hydrated,
      addNotification,
      markRead,
      markAllRead,
      removeNotification,
      clearAll,
    }),
    [notifications, unreadCount, hydrated, addNotification, markRead, markAllRead, removeNotification, clearAll]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
