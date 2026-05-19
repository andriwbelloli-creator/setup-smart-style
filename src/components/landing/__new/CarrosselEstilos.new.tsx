// HomeOfficeLife · Carrossel de Estilos IA v3
// 12 estilos · placeholders ricos com paleta + elementos do ambiente
/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

// ============================================================
// CARD DATA
// ============================================================
const STYLE_CARDS = [
  {
    id: "moderno", order: 1, status: "active", device: "all",
    title: "Home office moderno",
    category: "Espaço de trabalho",
    target: "Profissionais remotos",
    description: "Visual limpo, atual e produtivo com mesa clara, monitor e boa iluminação.",
    badge: "Mais pedido",
    investimento: "intermediario",
    investLabel: "R$ 3k–5k",
    cta: "Gerar estilo moderno",
    img: "/__new/hero-setup.webp",
    palette: ["#2A8E8E", "#D9B58A", "#FBF8F1", "#0F1F22"],
    elements: ["Mesa", "Monitor", "Cadeira ergo", "Luminária", "Planta"],
    treatment: "none", popularity: 78, trending: true,
    style: "moderno",
    accent: "var(--primary)",
  },
  {
    id: "pequeno", order: 2, status: "active", device: "all",
    title: "Home office pequeno",
    category: "Apartamento compacto",
    target: "Apês e espaços reduzidos",
    description: "Soluções verticais, prateleiras e aproveitamento inteligente de cantos.",
    badge: "Ideal para apartamento",
    investimento: "economico",
    investLabel: "Até R$ 1.500",
    cta: "Criar para espaço pequeno",
    img: "/__new/setup-compact.webp",
    palette: ["#B5854A", "#F7F4EC", "#155659", "#0F1F22"],
    elements: ["Mesa compacta", "Prateleira", "Suporte notebook", "Plantas"],
    treatment: "warm", popularity: 84, trending: true,
    style: "compacto",
    accent: "oklch(0.55 0.12 80)",
  },
  {
    id: "executivo", order: 3, status: "active", device: "all",
    title: "Escritório executivo",
    category: "Reuniões e foco",
    target: "Executivos e advogados",
    description: "Marcenaria planejada, iluminação indireta e mobiliário de design.",
    badge: "Visual profissional",
    investimento: "premium",
    investLabel: "R$ 8k+",
    cta: "Gerar office premium",
    img: "/__new/setup-after.webp",
    palette: ["#0E3D3F", "#54676B", "#D9B58A", "#FBF8F1"],
    elements: ["Marcenaria", "Cadeira de design", "Iluminação indireta", "Obras de arte"],
    treatment: "deep", popularity: 62,
    style: "executivo",
    accent: "var(--brand-teal-700)",
  },
  {
    id: "psicologo", order: 4, status: "active", device: "all",
    title: "Consultório online",
    category: "Atendimento virtual",
    target: "Psicólogos e terapeutas",
    description: "Luz suave, fundo neutro e ambiente acolhedor para sessões online.",
    badge: "Acolhedor e confiável",
    investimento: "intermediario",
    investLabel: "R$ 3k–5k",
    cta: "Gerar consultório online",
    img: "/__new/setup-minimal.webp",
    palette: ["#F9A89A", "#FBF8F1", "#6FB8B5", "#54676B"],
    elements: ["Poltrona", "Luminária quente", "Painel neutro", "Plantas", "Webcam"],
    treatment: "soft", popularity: 71,
    style: "acolhedor",
    accent: "oklch(0.6 0.13 155)",
  },
  {
    id: "economico", order: 5, status: "active", device: "all",
    title: "Home office econômico",
    category: "Bonito gastando pouco",
    target: "Estudantes e iniciantes",
    description: "Produtos acessíveis no Brasil que entregam visual bonito e funcional.",
    badge: "Bonito gastando pouco",
    investimento: "economico",
    investLabel: "Até R$ 700",
    cta: "Gerar ideia econômica",
    img: "/__new/setup-before.webp",
    palette: ["#B5854A", "#FBF8F1", "#54676B", "#2A8E8E"],
    elements: ["Mesa básica", "Suporte notebook", "Luminária grampo", "Organizador"],
    treatment: "warm", popularity: 89, trending: true,
    style: "economico",
    accent: "oklch(0.62 0.09 55)",
  },
  {
    id: "criador", order: 6, status: "active", device: "all",
    title: "Criador de conteúdo",
    category: "Produção visual",
    target: "YouTubers e streamers",
    description: "Iluminação de destaque, cenário visual forte e setup pronto para vídeo.",
    badge: "Pronto para vídeo",
    investimento: "intermediario",
    investLabel: "R$ 3k–5k",
    cta: "Gerar cenário criativo",
    img: "/__new/setup-creator.webp",
    palette: ["#F36458", "#F9A89A", "#0F1F22", "#FBF8F1"],
    elements: ["Ring light", "Microfone", "Webcam 4K", "Painel de fundo", "Mesa bonita"],
    treatment: "vibrant", popularity: 68,
    style: "creator",
    accent: "var(--brand-coral-500)",
  },
  {
    id: "gamer", order: 7, status: "active", device: "all",
    title: "Gamer clean",
    category: "Setup organizado",
    target: "Gamers e devs",
    description: "RGB discreto, cabos escondidos, monitor grande e visual moderno sem excessos.",
    badge: "Visual gamer sem exagero",
    investimento: "intermediario",
    investLabel: "R$ 3k–5k",
    cta: "Gerar gamer clean",
    img: "/__new/setup-gamer.webp",
    palette: ["#7C5FC5", "#0F1F22", "#2A8E8E", "#FBF8F1"],
    elements: ["Monitor 27\"", "Cadeira gamer", "RGB discreto", "Organizador cabos"],
    treatment: "cool", popularity: 65,
    style: "gamer-clean",
    accent: "oklch(0.55 0.15 300)",
  },
  {
    id: "escandinavo", order: 8, status: "active", device: "all",
    title: "Estilo escandinavo",
    category: "Decoração e conforto",
    target: "Quem busca leveza",
    description: "Madeira clara, branco off-white, luz natural e plantas. Sensação de leveza.",
    badge: "Claro e confortável",
    investimento: "intermediario",
    investLabel: "R$ 3k–5k",
    cta: "Gerar estilo escandinavo",
    img: "/__new/setup-minimal.webp",
    palette: ["#FBF8F1", "#D9B58A", "#6FB8B5", "#54676B"],
    elements: ["Mesa madeira clara", "Cadeira clara", "Plantas", "Luz natural"],
    treatment: "bright", popularity: 73,
    style: "escandinavo",
    accent: "var(--wood)",
  },
  {
    id: "advogado", order: 9, status: "active", device: "all",
    title: "Escritório jurídico",
    category: "Formal e confiável",
    target: "Advogados e consultores",
    description: "Visual sóbrio com estante, mesa elegante e fundo de credibilidade.",
    badge: "Credibilidade",
    investimento: "premium",
    investLabel: "R$ 5k–8k",
    cta: "Gerar escritório jurídico",
    img: "/__new/setup-after.webp",
    palette: ["#155659", "#0F1F22", "#54676B", "#D9B58A"],
    elements: ["Mesa elegante", "Estante", "Cadeira sóbria", "Iluminação neutra"],
    treatment: "deep", popularity: 58,
    style: "formal",
    accent: "oklch(0.42 0.06 230)",
  },
  {
    id: "professor", order: 10, status: "active", device: "all",
    title: "Professor online",
    category: "Aulas e gravações",
    target: "Educadores e tutores",
    description: "Boa câmera, microfone, quadro de apoio e espaço para materiais.",
    badge: "Áudio e vídeo",
    investimento: "economico",
    investLabel: "Até R$ 3k",
    cta: "Gerar espaço para aulas",
    img: "/__new/setup-creator.webp",
    palette: ["#F9A89A", "#FBF8F1", "#155659", "#54676B"],
    elements: ["Câmera HD", "Microfone", "Quadro apoio", "Mesa organizada"],
    treatment: "soft", popularity: 66,
    style: "didatico",
    accent: "var(--warning)",
  },
  {
    id: "industrial", order: 11, status: "active", device: "all",
    title: "Estilo industrial",
    category: "Escritório marcante",
    target: "Arquitetos e designers",
    description: "Madeira escura, metal preto, cimento queimado. Visual urbano e moderno.",
    badge: "Design bold",
    investimento: "premium",
    investLabel: "R$ 5k–8k",
    cta: "Gerar estilo industrial",
    img: "/__new/setup-gamer.webp",
    palette: ["#0F1F22", "#54676B", "#B5854A", "#F36458"],
    elements: ["Mesa madeira escura", "Estrutura metálica", "Iluminação quente", "Parede texturizada"],
    treatment: "dark", popularity: 54,
    style: "industrial",
    accent: "var(--brand-teal-900)",
  },
  {
    id: "minimalista", order: 12, status: "active", device: "all",
    title: "Home office minimalista",
    category: "Simples e funcional",
    target: "Quem gosta de menos",
    description: "Paleta neutra, poucos itens e iluminação natural. Sem poluição visual.",
    badge: "Menos é mais",
    investimento: "economico",
    investLabel: "Até R$ 1.500",
    cta: "Gerar estilo minimalista",
    img: "/__new/setup-before.webp",
    palette: ["#FBF8F1", "#F7F4EC", "#54676B", "#0F1F22"],
    elements: ["Mesa clean", "Notebook", "Luminária discreta", "1 planta"],
    treatment: "bright", popularity: 81,
    style: "minimalista",
    accent: "oklch(0.45 0.03 200)",
  },
  {
    id: "sem-compra", order: 13, status: "active", device: "all",
    title: "Sem comprar nada",
    category: "Reorganização inteligente",
    target: "Quem quer melhorar hoje",
    description: "Reposicione o que você já tem. Luz natural, cabos e layout — sem gastar nada.",
    badge: "R$ 0 · Hoje mesmo",
    investimento: "sem-compra",
    investLabel: "R$ 0",
    cta: "Melhorar gratuitamente",
    img: "/__new/setup-before.webp",
    palette: ["#6FB8B5", "#FBF8F1", "#B5854A", "#54676B"],
    elements: ["Reposicionar mesa", "Aproveitar luz", "Organizar cabos", "Reorganizar"],
    treatment: "bright", popularity: 92, trending: true,
    style: "reorganizar",
    accent: "var(--success)",
  },
  {
    id: "no-quarto", order: 14, status: "active", device: "all",
    title: "Home office no quarto",
    category: "Trabalho e descanso",
    target: "Estudantes e remoto parcial",
    description: "Separe visualmente trabalho e descanso sem reformar o quarto.",
    badge: "Sem reforma",
    investimento: "economico",
    investLabel: "R$ 300–1.500",
    cta: "Gerar para o quarto",
    img: "/__new/setup-compact.webp",
    palette: ["#D9B58A", "#FBF8F1", "#155659", "#0F1F22"],
    elements: ["Mesa compacta", "Luminária quente", "Organizadores fechados", "Painel discreto"],
    treatment: "warm", popularity: 76,
    style: "quarto",
    accent: "oklch(0.62 0.09 55)",
  },
  {
    id: "na-sala", order: 15, status: "active", device: "all",
    title: "Home office na sala",
    category: "Combina com a decoração",
    target: "Casais e famílias",
    description: "Crie um canto de trabalho que se mistura com a estética da sala.",
    badge: "Decoração integrada",
    investimento: "intermediario",
    investLabel: "R$ 1.500–3.000",
    cta: "Gerar para a sala",
    img: "/__new/setup-minimal.webp",
    palette: ["#FBF8F1", "#D9B58A", "#6FB8B5", "#54676B"],
    elements: ["Escrivaninha decorativa", "Cadeira bonita", "Prateleira", "Caixas organizadoras"],
    treatment: "bright", popularity: 79, trending: true,
    style: "sala",
    accent: "var(--brand-teal-300)",
  },
  {
    id: "ergonomico", order: 16, status: "active", device: "all",
    title: "Home office ergonômico",
    category: "Conforto que se sente",
    target: "Quem sente dor nas costas",
    description: "Postura, tela na altura certa e cadeira confortável sem gastar uma fortuna.",
    badge: "Adeus dor nas costas",
    investimento: "intermediario",
    investLabel: "R$ 800–2.000",
    cta: "Gerar setup ergonômico",
    img: "/__new/setup-after.webp",
    palette: ["#2A8E8E", "#54676B", "#D9B58A", "#FBF8F1"],
    elements: ["Cadeira ergo", "Suporte monitor", "Apoio pés", "Teclado externo"],
    treatment: "none", popularity: 87, trending: true,
    style: "ergonomico",
    accent: "var(--primary)",
  },
];

