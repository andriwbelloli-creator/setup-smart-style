-- analytics_events: tabela genérica pra rastrear funis dos 4 serviços
-- (inspiração, IA, afiliados, marketplace). Permite cruzar jornada do mesmo
-- usuário (anônimo ou logado) entre serviços via session_id / anon_id.
--
-- Princípios:
-- - Insert público (anon + authenticated) pra capturar visitantes não-logados
-- - Read só admin (proteção de PII e dados de negócio)
-- - props jsonb: schema-less pra evolução rápida sem migrations
-- - anon_id no localStorage: identifica visitante anônimo
-- - session_id: agrupa eventos da mesma sessão (timeout 30min)
-- - utm_* + referrer: atribuição de origem

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidade (uma dessas duas é sempre preenchida)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id TEXT,

  -- Agrupamento de jornada
  session_id TEXT,

  -- Evento
  event_name TEXT NOT NULL CHECK (char_length(event_name) BETWEEN 2 AND 80),
  service TEXT NOT NULL CHECK (service IN ('inspiration', 'ia', 'affiliate', 'marketplace', 'auth', 'subscription', 'other')),
  props JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Contexto da requisição
  page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ua TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices pros aggregates do dashboard
CREATE INDEX IF NOT EXISTS analytics_events_service_idx ON public.analytics_events(service, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx   ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx    ON public.analytics_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_events_anon_idx    ON public.analytics_events(anon_id, created_at DESC) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON public.analytics_events(session_id, created_at) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS analytics_events_utm_idx     ON public.analytics_events(utm_source, utm_campaign, created_at DESC) WHERE utm_source IS NOT NULL;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- INSERT: qualquer um pode trackear (incluindo anon). Validação acontece no client (zod-like)
-- e no CHECK constraint do service.
DROP POLICY IF EXISTS "analytics_events insert anyone" ON public.analytics_events;
CREATE POLICY "analytics_events insert anyone"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- SELECT: só admins (dados sensíveis: jornada, conversão, receita)
DROP POLICY IF EXISTS "analytics_events read admin" ON public.analytics_events;
CREATE POLICY "analytics_events read admin"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- View agregada: contagem de eventos por dia/serviço/evento (mais barato pro dashboard)
CREATE OR REPLACE VIEW public.analytics_daily_stats AS
SELECT
  date_trunc('day', created_at) AS day,
  service,
  event_name,
  COUNT(*)                                                       AS events,
  COUNT(DISTINCT COALESCE(user_id::text, anon_id))               AS unique_users,
  COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) AS sessions
FROM public.analytics_events
GROUP BY 1, 2, 3
ORDER BY 1 DESC;
-- Views não suportam RLS direto — quem faz select na view obedece a RLS da tabela base.
