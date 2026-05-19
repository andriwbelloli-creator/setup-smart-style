// HomeOfficeLife · Como Funciona — 4-step explainer
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const STEPS = [
  {
    n: "01",
    icon: "Camera",
    title: "Envie uma foto",
    desc: "Pode ser do seu escritório, consultório, home office ou canto de trabalho. Funciona com qualquer ângulo.",
    accent: "var(--primary)",
  },
  {
    n: "02",
    icon: "Sparkles",
    title: "Escolha seu objetivo",
    desc: "Decorar, organizar, melhorar ergonomia, montar um setup ou economizar espaço. Você define a prioridade.",
    accent: "var(--brand-coral-500)",
  },
  {
    n: "03",
    icon: "Image",
    title: "Receba ideias da IA",
    desc: "Veja seu ambiente em estilos diferentes com diagnóstico de ergonomia, iluminação e organização.",
    accent: "var(--wood)",
  },
  {
    n: "04",
    icon: "Shopping",
    title: "Monte seu espaço",
    desc: "Acesse a lista de produtos compatíveis com seu orçamento e monte uma versão parecida no seu espaço.",
    accent: "var(--success)",
  },
];

export interface ComoFuncionaProps {
  onStart?: () => void;
}

const ComoFunciona = ({ onStart }: ComoFuncionaProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section className="border-y border-[var(--border)] py-16 md:py-20" style={{ background: "var(--cream)" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 text-center">
          <Pill tone="eyebrow" className="mb-4 !text-[10px]"><I.Zap size={11}/> Como funciona</Pill>
          <h2 style={{ fontFamily: "var(--font-display)" }}
              className="text-[28px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
            Do upload ao seu office{" "}
            <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              em 4 passos
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted-foreground)]">
            Sem cadastro complicado. Sem prompts confusos. Você manda a foto, a IA faz o resto.
          </p>
        </div>

        <div className="relative grid gap-4 md:grid-cols-4">
          {/* Connection line (desktop) */}
          <div className="absolute hidden md:block top-12 left-[12.5%] right-[12.5%] h-px" style={{
            background: "repeating-linear-gradient(to right, var(--border) 0, var(--border) 6px, transparent 6px, transparent 12px)"
          }}/>

          {STEPS.map((step, i) => {
            const IconC = I[step.icon];
            const isHovered = hovered === i;
            return (
              <div key={step.n}
                   onMouseEnter={() => setHovered(i)}
                   onMouseLeave={() => setHovered(null)}
                   className="relative">
                <div className="relative flex flex-col items-center text-center"
                     style={{
                       transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                       transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                     }}>
                  {/* Number + icon */}
                  <div className="relative mb-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full shadow-[var(--shadow-soft)] transition-shadow duration-300"
                         style={{
                           background: "var(--card)",
                           border: `2px solid ${isHovered ? step.accent : 'var(--border)'}`,
                           boxShadow: isHovered ? "var(--shadow-elegant)" : "var(--shadow-soft)",
                         }}>
                      <IconC size={28} style={{ color: step.accent, transition: "transform 400ms", transform: isHovered ? "scale(1.1)" : "scale(1)" }}/>
                    </div>
                    <span style={{
                      position: "absolute", top: -8, right: -4,
                      background: step.accent, color: "white",
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 9px", borderRadius: 9999,
                      fontFamily: "var(--font-display)",
                      boxShadow: "var(--shadow-soft)",
                    }}>
                      {step.n}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-display)" }} className="text-[18px] font-bold leading-tight text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted-foreground)] max-w-[220px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3">
          <Button variant="hero" size="lg" onClick={onStart}>
            <I.Camera size={16}/> Começar agora — é grátis
          </Button>
          <span className="text-xs text-[var(--muted-foreground)]">
            Sem cartão · Resultado em ~30 segundos
          </span>
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
