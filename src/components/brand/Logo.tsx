// Logo canônico — Office Planner
//
// Conceito: monograma "OP" em squircle azul
//   - Squircle azul: tech, confiança, profissionalismo
//   - "OP" em branco: Office Planner, legível em qualquer tamanho
//
// USO:
//   <Logo size={32} />                          — ícone (squircle + OP)
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
  const inkColor   = tone === "white" ? "#FFFFFF"  : "#0F172A";
  const mutedColor = tone === "white" ? "rgba(255,255,255,0.55)" : "#64748B";

  const gap = Math.round(size * 0.3);
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

      {/* ── Squircle azul ── */}
      <rect width={size} height={size} rx={Math.round(size * 0.25)} fill="#2563EB" />

      {/* ── Monograma "OP" em branco ── */}
      <text
        x={size / 2}
        y={Math.round(size * 0.685)}
        textAnchor="middle"
        fontFamily='"Space Grotesk", system-ui, sans-serif'
        fontSize={Math.round(size * 0.46)}
        fontWeight="700"
        letterSpacing="-0.03em"
        fill="white"
      >
        OP
      </text>

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
