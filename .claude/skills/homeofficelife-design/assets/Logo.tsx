// Logo da marca homeoffice.life — SVG inline, horizontal lockup.
//
// PROPÓSITO DA MARCA:
//   - "h" minúsculo: humano, acessível, brasileiro (Lat Lab style)
//   - Sparkle coral: insight da IA (não decorativo — é o produto)
//   - Wordmark sans condensado: tecnológico mas caloroso
//
// PORQUÊ SVG (não PNG):
//   1. Escala perfeito de 16px (favicon) a 200px (hero) sem perda
//   2. Cores usam CSS variables — se mudar paleta, logo acompanha
//   3. ~1KB no bundle vs ~80KB PNG
//   4. Single source pra rich logos, monocromáticos, favicons
//
// COMO USAR:
//   <Logo size={32} />        — só ícone (32px)
//   <Logo size={32} variant="full" />     — ícone + wordmark
//   <Logo size={32} variant="full" tone="white" />  — versão pra fundo escuro

type Props = {
  /** Altura em px. Wordmark escala proporcional. */
  size?: number;
  /** "icon" = só o h, "full" = h + wordmark */
  variant?: "icon" | "full";
  /** "brand" usa cores da marca, "white" inverte pra fundo escuro */
  tone?: "brand" | "white";
  className?: string;
  /** Texto pro aria-label e <title> do SVG */
  label?: string;
};

export function Logo({
  size = 32,
  variant = "full",
  tone = "brand",
  className,
  label = "homeofficelife — home office avaliado por IA",
}: Props) {
  // Cores: brand usa CSS vars (acompanha tema/dark mode). White hardcoded.
  const primary = tone === "white" ? "#FFFFFF" : "var(--color-primary)";
  const accent = tone === "white" ? "#FFFFFF" : "var(--color-accent)";

  // Proporções: ícone é quadrado size×size. Wordmark adiciona ~3.6× a largura.
  const width = variant === "full" ? size * 4.6 : size;

  return (
    <svg
      role="img"
      aria-label={label}
      width={width}
      height={size}
      viewBox={variant === "full" ? "0 0 184 40" : "0 0 40 40"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{label}</title>

      {/* "h" — sem serif, peso médio. Path otimizado pra parecer corpo arredondado. */}
      <path
        d="M9 7v25h5.5V21c0-3 1.8-5 4.5-5s4.5 2 4.5 5v11H29V20c0-5.5-3.6-9.2-8.8-9.2-2.4 0-4.5.9-5.7 2.4V7H9z"
        fill={primary}
      />

      {/* Sparkle (4 pontas) — coral. Posicionado no topo-direito do h. */}
      <path
        d="M32 4.5l1.1 3.4 3.4 1.1-3.4 1.1L32 13.5l-1.1-3.4-3.4-1.1 3.4-1.1L32 4.5z"
        fill={accent}
      />

      {/* Wordmark — só se variant=full */}
      {variant === "full" && (
        <text
          x={50}
          y={28}
          fontFamily='"Space Grotesk", "DM Sans", system-ui, sans-serif'
          fontWeight={700}
          fontSize={20}
          fill={primary}
          letterSpacing="-0.02em"
        >
          homeoffice<tspan fontWeight={500}>life</tspan>
        </text>
      )}
    </svg>
  );
}
