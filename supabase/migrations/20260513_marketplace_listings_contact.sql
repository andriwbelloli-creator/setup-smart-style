-- Adiciona campo de contato obrigatório no anúncio C2C.
-- Aceita formato livre (WhatsApp link, telefone, email) — validação de
-- conteúdo fica na aplicação. Listings antigos ficam com '' (backfill).

alter table public.marketplace_listings
  add column if not exists contact text not null default '';
