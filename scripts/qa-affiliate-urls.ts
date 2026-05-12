// QA full nas affiliate_urls de todos os setup_products.
// Para cada URL: faz HEAD (fallback GET se HEAD bloqueado),
// classifica em ok / redirect / 4xx / 5xx / bot-blocked / suspicious.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type Result = {
  id: string;
  name: string;
  category: string;
  store: string;
  url: string;
  status: number;
  classification: "ok" | "redirect" | "4xx" | "5xx" | "bot-blocked" | "error";
  note?: string;
};

async function probe(url: string): Promise<{ status: number; classification: Result["classification"]; note?: string }> {
  try {
    // GET, redirect=manual pra ver o destino real
    const r = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(15_000),
    });
    const s = r.status;
    if (s >= 200 && s < 300) return { status: s, classification: "ok" };
    if (s >= 300 && s < 400) {
      const loc = r.headers.get("location") || "";
      // Detecta redirect pra páginas de "produto não encontrado" ou homepage
      if (/\/(busca|search|not[-_]?found|404)$/i.test(loc)) return { status: s, classification: "ok", note: `redirect → ${loc.slice(0, 80)}` };
      return { status: s, classification: "redirect", note: loc.slice(0, 80) };
    }
    if (s === 503 || s === 429) return { status: s, classification: "bot-blocked", note: "rate-limit/anti-bot" };
    if (s >= 400 && s < 500) return { status: s, classification: "4xx" };
    if (s >= 500) return { status: s, classification: "5xx" };
    return { status: s, classification: "error" };
  } catch (e: any) {
    return { status: 0, classification: "error", note: String(e?.message || e).slice(0, 80) };
  }
}

async function main() {
  console.log("→ buscando produtos no banco...");
  const { data, error } = await admin
    .from("setup_products")
    .select("id, name, category, store, affiliate_url");
  if (error) throw error;

  const products = (data || []).filter((p) => p.affiliate_url) as Array<{
    id: string;
    name: string;
    category: string;
    store: string;
    affiliate_url: string;
  }>;
  console.log(`→ testando ${products.length} URLs (paralelismo 8, timeout 15s cada)\n`);

  const results: Result[] = [];
  const CONCURRENCY = 8;
  let done = 0;
  async function worker(slice: typeof products) {
    for (const p of slice) {
      const { status, classification, note } = await probe(p.affiliate_url);
      results.push({
        id: p.id,
        name: p.name,
        category: p.category,
        store: p.store,
        url: p.affiliate_url,
        status,
        classification,
        note,
      });
      done++;
      if (done % 20 === 0) console.log(`  ↳ ${done}/${products.length}`);
    }
  }
  const chunks: typeof products[] = Array.from({ length: CONCURRENCY }, () => []);
  products.forEach((p, i) => chunks[i % CONCURRENCY].push(p));
  await Promise.all(chunks.map(worker));

  // Agrega
  const byClass: Record<string, number> = {};
  const byStore: Record<string, Record<string, number>> = {};
  for (const r of results) {
    byClass[r.classification] = (byClass[r.classification] || 0) + 1;
    byStore[r.store] = byStore[r.store] || {};
    byStore[r.store][r.classification] = (byStore[r.store][r.classification] || 0) + 1;
  }

  console.log("\n═══════════ RESULTADO QA ═══════════");
  console.log(`total testado: ${results.length}\n`);
  for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(15)} ${v}`);
  }

  console.log("\n--- por loja ---");
  for (const [store, classes] of Object.entries(byStore)) {
    const okPct = (((classes.ok || 0) / Object.values(classes).reduce((a, b) => a + b, 0)) * 100).toFixed(0);
    console.log(`  ${store.padEnd(15)} ok=${classes.ok || 0} bot-blocked=${classes["bot-blocked"] || 0} 4xx=${classes["4xx"] || 0} 5xx=${classes["5xx"] || 0} redirect=${classes.redirect || 0} error=${classes.error || 0} (ok ${okPct}%)`);
  }

  console.log("\n--- 4xx (links quebrados, ação necessária) ---");
  const broken = results.filter((r) => r.classification === "4xx");
  for (const b of broken) {
    console.log(`  [${b.status}] ${b.category.padEnd(12)} "${b.name}" → ${b.url.slice(0, 80)}`);
  }

  console.log("\n--- 5xx ---");
  const errs = results.filter((r) => r.classification === "5xx");
  for (const b of errs.slice(0, 10)) {
    console.log(`  [${b.status}] ${b.category.padEnd(12)} "${b.name}" → ${b.url.slice(0, 80)}`);
  }

  console.log("\n--- redirects suspeitos ---");
  const reds = results.filter((r) => r.classification === "redirect");
  for (const b of reds.slice(0, 10)) {
    console.log(`  [${b.status}] "${b.name}" → ${b.note}`);
  }

  // Save full JSON for further inspection
  await Bun.write("/tmp/qa-results.json", JSON.stringify(results, null, 2));
  console.log("\n✓ resultado completo salvo em /tmp/qa-results.json");
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
