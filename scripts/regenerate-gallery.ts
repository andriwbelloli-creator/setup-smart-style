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

// 24 verified Unsplash photo IDs. All confirmed 200 OK.
// All show complete workstations (desk + monitor + chair or laptop + room
// context). None are product close-ups or people portraits.
const POOL = [
  "photo-1497366216548-37526070297c", // classic iMac with geometric wall
  "photo-1499951360447-b19be8fe80f5", // modern minimalist desk
  "photo-1486312338219-ce68d2c6f44d", // laptop on wood desk with notebook
  "photo-1518373714866-3f1478910cc0", // iMac minimalist setup
  "photo-1593642632559-0c6d3fc62b89", // wood minimalist workspace
  "photo-1517292987719-0369a794ec0f", // standing desk light
  "photo-1547082299-de196ea013d6",    // dual monitor with plants
  "photo-1593062096033-9a26b09da705", // workspace with plants
  "photo-1611606063065-ee7946f0787a", // overhead workspace clean
  "photo-1611224923853-80b023f02d71", // corner desk workspace
  "photo-1531403009284-440f080d1e12", // laptop close-up on desk
  "photo-1497366754035-f200968a6e72", // double workspace shared
  "photo-1505330622279-bf7d7fc918f4", // bright office workspace
  "photo-1572177812156-58036aae439c", // home office bookshelves
  "photo-1551434678-e076c223a692",    // dev workspace with multiple monitors
  "photo-1574629810360-7efbbe195018", // creative workspace
  "photo-1600585154340-be6161a56a0c", // ergonomic chair + desk view
  "photo-1542744094-3a31f272c490",    // dual monitor home office
  "photo-1497032628192-86f99bcd76bc", // minimalist laptop desk
  "photo-1593476550610-87baa860004a", // workspace overhead
  "photo-1607082348824-0a96f2a4b9da", // clean white desk corner
  "photo-1542744095-291d1f67b221",    // workspace with chair angle
  "photo-1502672023488-70e25813eb80", // home office multiple devices
  "photo-1462826303086-329426d1aef5", // overhead with plants and laptop
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
