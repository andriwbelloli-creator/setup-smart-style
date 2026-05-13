-- Habilita Realtime no affiliate_clicks: o dashboard /dashboard/afiliados
-- assina INSERTs pra mostrar novos cliques sem reload.
alter publication supabase_realtime add table public.affiliate_clicks;
