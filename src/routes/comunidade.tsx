import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { SetupCard } from "@/components/setup/SetupCard";
import { type Setup } from "@/data/setups";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Heart, Bookmark, TrendingUp, Users, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade · HomeOffice.life" },
      { name: "description", content: "Comunidade brasileira de devs, designers e profissionais remotos compartilhando setups, dicas e transformações." },
      { property: "og:title", content: "Comunidade HomeOffice.life" },
      { property: "og:description", content: "Brasileiros trocando experiência sobre home office." },
    ],
  }),
  component: Comunidade,
});

type Stats = { members: number; setups: number; comments: number; avgBudget: number };
type TopUser = { username: string; display_name: string; avatar_url: string | null; count: number };

function fmtBRL(v: number): string {
  return v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;
}

function fmtRel(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const CAREER_LABEL: Record<string, string> = {
  dev: "Dev", designer: "Designer", pm: "PO/PM", creator: "Creator", remoto: "Remoto", outro: "Outro",
};

function Comunidade() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hot, setHot] = useState<Setup[]>([]);
  const [recent, setRecent] = useState<Setup[]>([]);
  const [top, setTop] = useState<TopUser[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      const all = await fetchPublishedSetups();
      if (!active) return;
      const sorted = [...all];
      setHot(sorted.sort((a, b) => b.likes - a.likes).slice(0, 4));
      setRecent(all.slice(0, 3));

      // Stats
      const [{ count: memberCount }, { count: commentCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
      ]);
      const avg = all.length ? Math.round(all.reduce((s, x) => s + x.budget, 0) / all.length) : 0;
      if (active) {
        setStats({
          members: memberCount ?? 0,
          setups: all.length,
          comments: commentCount ?? 0,
          avgBudget: avg,
        });
      }

      // Top contributors: group by author username
      const counts = new Map<string, { user: string; count: number }>();
      for (const s of all) {
        const key = s.author || "—";
        const cur = counts.get(key);
        if (cur) cur.count++;
        else counts.set(key, { user: key, count: 1 });
      }
      const topUsernames = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 3);
      if (topUsernames.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url")
          .in("username", topUsernames.map((t) => t.user));
        if (active) {
          setTop(
            topUsernames.map((t) => {
              const p = profs?.find((pr: any) => pr.username === t.user);
              return {
                username: t.user,
                display_name: p?.display_name || t.user,
                avatar_url: p?.avatar_url ?? null,
                count: t.count,
              };
            }),
          );
        }
      }
    })().catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            <Users className="h-3 w-3" /> Comunidade BR
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Devs, designers e remotos trocando setup
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Peça opinião antes de comprar, mostre transformação, descubra o que funciona em apê brasileiro de verdade.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: stats?.members ?? "—", l: "Membros" },
            { v: stats?.setups ?? "—", l: "Setups publicados" },
            { v: stats?.comments ?? "—", l: "Comentários" },
            { v: stats ? fmtBRL(stats.avgBudget) : "—", l: "Investimento médio" },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="font-display text-3xl font-bold">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Discussions: top setups by likes */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Setups em alta</h2>
            </div>
            <div className="space-y-3">
              {hot.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  Carregando setups da semana…
                </div>
              ) : (
                hot.map((s) => (
                  <Link key={s.id} to="/setup/$slug" params={{ slug: s.slug || s.id }} className="block">
                    <article className="rounded-3xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">@{s.author}</span>
                        <span>· {CAREER_LABEL[s.authorRole] || s.authorRole}</span>
                        <span>· {fmtRel(s.createdAt)}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                      <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {s.likes}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Ver discussão</span>
                        <span className="flex items-center gap-1.5"><Bookmark className="h-4 w-4" /> {s.saves}</span>
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Leaderboard */}
          <aside>
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl font-bold">Top contribuidores</h2>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              {top.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem contribuidores ainda.</p>
              ) : (
                <ol className="space-y-4">
                  {top.map((u, i) => (
                    <li key={u.username} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero font-display text-base font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{u.display_name}</div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                      <div className="font-display text-sm font-bold text-primary">{u.count} setup{u.count > 1 ? "s" : ""}</div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
              <h3 className="font-display text-xl font-bold">Pronto pra entrar?</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Poste seu setup, ganhe selo e ajude outros brasileiros a montar um home office melhor.
              </p>
              <Link to="/postar" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:scale-105">
                Postar meu setup
              </Link>
            </div>
          </aside>
        </div>

        {/* Recent uploads */}
        <section className="mt-16">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">Postados recentemente</h2>
            <Link to="/galeria" className="text-sm font-semibold text-primary">Ver tudo →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Sem setups ainda. Seja o primeiro a postar!
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((s) => <SetupCard key={s.id} s={s} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
