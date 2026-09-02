import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Your AI job search co-pilot
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            Find, tailor, and apply — faster.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-600 sm:text-lg">
            WizJobAI reads your resume, understands your goals, and matches you with roles worth applying to.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button className="h-12 px-7 text-base">Get started free</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="h-12 px-7 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
