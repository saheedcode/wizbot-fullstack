'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Close the drawer on route change, and lock body scroll while it's open.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="WizJobAI home">
          <Logo />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-brand-600 ${
                pathname === link.href ? 'text-brand-600' : 'text-ink-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-600"
              >
                <LayoutDashboard size={16} />
                {user?.name?.split(' ')[0] || 'Dashboard'}
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="h-9 px-4">
                <LogOut size={15} /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-brand-600">
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="h-9 px-4">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile drawer + backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 animate-fade-in bg-ink-900/40"
          />
          <div className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm animate-slide-in-right flex-col bg-white shadow-panel">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-100"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-3 text-[0.95rem] font-medium ${
                    pathname === link.href ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-[0.95rem] font-medium text-ink-700 hover:bg-ink-50"
                >
                  <LayoutDashboard size={17} /> Dashboard
                </Link>
              )}
            </div>

            <div className="border-t border-ink-100 p-4">
              {isAuthenticated ? (
                <Button variant="secondary" fullWidth onClick={handleLogout}>
                  <LogOut size={16} /> Log out
                </Button>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link href="/signup">
                    <Button fullWidth>Sign up</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" fullWidth>
                      Sign in
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
