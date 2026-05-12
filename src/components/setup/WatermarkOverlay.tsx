/**
 * Marca d'água "deskly.life" sobreposta nas imagens de setups.
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
export function WatermarkOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-2 right-2 z-10 select-none rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80 mix-blend-difference"
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
    >
      deskly.life
    </div>
  );
}
