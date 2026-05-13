import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "deskly_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    // Sinaliza pro MetaPixel (e outros listeners) que consent foi dado
    window.dispatchEvent(new CustomEvent("deskly:cookie-accepted"));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 shadow-elegant backdrop-blur">
      <div className="container mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground sm:text-sm">
          Usamos cookies essenciais (autenticação e preferências) e não rastreamos pra anúncios.
          {" "}
          <Link to="/privacidade" className="font-medium text-primary hover:underline">
            Saiba mais
          </Link>.
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-gradient-hero px-5 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-smooth hover:opacity-90 sm:text-sm"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
