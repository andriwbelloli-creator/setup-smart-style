// Helper de tracking — fire-and-forget pra `public.analytics_events`.
//
// USO:
//   import { track } from "@/lib/track";
//   track("ia_upload_start", "ia", { source: "home" });
//
// - Gera anon_id em localStorage (persiste entre sessões)
// - Gera session_id com timeout 30min (renova em cada evento)
// - Captura UTM da URL e mantém durante a sessão
// - Cliente Supabase JS já manda auth.uid() via JWT → user_id é resolvido server-side
//   se o usuário estiver logado (não precisamos passar manualmente)
// - Não bloqueia o caller: erro só vai pro console.warn

import { supabase } from "@/integrations/supabase/client";

const ANON_KEY = "deskly:anon_id";
const SESSION_KEY = "deskly:session";
const UTM_KEY = "deskly:utm";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export type Service = "inspiration" | "ia" | "affiliate" | "marketplace" | "auth" | "subscription" | "other";

type SessionData = { id: string; lastActivity: number };
type UtmData = { source?: string; medium?: string; campaign?: string };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getAnonId(): string {
  if (!isBrowser()) return "ssr";
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  if (!isBrowser()) return "ssr";
  const now = Date.now();
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const s = JSON.parse(raw) as SessionData;
      if (now - s.lastActivity < SESSION_TIMEOUT_MS) {
        s.lastActivity = now;
        localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        return s.id;
      }
    } catch {
      /* corrompido, regenera */
    }
  }
  const next: SessionData = { id: uuid(), lastActivity: now };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next.id;
}

function captureUtm(): UtmData {
  if (!isBrowser()) return {};
  // 1ª chamada da sessão: lê URL e persiste. Próximas: usa o cache.
  try {
    const cached = localStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached) as UtmData;
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href);
  const data: UtmData = {
    source: url.searchParams.get("utm_source") || undefined,
    medium: url.searchParams.get("utm_medium") || undefined,
    campaign: url.searchParams.get("utm_campaign") || undefined,
  };
  if (data.source || data.medium || data.campaign) {
    localStorage.setItem(UTM_KEY, JSON.stringify(data));
  }
  return data;
}

export async function track(
  eventName: string,
  service: Service,
  props: Record<string, unknown> = {},
): Promise<void> {
  if (!isBrowser()) return; // SSR: ignora

  const anonId = getAnonId();
  const sessionId = getSessionId();
  const utm = captureUtm();
  const page = window.location.pathname + window.location.search;
  const referrer = document.referrer || null;
  const ua = navigator.userAgent;

  // Resolve user_id do JWT, se houver
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    userId = data.session?.user?.id ?? null;
  } catch {
    /* sem sessão, segue como anon */
  }

  // Dev: log pra debug
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    console.debug(`[track] ${service}:${eventName}`, props);
  }

  try {
    await (supabase as any).from("analytics_events").insert({
      user_id: userId,
      anon_id: anonId,
      session_id: sessionId,
      event_name: eventName,
      service,
      props,
      page,
      referrer,
      utm_source: utm.source ?? null,
      utm_medium: utm.medium ?? null,
      utm_campaign: utm.campaign ?? null,
      ua,
    });
  } catch (e) {
    // Fire-and-forget: erros não devem quebrar UX. Logamos pra investigar depois.
    console.warn("[track] failed:", e);
  }
}

/** Track page view — chame em useEffect com [] em cada rota que importar. */
export function trackPageView(service: Service, props: Record<string, unknown> = {}) {
  track("page_view", service, props).catch(() => {});
}
