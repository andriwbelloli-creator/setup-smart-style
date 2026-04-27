import { Heart, MapPin } from "lucide-react";
import minimal from "@/assets/setup-minimal.jpg";
import gamer from "@/assets/setup-gamer.jpg";
import creator from "@/assets/setup-creator.jpg";
import compact from "@/assets/setup-compact.jpg";
import hero from "@/assets/hero-setup.jpg";
import after from "@/assets/after.jpg";

const setups = [
  { img: hero, name: "Dev Turquesa", author: "@matheus.code", city: "São Paulo, SP", score: 9.1, likes: 842, tag: "Dev" },
  { img: gamer, name: "Cyber Cave", author: "@gabi.streams", city: "Curitiba, PR", score: 8.7, likes: 1240, tag: "Gamer" },
  { img: minimal, name: "White & Clean", author: "@ana.designer", city: "Belo Horizonte, MG", score: 9.4, likes: 980, tag: "Minimal" },
  { img: creator, name: "Creator Studio", author: "@joao.cria", city: "Rio de Janeiro, RJ", score: 8.9, likes: 1560, tag: "Conteúdo" },
  { img: compact, name: "Apê 32m²", author: "@bia.pequena", city: "Porto Alegre, RS", score: 8.3, likes: 612, tag: "Compacto" },
  { img: after, name: "Cozy Wood", author: "@rafa.home", city: "Florianópolis, SC", score: 9.0, likes: 720, tag: "Aconchegante" },
];

const filtros = ["Todos", "Dev", "PO/PM", "Designer", "Gamer", "Conteúdo", "Minimal", "Compacto"];

export function Galeria() {
  return (
    <section id="galeria" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              Comunidade BR
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Inspiração que vem de <span className="text-accent">apartamentos brasileiros</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Chega de referência gringa de mansão. Veja setups reais de devs, designers e criadores em apês de verdade.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {filtros.map((f, i) => (
            <button
              key={f}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                i === 0
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {setups.map((s) => (
            <article
              key={s.name}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={`Setup ${s.name} de ${s.author}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                />
                <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {s.tag}
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-foreground/90 px-3 py-1 text-xs font-bold text-background backdrop-blur">
                  ★ {s.score}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                    <div className="mt-0.5 text-sm text-muted-foreground">{s.author}</div>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground transition-smooth hover:text-coral">
                    <Heart className="h-4 w-4" /> {s.likes}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {s.city}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
