import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Upload, Star, ArrowRight, Zap, ExternalLink } from "lucide-react";
import heroImg from "@/assets/hero-setup.webp";
import { decorateAffiliateUrl } from "@/lib/affiliate";

// Amazon BR com filtro de categoria `i=computers` — única loja BR que
// aceita filtro de categoria via query stable. Kabum rejeita facet
// query (HTTP 400), Magalu não tem filtro confiável em /busca,
// Mercado Livre usa path embutido que muda toda hora.
// Tentamos `kabum.com.br/produto/177566/...` antes mas esse ID era de
// um pneu. Lição: nunca hardcodar /produto/<id> sem ver no browser.
const LG_ULTRAWIDE_URL = decorateAffiliateUrl(
  "https://www.amazon.com.br/s?k=LG+Ultrawide+34WP65C+monitor&i=computers",
  "amazon_br",
);

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="container mx-auto grid gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-32">
        <div className="flex flex-col justify-center animate-fade-up">
          {/* Badge animada + pulse pra chamar atenção pra IA */}
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Zap className="h-3.5 w-3.5" />
            IA brasileira · Diagnóstico em 30 segundos
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Seu home office,{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">avaliado</span>{" "}
            por IA em <span className="whitespace-nowrap">30 segundos</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Envie uma foto e descubra <strong className="text-foreground">o que está sabotando sua produtividade</strong> — nota de ergonomia, iluminação, organização e dicas com produtos reais do Brasil.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-14 gap-2 bg-gradient-hero px-8 text-base font-bold shadow-elegant transition-smooth hover:shadow-glow hover:scale-[1.02]">
              <Link to="/diagnostico">
                <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Avaliar meu setup agora — grátis
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 gap-2 border-2 px-8 text-base">
              <Link to="/galeria">
                Explorar galeria <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong className="text-foreground">3 análises gratuitas</strong> — sem cartão, sem pegadinha. Resultado em ~30s.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
            <div>
              <div className="font-display text-2xl font-bold text-foreground">12k+</div>
              <div>Setups avaliados</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="font-display text-2xl font-bold text-foreground">3.4k</div>
              <div>Comunidade BR</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent text-accent" />
              ))}
              <span className="ml-2 font-medium text-foreground">4.9</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
            <img
              src={heroImg}
              alt="Setup home office com mesa de madeira, monitor ultrawide e parede turquesa"
              width={1600}
              height={1100}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            {/* Floating product tag */}
            <a
              href={LG_ULTRAWIDE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label="Ver LG Ultrawide 34 polegadas na Amazon BR"
              className="group absolute left-6 top-1/2 hidden animate-float rounded-2xl bg-card/95 p-3 shadow-elegant backdrop-blur transition-smooth hover:scale-105 hover:bg-card md:block"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monitor</div>
              <div className="text-sm font-semibold">LG Ultrawide 34"</div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-primary">
                R$ 2.799 · Amazon BR <ExternalLink className="h-3 w-3 opacity-0 transition-smooth group-hover:opacity-100" />
              </div>
            </a>
            {/* Score badge */}
            <div className="absolute bottom-6 right-6 rounded-2xl bg-card p-4 shadow-elegant">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nota IA</div>
              <div className="font-display text-3xl font-bold">
                8.7<span className="text-base text-muted-foreground">/10</span>
              </div>
              <div className="mt-1 flex gap-1">
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-muted" />
              </div>
            </div>
          </div>
          {/* Decorative blob */}
          <div className="absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
