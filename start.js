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
    if (await serveStatic(req, res)) return;
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
