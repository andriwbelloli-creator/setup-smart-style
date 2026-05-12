import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedSetups, rowToSetup } from "@/lib/setups-db";
import { SetupCard } from "@/components/setup/SetupCard";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchMyListings, fetchMyOffers, formatBrl, updateOfferStatus, type MarketplaceListing, type MarketplaceOffer } from "@/lib/marketplace";
import type { Setup } from "@/data/setups";
import { Loader2, Upload, Pencil, Trash2, Download, AlertTriangle, LogOut, ShoppingBag, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil · HomeOfficeLife" }] }),
  component: Perfil,
});

function Perfil() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [mySetups, setMySetups] = useState<Setup[]>([]);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [myOffers, setMyOffers] = useState<MarketplaceOffer[]>([]);
  const [tab, setTab] = useState<"meus" | "salvos" | "anuncios" | "propostas" | "perfil">("meus");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [{ data: prof }, { data: mine }, { data: savesRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("setups").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("saves").select("setup_id").eq("user_id", user.id),
      ]);
      setProfile(prof);
      setDisplayName(prof?.display_name || "");
      setBio(prof?.bio || "");
      setMySetups((mine || []).map((r: any) => rowToSetup({ ...r, profiles: prof })));
      const ids = (savesRows || []).map((r: any) => r.setup_id);
      if (ids.length) {
        const { data: saved } = await supabase
          .from("setups").select("*")
          .in("id", ids);
        const ownerIds = Array.from(new Set(((saved as any[]) || []).map((r) => r.owner_id).filter(Boolean)));
        const { data: profs } = ownerIds.length
          ? await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", ownerIds)
          : { data: [] as any[] };
        const byId = new Map<string, any>(((profs as any[]) || []).map((p) => [p.id, p]));
        setSavedSetups(((saved as any[]) || []).map((r) => rowToSetup({ ...r, profiles: byId.get(r.owner_id) ?? null })));
      } else {
        setSavedSetups([]);
      }
      // Marketplace: meus anúncios + propostas que enviei
      const [listings, offers] = await Promise.all([
        fetchMyListings(user.id),
        fetchMyOffers(user.id),
      ]);
      setMyListings(listings);
      setMyOffers(offers);
      setLoading(false);
    })();
  }, [user]);

  const withdrawOffer = async (offerId: string) => {
    if (!confirm("Cancelar esta proposta?")) return;
    const { error } = await updateOfferStatus(offerId, "withdrawn");
    if (error) return toast.error(error.message);
    setMyOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: "withdrawn" } : o)));
    toast.success("Proposta cancelada.");
  };

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: displayName, bio }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado!");
    setProfile({ ...profile, display_name: displayName, bio });
    setEditing(false);
  };

  const deleteSetup = async (id: string) => {
    if (!confirm("Apagar este setup?")) return;
    const { error } = await supabase.from("setups").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setMySetups((prev) => prev.filter((s) => s.id !== id));
    toast.success("Setup removido");
  };

  const exportData = async () => {
    if (!user) return;
    toast.info("Preparando seus dados...");
    const [{ data: prof }, { data: setups }, { data: comments }, { data: likes }, { data: saves }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("setups").select("*, setup_images(*), setup_products(*)").eq("owner_id", user.id),
      supabase.from("comments").select("*").eq("author_id", user.id),
      supabase.from("likes").select("*").eq("user_id", user.id),
      supabase.from("saves").select("*").eq("user_id", user.id),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email, created_at: user.created_at },
      profile: prof,
      setups, comments, likes, saves,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `homeofficelife-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados baixados!");
  };

  const signOutAllDevices = async () => {
    if (!confirm("Encerrar sessão em TODOS os dispositivos conectados? Você será deslogado aqui também.")) return;
    // Supabase global scope revoga refresh tokens em todas as sessões do user
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) { toast.error(error.message); return; }
    toast.success("Sessões encerradas em todos dispositivos.");
    navigate({ to: "/" });
  };

  const deleteAccount = async () => {
    if (!user) return;
    const typed = prompt(`Para confirmar a exclusão permanente da sua conta e de todos os seus dados, digite seu e-mail (${user.email}):`);
    if (typed !== user.email) {
      if (typed !== null) toast.error("E-mail não confere. Cancelado.");
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Sessão expirada. Faça login novamente."); return; }
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) { toast.error("Falha ao excluir conta: " + error.message); return; }
    toast.success("Conta excluída. Adeus!");
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (authLoading || !user) return <div className="min-h-screen bg-background"><Navbar /><div className="container py-32 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero text-2xl font-bold text-primary-foreground shadow-elegant">
                {(profile?.display_name || user.email || "?")[0].toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">{profile?.display_name || "Sem nome"}</h1>
                <div className="text-sm text-muted-foreground">@{profile?.username} · {user.email}</div>
              </div>
            </div>
            {profile?.bio && <p className="mt-4 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>}
          </div>
          <Button asChild className="gap-2 bg-gradient-hero shadow-elegant"><Link to="/postar"><Upload className="h-4 w-4" /> Postar setup</Link></Button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-border">
          {(["meus", "salvos", "anuncios", "propostas", "perfil"] as const).map((t) => {
            const label =
              t === "meus" ? `Meus setups (${mySetups.length})` :
              t === "salvos" ? `Salvos (${savedSetups.length})` :
              t === "anuncios" ? `Meus anúncios (${myListings.length})` :
              t === "propostas" ? `Propostas (${myOffers.length})` :
              "Editar perfil";
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-smooth ${
                  tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : tab === "meus" ? (
          mySetups.length === 0 ? (
            <Empty msg="Você ainda não postou nenhum setup." cta />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mySetups.map((s) => (
                <div key={s.id} className="relative">
                  <SetupCard s={s} />
                  <button onClick={() => deleteSetup(s.id)} className="absolute right-3 top-3 z-10 rounded-full bg-card/95 p-2 text-coral shadow-elegant backdrop-blur hover:bg-coral hover:text-coral-foreground" aria-label="Apagar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : tab === "salvos" ? (
          savedSetups.length === 0 ? (
            <Empty msg="Nenhum setup salvo ainda. Explore a galeria!" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedSetups.map((s) => <SetupCard key={s.id} s={s} />)}
            </div>
          )
        ) : tab === "anuncios" ? (
          myListings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-semibold">Nenhum anúncio ainda</h3>
              <p className="mt-1 text-sm text-muted-foreground">Venda equipamentos que não usa mais — sem taxa pra anunciar.</p>
              <Button asChild className="mt-5 bg-gradient-hero"><Link to="/marketplace/anunciar">Anunciar produto</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Gerencie status, pause ou marque como vendido no detalhe de cada anúncio.</p>
                <Button asChild size="sm" className="bg-gradient-hero"><Link to="/marketplace/anunciar">+ Novo anúncio</Link></Button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((l) => <ListingCard key={l.id} l={l} />)}
              </div>
            </div>
          )
        ) : tab === "propostas" ? (
          myOffers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
              <Send className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-semibold">Nenhuma proposta enviada</h3>
              <p className="mt-1 text-sm text-muted-foreground">Encontrou algo interessante no Marketplace? Faça uma oferta.</p>
              <Button asChild className="mt-5 bg-gradient-hero"><Link to="/marketplace">Explorar marketplace</Link></Button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {myOffers.map((o) => {
                const statusLabel: Record<typeof o.status, string> = {
                  pending: "Pendente", accepted: "Aceita pelo vendedor!", rejected: "Recusada", withdrawn: "Cancelada por você",
                };
                const statusColor: Record<typeof o.status, string> = {
                  pending: "bg-secondary text-foreground",
                  accepted: "bg-primary/15 text-primary",
                  rejected: "bg-coral/15 text-coral",
                  withdrawn: "bg-muted text-muted-foreground",
                };
                return (
                  <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link to="/marketplace/$id" params={{ id: o.listing_id }} className="font-semibold hover:underline">
                          {o.listing?.title || "Anúncio"}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Preço pedido: {o.listing ? formatBrl(Number(o.listing.price)) : "—"}
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">Sua oferta:</span>
                          <span className="font-display text-lg font-bold">{formatBrl(Number(o.price_offered))}</span>
                        </div>
                        {o.message && (
                          <p className="mt-2 text-sm italic text-muted-foreground">"{o.message}"</p>
                        )}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor[o.status]}`}>
                        {statusLabel[o.status]}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Enviada em {new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                      {o.status === "pending" && (
                        <button onClick={() => withdrawOffer(o.id)} className="font-semibold text-coral hover:underline">
                          Cancelar proposta
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="max-w-xl rounded-3xl border border-border bg-card p-6 shadow-soft">
            <Field label="Nome de exibição">
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Field label="Bio">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={4}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Button onClick={saveProfile} className="mt-4 gap-2 bg-gradient-hero"><Pencil className="h-4 w-4" /> Salvar alterações</Button>

            <div className="mt-10 border-t border-border pt-6">
              <h3 className="font-display text-base font-bold">Privacidade e dados (LGPD)</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Você pode baixar todos os dados que mantemos sobre você, ou excluir sua conta permanentemente.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={exportData} className="gap-2">
                  <Download className="h-4 w-4" /> Baixar meus dados (JSON)
                </Button>
                <Button variant="outline" onClick={signOutAllDevices} className="gap-2">
                  <LogOut className="h-4 w-4" /> Sair de todos os dispositivos
                </Button>
                <Button
                  variant="outline"
                  onClick={deleteAccount}
                  className="gap-2 border-coral/40 text-coral hover:bg-coral/5 hover:text-coral"
                >
                  <AlertTriangle className="h-4 w-4" /> Excluir minha conta
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                A exclusão é permanente e remove seus setups, comentários, curtidas e saves em até 30 dias (alguns logs técnicos podem ser retidos por exigência fiscal).
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4"><div className="mb-2 text-sm font-semibold">{label}</div>{children}</div>;
}

function Empty({ msg, cta }: { msg: string; cta?: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
      <p className="text-muted-foreground">{msg}</p>
      {cta && <Button asChild className="mt-4 bg-gradient-hero"><Link to="/postar">Postar meu primeiro setup</Link></Button>}
    </div>
  );
}