// Faz upload dos JPGs locais usados pela versão Lovable (src/assets/*.jpg)
// para o bucket "setups" do Supabase Storage e atualiza os 6 setups Lovable
// para usar essas URLs (mesmas imagens que aparecem em deskly-life.lovable.app).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ROOT = new URL("../src/assets/", import.meta.url).pathname;

// slug → local jpg filename (mesma associação do src/data/setups.ts)
const MAP: Array<{ slug: string; file: string }> = [
  { slug: "dev-turquesa",   file: "hero-setup.jpg"    },
  { slug: "cyber-cave",     file: "setup-gamer.jpg"   },
  { slug: "white-clean",    file: "setup-minimal.jpg" },
  { slug: "creator-studio", file: "setup-creator.jpg" },
  { slug: "ape-32m2",       file: "setup-compact.jpg" },
  { slug: "cozy-wood",      file: "after.jpg"         },
];

function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/setups/${path}`;
}

async function uploadOne(slug: string, file: string): Promise<string> {
  const localPath = join(ROOT, file);
  const bytes = readFileSync(localPath);
  const storagePath = `lovable/${slug}.jpg`;
  const { error } = await admin.storage.from("setups").upload(storagePath, bytes, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`upload ${slug}: ${error.message}`);
  return publicUrl(storagePath);
}

async function main() {
  console.log("→ Upload de 6 imagens do Lovable pro bucket 'setups/lovable/'");
  const urlBySlug = new Map<string, string>();
  for (const { slug, file } of MAP) {
    const url = await uploadOne(slug, file);
    urlBySlug.set(slug, url);
    console.log(`  ↳ ${slug} → ${url}`);
  }

  console.log("→ Atualizando setups.cover_url e setup_images");
  for (const { slug } of MAP) {
    const url = urlBySlug.get(slug)!;

    const { data: setup, error: getErr } = await admin
      .from("setups").select("id").eq("slug", slug).maybeSingle();
    if (getErr || !setup) {
      console.warn(`  ⚠ setup ${slug} não encontrado`);
      continue;
    }

    const { error: cErr } = await admin
      .from("setups").update({ cover_url: url }).eq("id", setup.id);
    if (cErr) console.warn(`  ⚠ cover ${slug}:`, cErr.message);

    // Apaga galeria antiga (todas as posições) e insere só a hero (position 0)
    // pra refletir o Lovable que mostra apenas uma imagem por setup.
    const { error: delErr } = await admin
      .from("setup_images").delete().eq("setup_id", setup.id);
    if (delErr) console.warn(`  ⚠ delete imgs ${slug}:`, delErr.message);

    const { error: insErr } = await admin.from("setup_images").insert({
      setup_id: setup.id, url, position: 0, is_before: false, is_after: false,
    });
    if (insErr) console.warn(`  ⚠ insert img ${slug}:`, insErr.message);

    console.log(`  ↳ ${slug} atualizado`);
  }

  console.log("✓ pronto");
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
