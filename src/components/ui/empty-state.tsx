import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Empty state padronizado — usa em listas vazias, busca sem resultados,
 * páginas pendentes de conteúdo. Visualmente coerente com cards da plataforma.
 *
 * Exemplo:
 *   <EmptyState
 *     icon={ImageOff}
 *     title="Nenhum setup encontrado"
 *     description="Os filtros atuais não retornaram resultados. Tente soltar."
 *     action={{ label: "Limpar filtros", onClick: clearFilters }}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`rounded-3xl border border-dashed border-border bg-card p-10 text-center md:p-14 ${className}`}
    >
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      )}
      <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild>
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
