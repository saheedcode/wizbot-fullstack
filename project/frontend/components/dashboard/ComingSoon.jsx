import Link from 'next/link';
import { Construction } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Construction size={22} />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-ink-600">{description}</p>
      <Link href="/dashboard" className="mt-6">
        <Button variant="secondary">Back to Overview</Button>
      </Link>
    </div>
  );
}
