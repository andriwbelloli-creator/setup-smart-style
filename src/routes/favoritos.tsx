import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { SetupCard } from "@/components/setup/SetupCard";
import { SetupCardSkeletonGrid } from "@/components/setup/SetupCardSkeleton";
import { useAuth } from "@/hooks/use-auth";
import { useSaves } from "@/hooks/use-saved";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { SETUPS, type Setup } from "@/data/setups";
import { Bookmark, Loader2, ArrowLeftRight } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos · Deskly" },
      { name: "description", content: "Setups que você salvou pra inspirar seu próximo upgrade." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const saves = useSaves();
  const [allSetups, setAllSetups] = useState<Setup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    fetchPublishedSetups()
      .then((rows) => setAllSetups([...rows, ...SETUPS]))
      .catch(() => setAllSetups([...SETUPS]))
      .finally(() => setLoading(false));
  }, []);

  const saved = allSetups.filter((s) => saves.has(s.id));

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Bookmark className="h-3 w-3" /> Favoritos
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Seus setups salvos
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {saved.length === 0
              ? "Você ainda não salvou nenhum setup. Explore a galeria e clique no marcador 📑 dos que te inspirarem."
              : `${saved.length} setup${saved.length === 1 ? "" : "s"} pra inspirar seu próximo upgrade.`}
          </p>
          {saved.length >= 2 && (
            <Link
              to="/comparar"
              search={{ setups: `${saved[0].slug},${saved[1].slug}` }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90"
            >
              <ArrowLeftRight className="h-4 w-4" /> Comparar dois favoritos
            </Link>
          )}
        </div>

        {loading ? (
          <SetupCardSkeletonGrid count={6} />
        ) : saved.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-bold">Sua coleção está vazia</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Setups salvos ficam aqui pra você revisitar, comparar e voltar quando estiver montando o seu.
            </p>
            <Link
              to="/galeria"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-smooth hover:opacity-90"
            >
              Explorar galeria →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => (
              <SetupCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
