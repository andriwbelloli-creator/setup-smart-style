// Service worker minimal pra atender requisitos de PWA installability.
// NÃO faz cache de assets — deixa o navegador gerenciar com cache HTTP
// padrão (mais previsível pra evitar bug de "site não atualiza" depois
// de deploy). Pode evoluir pra cache offline depois.

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passa direto pro network — comportamento padrão sem SW.
  // Hook existe pra Chrome considerar o site instalável.
});
