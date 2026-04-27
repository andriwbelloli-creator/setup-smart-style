import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Bookmark } from "lucide-react";
import type { Setup } from "@/data/setups";
import { useLikes, useSaves } from "@/hooks/use-saved";

export function SetupCard({ s }: { s: Setup }) {
  const likes = useLikes();
  const saves = useSaves();
  const liked = likes.has(s.id);
  const saved = saves.has(s.id);
  return (
    <Link
      to="/setup/$slug"
      params={{ slug: s.slug }}
      className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={s.image}
          alt={`Setup ${s.title} de ${s.author}`}
          loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
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
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {s.city}
        </div>
      </div>
    </Link>
  );
}