const INVEST_FILTERS = [
  { id: "todos",         label: "Todos" },
  { id: "sem-compra",    label: "Sem comprar", sub: "R$ 0" },
  { id: "economico",     label: "Econômico", sub: "até R$ 1.5k" },
  { id: "intermediario", label: "Intermediário", sub: "R$ 1.5k–5k" },
  { id: "premium",       label: "Premium", sub: "R$ 5k+" },
];

const INVEST_COLORS: Record<string, { bg: string; fg: string }> = {
  "sem-compra":  { bg: "oklch(0.6 0.13 155 / 0.18)", fg: "var(--success)" },
  economico:     { bg: "oklch(0.6 0.13 155 / 0.12)", fg: "var(--success)" },
  intermediario: { bg: "oklch(0.42 0.07 195 / 0.12)", fg: "var(--primary)" },
  premium:       { bg: "oklch(0.72 0.18 35 / 0.12)", fg: "var(--brand-coral-500)" },
};

const TREATMENTS: Record<string, { filter: string; overlay: string | null }> = {
  none:    { filter: "none", overlay: null },
  warm:    { filter: "saturate(1.1) contrast(1.05)", overlay: "linear-gradient(135deg, oklch(0.7 0.15 55 / 0.18), transparent 60%)" },
  deep:    { filter: "saturate(0.85) brightness(0.92)", overlay: "linear-gradient(180deg, oklch(0.2 0.06 195 / 0.3), oklch(0.15 0.04 195 / 0.4))" },
  soft:    { filter: "saturate(0.9) brightness(1.05)", overlay: "linear-gradient(180deg, oklch(0.85 0.06 25 / 0.18), transparent 50%)" },
  vibrant: { filter: "saturate(1.25) contrast(1.08)", overlay: "linear-gradient(135deg, oklch(0.72 0.18 35 / 0.22), transparent 55%)" },
  cool:    { filter: "saturate(1.05) hue-rotate(-8deg)", overlay: "linear-gradient(180deg, oklch(0.5 0.12 280 / 0.22), oklch(0.18 0.02 200 / 0.3))" },
  bright:  { filter: "brightness(1.08) saturate(0.95)", overlay: "linear-gradient(180deg, oklch(0.98 0.012 85 / 0.15), transparent 70%)" },
  dark:    { filter: "saturate(0.95) brightness(0.78) contrast(1.1)", overlay: "linear-gradient(180deg, oklch(0.12 0.02 195 / 0.45), oklch(0.08 0.02 195 / 0.5))" },
};

