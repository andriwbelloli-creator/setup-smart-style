// send-offer-notification: dispara email transacional via Resend quando
// uma proposta é criada/aceita/rejeitada no marketplace.
//
// Body: { offer_id: string, event: "created" | "accepted" | "rejected" }
// Auth: JWT do usuário que fez a ação (verify_jwt = true). Função usa
// service role internamente pra buscar emails de auth.users (que o
// usuário não pode ler diretamente via RLS).

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "HomeOfficeLife <noreply@homeofficelife.com.br>";
const SITE_URL = "https://homeofficelife.com.br";

type Event = "created" | "accepted" | "rejected";

function brlFromCents(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function template(event: Event, ctx: { listingTitle: string; offerPrice: number; askPrice: number; offerMessage?: string; listingId: string; buyerName?: string }) {
  const offerBrl = brlFromCents(Number(ctx.offerPrice));
  const askBrl = brlFromCents(Number(ctx.askPrice));
  const url = `${SITE_URL}/marketplace/${ctx.listingId}`;
  const base = (title: string, body: string, cta: string) => `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <div style="margin-bottom:20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#0d6e6e;font-weight:700;">HomeOfficeLife · Marketplace</div>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1a1a1a;">${title}</h1>
    ${body}
    <a href="${url}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0d6e6e;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${cta}</a>
    <p style="margin-top:32px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#888;">
      Você recebeu este email porque tem uma conta em HomeOfficeLife.
      <a href="${SITE_URL}" style="color:#0d6e6e;">homeofficelife.com.br</a>
    </p>
  </div>
</body></html>`;

  if (event === "created") {
    return {
      subject: `Nova proposta de ${offerBrl} no seu anúncio`,
      html: base(
        "Você recebeu uma proposta!",
        `<p style="font-size:15px;line-height:1.6;color:#444;">
          <strong>${ctx.buyerName || "Um comprador"}</strong> ofereceu <strong>${offerBrl}</strong> pelo seu anúncio <strong>${ctx.listingTitle}</strong> (preço pedido: ${askBrl}).
          ${ctx.offerMessage ? `<br><br>Mensagem do comprador:<br><em style="color:#666;">"${escapeHtml(ctx.offerMessage)}"</em>` : ""}
        </p>`,
        "Ver proposta",
      ),
    };
  }
  if (event === "accepted") {
    return {
      subject: `Sua proposta de ${offerBrl} foi aceita!`,
      html: base(
        "Sua proposta foi aceita 🎉",
        `<p style="font-size:15px;line-height:1.6;color:#444;">
          O vendedor aceitou sua oferta de <strong>${offerBrl}</strong> pelo anúncio <strong>${ctx.listingTitle}</strong>.
          <br><br>Combine os detalhes da entrega pelo contato do vendedor (visível no anúncio).
        </p>`,
        "Ver anúncio",
      ),
    };
  }
  return {
    subject: `Sua proposta no anúncio "${ctx.listingTitle}" foi recusada`,
    html: base(
      "Sua proposta foi recusada",
      `<p style="font-size:15px;line-height:1.6;color:#444;">
        O vendedor recusou sua oferta de <strong>${offerBrl}</strong> pelo anúncio <strong>${ctx.listingTitle}</strong>.
        <br><br>Você pode fazer uma nova proposta com valor diferente ou explorar outros anúncios.
      </p>`,
      "Explorar marketplace",
    ),
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]);
}

async function fetchSupabase(path: string, init: RequestInit = {}) {
  const url = Deno.env.get("SUPABASE_URL");
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      apikey: sr!,
      Authorization: `Bearer ${sr}`,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { offer_id, event } = body as { offer_id: string; event: Event };
    if (!offer_id || !["created", "accepted", "rejected"].includes(event)) {
      return new Response(JSON.stringify({ error: "offer_id e event obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Busca offer + listing
    const offerRes = await fetchSupabase(
      `/rest/v1/marketplace_offers?id=eq.${offer_id}&select=*,listing:marketplace_listings(id,title,price,seller_id)`,
    );
    const offers = await offerRes.json();
    const offer = offers?.[0];
    if (!offer) {
      return new Response(JSON.stringify({ error: "Proposta não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decide destinatário e busca email + nome
    const recipientId = event === "created" ? offer.seller_id : offer.buyer_id;
    const userRes = await fetchSupabase(`/auth/v1/admin/users/${recipientId}`);
    const userData = await userRes.json();
    const recipientEmail = userData?.email;
    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Email do destinatário não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Busca nome do buyer pra incluir no email de "created"
    let buyerName: string | undefined;
    if (event === "created") {
      const profRes = await fetchSupabase(
        `/rest/v1/profiles?id=eq.${offer.buyer_id}&select=display_name,username`,
      );
      const profs = await profRes.json();
      buyerName = profs?.[0]?.display_name || profs?.[0]?.username;
    }

    const ctx = {
      listingTitle: offer.listing?.title || "anúncio",
      offerPrice: offer.price_offered,
      askPrice: offer.listing?.price || 0,
      offerMessage: offer.message,
      listingId: offer.listing?.id,
      buyerName,
    };
    const tpl = template(event, ctx);

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: tpl.subject,
        html: tpl.html,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Resend error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Falha no envio", resend_status: resp.status, resend_body: t.slice(0, 400) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();

    return new Response(JSON.stringify({ ok: true, email_id: data.id, recipient: recipientEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-offer-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
