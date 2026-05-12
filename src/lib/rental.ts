import { supabase } from "@/integrations/supabase/client";

export type LeadType = "B2B" | "B2C";

export type RentalPartner = {
  id: string;
  name: string;
  email: string;
  website: string | null;
  accepted_types: string[];
};

/**
 * Estimativa de mensalidade B2C: 8% do preço total de compra
 * (~12 meses pra cobrir + margem). Operadoras reais ajustam por
 * categoria de produto e prazo.
 */
export function estimateMonthlyRental(totalPriceBrl: number, durationMonths = 12): number {
  // Quanto mais longo o contrato, menor a mensalidade efetiva.
  const factor = durationMonths >= 24 ? 0.06 : durationMonths >= 12 ? 0.08 : 0.11;
  return Math.round(totalPriceBrl * factor);
}

/**
 * Roteia o lead pro parceiro adequado.
 *
 * Fase 1 (atual): apenas console.log simulando o envio.
 * Fase 2: integração real com Resend (https://resend.com/docs/api-reference/emails/send-email)
 *   - Email pro parceiro contendo: dados do cliente, setup de interesse,
 *     prazo, orçamento estimado
 *   - Email de confirmação pro cliente
 *   - CC: comercial@homeoffice.life
 *
 * Critério de roteamento:
 *   1. Pega parceiros active que aceitam o lead_type
 *   2. Round-robin simples (ou prefere o com menor lead atribuído)
 *   3. Atualiza rental_leads.partner_id
 */
export async function notifyPartner(leadId: string): Promise<{ ok: boolean; partner?: RentalPartner; error?: string }> {
  // Lê o lead
  const { data: lead, error: leadErr } = await (supabase as any)
    .from("rental_leads")
    .select("id, lead_type, customer_name, customer_email, customer_phone, company_name, employee_count, rental_duration_months, setup_id")
    .eq("id", leadId)
    .maybeSingle();
  if (leadErr || !lead) {
    console.warn("[notifyPartner] lead não encontrado:", leadErr?.message);
    return { ok: false, error: "lead not found" };
  }

  // Pega parceiros que aceitam esse tipo
  const { data: partners } = await (supabase as any)
    .from("rental_partners")
    .select("id, name, email, website, accepted_types")
    .eq("active", true)
    .contains("accepted_types", [lead.lead_type]);
  const eligible = (partners || []) as RentalPartner[];

  if (eligible.length === 0) {
    console.warn(`[notifyPartner] sem parceiros pra lead_type=${lead.lead_type}`);
    return { ok: false, error: "no eligible partners" };
  }

  // Seleção: round-robin simples (random) por enquanto. Fase 2:
  // queryar count de leads atribuídos nas últimas 24h e pegar o
  // com menor carga (balanceamento).
  const chosen = eligible[Math.floor(Math.random() * eligible.length)];

  // Atualiza partner_id
  const { error: updErr } = await (supabase as any)
    .from("rental_leads")
    .update({ partner_id: chosen.id })
    .eq("id", leadId);
  if (updErr) {
    console.warn("[notifyPartner] erro atualizar partner_id:", updErr.message);
  }

  // ====== SIMULAÇÃO de envio de email (Fase 1) ======
  // TODO Fase 2: trocar console.log por Resend.emails.send({...})
  console.info(
    `[rental-notify] → parceiro "${chosen.name}" <${chosen.email}>\n` +
    `  Tipo: ${lead.lead_type}\n` +
    `  ${lead.lead_type === "B2B" ? `Empresa: ${lead.company_name} · ${lead.employee_count} setups` : `Cliente: ${lead.customer_name}`}\n` +
    `  Contato: ${lead.customer_email} · ${lead.customer_phone}\n` +
    `  Prazo: ${lead.rental_duration_months} meses\n` +
    `  Setup ref: ${lead.setup_id ?? "—"}`,
  );

  return { ok: true, partner: chosen };
}
