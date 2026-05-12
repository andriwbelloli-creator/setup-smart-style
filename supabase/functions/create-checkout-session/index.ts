// Stripe Checkout session creator.
// Requires Supabase secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_PREMIUM, STRIPE_PRICE_PRO

import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICE_IDS = {
  premium: () => Deno.env.get("STRIPE_PRICE_PREMIUM") ?? "",
  pro: () => Deno.env.get("STRIPE_PRICE_PRO") ?? "",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return json({ error: "STRIPE_SECRET_KEY não configurada" }, 500);
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-09-30.acacia" });

    const { tier, userId, email, returnUrl } = await req.json();
    if (!tier || !userId || !email) {
      return json({ error: "Parâmetros faltando: tier, userId, email" }, 400);
    }
    if (tier !== "premium" && tier !== "pro") {
      return json({ error: "Tier inválido" }, 400);
    }
    const priceId = PRICE_IDS[tier as "premium" | "pro"]();
    if (!priceId) {
      return json({ error: `STRIPE_PRICE_${tier.toUpperCase()} não configurado` }, 500);
    }

    const origin = returnUrl || req.headers.get("origin") || "https://homeoffice.life";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      metadata: { userId, tier },
      subscription_data: { metadata: { userId, tier } },
      success_url: `${origin}/perfil?checkout=success`,
      cancel_url: `${origin}/premium?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return json({ error: e instanceof Error ? e.message : "Erro" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
