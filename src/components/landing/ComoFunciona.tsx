import { Link } from "@tanstack/react-router";
import { Camera, Send, Handshake, Sparkles, Search, Plus } from "lucide-react";

// Como funciona — 3 passos pro Marketplace + 3 jeitos de usar a plataforma.
// Pensado pra reduzir fricção mental "como funciona isso?".
const STEPS_VENDER = [
  { icon: Camera, title: "Fotografe", text: "Tire 1-6 fotos do seu equipamento. Descreva o estado." },
  { icon: Send,   title: "Receba propostas", text: "Compradores enviam ofertas com mensagem direta." },
  { icon: Handshake, title: "Combine e venda", text: "Aceita a melhor proposta, combina a entrega." },
];

const STEPS_COMPRAR = [
  { icon: Search, title: "Explore", text: "Filtre por categoria, condição, faixa de preço." },
  { icon: Send, title: "Faça proposta", text: "Mande sua oferta com mensagem. Sem pressão pra fechar." },
  { icon: Handshake, title: "Combine direto", text: "Vendedor aceita, vocês finalizam a venda." },
];

export function ComoFunciona() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Como funciona
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Sem taxa, sem complicação
          </h2>
          <p className="mt-3 text-muted-foreground">
            Anunciar é grátis. Comprar e vender é direto entre você e a comunidade.
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
          {/* Vender */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Plus className="h-3 w-3" /> Vender
            </div>
            <h3 className="font-display text-2xl font-bold">Em 3 passos, seu equipamento anunciado</h3>
            <ol className="mt-6 space-y-5">
              {STEPS_VENDER.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-primary">{i + 1}</span>
                      {s.title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              to="/marketplace/anunciar"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-smooth"
            >
              Anunciar meu produto →
            </Link>
          </div>

          {/* Comprar */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
              <Search className="h-3 w-3" /> Comprar
            </div>
            <h3 className="font-display text-2xl font-bold">Encontre, proponha, leva pra casa</h3>
            <ol className="mt-6 space-y-5">
              {STEPS_COMPRAR.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      <span className="mr-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">{i + 1}</span>
                      {s.title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              to="/marketplace"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-smooth"
            >
              Explorar anúncios →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
