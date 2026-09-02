'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  CheckCheck,
  ChevronDown,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationsContext';

const TYPE_ICON = {
  interview: Calendar,
  tip: MessageSquare,
  system: Megaphone,
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function NotificationsMenu() {
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return undefined;
    const onClickAway = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClickAway);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleSelect = (n) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 flex max-h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] animate-fade-up flex-col overflow-hidden rounded-xl2 border border-ink-100 bg-white shadow-panel"
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-ink-500">You&rsquo;re all caught up.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Megaphone;
                return (
                  <div
                    key={n.id}
                    role="menuitem"
                    className={`group flex gap-3 border-b border-ink-50 px-4 py-3 last:border-0 hover:bg-ink-50 ${
                      n.read ? '' : 'bg-brand-50/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(n)}
                      className="flex flex-1 gap-3 text-left"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-ink-900">{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                        </span>
                        {n.message && <span className="mt-0.5 block text-xs text-ink-500">{n.message}</span>}
                        <span className="mt-1 block text-[0.7rem] text-ink-400">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNotification(n.id)}
                      aria-label="Dismiss notification"
                      className="h-fit shrink-0 rounded-md p-1 text-ink-300 opacity-0 hover:bg-ink-100 hover:text-ink-600 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ title, onOpenMobileNav, onRequestLogout }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClickAway = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClickAway);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <h1 className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink-900 sm:text-lg">
        {title}
      </h1>

      <NotificationsMenu />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-ink-100"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Account menu"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
          <ChevronDown size={15} className="hidden text-ink-400 sm:block" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 w-56 animate-fade-up rounded-xl2 border border-ink-100 bg-white p-1.5 shadow-panel"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
              <p className="truncate text-xs text-ink-400">{user?.email}</p>
            </div>
            <div className="mx-1 my-1 border-t border-ink-100" />
            <Link
              href="/dashboard/settings"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              <Settings size={16} className="text-ink-400" /> Profile Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onRequestLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
