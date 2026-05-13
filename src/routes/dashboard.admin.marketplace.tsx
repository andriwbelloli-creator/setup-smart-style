import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Trash2, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/marketplace")({
  head: () => ({
    meta: [
      { title: "Moderação Marketplace · Admin · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMarketplace,
});

type Listing = {
  id: string;
  title: string;
  price: number | string;
  status: "active" | "paused" | "sold" | "removed";
  seller_id: string;
  created_at: string;
  category_slug?: string | null;
  seller_name?: string;
};

function AdminMarketplace() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "not-mine">("not-mine");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!adminLoading && !isAdmin && user) navigate({ to: "/" });
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("marketplace_listings")
        .select("id, title, price, status, seller_id, created_at, category_slug")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const rows: Listing[] = data || [];
      // Hidrata nomes dos sellers
      const sellerIds = Array.from(new Set(rows.map((l) => l.seller_id)));
      const { data: profs } = await (supabase as any)
        .from("profiles")
        .select("id, display_name, username")
        .in("id", sellerIds);
      const nameMap: Record<string, string> = {};
      for (const p of (profs || []) as any[]) {
        nameMap[p.id] = p.display_name || p.username || p.id.slice(0, 8);
      }
      setListings(rows.map((l) => ({ ...l, seller_name: nameMap[l.seller_id] || l.seller_id.slice(0, 8) })));
      setLoading(false);
    })();
  }, [isAdmin]);

  const filtered = filter === "not-mine"
    ? listings.filter((l) => l.seller_id !== user?.id)
    : listings;

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const includesMine = filtered.some((l) => selected.has(l.id) && l.seller_id === user?.id);
    const warning = includesMine
      ? "⚠️ A seleção inclui anúncios SEUS. Tem certeza?"
      : `Excluir ${selected.size} anúncio(s) permanentemente? Esta ação é IRREVERSÍVEL.`;
    if (!confirm(warning)) return;
    setDeleting(true);
    const ids = Array.from(selected);
    const { error } = await (supabase as any)
      .from("marketplace_listings")
      .delete()
      .in("id", ids);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} anúncio(s) excluído(s).`);
    setListings(listings.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
  };

  if (authLoading || adminLoading || (!isAdmin && user)) {
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
      <main className="container mx-auto px-4 py-10 md:px-6">
        <Link to="/dashboard/admin" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao admin
        </Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
              <Shield className="h-3 w-3" /> Admin · Moderação
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Marketplace — todos os anúncios
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Total: <strong>{listings.length}</strong> · Mostrando <strong>{filtered.length}</strong> · Selecionados: <strong>{selected.size}</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-full bg-card p-1 shadow-soft">
              <button
                onClick={() => { setFilter("not-mine"); setSelected(new Set()); }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${filter === "not-mine" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                Só de outros
              </button>
              <button
                onClick={() => { setFilter("all"); setSelected(new Set()); }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-smooth ${filter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                Todos
              </button>
            </div>
            <Button
              onClick={deleteSelected}
              disabled={selected.size === 0 || deleting}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir {selected.size > 0 ? `(${selected.size})` : "selecionados"}
            </Button>
          </div>
        </div>

        {filter === "not-mine" && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              Mostrando apenas anúncios que <strong>NÃO são seus</strong>. Use "Selecionar tudo" + "Excluir" pra limpar dados fake.
              Mude pro filtro "Todos" se quiser ver os seus também.
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
            <p className="text-sm text-muted-foreground">Sem anúncios neste filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Vendedor</th>
                  <th className="p-3 text-right">Preço</th>
                  <th className="p-3">Criado</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const isMine = l.seller_id === user?.id;
                  return (
                    <tr key={l.id} className={`border-b border-border/40 last:border-0 ${isMine ? "bg-primary/5" : ""}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(l.id)}
                          onChange={() => toggleOne(l.id)}
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="p-3">
                        <Link
                          to="/marketplace/$id"
                          params={{ id: l.id }}
                          className="font-medium text-foreground hover:underline"
                        >
                          {l.title}
                        </Link>
                        {isMine && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">SEU</span>}
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          l.status === "active" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                          l.status === "paused" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                          l.status === "sold" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{l.seller_name}</td>
                      <td className="p-3 text-right font-semibold">R$ {Number(l.price).toLocaleString("pt-BR")}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm(`Excluir "${l.title}"?`)) return;
                            const { error } = await (supabase as any)
                              .from("marketplace_listings")
                              .delete()
                              .eq("id", l.id);
                            if (error) return toast.error(error.message);
                            toast.success("Excluído.");
                            setListings(listings.filter((x) => x.id !== l.id));
                          }}
                          className="text-destructive hover:text-destructive/80"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
