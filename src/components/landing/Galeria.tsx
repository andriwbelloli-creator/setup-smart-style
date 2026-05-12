import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SetupCard } from "@/components/setup/SetupCard";
import { SETUPS, type Setup } from "@/data/setups";
import { fetchPublishedSetups } from "@/lib/setups-db";
import { ArrowRight } from "lucide-react";

const filtros = ["Todos", "Dev", "Designer", "Minimalista", "Gamer", "Creator", "Apê pequeno", "MacBook"];

export function Galeria() {
  // 4 cards no desktop (1 linha) — compactação UX pós-auditoria.
  // Scroll horizontal no mobile pra não estourar vertical.
  const [setups, setSetups] = useState<Setup[]>(SETUPS.slice(0, 4));

  useEffect(() => {
    fetchPublishedSetups()
      .then((rows) => {
        if (rows.length > 0) setSetups([...rows, ...SETUPS].slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="galeria" className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              Comunidade BR
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Inspiração de <span className="text-accent">apartamentos brasileiros</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Setups reais de devs, designers e criadores em apês de verdade.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filtros.map((f, i) => (
            <Link
              to="/galeria"
              key={f}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-smooth ${
                i === 0
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>

        {/* Desktop: grid 1 linha × 4 cols. Mobile: scroll horizontal. */}
        <div className="mt-6 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
          {setups.map((s) => <SetupCard key={s.id} s={s} />)}
        </div>
        <div className="mt-6 -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 md:hidden">
          {setups.map((s) => (
            <div key={s.id} className="w-[78%] flex-shrink-0">
              <SetupCard s={s} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/galeria"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-smooth hover:opacity-90"
          >
            Ver galeria completa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
