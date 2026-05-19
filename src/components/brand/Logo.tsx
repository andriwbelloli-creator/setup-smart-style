// Logo canônico — Office Planner
//
// Conceito: Porta Aberta (logo 08)
//   - Squircle escuro: profissionalismo, solidez
//   - Porta branca entreaberta: entrada no espaço
//   - Painel âmbar à direita: luz, transformação, IA
//   - Maçaneta coral: elemento de identidade da marca
//
// USO:
//   <Logo size={32} />                          — ícone (squircle)
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
  const inkColor   = tone === "white" ? "#FFFFFF" : "#0F1F22";
  const mutedColor = tone === "white" ? "rgba(255,255,255,0.55)" : "#54676B";

  // Ícone: squircle escuro + porta branca + painel âmbar
  // viewBox 40×40 para o ícone isolado; full adiciona wordmark à direita
  const iconW = size;
  const totalW = variant === "full" ? size + size * 3.6 : size;

  return (
    <svg
      role="img"
      aria-label={label}
      width={totalW}
      height={iconW}
      viewBox={variant === "full" ? `0 0 ${40 + 40 * 3.6} 40` : "0 0 40 40"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{label}</title>

      {/* ── Squircle background ── */}
      <rect width="40" height="40" rx="9" fill="#1E3A5F" />

      {/* ── Porta: frame exterior (branco) ── */}
      <rect x="9" y="8" width="17" height="24" rx="1.5"
            stroke="white" strokeWidth="1.8" fill="none" />

      {/* ── Painel azul (folha direita aberta — luz entrando) ── */}
      <rect x="20" y="8" width="6" height="24" rx="1"
            fill="#93C5FD" opacity="0.90" />

      {/* ── Divisória (linha da dobradiça) ── */}
      <line x1="20" y1="8" x2="20" y2="32"
            stroke="white" strokeWidth="1.4" />

      {/* ── Maçaneta (azul claro — elemento de identidade) ── */}
      <circle cx="17.2" cy="20.5" r="1.4" fill="#60A5FA" />

      {/* ── Wordmark: "Office Planner" — só se variant=full ── */}
      {variant === "full" && (
        <text
          x="48"
          y="26.5"
          fontFamily='"Space Grotesk", "DM Sans", system-ui, sans-serif'
          fontSize="18"
          letterSpacing="-0.025em"
          fill={inkColor}
        >
          <tspan fontWeight="700">Office</tspan>
          <tspan fontWeight="500" fill={mutedColor}> Planner</tspan>
        </text>
      )}
    </svg>
  );
}
