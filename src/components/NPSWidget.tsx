import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";
import { hasConsent } from "@/lib/consent";
import { toast } from "sonner";

// NPS — "0–10 quanto recomendaria o home office live?"
//
// REGRAS DE EXIBIÇÃO (UX-first, não-bloqueante):
//   - Só roda com cookie consent aceito
//   - Só pergunta 1x a cada 90 dias por dispositivo
//   - Não aparece em rotas críticas (checkout, /diagnostico em análise)
//   - Trigger: depois de N páginas vistas OU sinal de "valor entregue"
//     (ex: passar por /result, postar setup, anunciar). Aqui usamos
//     `pageViewsBeforeAsk` por simplicidade — pode ser refinado.
//   - Bottom-right slide-in. Dispensável com X. Não bloqueia clique no resto.

const STORAGE_KEY = "deskly:nps";
const COOLDOWN_DAYS = 90;
const PAGEVIEW_KEY = "deskly:nps:pv";

type Stored = { lastAskedAt: number; lastScore?: number };

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(s: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function bumpPageViews(): number {
  try {
    const n = +(window.localStorage.getItem(PAGEVIEW_KEY) || "0") + 1;
    window.localStorage.setItem(PAGEVIEW_KEY, String(n));
    return n;
  } catch {
    return 0;
  }
}

const EXCLUDED_PATHS = ["/auth", "/checkout", "/premium"];

export function NPSWidget({ pageViewsBeforeAsk = 5 }: { pageViewsBeforeAsk?: number }) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"score" | "comment" | "done">("score");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasConsent()) return;

    const path = window.location.pathname;
    if (EXCLUDED_PATHS.some((p) => path.startsWith(p))) return;

    const stored = readStored();
    if (stored) {
      const daysSince = (Date.now() - stored.lastAskedAt) / (24 * 60 * 60 * 1000);
      if (daysSince < COOLDOWN_DAYS) return;
    }

    const pv = bumpPageViews();
    if (pv < pageViewsBeforeAsk) return;

    // Atraso pequeno pra não interromper o paint inicial
    const t = setTimeout(() => setOpen(true), 3500);
    return () => clearTimeout(t);
  }, [pageViewsBeforeAsk]);

  const dismiss = () => {
    writeStored({ lastAskedAt: Date.now() });
    track("nps_dismissed", "other", { step });
    setOpen(false);
  };

  const submitScore = (s: number) => {
    setScore(s);
    setStep("comment");
  };

  const submitComment = () => {
    if (score === null) return;
    track("nps_response", "other", {
      score,
      comment: comment.trim().slice(0, 1000) || undefined,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
    writeStored({ lastAskedAt: Date.now(), lastScore: score });
    setStep("done");
    setTimeout(() => setOpen(false), 1800);
    toast.success("Valeu! Sua nota ajuda a gente a melhorar.");
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Pesquisa NPS"
      className="fixed bottom-20 right-4 z-30 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-5 shadow-elegant md:bottom-24 md:right-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      {step === "score" && (
        <>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
            Pesquisa rápida · 10 segundos
          </div>
          <h3 className="font-display text-base font-bold leading-tight">
            De 0 a 10, quanto você recomendaria o home office live pra um amigo?
          </h3>
          <div className="mt-4 grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => submitScore(i)}
                aria-label={`Nota ${i}`}
                className="aspect-square rounded-md border border-border bg-card text-sm font-semibold transition-smooth hover:border-primary hover:bg-primary/5"
              >
                {i}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>Nem um pouco</span>
            <span>Com certeza</span>
          </div>
        </>
      )}

      {step === "comment" && score !== null && (
        <>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
            Nota {score} · obrigado
          </div>
          <h3 className="font-display text-base font-bold leading-tight">
            {score >= 9
              ? "O que tá funcionando bem pra você?"
              : score >= 7
              ? "O que poderia ficar ainda melhor?"
              : "O que mais te incomodou?"}
          </h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Opcional — qualquer coisa ajuda"
            rows={3}
            maxLength={1000}
            className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={submitComment}>
              Pular
            </Button>
            <Button size="sm" onClick={submitComment} className="bg-gradient-hero">
              Enviar
            </Button>
          </div>
        </>
      )}

      {step === "done" && (
        <div className="py-2 text-center">
          <div className="font-display text-lg font-bold">Recebido. Valeu!</div>
          <p className="mt-1 text-sm text-muted-foreground">A gente lê todas as respostas.</p>
        </div>
      )}
    </div>
  );
}
