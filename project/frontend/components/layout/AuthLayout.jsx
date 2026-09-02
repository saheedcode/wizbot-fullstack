import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function AuthLayout({ children, title, subtitle, footer, wide = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="WizJobAI home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 sm:flex">
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <Link href="/about" className="hover:text-brand-600">
              About
            </Link>
            <Link href="/contact" className="hover:text-brand-600">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-ink-600 hover:text-brand-600">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-3.5 py-2 font-semibold text-white hover:bg-brand-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} animate-fade-up`}>
          <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-panel sm:p-9">
            {(title || subtitle) && (
              <div className="mb-7 text-center">
                {title && <h1 className="font-display text-2xl font-bold text-ink-900">{title}</h1>}
                {subtitle && <p className="mt-2 text-sm text-ink-600">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
          {footer && <div className="mt-5 text-center text-sm text-ink-600">{footer}</div>}
        </div>
      </main>

      <footer className="border-t border-ink-100 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-ink-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} WizJobAI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink-600">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-ink-600">
              Terms and conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
