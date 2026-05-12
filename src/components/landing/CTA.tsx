import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero px-8 py-16 text-center text-primary-foreground shadow-elegant md:px-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
          <div className="relative mx-auto max-w-2xl">
            <Sparkles className="mx-auto mb-6 h-10 w-10 text-accent" />
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Pronto pra descobrir a nota do seu setup?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Grátis, sem cadastro. Em 30 segundos você tem análise completa e lista de upgrades por preço de Brasil.
            </p>
            <Link to="/diagnostico" className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-coral transition-smooth hover:scale-105">
              Avaliar meu setup agora <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-xs text-primary-foreground/60">+12.000 brasileiros já avaliaram</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="font-display text-xl font-bold">Deskly</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Feito no Brasil pra quem trabalha de casa. © 2026
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/galeria" className="hover:text-foreground">Galeria</Link>
            <Link to="/kits" className="hover:text-foreground">Kits</Link>
            <Link to="/diagnostico" className="hover:text-foreground">Diagnóstico</Link>
            <Link to="/orcamento" className="hover:text-foreground">Orçamentos</Link>
            <Link to="/consultoria" className="hover:text-foreground">Consultoria</Link>
            <Link to="/comunidade" className="hover:text-foreground">Comunidade</Link>
            <Link to="/premium" className="hover:text-foreground">Premium</Link>
            <Link to="/termos" className="hover:text-foreground">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
