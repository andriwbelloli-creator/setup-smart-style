// Promove um usuário a admin (role + subscription pro vitalícia)
// Uso: bun run scripts/make-admin.ts [email]
// Default: andriw.belloli@gmail.com

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use .env.local)");
  process.exit(1);
}

const EMAIL = process.argv[2] || "andriw.belloli@gmail.com";
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email: string): Promise<string | null> {
  // listUsers tem paginação default 50; subimos pra 1000 (suficiente pra MVP)
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
  return u?.id ?? null;
}

async function main() {
  console.log(`→ procurando ${EMAIL}`);
  let userId = await findUserByEmail(EMAIL);

  if (!userId) {
    console.log(`  ↳ não encontrado, criando conta...`);
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      email_confirm: true,
      user_metadata: { display_name: "Andriw Belloli" },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  ↳ criado ${userId}`);
  } else {
    console.log(`  ↳ existe (${userId})`);
  }

  // 1. role admin
  const { error: roleErr } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
  if (roleErr) {
    console.error("falha ao gravar role:", roleErr.message);
    process.exit(1);
  }
  console.log(`  ✓ role 'admin' aplicada`);

  // 2. subscription pro vitalícia (data bem distante)
  const { data: proPlan } = await admin
    .from("subscription_plans")
    .select("id")
    .eq("tier", "pro")
    .maybeSingle();
  if (!proPlan) {
    console.warn("  ⚠ plano 'pro' não encontrado em subscription_plans");
  } else {
    const farFuture = new Date("2099-12-31T00:00:00Z").toISOString();
    const { error: subErr } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_id: proPlan.id,
        tier: "pro",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: farFuture,
        cancel_at_period_end: false,
      },
      { onConflict: "user_id" },
    );
    if (subErr) console.warn("  ⚠ subscription:", subErr.message);
    else console.log("  ✓ subscription 'pro' vitalícia aplicada");
  }

  console.log("\n✓ pronto. Logue novamente no app pra refrescar a sessão.");
}

main().catch((e) => {
  console.error("falhou:", e);
  process.exit(1);
});
