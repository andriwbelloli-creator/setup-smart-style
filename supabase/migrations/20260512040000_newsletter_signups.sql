-- Captura de emails pra newsletter / lead gen.
-- Sem opt-in granular de marketing porque LGPD permite contato
-- relacionado ao produto se o usuário deu o email voluntariamente
-- pra "ficar por dentro de novos setups e dicas".

CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'unknown',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer TEXT,
  user_agent TEXT,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_signups_email_idx ON public.newsletter_signups(email);
CREATE INDEX IF NOT EXISTS newsletter_signups_active_idx ON public.newsletter_signups(created_at DESC) WHERE unsubscribed_at IS NULL;
CREATE INDEX IF NOT EXISTS newsletter_signups_source_idx ON public.newsletter_signups(source, created_at DESC);

ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Qualquer um (anon ou auth) pode inserir email (formulário público)
DROP POLICY IF EXISTS "newsletter_signups insert anyone" ON public.newsletter_signups;
CREATE POLICY "newsletter_signups insert anyone"
  ON public.newsletter_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas admin lê (privacidade)
DROP POLICY IF EXISTS "newsletter_signups admin read" ON public.newsletter_signups;
CREATE POLICY "newsletter_signups admin read"
  ON public.newsletter_signups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
