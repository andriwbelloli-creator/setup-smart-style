-- Atualiza preço do tier Pro de R$29,90 → R$19,90 (decisão de pricing 2026-05-13).
-- Premium continua R$9,90. Diferença Pro vs Premium ficou pequena por design:
-- queremos mover free → premium primeiro e usar Pro só pra power users que
-- realmente vão usar consultoria + features de criador.

update public.subscription_plans
set price_cents_brl = 1990
where tier = 'pro' and price_cents_brl <> 1990;
