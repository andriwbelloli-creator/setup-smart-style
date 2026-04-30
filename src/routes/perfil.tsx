import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedSetups, rowToSetup } from "@/lib/setups-db";
import { SetupCard } from "@/components/setup/SetupCard";
import type { Setup } from "@/data/setups";
import { Loader2, Upload, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil · Deskly" }] }),
  component: Perfil,
});

function Perfil() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [mySetups, setMySetups] = useState<Setup[]>([]);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [tab, setTab] = useState<"meus" | "salvos" | "perfil">("meus");
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
          .from("setups").select("*, profiles!setups_owner_id_fkey(username, display_name, avatar_url)")
          .in("id", ids);
        setSavedSetups((saved || []).map((r: any) => rowToSetup(r)));
      } else {
        setSavedSetups([]);
      }
      setLoading(false);
    })();
  }, [user]);

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

        <div className="mb-8 flex gap-2 border-b border-border">
          {(["meus", "salvos", "perfil"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold capitalize transition-smooth ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t === "meus" ? `Meus setups (${mySetups.length})` : t === "salvos" ? `Salvos (${savedSetups.length})` : "Editar perfil"}
            </button>
          ))}
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