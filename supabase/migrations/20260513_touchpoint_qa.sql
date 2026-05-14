-- QA constante de touchpoints
--
-- Mecanismo:
--   1. `touchpoint_qa_fixtures` armazena casos canônicos (foto + produtos
--      declarados + touchpoints esperados manualmente curados).
--   2. Cron (ou trigger manual no admin) chama edge function `qa-touchpoints-run`
--      que roda cada fixture pela pipeline (Vision + Gemini) e compara o
--      resultado com o esperado.
--   3. Resultado de cada run vai pra `touchpoint_qa_runs` com score por
--      fixture (IoU de bboxes + match de nome).
--   4. Drift detectado (score caiu > X% vs baseline) dispara alerta no admin.
--
-- Score por fixture (0–100):
--   - Match de produtos detectados (Jaccard sobre o set de nomes) × 0.4
--   - Acurácia de localização (IoU médio das bboxes) × 0.4
--   - Confidence média dos matches × 0.2
--
-- Acesso: admin reads + writes, anon nada.

CREATE TABLE IF NOT EXISTS public.touchpoint_qa_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificação
  name TEXT NOT NULL,
  description TEXT,
  -- Input pro pipeline
  image_url TEXT NOT NULL,
  known_products JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- shape: [{ category: string, name: string }]
  -- Verdade curada manualmente (gabarito)
  expected_touchpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- shape: [{ name, category, x, y, w?, h?, must_match: bool }]
  -- Metadados pra organização
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS touchpoint_qa_fixtures_enabled_idx
  ON public.touchpoint_qa_fixtures(enabled, created_at DESC);

ALTER TABLE public.touchpoint_qa_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage QA fixtures"
  ON public.touchpoint_qa_fixtures
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));


CREATE TABLE IF NOT EXISTS public.touchpoint_qa_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES public.touchpoint_qa_fixtures(id) ON DELETE CASCADE,
  -- Versão da pipeline (livre — bump quando refatorar)
  pipeline TEXT NOT NULL DEFAULT 'vision+gemini',
  -- Score 0–100, NULL se erro
  score NUMERIC(5,2),
  -- Detalhes pra debug
  detected JSONB,        -- output bruto da pipeline
  diff JSONB,            -- match/miss/extra vs expected
  duration_ms INT,
  error TEXT,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS touchpoint_qa_runs_fixture_idx
  ON public.touchpoint_qa_runs(fixture_id, ran_at DESC);

CREATE INDEX IF NOT EXISTS touchpoint_qa_runs_pipeline_idx
  ON public.touchpoint_qa_runs(pipeline, ran_at DESC);

ALTER TABLE public.touchpoint_qa_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read QA runs"
  ON public.touchpoint_qa_runs
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Inserts são feitos pelo service_role da edge function, não precisa RLS write.

-- View pra ver drift por fixture: último score vs baseline (média dos últimos 10 antes).
CREATE OR REPLACE VIEW public.touchpoint_qa_drift AS
WITH latest AS (
  SELECT DISTINCT ON (fixture_id) fixture_id, score AS latest_score, ran_at
  FROM public.touchpoint_qa_runs
  ORDER BY fixture_id, ran_at DESC
),
baseline AS (
  SELECT fixture_id, AVG(score)::numeric(5,2) AS baseline_score
  FROM (
    SELECT fixture_id, score,
           ROW_NUMBER() OVER (PARTITION BY fixture_id ORDER BY ran_at DESC) AS rn
    FROM public.touchpoint_qa_runs
    WHERE score IS NOT NULL
  ) sub
  WHERE rn BETWEEN 2 AND 11
  GROUP BY fixture_id
)
SELECT
  f.id AS fixture_id,
  f.name,
  l.latest_score,
  b.baseline_score,
  (l.latest_score - COALESCE(b.baseline_score, l.latest_score)) AS drift,
  l.ran_at AS last_run_at
FROM public.touchpoint_qa_fixtures f
LEFT JOIN latest l ON l.fixture_id = f.id
LEFT JOIN baseline b ON b.fixture_id = f.id;
