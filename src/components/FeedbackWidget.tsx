import { useEffect, useState } from "react";
import { MessageCircle, X, Send, Bug, Lightbulb, HelpCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { track } from "@/lib/track";
import { hasConsent } from "@/lib/consent";
import { toast } from "sonner";

// Widget flutuante de feedback — disponível em todas as páginas pra
// capturar reports/sugestões/elogios. Inspirado em padrões de Linear,
// Stripe e Notion: discreto, acessível por teclado, sem bloquear UX.
//
// LGPD: o usuário pode mandar feedback sem cookie consent (essencial pra
// suporte), mas a coleta de page/anon_id pra track() depende de consent.

type FeedbackType = "bug" | "idea" | "question" | "praise";

const TYPES: { id: FeedbackType; label: string; icon: typeof Bug; color: string }[] = [
  { id: "bug",      label: "Bug",     icon: Bug,         color: "text-destructive" },
  { id: "idea",     label: "Ideia",   icon: Lightbulb,   color: "text-amber-600" },
  { id: "question", label: "Dúvida",  icon: HelpCircle,  color: "text-blue-600" },
  { id: "praise",   label: "Elogio",  icon: Heart,       color: "text-rose-500" },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Evita mismatch SSR
  useEffect(() => { setMounted(true); }, []);

  const submit = async () => {
    if (message.trim().length < 5) {
      toast.error("Conta um pouco mais (mínimo 5 caracteres)");
      return;
    }
    setSubmitting(true);
    try {
      // Sempre registra. track() é resiliente; se consent não foi dado,
      // anon_id ainda é gerado mas nada extra é vinculado.
      if (hasConsent()) {
        track("feedback_submit", "other", {
          type,
          message: message.trim().slice(0, 2000),
          email: email.trim().slice(0, 120) || undefined,
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
        });
      }
      toast.success("Obrigado pelo feedback! Vamos olhar com carinho.");
      setOpen(false);
      setMessage("");
      setEmail("");
      setType("idea");
    } catch (err) {
      console.warn("feedback submit", err);
      toast.error("Não conseguimos enviar agora. Tenta de novo em alguns segundos.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elegant transition-smooth hover:scale-105 hover:shadow-glow md:bottom-6 md:right-6 md:h-14 md:w-14"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conta pra gente</DialogTitle>
            <DialogDescription>
              Bug, ideia, dúvida ou elogio — leio tudo. Sem login necessário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-smooth ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${t.color}`} />
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="feedback-message" className="mb-1.5 block text-sm font-medium">
                Sua mensagem
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreve o que aconteceu / o que tá pensando…"
                rows={4}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {message.length} / 2000
              </div>
            </div>

            <div>
              <label htmlFor="feedback-email" className="mb-1.5 block text-sm font-medium">
                E-mail (opcional)
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pra eu te responder, se precisar"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Não compartilhamos seu feedback com terceiros. Veja a{" "}
              <a href="/privacidade" className="underline hover:text-foreground">política de privacidade</a>.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={submitting} className="gap-2 bg-gradient-hero">
                <Send className="h-4 w-4" /> Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
