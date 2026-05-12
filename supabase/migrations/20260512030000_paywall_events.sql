-- Track quando usuário bate paywall (limite de análises grátis atingido).
-- Usado pra:
--   1. Mostrar banner "20% off" se voltar dentro de 7 dias (recovery)
--   2. Métricas de funil no admin (paywall hits, recovery rate)
--   3. Futuro: trigger pra email automático 24h após o hit

CREATE TABLE IF NOT EXISTS public.paywall_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'analyze_limit',
  analyses_used INTEGER,
  converted_at TIMESTAMPTZ,
  hit_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paywall_events_user_idx
  ON public.paywall_events(user_id, hit_at DESC);
CREATE INDEX IF NOT EXISTS paywall_events_hit_idx
  ON public.paywall_events(hit_at DESC);
CREATE INDEX IF NOT EXISTS paywall_events_unconverted_idx
  ON public.paywall_events(hit_at DESC)
  WHERE converted_at IS NULL;

ALTER TABLE public.paywall_events ENABLE ROW LEVEL SECURITY;

-- User pode inserir e ler os próprios eventos
DROP POLICY IF EXISTS "paywall_events insert own" ON public.paywall_events;
CREATE POLICY "paywall_events insert own"
  ON public.paywall_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "paywall_events read own" ON public.paywall_events;
CREATE POLICY "paywall_events read own"
  ON public.paywall_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin lê tudo (pra dashboard)
DROP POLICY IF EXISTS "paywall_events admin read" ON public.paywall_events;
CREATE POLICY "paywall_events admin read"
  ON public.paywall_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updates (marca converted_at) só via service_role.
