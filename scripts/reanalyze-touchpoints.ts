// scripts/reanalyze-touchpoints.ts
//
// Re-roda a detecção de touchpoints (x/y) para todos os setups published
// usando a edge function `detect-touchpoints`. Útil pra corrigir touchpoints
// de seed que foram hard-coded com coordenadas ruins.
//
// Como rodar:
//   GEMINI_API_KEY=...  \
//   SUPABASE_URL=...    \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   bun run scripts/reanalyze-touchpoints.ts
//
// Estratégia:
// - Lotes de 10 setups em paralelo
// - Delay de 1s entre lotes (rate limit Gemini free é generoso, mas evita pico)
// - Confidence >= 85 garantido pela edge function
// - Atualiza apenas x/y dos setup_products que a IA localizou com certeza
// - Setups sem match continuam com as coordenadas atuais (não zera nada)
// - Idempotente: rodar 2x não estraga; cada run sobrescreve só o que a IA
//   conseguiu casar por nome+categoria.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no env.");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Tier 1 (pago): 1000 RPM, sem RPD. Podemos ser agressivos.
// 10 paralelos + 2s entre lotes = ~300 req/min, dentro do limite.
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 2_000;

type SetupRow = { id: string; slug: string; cover_url: string | null };
type ProductRow = { id: string; setup_id: string; name: string; category: string; x: number; y: number };
type Detected = { name: string; category: string; x: number; y: number; confidence: number; spatial_context: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processSetup(setup: SetupRow): Promise<{ slug: string; updated: number; skipped: string } | null> {
  if (!setup.cover_url) {
    return { slug: setup.slug, updated: 0, skipped: "sem cover_url" };
  }

  const { data: products, error: prodErr } = await admin
    .from("setup_products")
    .select("id, setup_id, name, category, x, y")
    .eq("setup_id", setup.id);
  if (prodErr || !products || products.length === 0) {
    return { slug: setup.slug, updated: 0, skipped: "sem produtos" };
  }

  const knownProducts = (products as ProductRow[])
    .filter((p) => p.name?.trim())
    .map((p) => ({ category: p.category, name: p.name }));
  if (knownProducts.length === 0) {
    return { slug: setup.slug, updated: 0, skipped: "produtos sem nome" };
  }

  const fnUrl = `${SUPABASE_URL}/functions/v1/detect-touchpoints`;
  const r = await fetch(fnUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: setup.cover_url, knownProducts }),
  });

  if (!r.ok) {
    const t = await r.text();
    console.warn(`  [${setup.slug}] HTTP ${r.status}: ${t.slice(0, 200)}`);
    return { slug: setup.slug, updated: 0, skipped: `HTTP ${r.status}` };
  }

  const data = await r.json();
  const detected: Detected[] = data.products || [];
  if (detected.length === 0) {
    return { slug: setup.slug, updated: 0, skipped: "IA não localizou nada com confidence>=85" };
  }

  let updated = 0;
  for (const d of detected) {
    const prod = (products as ProductRow[]).find(
      (p) => p.name.toLowerCase() === d.name.toLowerCase() && p.category === d.category,
    );
    if (!prod) continue;
    const { error: upErr } = await admin
      .from("setup_products")
      .update({ x: d.x, y: d.y })
      .eq("id", prod.id);
    if (!upErr) updated++;
  }
  return { slug: setup.slug, updated, skipped: "" };
}

async function main() {
  console.log("[reanalyze] Carregando setups published...");
  const { data: setups, error } = await admin
    .from("setups")
    .select("id, slug, cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Falha ao listar setups:", error.message);
    process.exit(1);
  }
  const list = (setups || []) as SetupRow[];
  console.log(`[reanalyze] ${list.length} setups encontrados. Processando em lotes de ${BATCH_SIZE}...\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;
  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    const batch = list.slice(i, i + BATCH_SIZE);
    console.log(`--- Lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(list.length / BATCH_SIZE)} (${batch.length} setups) ---`);
    const results = await Promise.all(batch.map((s) => processSetup(s)));
    for (const r of results) {
      if (!r) continue;
      if (r.updated > 0) {
        console.log(`  ✓ ${r.slug}: ${r.updated} produto(s) atualizado(s)`);
        totalUpdated += r.updated;
      } else {
        console.log(`  - ${r.slug}: ${r.skipped || "nada a fazer"}`);
        totalSkipped++;
      }
    }
    if (i + BATCH_SIZE < list.length) await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  console.log(`\n[reanalyze] Concluído. ${totalUpdated} touchpoints atualizados, ${totalSkipped} setups pulados.`);
}

main().catch((e) => {
  console.error("[reanalyze] Erro fatal:", e);
  process.exit(1);
});
