// HomeOfficeLife · Hero — drop-zone + headline + stats
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

export interface HeroProps {
  onUpload?: () => void;
  onExplore?: () => void;
}

const Hero = ({ onUpload, onExplore }: HeroProps) => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-mesh), var(--background)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:py-16">
        {/* Left */}
        <div className="flex flex-col justify-center" style={{ animation: "fadeUp 0.8s var(--ease-smooth) both" }}>
          <Pill tone="eyebrow" className="mb-5 w-fit !text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" style={{ animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }}/>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]"/>
            </span>
            <I.Zap size={13}/> IA brasileira · Diagnóstico em 30 segundos
          </Pill>

          <h1 style={{ fontFamily: "var(--font-display)" }}
              className="text-[36px] sm:text-[48px] lg:text-[58px] font-bold tracking-[-0.025em] leading-[1.02] text-[var(--foreground)]">
            Transforme seu home office com{" "}
            <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              ideias geradas por IA
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[16px] leading-[1.55] text-[var(--muted-foreground)]">
            Envie uma foto do seu espaço e receba{" "}
            <strong className="text-[var(--foreground)]">ideias decoradas, diagnóstico inteligente e produtos</strong>{" "}
            para montar um ambiente mais bonito, confortável e produtivo.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" onClick={onUpload}>
              <I.Camera size={18}/> Gerar ideias para meu home office
            </Button>
            <Button variant="outline" size="xl" onClick={onExplore}>
              Ver exemplos <I.ArrowRight size={16}/>
            </Button>
          </div>

          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Funciona para home office, setup, escritório pequeno ou canto de trabalho. <strong className="text-[var(--foreground)]">Sem cartão.</strong>
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-6 text-sm text-[var(--muted-foreground)]">
            <div>
              <div className="font-bold text-[26px] leading-none text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>12k+</div>
              <div className="mt-1">Setups avaliados</div>
            </div>
            <div className="h-10 w-px bg-[var(--border)]"/>
            <div>
              <div className="font-bold text-[26px] leading-none text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>3.4k</div>
              <div className="mt-1">Comunidade BR</div>
            </div>
            <div className="h-10 w-px bg-[var(--border)]"/>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <I.Star key={i} size={15} className="text-[var(--brand-coral-500)]"/>)}
              <span className="ml-2 font-semibold text-[var(--foreground)]">4.9</span>
            </div>
          </div>
        </div>

        {/* Right — drop zone */}
        <div className="relative" style={{ animation: "fadeUp 0.8s 0.2s var(--ease-smooth) both" }}>
          <label
            onDragOver={(e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDragOver(false); onUpload?.(); }}
            onClick={() => onUpload?.()}
            className={
              "group relative block cursor-pointer overflow-hidden rounded-[28px] bg-[var(--card)] shadow-[var(--shadow-elegant)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] " +
              (dragOver ? "border-4 border-[var(--primary)] scale-[1.02] shadow-[var(--shadow-glow)]" : "border-2 border-[var(--border)] hover:border-[var(--primary)]/50")
            }>
            <img src="assets/hero-setup.webp" alt="Setup home office" className="block aspect-[16/11] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <div className={
              "absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] transition-opacity duration-300 " +
              (dragOver ? "bg-[var(--primary)]/70 opacity-100" : "bg-[var(--foreground)]/55 opacity-0 group-hover:opacity-100")
            }>
              <div className="rounded-full bg-[var(--background)]/95 p-5 shadow-[var(--shadow-elegant)] backdrop-blur">
                <I.Image size={36} className="text-[var(--primary)]"/>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)" }} className="max-w-[260px] px-4 text-center text-2xl font-bold text-white">
                {dragOver ? "Solte aqui!" : "Solte sua foto ou clique"}
              </h3>
              <p className="max-w-[260px] px-4 text-center text-sm text-white/90">JPG, PNG ou WebP · até 10MB</p>
            </div>

            {/* Floating product tag */}
            <div className="absolute left-3 top-3 hidden rounded-xl bg-[var(--card)]/95 px-3 py-2 shadow-[var(--shadow-elegant)] backdrop-blur md:block"
                 style={{ animation: "float 6s ease-in-out infinite" }}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Monitor</div>
              <div className="text-xs font-semibold text-[var(--foreground)]">LG Ultrawide 34"</div>
              <div className="mt-0.5 text-[11px] font-semibold text-[var(--primary)]">R$ 2.799 · Amazon BR</div>
            </div>

            {/* Score badge */}
            <div className="absolute bottom-3 right-3 rounded-xl bg-[var(--card)]/95 p-3 shadow-[var(--shadow-elegant)] backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Nota IA</div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold leading-tight text-[var(--foreground)]">
                8.7<span className="text-sm text-[var(--muted-foreground)]">/10</span>
              </div>
              <div className="mt-1 flex gap-0.5">
                {[1,1,1,1,0].map((on,i) => <span key={i} className={"h-1 w-4 rounded-full " + (on ? "bg-[var(--primary)]" : "bg-[var(--muted)]")}/>)}
              </div>
            </div>
          </label>

          <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
            <I.Sparkles size={11} className="inline-block mr-1 text-[var(--brand-coral-500)]"/>
            Arraste uma foto ou clique para começar
          </p>

          <div className="pointer-events-none absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--accent)" }}/>
          <div className="pointer-events-none absolute -bottom-8 -left-8 -z-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--primary)" }}/>
        </div>
      </div>
    </section>
  );
};

export default Hero;
