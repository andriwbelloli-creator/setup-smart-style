// Stripe webhook handler — updates subscriptions table on payment events.
// Requires Supabase secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-09-30.acacia" });
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log("Stripe event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const tier = session.metadata?.tier as "premium" | "pro" | undefined;
        if (!userId || !tier) break;
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("id")
          .eq("tier", tier)
          .maybeSingle();
        if (!plan) break;
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          plan_id: plan.id,
          tier,
          status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        await logEvent(supabase, userId, event, session.amount_total);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const status = mapStripeStatus(sub.status);
        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        await logEvent(supabase, userId, event);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = (invoice.subscription_details?.metadata as any)?.userId;
        if (userId) await logEvent(supabase, userId, event, invoice.amount_paid);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return new Response("Handler error", { status: 500 });
  }
});

function mapStripeStatus(s: Stripe.Subscription.Status): string {
  switch (s) {
    case "active":
    case "trialing": return s;
    case "past_due": return "past_due";
    case "canceled": return "canceled";
    case "incomplete":
    case "incomplete_expired": return "incomplete";
    case "unpaid": return "unpaid";
    default: return "active";
  }
}

async function logEvent(supabase: any, userId: string, event: Stripe.Event, amountCents?: number | null) {
  await supabase.from("payment_events").insert({
    user_id: userId,
    provider: "stripe",
    event_type: event.type,
    external_id: event.id,
    amount_cents: amountCents ?? null,
    currency: "BRL",
    raw_payload: event.data.object,
  });
}
