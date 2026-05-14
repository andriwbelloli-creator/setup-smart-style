import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchMySavedListings, type MarketplaceListing } from "@/lib/marketplace";
import { Loader2, Bookmark, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/marketplace/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos · Loja · home office live" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MarketplaceFavoritos,
});

function MarketplaceFavoritos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Faça login para ver favoritos");
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchMySavedListings(user.id)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à Loja
        </Link>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Bookmark className="h-3 w-3" /> Favoritos
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Anúncios que você salvou
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-lg font-semibold">Nenhum favorito ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique no ícone de bookmark nos cards do marketplace pra salvar os anúncios aqui.
            </p>
            <Button asChild className="mt-5 bg-gradient-hero">
              <Link to="/marketplace">Explorar marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} l={l} saved />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
