import Link from 'next/link';
import { ArrowRight, Bot, MessageSquareText, Wand2 } from 'lucide-react';

const ACTIONS = [
  {
    href: '/dashboard/wizbot',
    label: 'Auto-Apply',
    description: 'Manage your AI job application bots',
    icon: Bot,
  },
  {
    href: '/dashboard/cvs',
    label: 'Create Resume',
    description: 'Get AI-powered suggestions, or optimize an existing one.',
    icon: Wand2,
  },
  {
    href: '/dashboard/interview-prep',
    label: 'Interview Prep',
    description: 'Practice with AI-powered interview simulations',
    icon: MessageSquareText,
  },
];

export default function QuickActions() {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft transition-shadow hover:shadow-panel"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-900">{action.label}</p>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
