import {
  Search,
  LayoutGrid,
  FileText,
  BarChart3,
  Bot,
  ListChecks,
  MessageSquare,
  Calendar,
  Settings,
  HelpCircle,
  Rocket,
  Bookmark,
  UserCircle,
  UserCog,
} from 'lucide-react';

// The "Get Started" entry is a standalone highlighted CTA pinned above the
// main nav list (matches the pill treatment in the product mockups).
export const GET_STARTED_ITEM = {
  href: '/dashboard/get-started',
  label: 'Get Started',
  icon: Rocket,
};

// Sidebar sections for the authenticated dashboard shell, in display order.
// `href` is the route each item links to; `exact` means it should only be
// highlighted as active on an exact pathname match (used for the dashboard
// home route so nested /dashboard/* pages don't also light it up).
//
// `children`, when present, renders the item as an expandable group (see
// Discover Jobs below) - `active` for the parent row is true whenever the
// current path matches the parent OR any child href.
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid, exact: true },
  {
    href: '/dashboard/jobs',
    label: 'Discover Jobs',
    icon: Search,
    children: [
      { href: '/dashboard/jobs', label: 'Search for jobs', exact: true },
      { href: '/dashboard/jobs?tab=saved', label: 'Saved jobs', icon: Bookmark },
    ],
  },
  { href: '/dashboard/wizbot', label: 'Manage Wizbot', icon: Bot },
  { href: '/dashboard/cvs', label: 'My Resume', icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  {
    href: '/dashboard/tracker',
    label: 'Application Tracker',
    icon: ListChecks,
    // Resolved at render time in Sidebar from live analytics data - shows the
    // number of applications currently sitting in the "interview" stage.
    badgeKey: 'interviews',
  },
  { href: '/dashboard/interview-prep', label: 'Interview Prep', icon: MessageSquare },
  { href: '/dashboard/schedule', label: 'Scheduler', icon: Calendar },
  {
    href: '/dashboard/settings',
    label: 'Profile',
    icon: UserCircle,
    children: [
      { href: '/dashboard/settings', label: 'Profile Settings', icon: Settings, exact: true },
      { href: '/dashboard/settings/edit', label: 'Edit Profile', icon: UserCog },
    ],
  },
];

export const HELP_CENTER_ITEM = { href: '/dashboard/help', label: 'Help Center', icon: HelpCircle };
