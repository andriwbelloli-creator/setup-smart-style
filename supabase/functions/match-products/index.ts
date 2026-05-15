// match-products — liga elementos detectados/problemas → affiliate_products
// Gated por ENABLE_NEW_IA_FLOW=true

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// Mapeia problema detectado → problem_category na tabela affiliate_products
const PROBLEM_MAP: Record<string, string> = {
  ergonomia:      "ergonomia",
  iluminacao:     "iluminacao",
  iluminação:     "iluminacao",
  cabos:          "cabos",
  organizacao:    "organizacao",
  organização:    "organizacao",
  estetica:       "estetica",
  estética:       "estetica",
  produtividade:  "produtividade",
  videochamadas:  "videochamadas",
  video:          "videochamadas",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (Deno.env.get("ENABLE_NEW_IA_FLOW") !== "true") {
    return json({ error: "feature_disabled" }, 503);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return json({ error: "Supabase env not set" }, 500);
  }

  let problems: string[] = [];
  let scores: Record<string, number> = {};
  let budget: number | undefined;
  let styleSlug: string | undefined;
  let limit = 8;

  try {
    const body = await req.json();
    problems = body.problems ?? [];
    scores = body.scores ?? {};
    budget = body.budget;
    styleSlug = body.styleSlug;
    limit = body.limit ?? 8;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  // Derive problem_categories from problems array + low scores
  const categories = new Set<string>();

  for (const p of problems) {
    const cat = PROBLEM_MAP[p.toLowerCase()] ?? p.toLowerCase();
    categories.add(cat);
  }

  // Add categories for scores below 6
  for (const [key, val] of Object.entries(scores)) {
    if (val < 6) {
      const cat = PROBLEM_MAP[key.toLowerCase()] ?? key.toLowerCase();
      categories.add(cat);
    }
  }

  // If no categories found, return top-priority products overall
  const catList = [...categories];

  let url: string;
  if (catList.length > 0) {
    const filter = catList.map((c) => `problem_category.eq.${c}`).join(",");
    url = `${SUPABASE_URL}/rest/v1/affiliate_products?select=id,name,category,problem_category,fallback_search_url,product_url,image_url,price_min,price_max,price_range,reason,priority&status=eq.active&or=(${filter})&order=priority.desc&limit=${limit}`;
  } else {
    url = `${SUPABASE_URL}/rest/v1/affiliate_products?select=id,name,category,problem_category,fallback_search_url,product_url,image_url,price_min,price_max,price_range,reason,priority&status=eq.active&order=priority.desc&limit=${limit}`;
  }

  // Filter by budget if provided
  if (budget != null) {
    url += `&price_min=lte.${budget}`;
  }

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return json({ error: "supabase_error", detail: err }, 502);
  }

  const products = await res.json();

  return json({
    products,
    categoriesMatched: catList,
    total: products.length,
  });
});
