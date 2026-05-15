// HomeOfficeLife · Antes/Depois — interactive comparison slider
/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const TRANSFORMATIONS = [
  {
    label: "Cantinho na sala",
    style: "Escandinavo",
    investment: "R$ 1.200",
    score: { before: 5.2, after: 8.7 },
    improvements: ["+ Organização de cabos", "+ Suporte para notebook", "+ Luminária de mesa", "+ Planta"],
    before: "assets/setup-before.webp",
    after: "assets/setup-after.webp",
  },
  {
    label: "Apê pequeno",
    style: "Minimalista",
    investment: "R$ 800",
    score: { before: 4.8, after: 8.3 },
    improvements: ["+ Mesa compacta", "+ Iluminação", "+ Reorganização", "+ Decoração discreta"],
    before: "assets/setup-compact.webp",
    after: "assets/setup-minimal.webp",
  },
];

const AntesDepois = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const toast = useToast();

  const current = TRANSFORMATIONS[activeIdx];

  const handlePointer = useCallback((clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  useEffect(() => {
    const move = (e: any) => {
      if (!draggingRef.current) return;
      handlePointer(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const up = () => { draggingRef.current = false; document.body.style.cursor = ""; };
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [handlePointer]);

  const startDrag = (e: any) => {
    draggingRef.current = true;
    document.body.style.cursor = "ew-resize";
    e.preventDefault();
  };

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <Pill tone="eyebrow" className="mb-4 !text-[10px]"><I.ArrowLeftRight size={11}/> Antes / Depois</Pill>
          <h2 style={{ fontFamily: "var(--font-display)" }}
              className="text-[28px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
            Veja a{" "}
            <span style={{ color: "var(--brand-coral-500)" }}>transformação real</span>
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Arraste para comparar. A IA mostra o que mudar e quais produtos fazem isso acontecer.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Comparison slider */}
          <div ref={sliderRef}
               className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[24px] border border-[var(--border)] shadow-[var(--shadow-elegant)] select-none"
               onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => { startDrag(e); handlePointer(e.clientX); }}
               onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => { startDrag(e); handlePointer(e.touches[0].clientX); }}>
            {/* After (background) */}
            <img src={current.after} alt="Depois" className="absolute inset-0 h-full w-full object-cover pointer-events-none"/>

            {/* Before (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
              <img src={current.before} alt="Antes" className="absolute inset-0 h-full w-full object-cover pointer-events-none"/>
            </div>

            {/* Labels */}
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-ink-900)]/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                Antes
              </span>
            </div>
            <div className="absolute right-4 top-4">
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur"
                    style={{ background: "var(--gradient-warm)" }}>
                Depois · IA
              </span>
            </div>

            {/* Slider handle */}
            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `calc(${sliderPos}% - 1px)`, width: 2, background: "white", boxShadow: "0 0 16px rgba(0,0,0,0.4)" }}>
              <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[var(--shadow-elegant)] pointer-events-auto cursor-ew-resize"
                   onMouseDown={startDrag} onTouchStart={startDrag}>
                <I.ArrowLeftRight size={18} style={{ color: "var(--foreground)" }}/>
              </div>
            </div>

            <Watermark/>
          </div>

          {/* Stats panel */}
          <Card className="!rounded-[24px] p-6 flex flex-col">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Transformação
            </div>
            <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold leading-tight text-[var(--foreground)]">
              {current.label} · <span style={{ color: "var(--brand-coral-500)" }}>{current.style}</span>
            </h3>

            {/* Score */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Antes</div>
                <div style={{ fontFamily: "var(--font-display)" }} className="mt-1 text-[36px] font-bold leading-none text-[var(--muted-foreground)]">
                  {current.score.before}<span className="text-base">/10</span>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/8 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">Depois</div>
                <div style={{ fontFamily: "var(--font-display)" }} className="mt-1 text-[36px] font-bold leading-none text-[var(--foreground)]">
                  {current.score.after}<span className="text-base text-[var(--muted-foreground)]">/10</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[var(--success)]/12 px-3 py-1.5 text-xs font-bold text-[var(--success)]">
              <I.Sparkles size={12}/> +{((current.score.after - current.score.before) * 10).toFixed(0)} pontos com IA
            </div>

            {/* Improvements */}
            <div className="mt-5 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">O que mudou</div>
              <ul className="mt-3 space-y-2">
                {current.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                      style={{ animation: `fadeUp 0.4s ${i * 0.08}s var(--ease-smooth) both` }}>
                    <I.Check size={14} className="mt-0.5 flex-shrink-0 text-[var(--success)]"/> {imp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--brand-coral-500)]/25 bg-[var(--brand-coral-500)]/8 p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-coral-500)]">Investimento</div>
              <div style={{ fontFamily: "var(--font-display)" }} className="mt-0.5 text-xl font-bold text-[var(--foreground)]">
                {current.investment}
              </div>
            </div>

            <Button variant="hero" className="mt-4 w-full !h-12" onClick={() => toast.show("Abrindo lista de produtos…")}>
              Ver lista de compras <I.ArrowRight size={14}/>
            </Button>
          </Card>
        </div>

        {/* Transformation switcher */}
        <div className="mt-6 flex justify-center gap-2">
          {TRANSFORMATIONS.map((t, i) => (
            <button key={i} onClick={() => { setActiveIdx(i); setSliderPos(50); }}
                    className={"rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-300 " +
                      (activeIdx === i ? "bg-[var(--foreground)] text-[var(--background)]" : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AntesDepois;
