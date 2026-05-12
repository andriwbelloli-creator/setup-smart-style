/**
 * Marca d'água "homeoffice.life" sobreposta nas imagens de setups.
 *
 * Soft protection: copiar via screenshot ou DevTools ainda é trivial,
 * mas (1) sinaliza propriedade ao usuário casual, (2) gera atrito
 * pra concorrentes que querem reusar imagens da galeria, e (3) dá base
 * legal pra notificação DMCA quando a marca for removida (engenharia
 * deliberada vs cópia inadvertida).
 *
 * Truques visuais:
 * - mix-blend-mode: difference inverte cor conforme o fundo → sempre legível
 * - position absolute, pointer-events none → não interfere em clique/hover
 * - aria-hidden → não conta como conteúdo pra leitor de tela
 * - drop-shadow → segura legibilidade em backgrounds claros
 */
type Position = "bl" | "br" | "tl" | "tr";

const POSITION_CLASSES: Record<Position, string> = {
  bl: "bottom-2 left-2",
  br: "bottom-2 right-2",
  tl: "top-2 left-2",
  tr: "top-2 right-2",
};

export function WatermarkOverlay({ position = "bl" }: { position?: Position } = {}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 select-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80 mix-blend-difference ${POSITION_CLASSES[position]}`}
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
    >
      homeoffice.life
    </div>
  );
}
