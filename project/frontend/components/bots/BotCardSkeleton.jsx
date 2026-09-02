export default function BotCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl2 border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-full bg-ink-100" />
        <div className="h-5 w-16 rounded-full bg-ink-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-2/3 rounded bg-ink-100" />
        <div className="h-3 w-1/3 rounded bg-ink-100" />
      </div>
      <div className="mt-5 flex gap-6">
        <div className="h-8 w-10 rounded bg-ink-100" />
        <div className="h-8 w-10 rounded bg-ink-100" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-9 w-9 rounded-lg bg-ink-100" />
        <div className="h-9 flex-1 rounded-full bg-ink-100" />
      </div>
    </div>
  );
}
