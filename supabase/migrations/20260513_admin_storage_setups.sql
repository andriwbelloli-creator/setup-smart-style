-- Admins podem gerenciar qualquer arquivo no bucket "setups" (incluindo
-- assets globais como _landing/hero.webp). Owners continuam restritos
-- pela policy "setups storage insert own" (pasta = user_id).

drop policy if exists "setups storage admin all" on storage.objects;
create policy "setups storage admin all"
  on storage.objects for all to authenticated
  using (bucket_id = 'setups' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'setups' and public.has_role(auth.uid(), 'admin'));