const track = (event: string, data: Record<string, any> = {}) => console.log(`[tracking] ${event}`, data);

interface PaletteSwatchProps {
  colors: string[];
}
const PaletteSwatch = ({ colors }: PaletteSwatchProps) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {colors.map((c, i) => (
      <span key={i} style={{
        width: 14, height: 14, borderRadius: 9999,
        background: c, border: "1.5px solid rgba(255,255,255,0.9)",
        marginLeft: i > 0 ? -5 : 0,
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}/>
    ))}
  </div>
);

interface StyleCardProps {
  card: typeof STYLE_CARDS[number];
  onClick?: (card: typeof STYLE_CARDS[number]) => void;
}
const StyleCard = ({ card, onClick }: StyleCardProps) => {
  const [hovered, setHovered] = useState(false);
  const ic = INVEST_COLORS[card.investimento] || INVEST_COLORS.intermediario;
  const tr = TREATMENTS[card.treatment] || TREATMENTS.none;

  return (
    <div
      onClick={() => { track("home_carousel_card_clicked", { id: card.id }); onClick?.(card); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0, width: "100%",
        borderRadius: "var(--radius-3xl)", overflow: "hidden",
        cursor: "pointer", position: "relative",
        boxShadow: hovered ? "var(--shadow-elegant)" : "var(--shadow-soft)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      {/* Image with style-specific treatment */}
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <img src={card.img} alt={card.title} loading="lazy"
             style={{
               width: "100%", height: "100%", objectFit: "cover", display: "block",
               filter: tr.filter,
               transform: hovered ? "scale(1.06)" : "scale(1)",
               transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), filter 400ms ease",
             }}/>

        {/* Style-specific color cast overlay */}
        {tr.overlay && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: tr.overlay, mixBlendMode: "multiply",
          }}/>
        )}

        {/* Bottom gradient for text legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, oklch(0.10 0.02 200 / 0.92) 0%, oklch(0.10 0.02 200 / 0.4) 45%, transparent 75%)",
        }}/>

        {/* Render scan-line animation on hover */}
        {hovered && (
          <>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
              background: "linear-gradient(to bottom, transparent 0%, oklch(0.72 0.18 35 / 0.35) 45%, oklch(0.72 0.18 35 / 0.55) 50%, oklch(0.72 0.18 35 / 0.35) 55%, transparent 100%)",
              backgroundSize: "100% 24px",
              backgroundRepeat: "no-repeat",
              animation: "renderScan 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              mixBlendMode: "screen",
            }}/>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
              background: "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.025) 3px, rgba(255,255,255,0.025) 4px)",
              opacity: 0, animation: "fadeIn 400ms ease 200ms forwards",
            }}/>
          </>
        )}

        {/* Badge top-left */}
        <div style={{
          position: "absolute", top: 14, left: 14,
          display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", maxWidth: "60%",
        }}>
          {(card as any).trending && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "var(--brand-coral-500)", color: "white",
              padding: "5px 10px", borderRadius: 9999,
              fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              boxShadow: "var(--shadow-coral)",
            }}>
              <I.Flame size={11}/> Trending
            </span>
          )}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
            padding: "5px 12px", borderRadius: 9999,
            fontSize: 11, fontWeight: 700, color: "var(--foreground)",
            boxShadow: "var(--shadow-soft)",
          }}>
            <I.Sparkles size={12} style={{ color: card.accent }}/>
            {card.badge}
          </span>
        </div>

        {/* Investment badge top-right */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          display: "inline-flex", alignItems: "center", gap: 4,
          background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
          padding: "5px 10px", borderRadius: 9999,
          fontSize: 10, fontWeight: 700,
          color: ic.fg,
          boxShadow: "var(--shadow-soft)",
        }}>
          {card.investLabel}
        </div>

        {/* Reference marker (subtle) */}
        <div style={{
          position: "absolute", top: 56, right: 14,
          padding: "3px 8px", borderRadius: 9999,
          background: "rgba(15, 31, 34, 0.55)", backdropFilter: "blur(6px)",
          fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.05em", textTransform: "uppercase",
          opacity: hovered ? 1 : 0.7, transition: "opacity 200ms ease",
        }}>
          Imagem de referência
        </div>

        {/* Palette swatches */}
        <div style={{
          position: "absolute", top: 56, left: 18,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <PaletteSwatch colors={card.palette}/>
        </div>

        {/* Content bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 20px 18px" }}>
          {/* Popularity meter */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 5,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.78)",
                letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <I.Users size={10}/>
                <strong style={{ fontWeight: 700, color: "white" }}>{card.popularity}%</strong>
                escolhem este estilo
              </span>
            </div>
            <div style={{
              height: 3, borderRadius: 9999, overflow: "hidden",
              background: "rgba(255,255,255,0.18)",
            }}>
              <div style={{
                height: "100%", borderRadius: 9999,
                width: hovered ? `${card.popularity}%` : `${Math.max(20, card.popularity * 0.85)}%`,
                background: `linear-gradient(to right, ${card.accent}, var(--brand-coral-500))`,
                transition: "width 1000ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}/>
            </div>
          </div>
          {/* Category + target */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{card.category}</span>
            <span style={{ width: 3, height: 3, borderRadius: 9999, background: "rgba(255,255,255,0.35)" }}/>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{card.target}</span>
          </div>

          <h3 style={{
            fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
            color: "white", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em",
          }}>{card.title}</h3>

          {/* Elements chips */}
          <div style={{
            display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10,
            maxHeight: hovered ? 50 : 0, overflow: "hidden",
            transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            {card.elements.slice(0, 4).map(el => (
              <span key={el} style={{
                fontSize: 10, fontWeight: 600,
                color: "white",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                padding: "3px 8px", borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.18)",
              }}>
                {el}
              </span>
            ))}
          </div>

          <p style={{
            marginTop: hovered ? 10 : 6, fontSize: 13, color: "rgba(255,255,255,0.78)",
            lineHeight: 1.45, maxWidth: 340,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            transition: "margin 300ms ease",
          }}>{card.description}</p>

          {/* CTA */}
          <button
            onClick={e => { e.stopPropagation(); track("home_carousel_cta_clicked", { id: card.id }); onClick?.(card); }}
            style={{
              marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8,
              background: "white", color: "var(--foreground)",
              border: "none", borderRadius: 9999,
              padding: "10px 22px", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-sans)", cursor: "pointer",
              boxShadow: "var(--shadow-soft)",
              transform: hovered ? "translateX(4px)" : "translateX(0)",
              transition: "all 300ms ease",
            }}
          >
            {card.cta} <I.ArrowRight size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STATES
// ============================================================
const SkeletonCard = () => (
  <div style={{
    flexShrink: 0, width: "100%", borderRadius: "var(--radius-3xl)",
    overflow: "hidden", background: "var(--muted)", aspectRatio: "16/10",
    animation: "pulse 1.5s ease-in-out infinite",
  }}>
    <div style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
      <div style={{ width: 100, height: 12, borderRadius: 6, background: "var(--border)", marginBottom: 8 }}/>
      <div style={{ width: 200, height: 18, borderRadius: 6, background: "var(--border)", marginBottom: 6 }}/>
      <div style={{ width: 260, height: 12, borderRadius: 6, background: "var(--border)", marginBottom: 14 }}/>
      <div style={{ width: 140, height: 40, borderRadius: 9999, background: "var(--border)" }}/>
    </div>
  </div>
);

const EmptyCarousel = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "48px 24px", textAlign: "center",
    borderRadius: "var(--radius-3xl)", border: "2px dashed var(--border)", background: "var(--muted)",
  }}>
    <I.Image size={48} style={{ color: "var(--muted-foreground)", marginBottom: 12 }}/>
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
      Nenhum estilo disponível
    </h3>
    <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted-foreground)", maxWidth: 320 }}>
      Os estilos de decoração estão sendo preparados. Volte em breve!
    </p>
  </div>
);

interface ErrorCarouselProps {
  onRetry?: () => void;
}
const ErrorCarousel = ({ onRetry }: ErrorCarouselProps) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: "48px 24px", textAlign: "center",
    borderRadius: "var(--radius-3xl)", border: "1px solid oklch(0.6 0.22 27 / 0.3)",
    background: "oklch(0.6 0.22 27 / 0.05)",
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      background: "oklch(0.6 0.22 27 / 0.12)", marginBottom: 12,
    }}>
      <I.X size={24} style={{ color: "var(--destructive)" }}/>
    </div>
    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
      Erro ao carregar estilos
    </h3>
    <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted-foreground)", maxWidth: 320 }}>
      Não foi possível carregar os estilos. Verifique sua conexão.
    </p>
    <button onClick={onRetry} style={{
      marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
      background: "var(--foreground)", color: "var(--background)",
      border: "none", borderRadius: 9999, padding: "10px 24px",
      fontSize: 14, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer",
    }}>Tentar novamente</button>
  </div>
);

