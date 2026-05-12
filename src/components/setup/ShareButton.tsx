import { Share2, Link2 } from "lucide-react";
import { useShare } from "@/hooks/use-share";

type Props = {
  title: string;
  url: string;
  text?: string;
  /** Tamanho do botão. "icon" mostra só o ícone (uso em cards). */
  size?: "icon" | "default";
  className?: string;
};

export function ShareButton({ title, url, text, size = "icon", className = "" }: Props) {
  const share = useShare({ title, url, text });

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); share.trigger(); }}
        aria-label="Compartilhar"
        className={
          size === "icon"
            ? `flex h-8 w-8 items-center justify-center rounded-full bg-card/95 text-foreground backdrop-blur transition-smooth hover:scale-110 ${className}`
            : `inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-smooth hover:border-foreground ${className}`
        }
      >
        <Share2 className="h-4 w-4" />
        {size === "default" && <span>Compartilhar</span>}
      </button>
      {share.open && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-elegant"
        >
          <a href={share.links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => share.setOpen(false)}>
            <span className="text-lg">💬</span> WhatsApp
          </a>
          <a href={share.links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => share.setOpen(false)}>
            <span className="text-lg">𝕏</span> Twitter / X
          </a>
          <a href={share.links.threads} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => share.setOpen(false)}>
            <span className="text-lg">@</span> Threads
          </a>
          <a href={share.links.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => share.setOpen(false)}>
            <span className="text-lg">✈️</span> Telegram
          </a>
          <a href={share.links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => share.setOpen(false)}>
            <span className="text-lg">f</span> Facebook
          </a>
          <button type="button" onClick={share.copy} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary">
            <Link2 className="h-4 w-4" /> Copiar link
          </button>
        </div>
      )}
    </div>
  );
}
