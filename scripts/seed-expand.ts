// Roda a expansão do seed: cria os usuários novos (idempotente) e adiciona
// os setups novos que ainda não existem (idempotente por slug).

import { createClient } from "@supabase/supabase-js";
import { EXP_USERS, EXP_SETUPS, type SeedUser } from "./seed-data-expansion";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use .env.local)");
  process.exit(1);
}
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser(u: SeedUser): Promise<string> {
  const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const found = list.users.find((x) => x.email === u.email);
  if (found) return found.id;
  const { data, error: createErr } = await admin.auth.admin.createUser({
    email: u.email, password: u.password, email_confirm: true,
    user_metadata: { display_name: u.display_name },
  });
  if (createErr) throw createErr;
  return data.user.id;
}

async function main() {
  console.log(`→ Criando/atualizando ${EXP_USERS.length} usuários novos`);
  const userId: Record<string, string> = {};

  // map all existing emails (need owners from base seed too)
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const u of list?.users ?? []) {
    if (u.email) userId[u.email] = u.id;
  }

  for (const u of EXP_USERS) {
    const id = await ensureUser(u);
    userId[u.email] = id;
    const { error } = await admin.from("profiles").update({
      username: u.username, display_name: u.display_name, bio: u.bio,
      career: u.career, city: u.city, avatar_url: u.avatar_url,
    }).eq("id", id);
    if (error) console.warn(`  ⚠ profile ${u.username}:`, error.message);
    console.log(`  ↳ ${u.username} (${id})`);
  }

  console.log(`→ Inserindo até ${EXP_SETUPS.length} setups (pula se slug existir)`);
  let inserted = 0, skipped = 0, imgs = 0, prods = 0;
  for (const s of EXP_SETUPS) {
    const { data: existing } = await admin
      .from("setups").select("id").eq("slug", s.slug).maybeSingle();
    if (existing) { console.log(`  ↳ ${s.slug} já existe, pulando`); skipped++; continue; }

    const ownerId = userId[s.ownerEmail];
    if (!ownerId) { console.warn(`  ⚠ owner ${s.ownerEmail} não encontrado, pulando ${s.slug}`); continue; }

    const { data: setup, error } = await admin.from("setups").insert({
      owner_id: ownerId, slug: s.slug, title: s.title, description: s.description,
      styles: s.styles, career: s.career, budget_brl: s.budget_brl, city: s.city,
      cover_url: s.cover_url, status: "published", ai_score: s.ai_score,
    }).select("id").single();
    if (error || !setup) { console.warn(`  ⚠ ${s.slug}:`, error?.message); continue; }
    inserted++;
    console.log(`  ↳ ${s.slug} (${setup.id})`);

    const { error: imgErr } = await admin.from("setup_images").insert({
      setup_id: setup.id, url: s.cover_url, position: 0, is_before: false, is_after: false,
    });
    if (imgErr) console.warn(`    ⚠ img:`, imgErr.message); else imgs++;

    if (s.products.length) {
      const { error: prodErr } = await admin.from("setup_products").insert(
        s.products.map((pp) => ({ ...pp, setup_id: setup.id })),
      );
      if (prodErr) console.warn(`    ⚠ produtos:`, prodErr.message); else prods += s.products.length;
    }
  }
  console.log(`✓ ${inserted} inseridos, ${skipped} já existiam · ${imgs} covers, ${prods} produtos`);
}

main().catch((e) => { console.error("falhou:", e); process.exit(1); });
