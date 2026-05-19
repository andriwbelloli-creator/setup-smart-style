import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Upload, Star, ArrowRight, Zap, ExternalLink, ImageIcon, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import heroImg from "@/assets/hero-setup.webp";
import { decorateAffiliateUrl } from "@/lib/affiliate";
import { toast } from "sonner";
import { useExperiment } from "@/hooks/use-experiment";

// Experimento #1 — copy do CTA primário do Hero.
// Hipótese: copy mais direto/concreto converte mais que copy ambicioso.
// Bucket por anon_id (estável entre sessões). Eventos chegam em
// analytics_events com event_name="experiment_exposure" / "experiment_conversion"
// + props { experiment: "hero_cta_v1", variant, action }.
//
// Análise: ver lift de conversão na rota /dashboard/admin/analytics
// depois de ~200 cliques distribuídos entre as variantes.
const HERO_CTA_VARIANTS = ["control", "direct", "outcome"] as const;
const HERO_CTA_COPY: Record<typeof HERO_CTA_VARIANTS[number], string> = {
  control: "Criar projeto para meu office",
  direct: "Enviar foto e transformar meu espaço",
  outcome: "Descobrir o que falta no meu espaço",
};

// Amazon BR com filtro de categoria `i=computers` — única loja BR que
// aceita filtro de categoria via query stable. Kabum rejeita facet query.
const LG_ULTRAWIDE_URL = decorateAffiliateUrl(
  "https://www.amazon.com.br/s?k=LG+Ultrawide+34WP65C+monitor&i=computers",
  "amazon_br",
);

// Quando usuário dropa/escolhe foto no Hero, salvamos em sessionStorage
// (dataURL) e o componente AnaliseIA logo abaixo lê e dispara o handleFile
// automaticamente. Evita prop drilling sem state global.
const PENDING_UPLOAD_KEY = "deskly:pending-upload";

async function handleHeroFile(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    toast.error("Imagem muito grande (máx 10MB)");
    return;
  }
  if (!file.type.startsWith("image/")) {
    toast.error("Envie uma imagem (jpg, png ou webp)");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      sessionStorage.setItem(PENDING_UPLOAD_KEY, reader.result as string);
      window.dispatchEvent(new CustomEvent("deskly:pending-upload"));
      document.getElementById("analise-ia")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      console.warn("hero upload:", e);
    }
  };
  reader.readAsDataURL(file);
}

export function Hero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { variant: ctaVariant, convert: convertCta } = useExperiment(
    "hero_cta_v1",
    HERO_CTA_VARIANTS,
  );

  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-16">
        <div className="flex flex-col justify-center animate-fade-up">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <Zap className="h-3.5 w-3.5" />
            Escritórios, consultórios e home offices · IA brasileira em 30s
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Planeje seu{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">office</span>{" "}
            com IA.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Envie a foto do seu espaço e receba <strong className="text-foreground">ideias decoradas, diagnóstico inteligente</strong> e sugestões de produtos pra montar um escritório, consultório ou home office mais produtivo.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-14 gap-2 bg-gradient-hero px-8 text-base font-bold shadow-elegant transition-smooth hover:shadow-glow hover:scale-[1.02]">
              <Link to="/diagnostico" onClick={() => convertCta("clicked_primary_cta")}>
                <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                {HERO_CTA_COPY[ctaVariant]}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 gap-2 border-2 px-8 text-base">
              <Link to="/galeria">
                Ver exemplos de transformações <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {/* Trust signals — chips com check verde pra cortar fricção de cadastro */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              "Sem cartão",
              "Fotos privadas",
              "Resultado em 30s",
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong className="text-foreground">3 análises gratuitas</strong> · cancele quando quiser.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
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

        {/* Lado direito: drop-zone overlay sobre a imagem */}
        <div className="relative">
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleHeroFile(file);
            }}
            className={`group relative block cursor-pointer overflow-hidden rounded-3xl border-2 bg-card shadow-elegant transition-all ${
              dragOver ? "border-primary scale-[1.02] shadow-glow" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleHeroFile(file);
              }}
            />
            <img
              src={heroImg}
              alt="Escritório com mesa de madeira, monitor ultrawide e parede turquesa"
              width={1600}
              height={1100}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover transition-smooth group-hover:scale-105"
            />

            {/* Overlay com call-to-action grande */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-foreground/55 backdrop-blur-[2px] transition-smooth ${dragOver ? "bg-primary/70" : "opacity-0 group-hover:opacity-100"}`}>
              <div className="rounded-full bg-background/95 p-5 shadow-elegant backdrop-blur">
                <ImageIcon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mt-4 max-w-xs px-4 text-center font-display text-2xl font-bold text-background">
                {dragOver ? "Solte aqui!" : "Solte sua foto ou clique"}
              </h3>
              <p className="mt-2 max-w-xs px-4 text-center text-sm text-background/90">
                JPG, PNG ou WebP · até 10MB
              </p>
            </div>

            {/* Floating product tag (mantém afiliado) */}
            <a
              href={LG_ULTRAWIDE_URL}
              target="_blank"
              rel="sponsored noopener noreferrer"
              aria-label="Ver LG Ultrawide 34 polegadas na Amazon BR"
              onClick={(e) => e.stopPropagation()}
              className="group/tag absolute left-4 top-4 hidden animate-float rounded-xl bg-card/90 px-2.5 py-2 shadow-elegant backdrop-blur transition-smooth hover:scale-105 hover:bg-card md:block"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monitor</div>
              <div className="text-xs font-semibold">LG Ultrawide 34"</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-primary">
                R$ 2.799 · Amazon BR <ExternalLink className="h-3 w-3 opacity-0 transition-smooth group-hover/tag:opacity-100" />
              </div>
            </a>

            {/* Score badge no canto inferior direito */}
            <div className="absolute bottom-4 right-4 rounded-xl bg-card/95 p-3 shadow-elegant backdrop-blur">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nota IA</div>
              <div className="font-display text-2xl font-bold leading-tight">
                8.7<span className="text-sm text-muted-foreground">/10</span>
              </div>
              <div className="mt-1 flex gap-0.5">
                <span className="h-1 w-4 rounded-full bg-primary" />
                <span className="h-1 w-4 rounded-full bg-primary" />
                <span className="h-1 w-4 rounded-full bg-primary" />
                <span className="h-1 w-4 rounded-full bg-primary" />
                <span className="h-1 w-4 rounded-full bg-muted" />
              </div>
            </div>
          </label>

          {/* Hint abaixo da imagem */}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            ✨ Arraste uma foto pra cima da imagem ou clique
          </p>

          {/* Decorative blobs */}
          <div className="absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
