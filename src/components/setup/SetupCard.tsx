import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Bookmark, ArrowRight, Trash2, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Setup } from "@/data/setups";
import { useLikes, useSaves } from "@/hooks/use-saved";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { WatermarkOverlay } from "@/components/setup/WatermarkOverlay";
import { ShareButton } from "@/components/setup/ShareButton";

export function SetupCard({
  s,
  featured = false,
  trending,
  onDeleted,
}: {
  s: Setup;
  featured?: boolean;
  /** Quando definido, mostra badge "🔥 N cliques" (uso na galeria ordenada por popular). */
  trending?: number;
  onDeleted?: (id: string) => void;
}) {
  const likes = useLikes();
  const saves = useSaves();
  const liked = likes.has(s.id);
  const saved = saves.has(s.id);
  const { isAdmin } = useIsAdmin();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir o setup "${s.title}"? Esta ação é permanente.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("setups").delete().eq("id", s.id);
    setDeleting(false);
    if (error) {
      toast.error(`Falha ao excluir: ${error.message}`);
      return;
    }
    toast.success("Setup excluído.");
    onDeleted?.(s.id);
  };
  return (
    <Link
      to="/setup/$slug"
      params={{ slug: s.slug }}
      className={`group block overflow-hidden rounded-3xl border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant ${
        featured ? "border-primary/40 ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={s.image}
          alt={`Setup ${s.title} de ${s.author}`}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {typeof trending === "number" && trending > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-coral-foreground shadow-elegant">
              <Flame className="h-3 w-3" /> {trending} {trending === 1 ? "clique" : "cliques"}
            </span>
          )}
          {s.styles.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{t}</span>
          ))}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background backdrop-blur">
          ★ {s.score}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-foreground backdrop-blur">
          R$ {s.budget.toLocaleString("pt-BR")}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-3 top-12 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-elegant transition-smooth hover:scale-110 disabled:opacity-50"
            aria-label={`Excluir setup ${s.title}`}
            title="Excluir setup (admin)"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <WatermarkOverlay />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <div className="mt-0.5 truncate text-sm text-muted-foreground">{s.author} · {s.authorRole}</div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); likes.toggle(s.id); }}
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-smooth hover:text-coral ${liked ? "text-coral" : ""}`}
              aria-label="Curtir"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} /> {s.likes + (liked ? 1 : 0)}
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); saves.toggle(s.id); }}
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-smooth hover:text-primary ${saved ? "text-primary" : ""}`}
              aria-label="Salvar"
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} /> {s.saves + (saved ? 1 : 0)}
            </button>
            <ShareButton
              title={s.title}
              url={typeof window !== "undefined" ? `${window.location.origin}/setup/${s.slug}` : `/setup/${s.slug}`}
              size="icon"
              className="!h-6 !w-6 border border-border"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {s.city}
        </div>
        {featured && (
          <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth group-hover:scale-[1.02]">
            Ver setup completo <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </Link>
  );
}
