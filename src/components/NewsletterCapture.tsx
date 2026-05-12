import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, Check, Loader2 } from "lucide-react";

type Variant = "inline" | "card";

type Props = {
  /** De onde veio o cadastro — usado pra analytics de fonte. */
  source: string;
  variant?: Variant;
  /** Override visual do título. Default: "Receba os melhores setups direto no email" */
  title?: string;
  /** Override do subtítulo. */
  subtitle?: string;
  className?: string;
};

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function NewsletterCapture({
  source,
  variant = "inline",
  title = "Receba os melhores setups direto no email",
  subtitle = "1 email por semana. Os 3 setups da semana + 1 dica prática. Sem spam.",
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "duplicate" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      return;
    }
    setState("loading");
    const referrer = typeof document !== "undefined" ? document.referrer || null : null;
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null;
    // Texto de consentimento que o usuário viu — gravado pra
    // accountability LGPD (provar opt-in se contestar depois)
    const consentText = `${title} | ${subtitle} | Ao inscrever, você concorda em receber emails do Deskly e pode cancelar a qualquer momento pelo link no rodapé de cada email.`;
    const { error } = await supabase
      .from("newsletter_signups")
      .insert({
        email: email.toLowerCase().trim(),
        source,
        referrer,
        user_agent: userAgent,
        consent_text: consentText,
      });

    if (error) {
      // 23505 = unique violation (email já existe → ok pro user)
      if (error.code === "23505") {
        setState("duplicate");
        return;
      }
      console.warn("newsletter_signups insert:", error.message);
      setState("error");
      return;
    }
    setState("ok");
  };

  const isDone = state === "ok" || state === "duplicate";

  if (variant === "card") {
    return (
      <div className={`rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <FormBody
          email={email}
          setEmail={setEmail}
          state={state}
          setState={setState}
          submit={submit}
          isDone={isDone}
          dense={false}
        />
        {!isDone && <ConsentNote />}
      </div>
    );
  }

  return (
    <div className={className}>
      <FormBody
        email={email}
        setEmail={setEmail}
        state={state}
        setState={setState}
        submit={submit}
        isDone={isDone}
        dense
      />
    </div>
  );
}

function FormBody({
  email,
  setEmail,
  state,
  submit,
  isDone,
  dense,
}: {
  email: string;
  setEmail: (v: string) => void;
  state: "idle" | "loading" | "ok" | "duplicate" | "error";
  setState: (s: "idle" | "loading" | "ok" | "duplicate" | "error") => void;
  submit: (e: React.FormEvent) => void;
  isDone: boolean;
  dense: boolean;
}) {
  if (isDone) {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 ${dense ? "px-4 py-3" : "mt-5 p-4"} text-sm font-semibold text-primary`}>
        <Check className="h-5 w-5" />
        {state === "duplicate"
          ? "Você já está na lista — obrigado!"
          : "Inscrição confirmada. Te vejo na caixa de entrada."}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className={`flex flex-col gap-2 sm:flex-row ${dense ? "" : "mt-5"}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        autoComplete="email"
        className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm transition-smooth focus:border-primary focus:outline-none"
        aria-label="Seu email"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90 disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Inscrever
      </button>
      {state === "error" && (
        <span className="absolute -bottom-6 text-xs text-destructive">
          Email inválido. Tenta de novo.
        </span>
      )}
    </form>
  );
}

/**
 * Nota LGPD visível — usada na variante card pra comunicar transparência.
 */
export function ConsentNote() {
  return (
    <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
      Ao se inscrever, você concorda em receber emails do Deskly. Cancela em
      1 clique no rodapé de cada email. Não compartilhamos seu email. Veja a
      {" "}<a href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</a>.
    </p>
  );
}
