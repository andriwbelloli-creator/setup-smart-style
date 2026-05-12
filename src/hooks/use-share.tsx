import { useState, useCallback } from "react";
import { toast } from "sonner";

export type ShareTarget = {
  title: string;
  text?: string;
  url: string;
};

export type ShareLinks = {
  whatsapp: string;
  twitter: string;
  telegram: string;
  facebook: string;
  threads: string;
};

/**
 * Hook reutilizável de compartilhamento:
 * - usa navigator.share() nativo (mobile/PWA) quando disponível
 * - fallback para popover com WhatsApp/Twitter/Telegram/Facebook/Threads + copiar link
 */
export function useShare(target: ShareTarget) {
  const [open, setOpen] = useState(false);

  const message = target.text ?? `${target.title} — vi esse setup no Deskly e amei`;

  const links: ShareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${message} ${target.url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(target.url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(target.url)}&text=${encodeURIComponent(message)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target.url)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${message} ${target.url}`)}`,
  };

  const trigger = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: target.title, text: target.text, url: target.url });
        return;
      } catch {
        // user cancelou — não trata
      }
    }
    setOpen((v) => !v);
  }, [target.title, target.text, target.url]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(target.url);
      toast.success("Link copiado!");
      setOpen(false);
    } catch {
      toast.error("Não consegui copiar — copie manualmente da barra.");
    }
  }, [target.url]);

  return { open, setOpen, trigger, copy, links };
}
