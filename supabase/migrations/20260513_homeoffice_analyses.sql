-- HomeOffice.life — análises por IA (Gemini + rules + Claude premium)
--
-- Fluxo:
--   1. Upload da imagem vai pra storage; URL é passada pra edge function
--      `analyze-homeoffice-image`.
--   2. Função invoca Gemini Vision pra detecção objetiva, motor de regras
--      gera touchpoints, e (se premium) Claude refina.
--   3. Resultado é salvo em `analyses` (header) + N linhas em `touchpoints`.
--
-- Tabelas:
--   - analyses               cabeçalho da análise, scores, status
--   - touchpoints            itens recomendados / não-recomendados
--   - partners               catálogo de parceiros (semeado)
--   - user_analysis_limits   contagem de free analyses + flag premium
--
-- RLS: cada usuário acessa só os próprios dados. Admin vê tudo via has_role.

-- Enums
DO $$ BEGIN
  CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.analysis_type AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.profile_type AS ENUM (
    'geral','dev','designer','advogado','medico','psicologo',
    'professor','autonomo','consultor','criador','executivo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.touchpoint_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================================
-- analyses
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  status public.analysis_status NOT NULL DEFAULT 'pending',
  analysis_type public.analysis_type NOT NULL DEFAULT 'free',
  profile_type public.profile_type NOT NULL DEFAULT 'geral',

  -- Score geral 0–100 (média ponderada dos sub-scores)
  overall_score NUMERIC(5,2),

  -- Sub-scores 0–100
  ergonomics_score NUMERIC(5,2),
  lighting_score NUMERIC(5,2),
  organization_score NUMERIC(5,2),
  cable_management_score NUMERIC(5,2),
  decoration_score NUMERIC(5,2),
  video_background_score NUMERIC(5,2),
  acoustic_score NUMERIC(5,2),
  productivity_score NUMERIC(5,2),

  -- Resultados crus pra debug e re-processamento
  gemini_raw_result JSONB,
  rules_result JSONB,
  claude_result JSONB,
  final_result JSONB,

  error_message TEXT,
  duration_ms INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_user_idx ON public.analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analyses_status_idx ON public.analyses(status, created_at DESC) WHERE status <> 'completed';
CREATE INDEX IF NOT EXISTS analyses_premium_idx ON public.analyses(analysis_type, created_at DESC) WHERE analysis_type = 'premium';

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_owner_select" ON public.analyses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "analyses_owner_insert" ON public.analyses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "analyses_admin_update" ON public.analyses
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- =========================================================================
-- touchpoints
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,

  -- Categorização
  category TEXT NOT NULL,            -- ex: "iluminacao_conforto_visual"
  item TEXT NOT NULL,                -- ex: "cortina"
  commercial_category TEXT,          -- ex: "cortina_blackout", pra busca afiliada

  -- Conteúdo
  visual_evidence TEXT NOT NULL,
  problem TEXT NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,

  -- Meta
  priority public.touchpoint_priority NOT NULL DEFAULT 'medium',
  confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  estimated_budget TEXT,             -- ex: "R$ 120 a R$ 500"
  partners TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  is_recommended BOOLEAN NOT NULL DEFAULT TRUE,
  not_recommended_reason TEXT,       -- preenchido quando is_recommended=false

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS touchpoints_analysis_idx ON public.touchpoints(analysis_id, priority DESC, confidence DESC);
CREATE INDEX IF NOT EXISTS touchpoints_recommended_idx ON public.touchpoints(analysis_id, is_recommended);

ALTER TABLE public.touchpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "touchpoints_owner_select" ON public.touchpoints
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.analyses a
    WHERE a.id = touchpoints.analysis_id
      AND (a.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));

-- Inserts via service_role na edge function. Sem policy de insert pra
-- authenticated -- usuário não escreve direto, sempre via função.

-- =========================================================================
-- partners
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,            -- "moveis_decoracao" | "eletronicos" | "plantas" | "geral"
  base_url TEXT NOT NULL,
  search_url_template TEXT,          -- template com {query} pra busca afiliada
  affiliate_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  affiliate_program TEXT,            -- "lomadee" | "awin" | "proprio"
  commission_rate NUMERIC(5,2),      -- 0–100 percent
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners_public_read" ON public.partners
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "partners_admin_write" ON public.partners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed dos 11 parceiros principais. ON CONFLICT pra idempotência.
INSERT INTO public.partners (slug, name, category, base_url, search_url_template, notes) VALUES
  ('tokstok',         'Tok&Stok',       'moveis_decoracao', 'https://www.tokstok.com.br', 'https://www.tokstok.com.br/search?q={query}', 'Móveis, iluminação, decoração'),
  ('madeira_madeira', 'MadeiraMadeira', 'moveis_decoracao', 'https://www.madeiramadeira.com.br', 'https://www.madeiramadeira.com.br/busca?strBusca={query}', 'Móveis, organização'),
  ('mobly',           'Mobly',          'moveis_decoracao', 'https://www.mobly.com.br', 'https://www.mobly.com.br/catalogsearch/result/?q={query}', 'Móveis, estantes'),
  ('leroy_merlin',    'Leroy Merlin',   'construcao_decoracao', 'https://www.leroymerlin.com.br', 'https://www.leroymerlin.com.br/busca?term={query}', 'Construção, papel de parede, iluminação'),
  ('amazon_br',       'Amazon',         'eletronicos_geral', 'https://www.amazon.com.br', 'https://www.amazon.com.br/s?k={query}', 'Eletrônicos, acessórios, livros'),
  ('mercado_livre',   'Mercado Livre',  'eletronicos_geral', 'https://www.mercadolivre.com.br', 'https://lista.mercadolivre.com.br/{query}', 'Marketplace amplo'),
  ('kalunga',         'Kalunga',        'escritorio',       'https://www.kalunga.com.br', 'https://www.kalunga.com.br/busca/{query}', 'Materiais de escritório'),
  ('shopee',          'Shopee',         'eletronicos_geral','https://shopee.com.br', 'https://shopee.com.br/search?keyword={query}', 'Acessórios baratos, importados'),
  ('magalu',          'Magalu',         'eletronicos_geral','https://www.magazineluiza.com.br', 'https://www.magazineluiza.com.br/busca/{query}/', 'Eletrônicos, móveis'),
  ('cobasi',          'Cobasi',         'plantas_pet',      'https://www.cobasi.com.br', 'https://www.cobasi.com.br/busca?q={query}', 'Plantas, vasos'),
  ('petz',            'Petz',           'plantas_pet',      'https://www.petz.com.br', 'https://www.petz.com.br/busca?q={query}', 'Pet + plantas decorativas')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  base_url = EXCLUDED.base_url,
  search_url_template = EXCLUDED.search_url_template,
  notes = EXCLUDED.notes;

-- =========================================================================
-- user_analysis_limits
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.user_analysis_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  free_analyses_used INT NOT NULL DEFAULT 0,
  free_analyses_quota INT NOT NULL DEFAULT 3,
  premium_active BOOLEAN NOT NULL DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ual_user_idx ON public.user_analysis_limits(user_id);

ALTER TABLE public.user_analysis_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ual_owner_select" ON public.user_analysis_limits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Updates só via service_role na edge function (não exposto pro client).

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS analyses_touch_updated_at ON public.analyses;
CREATE TRIGGER analyses_touch_updated_at BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS ual_touch_updated_at ON public.user_analysis_limits;
CREATE TRIGGER ual_touch_updated_at BEFORE UPDATE ON public.user_analysis_limits
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
