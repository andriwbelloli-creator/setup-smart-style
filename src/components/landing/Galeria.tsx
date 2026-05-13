import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SetupCard } from "@/components/setup/SetupCard";
import { SETUPS, type Setup } from "@/data/setups";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { ArrowRight } from "lucide-react";

const filtros = ["Todos", "Dev", "Designer", "Minimalista", "Gamer", "Creator", "Apê pequeno", "MacBook"];

export function Galeria() {
  const [setups, setSetups] = useState<Setup[]>(SETUPS.slice(0, 6));

  useEffect(() => {
    fetchPublishedSetups()
      .then((rows) => {
        if (rows.length > 0) setSetups([...rows, ...SETUPS].slice(0, 6));
      })
      .catch(() => {});
  }, []);

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
            <Link
              to="/galeria"
              key={f}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                i === 0
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {setups.map((s) => <SetupCard key={s.id} s={s} />)}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-semibold text-background transition-smooth hover:opacity-90"
          >
            Ver galeria completa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
