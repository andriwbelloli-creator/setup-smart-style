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
// CSP em modo report-only: ainda permite tudo, mas browser reporta
// violações pra /csp-report. Depois de uma semana coletando dados
// e ajustando a policy, trocar pra Content-Security-Policy (enforced).
const CSP_POLICY = [
  "default-src 'self'",
  // TanStack Start gera scripts inline em SSR — precisa unsafe-inline
  // até migrarmos pra nonce/hash. Tudo bem em report-only.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://deskly.life",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
  "report-uri /csp-report",
].join("; ");

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-DNS-Prefetch-Control": "on",
  "Content-Security-Policy-Report-Only": CSP_POLICY,
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
// Fallback hardcoded para os valores PÚBLICOS do Supabase (já estão
// embutidos no bundle do cliente — não são segredo). Garante que /r/
// funcione mesmo se as env vars não estiverem configuradas no Render.
// Service role (privado) NÃO tem fallback — fica null se ausente,
// e o servidor falha silenciosamente em logs (bot_traps, csp_violations).
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://icwgkbvwehkjmkuiecuj.supabase.co";
const SUPABASE_ANON =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_MscbtaZRPDd-J5oUE02Imw_vb4_i6Gl";
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// =============================================================
// Bot detection (honeypot) + rate limit por IP
// =============================================================
// In-memory store: válido pelo lifetime do processo. Render reinicia
// diariamente em tier free, então um bot precisa pagar o custo de
// detecção a cada novo deploy — aceitável.
const bannedIps = new Set();
const ipHits = new Map(); // ip -> [{ts, path}]
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_HITS_REDIRECT = 20; // /r/:id máximo por minuto por IP
const TARPIT_DELAY_MS = 5_000; // delay artificial para IPs banidos

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function ipShortHash(ip) {
  // não-criptográfico, só pra não logar IP raw no DB junto
  let h = 5381;
  for (let i = 0; i < ip.length; i++) h = (h * 33) ^ ip.charCodeAt(i);
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}

function trackHit(ip, path) {
  const now = Date.now();
  const arr = (ipHits.get(ip) || []).filter((h) => now - h.ts < RATE_WINDOW_MS);
  arr.push({ ts: now, path });
  ipHits.set(ip, arr);
  return arr.length;
}

async function logBotTrap(req, ip, trapType) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/bot_traps`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE,
        Authorization: `Bearer ${SUPABASE_SERVICE}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ip,
        ip_hash: ipShortHash(ip),
        user_agent: (req.headers["user-agent"] || "").slice(0, 200),
        referer: (req.headers["referer"] || "").slice(0, 200),
        trap_type: trapType,
        request_path: (req.url || "").slice(0, 200),
      }),
    });
  } catch {
    // silencioso — não queremos quebrar a resposta por falha de log
  }
}

async function handleCspReport(req, res) {
  // Browser envia POST JSON com o relatório
  let body = "";
  for await (const chunk of req) body += chunk;
  try {
    const parsed = JSON.parse(body || "{}");
    const r = parsed["csp-report"] || parsed;
    if (SUPABASE_URL && SUPABASE_SERVICE) {
      // fire-and-forget — não bloqueia resposta
      fetch(`${SUPABASE_URL}/rest/v1/csp_violations`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE,
          Authorization: `Bearer ${SUPABASE_SERVICE}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          document_uri: String(r["document-uri"] || "").slice(0, 500),
          violated_directive: String(r["violated-directive"] || "").slice(0, 200),
          blocked_uri: String(r["blocked-uri"] || "").slice(0, 500),
          source_file: String(r["source-file"] || "").slice(0, 500),
          line_number: typeof r["line-number"] === "number" ? r["line-number"] : null,
          user_agent: (req.headers["user-agent"] || "").slice(0, 200),
        }),
      }).catch(() => {});
    }
  } catch {
    // payload inválido — ignora silenciosamente
  }
  res.statusCode = 204;
  res.end();
}

async function handleHoneypot(req, res) {
  const ip = clientIp(req);
  bannedIps.add(ip);
  await logBotTrap(req, ip, "honeypot_link");
  // resposta 200 verossímil, demorada (tarpit) — bots gastam tempo
  await new Promise((r) => setTimeout(r, TARPIT_DELAY_MS));
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.end(`<!doctype html><html><head><title>Setup raro</title>
<meta name="robots" content="noindex,nofollow"></head>
<body><h1>Carregando...</h1><p>Aguarde.</p></body></html>`);
}

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

    const path = (req.url || "").split("?")[0];
    const ip = clientIp(req);

    // 2a. CSP violation reports (browser-initiated POST)
    if (path === "/csp-report" && req.method === "POST") {
      await handleCspReport(req, res);
      return;
    }

    // 2b. Honeypot: link invisível só bots clicam
    if (path === "/honeypot" || path === "/setups/_internal/draft") {
      await handleHoneypot(req, res);
      return;
    }

    // 2b. Affiliate cloaking: /r/<product-uuid>
    const match = path.match(/^\/r\/([a-z0-9-]{6,64})$/i);
    if (match) {
      // IP já banido → tarpit
      if (bannedIps.has(ip)) {
        await new Promise((r) => setTimeout(r, TARPIT_DELAY_MS));
        res.statusCode = 429;
        res.setHeader("Retry-After", "60");
        res.end("rate limited");
        return;
      }
      // Rate limit por IP no endpoint /r/
      const hits = trackHit(ip, path);
      if (hits > RATE_MAX_HITS_REDIRECT) {
        bannedIps.add(ip);
        logBotTrap(req, ip, "rate_limit_r"); // fire & forget
        res.statusCode = 429;
        res.setHeader("Retry-After", "60");
        res.end("rate limited");
        return;
      }
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
