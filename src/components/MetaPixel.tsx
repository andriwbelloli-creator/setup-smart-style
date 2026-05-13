import { useEffect } from "react";

const PIXEL_ID = "517991158551582";
const COOKIE_CONSENT_KEY = "deskly_cookie_consent";
const CONSENT_EVENT = "deskly:cookie-accepted";

function loadPixel() {
  if (typeof window === "undefined") return;
  if ((window as any).fbq) return;
  // Snippet padrão do Meta Pixel (mesma string que o gerador do Events Manager produz)
  (function (f: any, b: any, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  (window as any).fbq("init", PIXEL_ID);
  (window as any).fbq("track", "PageView");
}

export function MetaPixel() {
  useEffect(() => {
    // Carrega imediatamente se consent já aceito
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(COOKIE_CONSENT_KEY)) {
      loadPixel();
      return;
    }
    // Senão, espera o evento de aceitação
    const onConsent = () => loadPixel();
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);
  return null;
}
