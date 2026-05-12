/**
 * Skeleton de SetupCard — shimmer placeholder enquanto a galeria carrega.
 * Dimensões idênticas ao SetupCard real (aspect 4/3 + 5 linhas de meta)
 * pra evitar layout shift.
 */
export function SetupCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="relative aspect-[4/3] animate-pulse bg-secondary" />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-10 animate-pulse rounded-full bg-secondary" />
            <div className="h-4 w-10 animate-pulse rounded-full bg-secondary" />
          </div>
        </div>
        <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

export function SetupCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SetupCardSkeleton key={i} />
      ))}
    </div>
  );
}
