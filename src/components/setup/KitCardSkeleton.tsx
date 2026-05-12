/**
 * Skeleton de KitCard — shimmer placeholder pra grid de /kits (3 cards).
 * Replica o layout do KitCard real pra não causar layout shift.
 */
export function KitCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl border-2 border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-xl bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="mt-4 h-12 animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-16 animate-pulse rounded-2xl bg-secondary" />
      <ul className="mt-5 flex-1 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="h-14 animate-pulse rounded-xl bg-secondary" />
        ))}
      </ul>
      <div className="mt-5 h-10 animate-pulse rounded-full bg-secondary" />
    </div>
  );
}

export function KitCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <KitCardSkeleton key={i} />
      ))}
    </div>
  );
}