// ============================================================
// MAIN CAROUSEL
// ============================================================
export interface CarrosselEstilosProps {
  adminCards?: typeof STYLE_CARDS;
  state?: "ready" | "loading" | "empty" | "error";
  onCardClick?: (card: any) => void;
}

const CarrosselEstilos = ({ adminCards, state = "ready", onCardClick }: CarrosselEstilosProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [investFilter, setInvestFilter] = useState("todos");
  const toast = useToast();

  const allCards = useMemo(() => {
    const source = adminCards || STYLE_CARDS;
    return source.filter(c => c.status === "active").sort((a, b) => a.order - b.order);
  }, [adminCards]);

  const cards = useMemo(() => {
    if (investFilter === "todos") return allCards;
    return allCards.filter(c => c.investimento === investFilter);
  }, [allCards, investFilter]);

  const cardCount = cards.length;

  const scrollToIdx = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el || !el.children[idx]) return;
    el.scrollTo({ left: (el.children[idx] as HTMLElement).offsetLeft - 24, behavior: "smooth" });
    setActiveIdx(idx);
  }, []);

  useEffect(() => {
    setActiveIdx(0);
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, [investFilter]);

  useEffect(() => {
    if (isPaused || state !== "ready" || cardCount <= 1) return;
    autoplayRef.current = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % cardCount;
        scrollToIdx(next);
        return next;
      });
    }, 5000);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [isPaused, state, cardCount, scrollToIdx]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const children = [...el.children] as HTMLElement[];
      if (!children.length) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0, minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIdx(closest);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [cards]);

  useEffect(() => { track("home_carousel_viewed", { total: cards.length, filter: investFilter }); }, [cards.length, investFilter]);

  const handleCardClick = (card: any) => {
    track("home_carousel_style_selected", { id: card.id, style: card.style });
    if (onCardClick) onCardClick(card);
    else toast.show(`Gerando estilo "${card.title}" com IA…`);
  };

  const goLeft = () => scrollToIdx(Math.max(0, activeIdx - 1));
  const goRight = () => scrollToIdx(Math.min(cardCount - 1, activeIdx + 1));

  return (
    <section style={{ padding: "56px 0 64px", background: "var(--background)", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 28px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "oklch(0.72 0.18 35 / 0.15)", color: "var(--brand-coral-500)",
            padding: "5px 14px", borderRadius: 9999, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14,
          }}>
            <I.Sparkles size={13}/> IA Generativa
          </span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "clamp(26px, 4vw, 40px)", lineHeight: 1.08,
            letterSpacing: "-0.025em", color: "var(--foreground)", margin: 0,
          }}>
            Veja ideias de office para{" "}
            <span style={{
              backgroundImage: "var(--gradient-warm)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>todos os estilos e orçamentos</span>
          </h2>
          <p style={{ marginTop: 12, fontSize: 16, color: "var(--muted-foreground)", lineHeight: 1.55 }}>
            De um simples reposicionamento sem gastar nada até projetos sofisticados — gere versões decoradas do seu office com IA.
          </p>
        </div>

        {/* Investment filters */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 8, marginBottom: 24,
          overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none",
        }}>
          {INVEST_FILTERS.map(f => {
            const isActive = investFilter === f.id;
            return (
              <button key={f.id} onClick={() => setInvestFilter(f.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 18px", borderRadius: 9999, fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: "var(--font-sans)", cursor: "pointer",
                        whiteSpace: "nowrap", flexShrink: 0,
                        background: isActive ? "var(--foreground)" : "var(--card)",
                        color: isActive ? "var(--background)" : "var(--muted-foreground)",
                        border: isActive ? "none" : "1px solid var(--border)",
                        transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}>
                {f.label}
                {(f as any).sub && <span style={{ fontSize: 11, opacity: 0.65 }}>{(f as any).sub}</span>}
                {f.id !== "todos" && (
                  <span style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "var(--muted)",
                    padding: "1px 7px", borderRadius: 9999, fontSize: 11, fontWeight: 700,
                  }}>
                    {STYLE_CARDS.filter(c => c.status === "active" && c.investimento === f.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* States */}
        {state === "loading" && (
          <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
            {[1,2,3].map(i => <div key={i} style={{ flex: "0 0 calc(33.33% - 14px)", minWidth: 300 }}><SkeletonCard/></div>)}
          </div>
        )}
        {state === "empty" && <EmptyCarousel/>}
        {state === "error" && <ErrorCarousel onRetry={() => toast.show("Recarregando estilos…")}/>}

        {state === "ready" && cards.length > 0 && (
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            <div ref={scrollRef} key={investFilter} style={{
              display: "flex", gap: 20, overflowX: "auto",
              scrollSnapType: "x mandatory", scrollbarWidth: "none",
              paddingBottom: 8, WebkitOverflowScrolling: "touch",
              animation: "fadeUp 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              {cards.map((card) => (
                <div key={card.id} style={{
                  flex: "0 0 calc(33.33% - 14px)", minWidth: 300,
                  scrollSnapAlign: "start",
                }}>
                  <StyleCard card={card} onClick={handleCardClick}/>
                </div>
              ))}
            </div>

            {cardCount > 3 && (
              <>
                <button onClick={goLeft} disabled={activeIdx === 0} className="hidden lg:!flex"
                        style={{
                          position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
                          width: 48, height: 48, borderRadius: 9999, zIndex: 5,
                          background: activeIdx === 0 ? "var(--secondary)" : "var(--card)",
                          border: "1px solid var(--border)",
                          boxShadow: activeIdx === 0 ? "none" : "var(--shadow-elegant)",
                          alignItems: "center", justifyContent: "center",
                          cursor: activeIdx === 0 ? "default" : "pointer",
                          opacity: activeIdx === 0 ? 0.35 : 1,
                          transition: "all 200ms ease", color: "var(--foreground)",
                        }}>
                  <I.ChevronLeft size={22}/>
                </button>
                <button onClick={goRight} disabled={activeIdx >= cardCount - 1} className="hidden lg:!flex"
                        style={{
                          position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
                          width: 48, height: 48, borderRadius: 9999, zIndex: 5,
                          background: activeIdx >= cardCount - 1 ? "var(--secondary)" : "var(--card)",
                          border: "1px solid var(--border)",
                          boxShadow: activeIdx >= cardCount - 1 ? "none" : "var(--shadow-elegant)",
                          alignItems: "center", justifyContent: "center",
                          cursor: activeIdx >= cardCount - 1 ? "default" : "pointer",
                          opacity: activeIdx >= cardCount - 1 ? 0.35 : 1,
                          transition: "all 200ms ease", color: "var(--foreground)",
                        }}>
                  <I.ChevronRight size={22}/>
                </button>
              </>
            )}

            {activeIdx > 0 && (
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 8, width: 48,
                background: "linear-gradient(to right, var(--background), transparent)",
                pointerEvents: "none", zIndex: 3,
              }}/>
            )}
            {activeIdx < cardCount - 1 && (
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 8, width: 48,
                background: "linear-gradient(to left, var(--background), transparent)",
                pointerEvents: "none", zIndex: 3,
              }}/>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
              {cards.map((_, i) => (
                <button key={i} onClick={() => scrollToIdx(i)}
                        style={{
                          width: i === activeIdx ? 24 : 8, height: 8, borderRadius: 9999,
                          background: i === activeIdx ? "var(--primary)" : "var(--border)",
                          border: "none", cursor: "pointer", padding: 0,
                          transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                        aria-label={`Estilo ${i + 1}`}/>
              ))}
            </div>
          </div>
        )}

        {state === "ready" && cards.length === 0 && investFilter !== "todos" && (
          <div style={{
            textAlign: "center", padding: "40px 24px",
            borderRadius: "var(--radius-3xl)", border: "2px dashed var(--border)",
            background: "var(--muted)",
          }}>
            <p style={{ fontSize: 15, color: "var(--muted-foreground)" }}>
              Nenhum estilo nessa faixa de investimento.{" "}
              <button onClick={() => setInvestFilter("todos")} style={{
                background: "none", border: "none", color: "var(--primary)",
                fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "var(--font-sans)",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>Ver todos</button>
            </p>
          </div>
        )}

        {/* Bottom CTA + disclaimer */}
        {state === "ready" && allCards.length > 0 && (
          <>
            <div style={{
              marginTop: 36, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 12, textAlign: "center",
            }}>
              <p style={{ fontSize: 15, color: "var(--muted-foreground)", maxWidth: 440, lineHeight: 1.55 }}>
                Envie uma foto do seu espaço e veja como ele poderia ficar em diferentes estilos, com ideias realistas para o seu orçamento.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  onClick={() => { track("generation_started_from_carousel"); toast.show("Abrindo fluxo de upload…"); onCardClick?.({ style: "any" }); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--gradient-hero)", color: "white",
                    border: "none", borderRadius: 9999,
                    padding: "14px 32px", fontSize: 16, fontWeight: 700,
                    fontFamily: "var(--font-sans)", cursor: "pointer",
                    boxShadow: "var(--shadow-glow)",
                    transition: "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <I.Camera size={20}/> Gerar meu office com IA
                </button>
                <button
                  onClick={() => { scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" }); setInvestFilter("todos"); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--card)", color: "var(--foreground)",
                    border: "1px solid var(--border)", borderRadius: 9999,
                    padding: "14px 28px", fontSize: 16, fontWeight: 600,
                    fontFamily: "var(--font-sans)", cursor: "pointer",
                    transition: "all 200ms ease",
                  }}
                >
                  Explorar estilos <I.ArrowRight size={16}/>
                </button>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Gratuito · Sem cadastro · Resultado em 30 segundos
              </span>
            </div>

            {/* Subtle reference disclaimer */}
            <div style={{
              marginTop: 24, padding: "10px 20px", borderRadius: 9999,
              background: "var(--muted)", maxWidth: 520, margin: "24px auto 0",
              fontSize: 11, color: "var(--muted-foreground)", textAlign: "center",
              lineHeight: 1.5,
            }}>
              <I.Sparkles size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4, color: "var(--brand-coral-500)" }}/>
              Imagens ilustrativas com tratamento por estilo. Os resultados gerados pela IA são personalizados a partir da sua foto.
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export { STYLE_CARDS };
export default CarrosselEstilos;
