// Node HTTP wrapper para a build do TanStack Start (target node-server).
// Render (e qualquer host Node-friendly) usa este arquivo como entrypoint.
//
// O build emite dist/server/server.js exportando um handler Fetch API.
// Convertemos request HTTP → Web Request, chamamos o handler, e
// devolvemos a Web Response como HTTP response.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const CLIENT_DIR = join(__dirname, "dist", "client");

// =============================================================
// Security headers — aplicados a TODA resposta
// =============================================================
// Não inclui CSP porque o app usa scripts inline do TanStack Start
// e o Vite gera URLs com hashes que mudam a cada build (CSP estrito
// quebraria sem ajustes). Implementar CSP report-only depois.
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-DNS-Prefetch-Control": "on",
};

function applySecurityHeaders(res) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(k, v);
  }
}

// =============================================================
// Affiliate cloaking — /r/:productId redireciona 302 para o URL
// de afiliado armazenado no banco. Mantém o DOM limpo
// (sem expor URLs de Amazon/Kabum diretamente no HTML).
// =============================================================
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

async function handleAffiliateRedirect(req, res, productId) {
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Affiliate redirect not configured.");
    return;
  }
  try {
    const apiUrl = `${SUPABASE_URL}/rest/v1/setup_products?id=eq.${encodeURIComponent(
      productId,
    )}&select=affiliate_url`;
    const r = await fetch(apiUrl, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!r.ok) throw new Error(`supabase ${r.status}`);
    const rows = await r.json();
    const target = rows?.[0]?.affiliate_url;
    if (!target || typeof target !== "string") {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Produto não encontrado.");
      return;
    }
    res.statusCode = 302;
    // referrer policy + no caching pra esse hop
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Location", target);
    res.end();
  } catch (err) {
    console.error("[affiliate-redirect] error:", err);
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Falha ao resolver link.");
  }
}

const MIME = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const { default: appServer } = await import("./dist/server/server.js");

function nodeReqToFetchRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  const url = `${protocol}://${host}${req.url}`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
    else if (v !== undefined) headers.set(k, v);
  }
  const init = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function writeFetchResponse(res, response) {
  res.statusCode = response.status;
  for (const [k, v] of response.headers) res.setHeader(k, v);
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

async function serveStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const url = req.url.split("?")[0];
  if (!url.startsWith("/")) return false;
  if (url === "/" || url === "") return false;
  try {
    const path = join(CLIENT_DIR, url);
    if (!path.startsWith(CLIENT_DIR)) return false;
    const data = await readFile(path);
    const mime = MIME[extname(path).toLowerCase()] || "application/octet-stream";
    res.setHeader("Content-Type", mime);
    if (/\.(js|css|jpg|jpeg|png|webp|svg|woff2?)$/i.test(path)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
    res.statusCode = 200;
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    // 1. Headers de segurança em toda resposta
    applySecurityHeaders(res);

    // 2. Affiliate cloaking: /r/<product-uuid>
    const path = (req.url || "").split("?")[0];
    const match = path.match(/^\/r\/([a-z0-9-]{6,64})$/i);
    if (match) {
      await handleAffiliateRedirect(req, res, match[1]);
      return;
    }

    // 3. Assets estáticos
    if (await serveStatic(req, res)) return;

    // 4. App SSR
    const request = nodeReqToFetchRequest(req);
    const response = await appServer.fetch(request);
    await writeFetchResponse(res, response);
  } catch (err) {
    console.error("Request error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Internal server error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Deskly server listening on http://0.0.0.0:${PORT}`);
});
