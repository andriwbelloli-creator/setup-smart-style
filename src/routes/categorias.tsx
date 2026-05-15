import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { SETUPS } from "@/data/setups";
import {
  Sparkles,
  Gamepad2,
  Zap,
  Home,
  Wallet,
  Laptop,
  Code,
  Palette,
  Video,
  Layers,
  ArrowRight,
} from "lucide-react";

// Cada categoria mapeia pra um style do enum STYLES (em src/data/setups.ts).
// Click → /galeria?style=<slug> abre galeria já filtrada.
const CATEGORIES: {
  style: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
}[] = [
  {
    style: "Minimalista",
    title: "Minimalista",
    description: "Clean, paleta neutra, sem excessos. Pra quem foca no essencial.",
    icon: Layers,
    color: "from-primary/10 to-primary/5 border-primary/20",
  },
  {
    style: "Produtivo",
    title: "Produtivo",
    description: "Ergonomia + organização. Pra longas horas de trabalho focado.",
    icon: Zap,
    color: "from-accent/10 to-accent/5 border-accent/20",
  },
  {
    style: "Gamer",
    title: "Gamer",
    description: "RGB, ergonomia agressiva, periféricos de alto desempenho.",
    icon: Gamepad2,
    color: "from-coral/10 to-coral/5 border-coral/30",
  },
  {
    style: "Apê pequeno",
    title: "Apê pequeno",
    description: "Soluções inteligentes pra kitnet, varanda ou quarto-sala.",
    icon: Home,
    color: "from-primary/10 to-accent/5 border-primary/20",
  },
  {
    style: "Setup barato",
    title: "Setup barato",
    description: "Resultados bons com orçamento apertado. Até R$ 2.500.",
    icon: Wallet,
    color: "from-coral/10 to-primary/5 border-coral/20",
  },
  {
    style: "MacBook",
    title: "MacBook",
    description: "Setup pra quem trabalha em macOS. Dock, suporte, monitor 4K.",
    icon: Laptop,
    color: "from-primary/10 to-primary/5 border-primary/20",
  },
  {
    style: "Dev",
    title: "Dev",
    description: "Code-focused: ultrawide, teclado mecânico, headset pra calls.",
    icon: Code,
    color: "from-primary/10 to-primary/5 border-primary/20",
  },
  {
    style: "Designer",
    title: "Designer",
    description: "Color-accurate, Wacom, plantas, paleta inspiradora.",
    icon: Palette,
    color: "from-accent/10 to-accent/5 border-accent/20",
  },
  {
    style: "Creator",
    title: "Creator",
    description: "Câmera, microfone, ring light, painéis acústicos.",
    icon: Video,
    color: "from-coral/10 to-coral/5 border-coral/30",
  },
];

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias de setup · HomeOfficeLife" },
      {
        name: "description",
        content:
          "Explore setups de home office por categoria: minimalista, produtivo, gamer, apê pequeno, dev, designer, creator e mais.",
      },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  // Conta quantos setups têm cada style (counts em paralelo)
  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.style] = SETUPS.filter((s) => s.styles.includes(c.style)).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Explorar por categoria
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Encontre o setup que combina com{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">você</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {SETUPS.length} setups da comunidade BR organizados por perfil e necessidade.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = counts[c.style] ?? 0;
            return (
              <Link
                key={c.style}
                to="/galeria"
                search={{ style: c.style } as never}
                className={`group flex flex-col rounded-3xl border-2 bg-gradient-to-br p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant ${c.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-soft">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {count} {count === 1 ? "setup" : "setups"}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold leading-tight">
                  {c.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Ver setups <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA final */}
        <div className="mt-16 rounded-3xl border border-border bg-card p-8 text-center shadow-soft md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Não achou o que procura?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Envie a foto do seu setup e a IA brasileira sugere ajustes baseados nos 6 critérios.
            Resultado em 30 segundos.
          </p>
          <Link
            to="/diagnostico"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm font-bold text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" /> Avaliar meu setup
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
