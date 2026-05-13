import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { AnaliseIA } from "@/components/landing/AnaliseIA";
import { Sparkles, ShieldCheck, Zap, ListChecks } from "lucide-react";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico IA do seu setup · Deskly" },
      { name: "description", content: "Envie a foto do seu home office e receba nota e sugestões de ergonomia, iluminação, cabos, organização e produtividade." },
      { property: "og:title", content: "Diagnóstico IA do seu setup" },
      { property: "og:description", content: "Avaliação completa em 30 segundos, com sugestões de produtos brasileiros." },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-gradient-mesh">
          <div className="container mx-auto px-4 py-16 text-center md:px-6 md:py-24">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Diagnóstico por IA — grátis · login obrigatório
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Descubra a nota do seu home office em <span className="bg-gradient-warm bg-clip-text text-transparent">30 segundos</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Envie uma foto, receba análise por critério e uma lista de upgrades com produtos disponíveis no Brasil.
            </p>
          </div>
        </section>

        <AnaliseIA />

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-center font-display text-3xl font-bold tracking-tight md:text-4xl">Como funciona</h2>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
              {[
                { icon: Zap, title: "Envie sua foto", text: "Tire uma foto da sua mesa em ângulo aberto. Funciona com celular." },
                { icon: ShieldCheck, title: "IA analisa 6 critérios", text: "Ergonomia, iluminação, cabos, organização, estética e produtividade." },
                { icon: ListChecks, title: "Receba sugestões", text: "Lista de upgrades com produtos reais e preços de Amazon BR, ML, Kabum." },
              ].map((s, i) => (
                <div key={s.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Etapa {i + 1}</div>
                  <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
