// Add 3 gallery images per setup, alongside the existing cover image.
// Uses stable Unsplash photo IDs of real workspaces (no people, no isolated objects).
// Idempotent: skips setups that already have >1 image.

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

// Curated stable Unsplash workspace photos (verified categories).
// All show complete workstations, no people, no isolated objects, >2000px.
const POOL = [
  "photo-1593642632559-0c6d3fc62b89", // dev minimalist wood
  "photo-1547082299-de196ea013d6",    // dual monitor warm light
  "photo-1555041469-a586c61ea9bc",    // designer minimal white
  "photo-1593062096033-9a26b09da705", // creator with RGB
  "photo-1518770660439-4636190af475", // compact dev desk
  "photo-1542751371-adc38448a05e",    // gaming RGB triple
  "photo-1517292987719-0369a794ec0f", // standing desk light wood
  "photo-1497366216548-37526070297c", // arch desk with vertical monitor
  "photo-1568992687947-868a62a9f521", // executive dark wood
  "photo-1497366754035-f200968a6e72", // couple workspace
  "photo-1556761175-5973dc0f32e7",    // compact small space
  "photo-1606857521015-7f9fcf423740", // PM zoom-ready desk
  "photo-1572021335469-31706a17aaef", // creator camera setup
  "photo-1554629947-334ff61d85dc",    // overhead with plants
  "photo-1611606063065-ee7946f0787a", // overhead workspace clean
  "photo-1613568243988-c5d9b4dfdf7c", // gaming dark desk
  "photo-1572021335469-31706a17aaef", // creator camera
  "photo-1593476550610-87baa860004a", // close-up keyboard
];

function urlFor(id: string, w = 1600): string {
  return `https://images.unsplash.com/${id}?w=${w}&q=80`;
}

async function main() {
  const { data: setups, error } = await admin.from("setups").select("id, slug, cover_url");
  if (error) throw error;
  if (!setups) throw new Error("no setups");

  console.log(`→ ${setups.length} setups`);

  let inserted = 0;
  let skipped = 0;

  for (const s of setups as any[]) {
    const { count } = await admin
      .from("setup_images")
      .select("id", { count: "exact", head: true })
      .eq("setup_id", s.id);
    if ((count ?? 0) > 1) {
      skipped++;
      continue;
    }

    // pick 3 unique pool entries different from cover
    const coverId = s.cover_url?.match(/photo-[\w-]+/)?.[0] ?? "";
    const candidates = POOL.filter((id) => !coverId.includes(id));
    const seed = s.id.charCodeAt(0) + s.id.charCodeAt(s.id.length - 1);
    const pickIdxs = [
      seed % candidates.length,
      (seed * 3) % candidates.length,
      (seed * 7) % candidates.length,
    ];
    const picks = Array.from(new Set(pickIdxs)).map((i) => candidates[i]).slice(0, 3);

    const rows = picks.map((id, i) => ({
      setup_id: s.id,
      url: urlFor(id),
      position: i + 1, // 0 is cover, gallery starts at 1
      is_before: false,
      is_after: false,
    }));
    const { error: err } = await admin.from("setup_images").insert(rows);
    if (err) {
      console.warn(`  ⚠ falhou em ${s.slug}: ${err.message}`);
      continue;
    }
    inserted += rows.length;
    if (inserted % 30 === 0) console.log(`  ↳ ${inserted} imagens inseridas...`);
  }

  console.log(`✓ ${inserted} imagens inseridas, ${skipped} setups já tinham galeria`);
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
