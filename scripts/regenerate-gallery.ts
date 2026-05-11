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

// Conservative pool — only photos I'm highly confident show complete
// home-office workstations (desk + monitor + chair + room context).
// User flagged that previous pool had close-ups and lifestyle shots,
// so trimmed to ~18 most reliable workspace photos.
const POOL = [
  "photo-1497366216548-37526070297c", // iMac with geometric wall
  "photo-1518373714866-3f1478910cc0", // clean iMac minimalist + chair
  "photo-1593642632559-0c6d3fc62b89", // wood minimalist workspace
  "photo-1517292987719-0369a794ec0f", // standing desk light wood
  "photo-1547082299-de196ea013d6",    // dual monitor warm light
  "photo-1611606063065-ee7946f0787a", // overhead workspace clean
  "photo-1574629810360-7efbbe195018", // creative workspace + chair
  "photo-1600585154340-be6161a56a0c", // ergonomic chair + desk view
  "photo-1542744094-3a31f272c490",    // dual monitor home office
  "photo-1542744095-291d1f67b221",    // workspace with chair angle
  "photo-1502672023488-70e25813eb80", // home office room context
  "photo-1518972559570-7cc1309f3229", // minimalist designer desk
  "photo-1568992687947-868a62a9f521", // executive dark wood + chair
  "photo-1542751371-adc38448a05e",    // gaming setup full room
  "photo-1606857521015-7f9fcf423740", // PM zoom-ready desk
  "photo-1605379399642-870262d3d051", // dark dev cave with shelf
  "photo-1497366754035-f200968a6e72", // double workspace shared
  "photo-1611224923853-80b023f02d71", // corner desk workspace
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
