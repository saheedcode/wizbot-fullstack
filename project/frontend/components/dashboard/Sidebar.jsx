'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/lib/api';
import { GET_STARTED_ITEM, NAV_ITEMS, HELP_CENTER_ITEM } from './navConfig';

function hrefParts(href) {
  const [path, query] = href.split('?');
  return { path, query: query || '' };
}

function isActive(pathname, searchTab, item) {
  const { path, query } = hrefParts(item.href);
  if (item.exact) {
    if (query) {
      const params = new URLSearchParams(query);
      return pathname === path && searchTab === (params.get('tab') || '');
    }
    return pathname === path && !searchTab;
  }
  if (query) {
    const params = new URLSearchParams(query);
    return pathname === path && searchTab === params.get('tab');
  }
  return pathname.startsWith(path);
}

function isGroupActive(pathname, searchTab, item) {
  if (isActive(pathname, searchTab, item)) return true;
  return (item.children || []).some((child) => isActive(pathname, searchTab, child));
}

/** Small pill shown next to a nav label - used for the live Application Tracker count. */
function NavBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-auto grid h-5 min-w-[1.25rem] shrink-0 place-items-center rounded-full bg-brand-600 px-1 text-[0.65rem] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function NavLink({ item, active, collapsed, badge, onNavigate }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        collapsed ? 'justify-center' : ''
      } ${
        active
          ? 'bg-brand-50 text-brand-700'
          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
      }`}
    >
      {Icon && <Icon size={18} className={active ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600'} />}
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && <NavBadge count={badge} />}
    </Link>
  );
}

/** An expandable nav row (e.g. "Discover Jobs") with a chevron and sub-links. */
function NavGroup({ item, active, collapsed, badge, onNavigate, pathname, searchTab }) {
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const Icon = item.icon;

  if (collapsed) {
    // Collapsed rail: just navigate to the group's primary href, no flyout.
    return <NavLink item={item} active={active} collapsed badge={badge} onNavigate={onNavigate} />;
  }

  return (
    <div>
      <div
        className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
          active ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
        }`}
      >
        <Link href={item.href} onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
          {Icon && <Icon size={18} className={active ? 'text-brand-600' : 'text-ink-400'} />}
          <span className="truncate">{item.label}</span>
          <NavBadge count={badge} />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
          aria-expanded={open}
          className="mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-white hover:text-ink-700"
        >
          <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="ml-[1.65rem] mt-1 space-y-0.5 border-l border-ink-100 pl-3.5">
          {item.children.map((child) => {
            const childActive = isActive(pathname, searchTab, child);
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.83rem] font-medium transition-colors ${
                  childActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {ChildIcon && <ChildIcon size={14} className={childActive ? 'text-brand-600' : 'text-ink-400'} />}
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar content shared by the desktop rail and the mobile drawer. `collapsed`
 * only applies on desktop - the mobile drawer always renders expanded.
 */
function SidebarContent({ collapsed, onNavigate, badges }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTab = searchParams?.get('tab') || '';
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center px-2' : ''}`}>
        <Link href="/dashboard/settings" onClick={onNavigate} className="shrink-0">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-1 ring-ink-100"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </Link>
        {!collapsed && (
          <Link href="/dashboard/settings" onClick={onNavigate} className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name || 'Your account'}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </Link>
        )}
      </div>

      <div className="mx-4 border-t border-dashed border-ink-100" />

      <div className="px-3 pt-3">
        <Link
          href={GET_STARTED_ITEM.href}
          onClick={onNavigate}
          title={collapsed ? GET_STARTED_ITEM.label : undefined}
          className={`flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 ${
            collapsed ? 'justify-center' : ''
          } ${isActive(pathname, searchTab, GET_STARTED_ITEM) ? 'ring-2 ring-brand-200' : ''}`}
        >
          <GET_STARTED_ITEM.icon size={18} className="text-brand-600" />
          {!collapsed && <span className="truncate">{GET_STARTED_ITEM.label}</span>}
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <NavGroup
              key={item.href}
              item={item}
              active={isGroupActive(pathname, searchTab, item)}
              collapsed={collapsed}
              badge={item.badgeKey ? badges?.[item.badgeKey] : undefined}
              onNavigate={onNavigate}
              pathname={pathname}
              searchTab={searchTab}
            />
          ) : (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, searchTab, item)}
              collapsed={collapsed}
              badge={item.badgeKey ? badges?.[item.badgeKey] : undefined}
              onNavigate={onNavigate}
            />
          )
        )}
      </nav>

      <div className="mx-4 border-t border-dashed border-ink-100" />

      <div className="p-3">
        <Link
          href={HELP_CENTER_ITEM.href}
          onClick={onNavigate}
          title={collapsed ? HELP_CENTER_ITEM.label : undefined}
          className={`flex items-center gap-3 rounded-xl bg-brand-50/70 px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <HelpCenterIcon />
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate">
              {HELP_CENTER_ITEM.label}
              <span className="block truncate text-xs font-normal text-brand-500/80">Answers here</span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

function HelpCenterIcon() {
  const Icon = HELP_CENTER_ITEM.icon;
  return <Icon size={18} className="shrink-0 text-brand-600" />;
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = usePersistentCollapse();
  const badges = useLiveBadges();

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-ink-100 bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[4.75rem]' : 'w-72'
        }`}
      >
        <div className="flex w-full flex-col">
          <div className={`flex items-center px-4 pt-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <Link href="/">
                <Logo />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
          <SidebarContent collapsed={collapsed} badges={badges} />
        </div>
      </aside>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={onCloseMobile}
            className="absolute inset-0 animate-fade-in bg-ink-900/40"
          />
          <div className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs animate-slide-in-left flex-col bg-white shadow-panel">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
              <Logo />
              <button
                type="button"
                onClick={onCloseMobile}
                className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent collapsed={false} onNavigate={onCloseMobile} badges={badges} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Persists the desktop collapsed/expanded state across visits. Falls back to
// expanded on the server and on first client render to avoid a hydration
// mismatch, then syncs from localStorage right after mount.
function usePersistentCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('wizjobai_sidebar_collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('wizjobai_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  return [collapsed, setCollapsed];
}

// Powers the small live count badges in the nav (currently just the
// Application Tracker's "interviews in progress" count) from the same
// analytics endpoint the Overview page already uses.
function useLiveBadges() {
  const { isAuthenticated } = useAuth();
  const [badges, setBadges] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    analyticsApi
      .dashboard()
      .then((res) => {
        if (cancelled) return;
        const metrics = res.data?.metrics;
        if (metrics) setBadges({ interviews: metrics.interviews });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return badges;
}
