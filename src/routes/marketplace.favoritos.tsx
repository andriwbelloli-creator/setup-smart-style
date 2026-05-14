import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchMySavedListings, type MarketplaceListing } from "@/lib/marketplace";
import { Bookmark, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
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
          <SkeletonGrid count={6} columns="sm:grid-cols-2 xl:grid-cols-3" aspectRatio="4/3" />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nenhum favorito ainda"
            description="Clique no ícone de bookmark nos cards da loja pra salvar os anúncios aqui."
            action={{ label: "Explorar loja", href: "/marketplace" }}
          />
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
