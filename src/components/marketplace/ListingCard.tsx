import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Tag, ImageOff, Bookmark } from "lucide-react";
import { toast } from "sonner";
import type { MarketplaceListing } from "@/lib/marketplace";
import { formatBrl, toggleSaveListing } from "@/lib/marketplace";
import { useAuth } from "@/hooks/use-auth";

type Props = {
  l: MarketplaceListing;
  saved?: boolean;
  onSaveToggle?: (id: string, nowSaved: boolean) => void;
};

export function ListingCard({ l, saved = false, onSaveToggle }: Props) {
  const { user } = useAuth();
  const [optimisticSaved, setOptimisticSaved] = useState(saved);
  const [busy, setBusy] = useState(false);

  const cover = l.images?.[0];
  const inactive = l.status !== "active";

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Faça login pra salvar anúncios");
      return;
    }
    setBusy(true);
    const nowSaved = !optimisticSaved;
    setOptimisticSaved(nowSaved);
    const { error } = await toggleSaveListing(user.id, l.id, optimisticSaved);
    setBusy(false);
    if (error) {
      setOptimisticSaved(optimisticSaved);
      toast.error(error.message);
      return;
    }
    onSaveToggle?.(l.id, nowSaved);
  };

  return (
    <Link
      to="/marketplace/$id"
      params={{ id: l.id }}
      className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={l.title}
            loading="lazy"
            className={`h-full w-full object-cover transition-smooth group-hover:scale-105 ${inactive ? "opacity-60" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        {l.condition?.name && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <Tag className="h-3 w-3" /> {l.condition.name}
          </span>
        )}

        {inactive && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/85 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-background backdrop-blur">
            {l.status === "sold" ? "Vendido" : "Pausado"}
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          aria-label={optimisticSaved ? "Remover dos favoritos" : "Favoritar anúncio"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-elegant backdrop-blur transition-smooth hover:scale-105 disabled:opacity-50"
        >
          <Bookmark className={`h-4 w-4 ${optimisticSaved ? "fill-primary text-primary" : ""}`} />
        </button>

        <div className="absolute bottom-3 right-3 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background backdrop-blur">
          {formatBrl(Number(l.price))}
        </div>
      </div>
      <div className="p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {l.category?.name ?? "Sem categoria"}
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-tight line-clamp-2">{l.title}</h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {(l.city || l.state) && (
            <>
              <MapPin className="h-3 w-3" />
              <span className="truncate">{[l.city, l.state].filter(Boolean).join(", ")}</span>
            </>
          )}
          {l.seller?.display_name && (
            <span className="ml-auto truncate">por {l.seller.display_name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
