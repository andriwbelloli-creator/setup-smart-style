import { createClient } from "@supabase/supabase-js";
import { SEED_USERS, SEED_SETUPS, SEED_COMMENTS, type SeedUser } from "./seed-data";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam variáveis: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (use .env.local)");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser(u: SeedUser): Promise<string> {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) throw listErr;
  const existing = list.users.find((x) => x.email === u.email);
  if (existing) {
    console.log(`  ↳ usuário ${u.email} já existe (${existing.id})`);
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { display_name: u.display_name },
  });
  if (error) throw error;
  console.log(`  ↳ criado ${u.email} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log("→ criando usuários de seed");
  const userIdByEmail: Record<string, string> = {};
  for (const u of SEED_USERS) {
    const id = await ensureUser(u);
    userIdByEmail[u.email] = id;
    const { error } = await admin
      .from("profiles")
      .update({
        username: u.username,
        display_name: u.display_name,
        bio: u.bio,
        career: u.career,
        city: u.city,
        avatar_url: u.avatar_url,
      })
      .eq("id", id);
    if (error) console.warn(`  ⚠ profile update falhou pra ${u.email}:`, error.message);
  }

  console.log("→ inserindo setups");
  for (const s of SEED_SETUPS) {
    const ownerId = userIdByEmail[s.ownerEmail];
    if (!ownerId) {
      console.warn(`  ⚠ owner ${s.ownerEmail} não encontrado, pulando setup ${s.slug}`);
      continue;
    }
    const { data: existing } = await admin
      .from("setups")
      .select("id")
      .eq("slug", s.slug)
      .maybeSingle();
    if (existing) {
      console.log(`  ↳ setup ${s.slug} já existe (${existing.id}), pulando`);
      continue;
    }
    const { data: setup, error } = await admin
      .from("setups")
      .insert({
        owner_id: ownerId,
        slug: s.slug,
        title: s.title,
        description: s.description,
        styles: s.styles,
        career: s.career,
        budget_brl: s.budget_brl,
        city: s.city,
        cover_url: s.cover_url,
        status: "published",
        ai_score: s.ai_score,
      })
      .select("id")
      .single();
    if (error || !setup) {
      console.warn(`  ⚠ falha em ${s.slug}:`, error?.message);
      continue;
    }
    console.log(`  ↳ ${s.slug} (${setup.id})`);

    const { error: imgErr } = await admin.from("setup_images").insert({
      setup_id: setup.id,
      url: s.cover_url,
      position: 0,
      is_before: false,
      is_after: false,
    });
    if (imgErr) console.warn(`  ⚠ imagem falhou:`, imgErr.message);

    if (s.products.length) {
      const { error: prodErr } = await admin.from("setup_products").insert(
        s.products.map((p) => ({ ...p, setup_id: setup.id })),
      );
      if (prodErr) console.warn(`  ⚠ produtos falharam:`, prodErr.message);
    }
  }

  console.log("→ inserindo comentários");
  const slugToId = new Map<string, string>();
  const { data: setupRows } = await admin.from("setups").select("id, slug");
  setupRows?.forEach((s) => slugToId.set(s.slug, s.id));

  const checkedSetups = new Set<string>();
  const skipSetups = new Set<string>();
  let commentsInserted = 0;
  for (const c of SEED_COMMENTS) {
    const setupId = slugToId.get(c.setupSlug);
    const authorId = userIdByEmail[c.authorEmail];
    if (!setupId || !authorId) continue;

    if (!checkedSetups.has(setupId)) {
      const { count } = await admin
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("setup_id", setupId);
      checkedSetups.add(setupId);
      if ((count ?? 0) > 0) {
        skipSetups.add(setupId);
        console.log(`  ↳ ${c.setupSlug} já tem comentários, pulando`);
      }
    }
    if (skipSetups.has(setupId)) continue;

    const { error } = await admin
      .from("comments")
      .insert({ setup_id: setupId, author_id: authorId, body: c.body });
    if (error) {
      console.warn(`  ⚠ comentário falhou em ${c.setupSlug}:`, error.message);
    } else {
      commentsInserted++;
    }
  }
  console.log(`  ↳ ${commentsInserted} comentários inseridos`);

  console.log("✓ seed concluído");
}

main().catch((e) => {
  console.error("seed falhou:", e);
  process.exit(1);
});
