import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Logo />
        <p className="text-sm text-ink-400">© {new Date().getFullYear()} WizJobAI. All rights reserved.</p>
        <div className="flex gap-5 text-sm text-ink-600">
          <Link href="/privacy" className="hover:text-brand-600">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-brand-600">
            Terms and conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
