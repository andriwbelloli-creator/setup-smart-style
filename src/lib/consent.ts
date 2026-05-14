// Single source of truth pra verificar se o usuário aceitou cookies.
// Centraliza a leitura do localStorage e expõe um listener pra reagir
// a mudanças (CookieBanner dispara 'deskly:cookie-accepted').
//
// LGPD: analytics opcional (heatmap, NPS prompt, feedback widget) só
// rodam quando hasConsent() === true. Auth e preferences são essenciais
// e não dependem disso.

const STORAGE_KEY = "deskly_cookie_consent";

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

/** Subscribe ao evento de consent. Retorna unsubscribe. */
export function onConsentChange(cb: (accepted: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb(true);
  window.addEventListener("deskly:cookie-accepted", handler);
  return () => window.removeEventListener("deskly:cookie-accepted", handler);
}
