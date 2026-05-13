import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "deskly:pwa-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/**
 * Registra o service worker + mostra banner "Adicionar à tela inicial"
 * quando o navegador dispara beforeinstallprompt (Chrome Android, Edge).
 * iOS Safari não suporta o evento, mas o manifest ainda permite "Add to
 * Home Screen" pelo menu nativo.
 */
export function PWAInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registra service worker (silencioso, falhas vão pro console)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((e) => console.warn("[sw] register:", e));
    }

    // Já dismissou ou já instalado?
    if (localStorage.getItem(DISMISS_KEY)) return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Aguarda 30s de navegação antes de propor (não atrapalha first paint)
      setTimeout(() => setVisible(true), 30_000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      localStorage.setItem(DISMISS_KEY, "installed");
    } else {
      localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    }
    setVisible(false);
    setInstallEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible || !installEvent) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-card p-4 shadow-elegant"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar"
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Instale o HomeOfficeLife</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Vira app no celular, abre rápido e funciona melhor.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-full bg-gradient-hero px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90"
            >
              Instalar
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
