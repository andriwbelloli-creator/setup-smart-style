import { Link } from "@tanstack/react-router";
import { Crown, ArrowRight, Check } from "lucide-react";
import { NewsletterCapture } from "@/components/NewsletterCapture";

// CTA final reformulado pós-auditoria: foco em conversão Premium ao invés
// de repetir o pitch da IA (já abordado no Hero + AnaliseIA). Free → Pago.
export function CTA() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero px-6 py-12 text-center text-primary-foreground shadow-elegant md:px-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
          <div className="relative mx-auto max-w-2xl">
            <Crown className="mx-auto mb-4 h-10 w-10 text-accent" />
            <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              Faça mais do seu home office com Premium
            </h2>
            <p className="mt-3 text-base text-primary-foreground/85 md:text-lg">
              Análises ilimitadas, plano de ação detalhado e lista de compras priorizada.
              A partir de <strong className="text-accent">R$ 19/mês</strong>.
            </p>

            <ul className="mx-auto mt-6 max-w-md space-y-1.5 text-left text-sm text-primary-foreground/85">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                Análises ilimitadas (free é 3 lifetime)
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                Plano de ação detalhado + lista de compras
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                Suporte de consultoria 1:1 (Enterprise)
              </li>
            </ul>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/premium" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold text-accent-foreground shadow-coral transition-smooth hover:scale-105">
                <Crown className="h-4 w-4" /> Assinar Premium
              </Link>
              <Link to="/diagnostico" className="text-sm font-semibold text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline">
                Quero testar grátis primeiro →
              </Link>
            </div>
            <p className="mt-3 text-xs text-primary-foreground/60">Cancele a qualquer momento · Sem fidelidade</p>
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
        <div className="mb-10 max-w-2xl">
          <NewsletterCapture
            source="footer"
            variant="card"
            title="3 setups + 1 dica de upgrade, toda semana."
            subtitle="Curadoria editorial. Sem spam. Cancela em 1 clique."
          />
        </div>
        <div className="flex flex-col items-start justify-between gap-6 border-t border-border pt-8 md:flex-row md:items-center">
          <div>
            <div className="font-display text-xl font-bold">HomeOfficeLife</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Feito no Brasil pra quem trabalha de casa. © 2026
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/galeria" className="hover:text-foreground">Galeria</Link>
            <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
            <Link to="/kits" className="hover:text-foreground">Kits</Link>
            <Link to="/diagnostico" className="hover:text-foreground">Diagnóstico</Link>
            <Link to="/orcamento" className="hover:text-foreground">Orçamentos</Link>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <Link to="/comunidade" className="hover:text-foreground">Comunidade</Link>
            <Link to="/premium" className="hover:text-foreground">Premium</Link>
            <Link to="/consultoria" className="inline-flex items-center gap-1 hover:text-foreground">
              Consultoria <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">Enterprise</span>
            </Link>
            <Link to="/termos" className="hover:text-foreground">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link to="/relatar-conteudo" className="hover:text-foreground">Relatar conteúdo</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
