import { Button } from "@/components/ui/button";
import { Upload, Star, ArrowRight, Zap } from "lucide-react";
import heroImg from "@/assets/hero-setup.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-mesh">
      <div className="container mx-auto grid gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-32">
        <div className="flex flex-col justify-center animate-fade-up">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Zap className="h-3.5 w-3.5 text-accent" />
            Plataforma 100% brasileira para home office
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Seu setup,{" "}
            <span className="bg-gradient-warm bg-clip-text text-transparent">avaliado</span>{" "}
            por IA.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Envie uma foto do seu home office e receba nota de ergonomia, iluminação, organização e estética — com produtos da Amazon BR, Mercado Livre, Kabum e Magalu.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-14 gap-2 bg-gradient-hero px-8 text-base shadow-elegant transition-smooth hover:shadow-glow">
              <Upload className="h-5 w-5" />
              Enviar foto do setup
            </Button>
            <Button size="lg" variant="outline" className="h-14 gap-2 border-2 px-8 text-base">
              Explorar galeria <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
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
              className="h-full w-full object-cover"
            />
            {/* Floating product tag */}
            <div className="absolute left-6 top-1/2 hidden animate-float rounded-2xl bg-card/95 p-3 shadow-elegant backdrop-blur md:block">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monitor</div>
              <div className="text-sm font-semibold">LG Ultrawide 34"</div>
              <div className="text-xs text-primary">R$ 2.799 · Kabum</div>
            </div>
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
