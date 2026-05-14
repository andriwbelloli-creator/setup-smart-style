// track-product-click
//
// Frontend chama essa função ANTES de abrir o link do produto. A função:
//   1. Valida que product_id existe e active=true
//   2. Resolve destination_url no SERVIDOR (prefere affiliate_url, fallback
//      product_url) — nunca confia na URL enviada pelo frontend (anti
//      open-redirect)
//   3. Insere em product_clicks
//   4. Devolve { destination_url } pro frontend abrir
//
// Body:
//   { product_id, analysis_id?, touchpoint_id?, source? }
//
// Resposta:
//   { destination_url } | { error }

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function extractUserId(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const [, b64] = authHeader.slice(7).split(".");
    return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/"))).sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const productId: string | undefined = body.product_id;
    const analysisId: string | undefined = body.analysis_id;
    const touchpointId: string | undefined = body.touchpoint_id;
    const source: string = typeof body.source === "string" ? body.source : "analysis_result";

    if (!productId || typeof productId !== "string") {
      return new Response(JSON.stringify({ error: "product_id obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pega userId opcional (clique anônimo é permitido — vira lead)
    const userId = extractUserId(req.headers.get("authorization"));

    // Recupera produto pelo backend (NUNCA confiar em URL do client)
    const { data: product, error: prodErr } = await admin
      .from("recommended_products")
      .select("id, product_url, affiliate_url, partner_id, partner_name, active")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      return new Response(JSON.stringify({ error: "Produto não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!product.active) {
      return new Response(JSON.stringify({ error: "Produto temporariamente indisponível" }), {
        status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve URL: affiliate > product
    const destination = product.affiliate_url || product.product_url;
    if (!destination) {
      return new Response(JSON.stringify({ error: "Produto sem link configurado" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insere clique (fire-and-forget — não bloqueia o redirect)
    await admin.from("product_clicks").insert({
      user_id: userId,
      analysis_id: analysisId || null,
      touchpoint_id: touchpointId || null,
      product_id: productId,
      partner_id: product.partner_id,
      partner_name: product.partner_name,
      destination_url: destination,
      source,
      ua: req.headers.get("user-agent")?.slice(0, 500) || null,
    });

    return new Response(JSON.stringify({ destination_url: destination }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("track-product-click:", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
