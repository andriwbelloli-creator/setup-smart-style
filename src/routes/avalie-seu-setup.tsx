import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Star, Upload, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { NewsletterCapture } from "@/components/NewsletterCapture";

// Landing dedicada para campanhas pagas (Meta Ads / Google Ads).
// Diferenças vs home:
// - Sem Navbar (zero distração — só CTA principal)
// - Sem links pra outras seções
// - Single-page focada em 1 conversão: /diagnostico
// - Newsletter capture como soft conversion (caso não converta direto)
// - UTM-friendly URL (pode usar ?utm_source=meta&utm_campaign=xxx)
export const Route = createFileRoute("/avalie-seu-setup")({
  head: () => ({
    meta: [
      { title: "Avalie seu setup com IA · HomeOffice.life" },
      { name: "description", content: "Envie a foto do seu home office e em 30 segundos receba nota de ergonomia, iluminação, organização e sugestões de upgrade com preço real BR. Grátis." },
      { property: "og:title", content: "Sua mesa de R$ 8 ou R$ 8 mil? A IA da HomeOffice.life te diz." },
      { property: "og:description", content: "Análise grátis. 6 critérios. Produtos da Amazon BR, ML, Kabum e Magalu." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://homeoffice.life/og-image.jpg" },
    ],
  }),
  component: AvalieSeuSetup,
});

function AvalieSeuSetup() {
  return (
    <div className="min-h-screen bg-background">
      {/* Logo simples no topo, sem nav completo */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">HomeOffice.life</span>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero — single column, focused */}
        <section className="bg-gradient-mesh">
          <div className="container mx-auto px-4 py-16 text-center md:px-6 md:py-24">
            <div className="mx-auto max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
                <Zap className="h-3 w-3" /> Análise por IA · grátis
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Quanto vale o seu{" "}
                <span className="bg-gradient-warm bg-clip-text text-transparent">home office</span>?
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
                Envie 1 foto e em 30 segundos a IA te dá nota de ergonomia,
                iluminação e organização. Mais sugestões de upgrade com produtos reais BR.
              </p>

              <Link
                to="/diagnostico"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-hero px-10 py-5 text-lg font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-glow hover:scale-105"
              >
                <Upload className="h-5 w-5" />
                Enviar foto do meu setup
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                Sem cartão. Sem cadastro obrigatório. 30 segundos.
              </p>

              {/* Social proof */}
              <div className="mx-auto mt-12 flex max-w-md flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="ml-1 font-semibold">4.9</span>
                </div>
                <div>
                  <span className="font-display text-xl font-bold">12k+</span>{" "}
                  <span className="text-muted-foreground">setups avaliados</span>
                </div>
                <div>
                  <span className="font-display text-xl font-bold">3.4k</span>{" "}
                  <span className="text-muted-foreground">brasileiros</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 features */}
        <section className="border-t border-border bg-background py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <Feature
                icon={Sparkles}
                title="6 critérios técnicos"
                description="Ergonomia, iluminação, cabos, organização, estética e produtividade — pontuados de 0 a 10."
              />
              <Feature
                icon={ShieldCheck}
                title="Produtos reais BR"
                description="Recomendações com preço de Amazon BR, Mercado Livre, Kabum e Magalu — não US$ random."
              />
              <Feature
                icon={CheckCircle2}
                title="Sem cilada"
                description="Não vendemos sua foto. Não treinamos IA com ela. Análise em 30 segundos, resultado seu pra sempre."
              />
            </div>
          </div>
        </section>

        {/* Repeat CTA */}
        <section className="border-t border-border bg-gradient-mesh py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Tira foto. Manda. Recebe a nota.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mais simples impossível. Sua mesa merece um diagnóstico honesto.
            </p>
            <Link
              to="/diagnostico"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-semibold text-background shadow-elegant transition-smooth hover:opacity-90"
            >
              <Upload className="h-5 w-5" />
              Começar agora · grátis
            </Link>
          </div>
        </section>

        {/* Newsletter capture pra quem não converteu */}
        <section className="border-t border-border bg-background py-16">
          <div className="container mx-auto max-w-2xl px-4 md:px-6">
            <NewsletterCapture
              source="ad_landing_avalie"
              variant="card"
              title="Não tá pronto pra mandar a foto?"
              subtitle="Deixa seu email e te mandamos exemplos antes/depois de setups reais. 1x/semana, sem spam."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-cream py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 HomeOffice.life · Feito no Brasil ·{" "}
          <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          {" · "}
          <Link to="/termos" className="hover:text-foreground">Termos</Link>
        </p>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: typeof Sparkles; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
