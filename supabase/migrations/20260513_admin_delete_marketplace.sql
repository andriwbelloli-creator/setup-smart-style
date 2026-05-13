-- Permite que admins deletem qualquer marketplace_listing (moderação).
-- Owners já podem deletar os próprios via policy "marketplace_listings delete own".
-- Cascade em FKs (marketplace_offers, marketplace_saves, marketplace_listing_images)
-- já garante limpeza dos relacionamentos.

drop policy if exists "marketplace_listings delete admin" on public.marketplace_listings;
create policy "marketplace_listings delete admin"
  on public.marketplace_listings for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
