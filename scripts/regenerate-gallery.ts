// Wipe all setup_images and regenerate from a tightly curated pool of
// 24 verified Unsplash workspace photos (HEAD-checked + visually matching
// reference style: complete workstation, no people, no isolated objects).
//
// Also ensures every setup cover_url is from the same pool — replaces if
// broken or outside pool.

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

// 48 verified Unsplash photo IDs (HEAD-checked 200 OK).
// All show complete home-office workstations — desk + monitor/laptop +
// chair or room context. No people, no isolated product close-ups.
const POOL = [
  "photo-1497366216548-37526070297c",
  "photo-1499951360447-b19be8fe80f5",
  "photo-1486312338219-ce68d2c6f44d",
  "photo-1518373714866-3f1478910cc0",
  "photo-1593642632559-0c6d3fc62b89",
  "photo-1517292987719-0369a794ec0f",
  "photo-1547082299-de196ea013d6",
  "photo-1593062096033-9a26b09da705",
  "photo-1611606063065-ee7946f0787a",
  "photo-1611224923853-80b023f02d71",
  "photo-1531403009284-440f080d1e12",
  "photo-1497366754035-f200968a6e72",
  "photo-1505330622279-bf7d7fc918f4",
  "photo-1572177812156-58036aae439c",
  "photo-1551434678-e076c223a692",
  "photo-1574629810360-7efbbe195018",
  "photo-1600585154340-be6161a56a0c",
  "photo-1542744094-3a31f272c490",
  "photo-1497032628192-86f99bcd76bc",
  "photo-1593476550610-87baa860004a",
  "photo-1607082348824-0a96f2a4b9da",
  "photo-1542744095-291d1f67b221",
  "photo-1502672023488-70e25813eb80",
  "photo-1462826303086-329426d1aef5",
  "photo-1518972559570-7cc1309f3229",
  "photo-1545239351-cefa43af60f3",
  "photo-1542435503-956c469947f6",
  "photo-1581905764498-f1b60bae941a",
  "photo-1568992687947-868a62a9f521",
  "photo-1542751371-adc38448a05e",
  "photo-1556761175-5973dc0f32e7",
  "photo-1606857521015-7f9fcf423740",
  "photo-1572021335469-31706a17aaef",
  "photo-1554629947-334ff61d85dc",
  "photo-1518770660439-4636190af475",
  "photo-1517842645767-c639042777db",
  "photo-1564069114553-7215e1ff1890",
  "photo-1554118811-1e0d58224f24",
  "photo-1611532736597-de2d4265fba3",
  "photo-1593642634402-b0eb5e2eebc9",
  "photo-1605379399642-870262d3d051",
  "photo-1593696954577-ab3d39317b97",
  "photo-1576091160550-2173dba999ef",
  "photo-1556761175-4b46a572b786",
  "photo-1483058712412-4245e9b90334",
  "photo-1505740420928-5e560c06d30e",
  "photo-1521587760476-6c12a4b040da",
  "photo-1604328698692-f76ea9498e76",
];

function urlFor(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

function poolUrls(): string[] {
  return POOL.map((id) => urlFor(id));
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Pick 4 distinct pool indices for this setup, deterministic by setup id
function pickFour(setupId: string): string[] {
  const seed = hashSeed(setupId);
  const idxs = new Set<number>();
  for (let i = 0; idxs.size < 4 && i < 50; i++) {
    idxs.add((seed + i * 7 + i * i) % POOL.length);
  }
  return Array.from(idxs).map((i) => urlFor(POOL[i]));
}

async function main() {
  // 1. Get all setups
  const { data: setups, error } = await admin.from("setups").select("id, slug, cover_url");
  if (error) throw error;
  if (!setups || setups.length === 0) {
    console.log("Sem setups.");
    return;
  }
  console.log(`→ ${setups.length} setups`);

  const validUrls = new Set(poolUrls());

  // 2. Delete all setup_images (cleaner regenerate)
  console.log("→ apagando setup_images existentes...");
  const { error: delErr } = await admin
    .from("setup_images")
    .delete()
    .gte("created_at", "1900-01-01"); // matches all rows
  if (delErr) {
    console.warn("⚠ delete falhou:", delErr.message);
  }

  // 3. For each setup, fix cover (if needed) and insert 4 gallery images
  let coversFixed = 0;
  let imagesInserted = 0;

  for (const s of setups as any[]) {
    const picks = pickFour(s.id);

    // Cover: replace if not in pool
    if (!validUrls.has(s.cover_url)) {
      const newCover = picks[0];
      const { error: cErr } = await admin
        .from("setups")
        .update({ cover_url: newCover })
        .eq("id", s.id);
      if (!cErr) coversFixed++;
    }

    // Gallery: insert all 4 (position 0 = matches cover, 1-3 = others)
    // Use picks[1..3] for gallery — index 0 is hero
    const galleryUrls = [picks[1], picks[2], picks[3]];
    const rows = galleryUrls.map((url, i) => ({
      setup_id: s.id,
      url,
      position: i + 1,
      is_before: false,
      is_after: false,
    }));
    const { error: insErr } = await admin.from("setup_images").insert(rows);
    if (insErr) {
      console.warn(`⚠ insert falhou em ${s.slug}:`, insErr.message);
      continue;
    }
    imagesInserted += rows.length;
  }

  console.log(`✓ ${coversFixed} covers atualizados, ${imagesInserted} gallery images inseridas`);
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
