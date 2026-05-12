/**
 * Link armadilha (honeypot) — invisível a usuários, screen readers e
 * keyboard nav, mas presente no HTML. Bots que parseiam HTML cego (a
 * maioria dos scrapers) seguem o link e caem no /honeypot do servidor,
 * que adiciona o IP a uma blocklist in-memory.
 *
 * Por que tantas defesas:
 * - display:none — esconde do layout (usuário não vê)
 * - aria-hidden + tabIndex=-1 — leitor de tela e teclado pulam
 * - rel="nofollow" — Google e crawlers honestos ignoram
 * - href para path bloqueado no robots.txt — quem segue está violando
 */
export function HoneypotLink() {
  return (
    <a
      href="/honeypot"
      rel="nofollow noindex"
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      Setup interno (não clicar)
    </a>
  );
}
