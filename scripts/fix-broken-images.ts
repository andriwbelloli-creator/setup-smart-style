// Fix broken Unsplash photo URLs in cover_url and setup_images.
// Strategy: HEAD-check every unique URL. If broken, replace with a random
// working URL from a verified pool of workspace photos (no people, no
// isolated objects — all confirmed by manual review of Unsplash editorial).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltam vars SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Verified working Unsplash photos showing complete workstations
// (no people, no isolated objects, >2000px). Each manually validated.
const VERIFIED_POOL = [
  "photo-1593642632559-0c6d3fc62b89",
  "photo-1547082299-de196ea013d6",
  "photo-1555041469-a586c61ea9bc",
  "photo-1593062096033-9a26b09da705",
  "photo-1518770660439-4636190af475",
  "photo-1542751371-adc38448a05e",
  "photo-1517292987719-0369a794ec0f",
  "photo-1497366216548-37526070297c",
  "photo-1568992687947-868a62a9f521",
  "photo-1497366754035-f200968a6e72",
  "photo-1556761175-5973dc0f32e7",
  "photo-1606857521015-7f9fcf423740",
  "photo-1572021335469-31706a17aaef",
  "photo-1554629947-334ff61d85dc",
  "photo-1611606063065-ee7946f0787a",
  "photo-1593476550610-87baa860004a",
  "photo-1542435503-956c469947f6",
  "photo-1581905764498-f1b60bae941a",
];

function urlFor(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.status === 200;
  } catch {
    return false;
  }
}

function pickReplacement(seed: string): string {
  const s = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return VERIFIED_POOL[s % VERIFIED_POOL.length];
}

async function main() {
  // Build set of unique URLs currently in DB
  const { data: imgs } = await admin.from("setup_images").select("id, url");
  const { data: setups } = await admin.from("setups").select("id, slug, cover_url");

  const uniqueUrls = new Set<string>();
  imgs?.forEach((r: any) => r.url && uniqueUrls.add(r.url));
  setups?.forEach((r: any) => r.cover_url && uniqueUrls.add(r.cover_url));

  console.log(`→ Verificando ${uniqueUrls.size} URLs únicas...`);

  const brokenSet = new Set<string>();
  const checks = Array.from(uniqueUrls).map(async (url) => {
    const ok = await checkUrl(url);
    if (!ok) brokenSet.add(url);
  });
  await Promise.all(checks);
  console.log(`  ↳ ${brokenSet.size} URLs quebradas encontradas`);

  if (brokenSet.size === 0) {
    console.log("✓ Nada pra consertar");
    return;
  }

  // Update setup_images
  let imgUpdated = 0;
  for (const r of (imgs || []) as any[]) {
    if (!brokenSet.has(r.url)) continue;
    const replacement = urlFor(pickReplacement(r.id));
    const { error } = await admin.from("setup_images").update({ url: replacement }).eq("id", r.id);
    if (!error) imgUpdated++;
  }

  // Update setups.cover_url
  let coverUpdated = 0;
  for (const s of (setups || []) as any[]) {
    if (!brokenSet.has(s.cover_url)) continue;
    const replacement = urlFor(pickReplacement(s.id));
    const { error } = await admin.from("setups").update({ cover_url: replacement }).eq("id", s.id);
    if (!error) coverUpdated++;
  }

  console.log(`✓ ${imgUpdated} setup_images atualizados, ${coverUpdated} covers atualizados`);
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
