-- Logging de violações de Content-Security-Policy.
-- O servidor escuta /csp-report (POST JSON), parseia e grava aqui.
-- Útil pra: detectar XSS em curso, debugar policy antes de enforçar,
-- ver scripts/recursos não previstos sendo carregados.

CREATE TABLE IF NOT EXISTS public.csp_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_uri TEXT,
  violated_directive TEXT,
  blocked_uri TEXT,
  source_file TEXT,
  line_number INTEGER,
  user_agent TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS csp_violations_reported_idx
  ON public.csp_violations(reported_at DESC);
CREATE INDEX IF NOT EXISTS csp_violations_directive_idx
  ON public.csp_violations(violated_directive, reported_at DESC);

ALTER TABLE public.csp_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "csp_violations admin read" ON public.csp_violations;
CREATE POLICY "csp_violations admin read"
  ON public.csp_violations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
-- Inserts apenas via service_role (do servidor).
