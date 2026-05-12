-- Bot detection via honeypot links.
-- Quando um cliente acessa um link invisível (hidden CSS + aria-hidden)
-- gravamos o evento aqui. Usado para banir IPs in-memory no servidor.

CREATE TABLE IF NOT EXISTS public.bot_traps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  referer TEXT,
  trap_type TEXT NOT NULL DEFAULT 'honeypot_link',
  request_path TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bot_traps_ip_hash_idx ON public.bot_traps(ip_hash, detected_at DESC);
CREATE INDEX IF NOT EXISTS bot_traps_detected_idx ON public.bot_traps(detected_at DESC);

ALTER TABLE public.bot_traps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bot_traps admin read" ON public.bot_traps;
CREATE POLICY "bot_traps admin read"
  ON public.bot_traps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- Inserts via service_role apenas (servidor) — não há policy de insert.
