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

// ULTRA conservative pool — only the 6 photos directly matching the
// reference images the user explicitly approved. Repetition across
// setups is acceptable; off-brand content is not.
const POOL = [
  "photo-1497366216548-37526070297c", // reference 1: iMac with geometric wall
  "photo-1518373714866-3f1478910cc0", // reference 3: white iMac minimalist + chair
  "photo-1517292987719-0369a794ec0f", // reference 4: standing desk + chair + window
  "photo-1547082299-de196ea013d6",    // reference 2: dual monitor with plants
  "photo-1593642632559-0c6d3fc62b89", // wood minimalist (similar to refs)
  "photo-1600585154340-be6161a56a0c", // ergonomic chair + desk (similar to refs)
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

// Pick 4 pool indices for this setup, deterministic by setup id.
// Allows repetition when pool is smaller than 4 (still rotates which
// duplicate is used so it doesn't look identical between setups).
function pickFour(setupId: string): string[] {
  const seed = hashSeed(setupId);
  const picked: string[] = [];
  for (let i = 0; i < 4; i++) {
    const idx = (seed + i * 31 + i * i * 7) % POOL.length;
    picked.push(urlFor(POOL[idx]));
  }
  return picked;
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
