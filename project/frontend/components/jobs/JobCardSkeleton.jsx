export default function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl2 border border-ink-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-ink-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded bg-ink-100" />
          <div className="h-3 w-1/2 rounded bg-ink-100" />
        </div>
      </div>
      <div className="mt-4 h-3 w-2/3 rounded bg-ink-100" />
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-ink-100" />
        <div className="h-5 w-16 rounded-full bg-ink-100" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-ink-100" />
    </div>
  );
}
