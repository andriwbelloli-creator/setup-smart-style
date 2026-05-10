import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { SetupCard } from "@/components/setup/SetupCard";
import { SETUPS } from "@/data/setups";
import { MessageCircle, Heart, Bookmark, TrendingUp, Users, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade · Deskly" },
      { name: "description", content: "Comunidade brasileira de devs, designers e profissionais remotos compartilhando setups, dicas e transformações." },
      { property: "og:title", content: "Comunidade Deskly" },
      { property: "og:description", content: "3.4k brasileiros trocando experiência sobre home office." },
    ],
  }),
  component: Comunidade,
});

const discussions = [
  { user: "@matheus.code", role: "Dev", title: "Vale a pena trocar 2 monitores 24\" por 1 ultrawide 34\"?", replies: 42, hearts: 128, time: "2h" },
  { user: "@ana.designer", role: "Designer", title: "Iluminação CRI alto pra trabalhar com cor: o que vocês usam?", replies: 31, hearts: 89, time: "5h" },
  { user: "@bia.pequena", role: "Remoto", title: "Setup em apê de 32m² sem furar parede — gambiarras que funcionam", replies: 67, hearts: 240, time: "1d" },
  { user: "@rafa.home", role: "PO/PM", title: "Cadeira até R$ 1.5k que aguenta 8h de call: alguma indicação?", replies: 54, hearts: 176, time: "1d" },
];

const top = [
  { user: "@gabi.streams", points: 2840, badge: "Mestre dos cabos" },
  { user: "@matheus.code", points: 2210, badge: "Guru ergonômico" },
  { user: "@ana.designer", points: 1980, badge: "Curadora de luz" },
];

function Comunidade() {
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
            { v: "3.4k", l: "Membros ativos" },
            { v: "12k", l: "Setups postados" },
            { v: "48k", l: "Comentários" },
            { v: "R$ 1.8k", l: "Investimento médio" },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="font-display text-3xl font-bold">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Discussions */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl font-bold">Discussões em alta</h2>
            </div>
            <div className="space-y-3">
              {discussions.map((d) => (
                <article key={d.title} className="rounded-3xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{d.user}</span>
                    <span>· {d.role}</span>
                    <span>· há {d.time}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{d.title}</h3>
                  <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {d.hearts}</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {d.replies} respostas</span>
                    <span className="flex items-center gap-1.5"><Bookmark className="h-4 w-4" /> Salvar</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Leaderboard */}
          <aside>
            <div className="mb-5 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl font-bold">Top contribuidores</h2>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <ol className="space-y-4">
                {top.map((u, i) => (
                  <li key={u.user} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-hero font-display text-base font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{u.user}</div>
                      <div className="text-xs text-muted-foreground">{u.badge}</div>
                    </div>
                    <div className="font-display text-sm font-bold text-primary">{u.points}</div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
              <h3 className="font-display text-xl font-bold">Pronto pra entrar?</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Poste seu setup, ganhe selo e desbloqueie a consultoria com IA premium.
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SETUPS.slice(0, 3).map((s) => <SetupCard key={s.id} s={s} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
