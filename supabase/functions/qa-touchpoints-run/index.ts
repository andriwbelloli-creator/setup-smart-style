// qa-touchpoints-run
//
// Roda todos os fixtures de QA contra a pipeline atual e grava resultados em
// `touchpoint_qa_runs`. Pode ser disparado:
//   - manualmente do admin (POST sem body)
//   - via pg_cron (necessita CRON_SECRET)
//
// Body opcional:
//   { fixtureIds?: string[], pipeline?: "vision+gemini" | "vision_only" | "gemini_only" }
//
// Score por fixture (0–100):
//   - matchScore: |detected ∩ expected| / |expected ∪ detected|  × 100 (Jaccard de nomes)
//   - localScore: 100 - média da distância euclidiana entre (x,y) detectado vs esperado
//                 (distância em % do canvas, normalizada)
//   - confScore: média de confidence dos matches
//   - score = matchScore × 0.4 + localScore × 0.4 + confScore × 0.2

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Fixture = {
  id: string;
  name: string;
  image_url: string;
  known_products: { category: string; name: string }[];
  expected_touchpoints: { name: string; category: string; x: number; y: number }[];
};

type DetectedProduct = {
  name: string;
  category: string;
  x: number;
  y: number;
  confidence: number;
};

function nameKey(p: { name: string; category: string }): string {
  return `${p.category.toLowerCase().trim()}::${p.name.toLowerCase().trim()}`;
}

function scoreFixture(
  expected: Fixture["expected_touchpoints"],
  detected: DetectedProduct[],
): { score: number; matchScore: number; localScore: number; confScore: number; diff: any } {
  const expKeys = new Set(expected.map(nameKey));
  const detKeys = new Set(detected.map(nameKey));
  const intersect = [...expKeys].filter((k) => detKeys.has(k));
  const union = new Set([...expKeys, ...detKeys]);

  const matchScore = union.size === 0 ? 100 : (intersect.length / union.size) * 100;

  // Local: para cada match, distância (x,y) em %
  const distances: number[] = [];
  for (const e of expected) {
    const d = detected.find((x) => nameKey(x) === nameKey(e));
    if (d) {
      const dx = (e.x - d.x);
      const dy = (e.y - d.y);
      distances.push(Math.sqrt(dx * dx + dy * dy));
    }
  }
  // Distância 0–100 (diagonal), inverte pra score
  const avgDist = distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
  const localScore = distances.length ? Math.max(0, 100 - avgDist * 1.5) : 50;

  const matched = detected.filter((d) => expKeys.has(nameKey(d)));
  const confScore = matched.length
    ? matched.reduce((a, b) => a + b.confidence, 0) / matched.length
    : 0;

  const score = +(matchScore * 0.4 + localScore * 0.4 + confScore * 0.2).toFixed(2);

  return {
    score,
    matchScore: +matchScore.toFixed(2),
    localScore: +localScore.toFixed(2),
    confScore: +confScore.toFixed(2),
    diff: {
      matched: intersect,
      missed: [...expKeys].filter((k) => !detKeys.has(k)),
      extra: [...detKeys].filter((k) => !expKeys.has(k)),
      avgDistancePct: +avgDist.toFixed(2),
    },
  };
}

async function runPipeline(fixture: Fixture, supabaseUrl: string, anonKey: string, jwt: string) {
  const t0 = Date.now();
  const r = await fetch(`${supabaseUrl}/functions/v1/detect-touchpoints-combined`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`,
      "apikey": anonKey,
    },
    body: JSON.stringify({
      imageUrl: fixture.image_url,
      knownProducts: fixture.known_products,
    }),
  });
  const data = await r.json();
  return { data, duration_ms: Date.now() - t0, ok: r.ok };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: ou JWT de admin, ou CRON_SECRET no header
    const authHeader = req.headers.get("authorization") || "";
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedCron = Deno.env.get("CRON_SECRET");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    if (cronSecret && expectedCron && cronSecret === expectedCron) {
      // ok
    } else if (authHeader.startsWith("Bearer ")) {
      // Verifica admin
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: "Sem auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data: isAdminRow } = await admin.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!isAdminRow) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      return new Response(JSON.stringify({ error: "Sem auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const filterIds: string[] | undefined = body.fixtureIds;
    const pipelineLabel = body.pipeline || "vision+gemini";

    let q = admin.from("touchpoint_qa_fixtures").select("*").eq("enabled", true);
    if (filterIds && filterIds.length > 0) q = q.in("id", filterIds);
    const { data: fixtures, error: fxErr } = await q;
    if (fxErr) throw fxErr;
    if (!fixtures || fixtures.length === 0) {
      return new Response(JSON.stringify({ ok: true, ran: 0, message: "Nenhum fixture habilitado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Token p/ chamar functions internamente — usa service role
    const jwt = serviceKey;

    const results: { fixture_id: string; score: number | null; error?: string }[] = [];

    for (const f of fixtures as Fixture[]) {
      try {
        const { data, duration_ms, ok } = await runPipeline(f, supabaseUrl, anonKey, jwt);
        if (!ok || !data?.products) {
          await admin.from("touchpoint_qa_runs").insert({
            fixture_id: f.id,
            pipeline: pipelineLabel,
            score: null,
            duration_ms,
            error: data?.error || "sem produtos",
          });
          results.push({ fixture_id: f.id, score: null, error: data?.error || "sem produtos" });
          continue;
        }
        const sc = scoreFixture(f.expected_touchpoints, data.products);
        await admin.from("touchpoint_qa_runs").insert({
          fixture_id: f.id,
          pipeline: pipelineLabel,
          score: sc.score,
          detected: data,
          diff: sc.diff,
          duration_ms,
        });
        results.push({ fixture_id: f.id, score: sc.score });
      } catch (e: any) {
        await admin.from("touchpoint_qa_runs").insert({
          fixture_id: f.id,
          pipeline: pipelineLabel,
          score: null,
          error: e.message || String(e),
        });
        results.push({ fixture_id: f.id, score: null, error: e.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, ran: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("qa-touchpoints-run:", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
