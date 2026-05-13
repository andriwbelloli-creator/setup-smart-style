// Deduplica covers: pra cada cover_url, mantém só 1 setup (o mais antigo)
// e apaga os demais. Cascade FK leva junto setup_images, setup_products,
// comments, likes e saves.

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

async function main() {
  const { data: setups, error } = await admin
    .from("setups")
    .select("id, slug, cover_url, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!setups) return;

  const seenCovers = new Set<string>();
  const toDelete: { id: string; slug: string; cover_url: string }[] = [];

  for (const s of setups as any[]) {
    if (seenCovers.has(s.cover_url)) {
      toDelete.push(s);
    } else {
      seenCovers.add(s.cover_url);
    }
  }

  console.log(`→ ${setups.length} setups, ${seenCovers.size} covers únicos, ${toDelete.length} a apagar`);
  for (const s of toDelete) {
    console.log(`  ✗ ${s.slug}`);
  }

  if (toDelete.length === 0) {
    console.log("Nada a apagar.");
    return;
  }

  const ids = toDelete.map((s) => s.id);
  // Cascade via FK — basta apagar de setups
  const { error: delErr } = await admin.from("setups").delete().in("id", ids);
  if (delErr) {
    console.error("delete falhou:", delErr.message);
    process.exit(1);
  }
  console.log(`✓ ${toDelete.length} setups apagados (cascade levou images/products/comments)`);

  // Confirma total final
  const { data: final } = await admin.from("setups").select("id").eq("status", "published");
  console.log(`✓ ${final?.length ?? 0} setups restantes`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
