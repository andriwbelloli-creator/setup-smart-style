/**
 * Skeleton card padronizado pra grids de listagem (galeria, marketplace,
 * kits, blog). Usa o utility .skeleton definido em styles.css.
 *
 * Substitui spinners isolados por percepção de velocidade — usuário vê
 * o esqueleto do conteúdo antes do conteúdo chegar.
 */
export function SkeletonCard({ aspectRatio = "16/10" }: { aspectRatio?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="skeleton w-full" style={{ aspectRatio }} />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
        <div className="skeleton h-3 w-2/3 rounded-md" />
      </div>
    </div>
  );
}

/** Grid de N skeletons — pra mostrar enquanto fetch da listagem roda. */
export function SkeletonGrid({
  count = 6,
  columns = "md:grid-cols-2 lg:grid-cols-3",
  aspectRatio = "16/10",
}: {
  count?: number;
  columns?: string;
  aspectRatio?: string;
}) {
  return (
    <div className={`grid gap-5 ${columns}`} role="status" aria-label="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} aspectRatio={aspectRatio} />
      ))}
    </div>
  );
}
