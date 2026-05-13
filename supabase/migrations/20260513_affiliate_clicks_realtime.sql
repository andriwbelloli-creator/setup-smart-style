-- Habilita Realtime no affiliate_clicks: o dashboard /dashboard/afiliados
-- assina INSERTs pra mostrar novos cliques sem reload.
-- Idempotente: só adiciona se ainda não estiver na publication.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'affiliate_clicks'
  ) then
    alter publication supabase_realtime add table public.affiliate_clicks;
  end if;
end $$;
