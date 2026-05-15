// HomeOfficeLife · Benefícios — 6 value cards
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const BENEFITS = [
  {
    icon: "User",
    title: "Ergonomia",
    desc: "Postura, altura do monitor, apoio lombar e iluminação correta. Trabalhe sem dor.",
    accent: "var(--primary)",
    metric: "+62% conforto",
  },
  {
    icon: "Image",
    title: "Decoração",
    desc: "Estilos curados pra cada perfil. De minimalista a executivo, passando por escandinavo e industrial.",
    accent: "var(--brand-coral-500)",
    metric: "16 estilos prontos",
  },
  {
    icon: "Zap",
    title: "Produtividade",
    desc: "Organização inteligente, iluminação adequada e layout que favorece o foco real.",
    accent: "var(--warning)",
    metric: "+40% foco",
  },
  {
    icon: "Recycle",
    title: "Organização",
    desc: "Gestão de cabos, otimização de espaço e soluções verticais para apês pequenos.",
    accent: "var(--brand-teal-700)",
    metric: "Cabos invisíveis",
  },
  {
    icon: "Sparkles",
    title: "Iluminação",
    desc: "Luz natural, lâmpadas certas, sem reflexo na tela e bonito em videochamadas.",
    accent: "var(--wood)",
    metric: "Pronto para vídeo",
  },
  {
    icon: "Wallet",
    title: "Economia",
    desc: "Recomendações dentro do seu orçamento. De R$ 0 (reorganização) até projetos premium.",
    accent: "var(--success)",
    metric: "A partir de R$ 0",
  },
];

const Beneficios = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Pill tone="eyebrow" className="mb-4 !text-[10px]"><I.Star size={11}/> Por que importa</Pill>
          <h2 style={{ fontFamily: "var(--font-display)" }}
              className="text-[28px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
            Muito além da{" "}
            <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              imagem bonita
            </span>
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            A IA analisa 6 dimensões do seu espaço e sugere melhorias práticas. Não é só decoração.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => {
            const IconC = I[b.icon];
            const isH = hovered === i;
            return (
              <div key={b.title}
                   onMouseEnter={() => setHovered(i)}
                   onMouseLeave={() => setHovered(null)}
                   className="group relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
                {/* Decorative blob */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                     style={{ background: b.accent }}/>

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300"
                     style={{
                       background: `color-mix(in oklch, ${b.accent} 12%, transparent)`,
                       transform: isH ? "rotate(-3deg) scale(1.05)" : "rotate(0) scale(1)",
                     }}>
                  <IconC size={22} style={{ color: b.accent }}/>
                </div>

                <h3 style={{ fontFamily: "var(--font-display)" }} className="mt-4 text-[18px] font-bold leading-tight text-[var(--foreground)]">
                  {b.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted-foreground)]">
                  {b.desc}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                     style={{
                       background: `color-mix(in oklch, ${b.accent} 12%, transparent)`,
                       color: b.accent,
                     }}>
                  <I.Check size={11}/> {b.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Beneficios;
