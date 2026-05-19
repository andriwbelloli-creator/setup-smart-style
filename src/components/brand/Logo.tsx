// Logo canônico — Office Planner
//
// Conceito: Porta Aberta (logo 08, mockup v2)
//   - Porta teal com frame exterior e painel em perspectiva
//   - Maçaneta coral: elemento de identidade da marca
//   - Sem squircle escuro — logo limpo sobre qualquer fundo
//
// USO:
//   <Logo size={32} />                          — ícone (porta)
//   <Logo size={32} variant="full" />           — ícone + wordmark
//   <Logo size={32} variant="full" tone="white" /> — sobre fundo escuro

type Props = {
  size?: number;
  variant?: "icon" | "full";
  tone?: "brand" | "white";
  className?: string;
  label?: string;
};

export function Logo({
  size = 32,
  variant = "full",
  tone = "brand",
  className,
  label = "Office Planner — planeje seu office com IA",
}: Props) {
  const doorColor = tone === "white" ? "#FFFFFF"  : "#2A8E8E";
  const panelOp  = tone === "white" ? "0.25"      : "0.18";
  const inkColor  = tone === "white" ? "#FFFFFF"  : "#0F1F22";
  const mutedColor = tone === "white" ? "rgba(255,255,255,0.55)" : "#54676B";

  const gap = Math.round(size * 0.28);
  const fontSize = Math.round(size * 0.55);
  const totalW = variant === "full" ? size + gap + Math.round(fontSize * 8.2) : size;

  return (
    <svg
      role="img"
      aria-label={label}
      width={totalW}
      height={size}
      viewBox={`0 0 ${totalW} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{label}</title>

      {/* ── Ícone: porta aberta em perspectiva (viewBox 36×36) ── */}
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        {/* Frame exterior (batente) */}
        <rect x="5" y="4" width="20" height="28" rx="2"
              stroke={doorColor} strokeWidth="2.5" fill="none" />
        {/* Folha aberta em perspectiva */}
        <path d="M25 6 L31 8.5 L31 30 L25 32 Z"
              fill={doorColor} opacity={panelOp} />
        <path d="M25 6 L31 8.5 L31 30 L25 32 Z"
              stroke={doorColor} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        {/* Linha divisória */}
        <line x1="25" y1="6" x2="25" y2="32"
              stroke={doorColor} strokeWidth="2.2" />
        {/* Maçaneta coral */}
        <circle cx="22.5" cy="19" r="1.5" fill="#F36458" />
      </svg>

      {/* ── Wordmark: "Office" bold + "Planner" regular/muted ── */}
      {variant === "full" && (
        <text
          x={size + gap}
          y={Math.round(size * 0.68)}
          fontFamily='"Space Grotesk", "DM Sans", system-ui, sans-serif'
          fontSize={fontSize}
          letterSpacing="-0.02em"
          fill={inkColor}
        >
          <tspan fontWeight="700">Office</tspan>
          <tspan fontWeight="400" fill={mutedColor}> Planner</tspan>
        </text>
      )}
    </svg>
  );
}
