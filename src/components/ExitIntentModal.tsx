import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Check, Loader2, X } from "lucide-react";

const STORAGE_KEY = "deskly:exit_intent_seen";
const STORAGE_DISMISSED = "deskly:exit_intent_dismissed";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/**
 * Exit-intent capture: detecta mouse subindo em direção a fechar
 * a aba (desktop) ou troca de tab (mobile fallback), oferece lead
 * magnet "Guia 50 dicas pra subir nota IA pra 9+".
 *
 * Frequência: aparece uma vez por sessão se o user ainda não
 * dispensou. Se ele dispensar, não aparece de novo nunca naquele
 * navegador (localStorage).
 */
export function ExitIntentModal() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Se já dispensou, nunca mais
    if (localStorage.getItem(STORAGE_DISMISSED)) return;
    // Se já viu nessa sessão, não mostra de novo
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let shown = false;
    const trigger = () => {
      if (shown) return;
      shown = true;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(true);
    };

    // Desktop: mouse subiu pra próximo a y=0 (vai fechar tab ou clicar URL bar)
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) trigger();
    };
    // Mobile: tab fica invisível (user trocou de app)
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // espera 2s antes de gatilhar — evita popup imediato em refresh
        setTimeout(() => {
          if (document.visibilityState === "visible") return; // voltou rápido
          trigger();
        }, 2000);
      }
    };

    // Só ativa após 10s de página (não interrompe leitura inicial)
    const tid = window.setTimeout(() => {
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }, 10_000);

    return () => {
      window.clearTimeout(tid);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const close = (dismissPermanent = false) => {
    setVisible(false);
    if (dismissPermanent && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_DISMISSED, new Date().toISOString());
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    const consentText = "Exit-intent: Guia 50 dicas + newsletter Deskly | Cancela em 1 clique";
    const { error } = await supabase.from("newsletter_signups").insert({
      email: email.toLowerCase().trim(),
      source: "exit_intent_guide",
      consent_text: consentText,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent.slice(0, 200),
    });
    if (error && error.code !== "23505") {
      setState("error");
      return;
    }
    setState("ok");
    // Fecha automático após 3s e marca como dispensado permanente (já tem o email)
    setTimeout(() => close(true), 3000);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 px-4 backdrop-blur-sm"
      onClick={() => close(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-card p-7 shadow-elegant"
      >
        <button
          onClick={() => close(true)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {state === "ok" ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">Boa! Confere seu email.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              O guia chega em até 24h. Verifica também a aba de promoções.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground shadow-elegant">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex rounded-full bg-coral/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral-foreground">
                  Antes de sair...
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                  Leva o guia <span className="text-primary">50 dicas pra subir sua nota IA pra 9+</span>
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              PDF gratuito com as 50 ações que mais sobem nota em setups brasileiros (analisamos 12k+). Ergonomia, iluminação, organização e cabos — cada dica com produto sob R$ 200.
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90 disabled:opacity-60"
              >
                {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                Quero o guia
              </button>
            </form>
            {state === "error" && (
              <p className="mt-2 text-xs text-destructive">Email inválido. Tenta de novo.</p>
            )}

            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
              Sem spam. 1 email/semana. Cancela em 1 clique. Veja a{" "}
              <a href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</a>.
            </p>

            <button
              onClick={() => close(true)}
              className="mt-4 text-center text-xs text-muted-foreground hover:underline"
            >
              Não, obrigado — não mostrar de novo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
