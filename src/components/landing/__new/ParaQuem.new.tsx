// HomeOfficeLife · Para Quem É — persona grid
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const PERSONAS = [
  { id: "remoto",     emoji: null, icon: "Home",     label: "Profissionais remotos",   sub: "Trabalho 100% de casa",            color: "var(--primary)" },
  { id: "hibrido",    emoji: null, icon: "ArrowLeftRight", label: "Trabalho híbrido",  sub: "Alguns dias na semana",            color: "var(--brand-teal-700)" },
  { id: "freelancer", emoji: null, icon: "Sparkles", label: "Freelancers",             sub: "Autônomos e PJ",                    color: "var(--wood)" },
  { id: "estudante",  emoji: null, icon: "Bookmark", label: "Estudantes",              sub: "Apê pequeno e orçamento curto",     color: "oklch(0.55 0.12 80)" },
  { id: "dev",        emoji: null, icon: "Zap",      label: "Devs & tech",             sub: "Setup limpo e produtivo",           color: "var(--brand-teal-900)" },
  { id: "gamer",      emoji: null, icon: "Star",     label: "Gamers adultos",          sub: "Sem RGB exagerado",                 color: "oklch(0.55 0.15 300)" },
  { id: "creator",    emoji: null, icon: "Camera",   label: "Criadores",               sub: "Cenário para vídeo e lives",        color: "var(--brand-coral-500)" },
  { id: "consultor",  emoji: null, icon: "Crown",    label: "Consultores",             sub: "Credibilidade em videochamada",     color: "var(--info)" },
  { id: "psicologo",  emoji: null, icon: "Heart",    label: "Psicólogos",              sub: "Ambiente acolhedor",                color: "var(--success)" },
  { id: "professor",  emoji: null, icon: "User",     label: "Professores",             sub: "Aulas online com qualidade",        color: "var(--warning)" },
];

const ParaQuem = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const toast = useToast();
  return (
    <section className="border-y border-[var(--border)] py-16 md:py-20" style={{ background: "var(--cream)" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Pill tone="eyebrow" className="mb-4 !text-[10px]"><I.Users size={11}/> Para quem é</Pill>
          <h2 style={{ fontFamily: "var(--font-display)" }}
              className="text-[28px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
            Funciona pra{" "}
            <span style={{ color: "var(--brand-coral-500)" }}>todo mundo que trabalha de casa</span>
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Não importa se você é estudante, dev, terapeuta ou diretor — a IA adapta o estilo ao seu perfil e orçamento.
          </p>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {PERSONAS.map((p, i) => {
            const IconC = I[p.icon];
            const isH = hovered === i;
            return (
              <button key={p.id}
                      onClick={() => toast.show(`Estilos para ${p.label.toLowerCase()}`)}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
                        background: "var(--card)",
                        border: `1px solid ${isH ? p.color : 'var(--border)'}`,
                        borderRadius: "var(--radius-2xl)",
                        padding: "16px",
                        textAlign: "left", cursor: "pointer",
                        boxShadow: isH ? "var(--shadow-elegant)" : "var(--shadow-soft)",
                        transform: isH ? "translateY(-2px)" : "translateY(0)",
                        transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: "var(--radius-lg)",
                  background: `color-mix(in oklch, ${p.color} 14%, transparent)`,
                  color: p.color,
                }}>
                  <IconC size={18}/>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {p.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Não se reconheceu na lista? <button onClick={() => toast.show("Detectando seu perfil…")} className="font-bold text-[var(--primary)] underline-offset-4 hover:underline" style={{background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"var(--font-sans)"}}>A IA detecta o seu perfil automaticamente.</button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ParaQuem;
