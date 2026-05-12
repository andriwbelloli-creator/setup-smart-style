-- Audit log de ações administrativas.
-- Por que: como admin (você) pode deletar setups de qualquer
-- usuário, precisamos provar (LGPD art. 37 / accountability)
-- que a ação foi legítima caso seja contestada.
--
-- Cada ação destrutiva ou de moderação registra:
--   - admin user_id (quem agiu)
--   - action type
--   - target table + id (o que foi afetado)
--   - reason (opcional, texto livre)
--   - timestamp
--
-- Logs imutáveis: nem admin pode UPDATE/DELETE rows desta tabela.

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                      -- 'delete_setup', 'ban_user', 'unpublish_setup', etc.
  target_table TEXT NOT NULL,
  target_id TEXT,
  target_snapshot JSONB,                     -- snapshot do row antes do delete pra auditoria
  reason TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_actions_admin_idx ON public.admin_actions(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_created_idx ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON public.admin_actions(target_table, target_id);

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Apenas admins inserem (via own actions) e leem
DROP POLICY IF EXISTS "admin_actions insert own admin" ON public.admin_actions;
CREATE POLICY "admin_actions insert own admin"
  ON public.admin_actions FOR INSERT TO authenticated
  WITH CHECK (
    admin_user_id = auth.uid()
    AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "admin_actions read admin" ON public.admin_actions;
CREATE POLICY "admin_actions read admin"
  ON public.admin_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Sem UPDATE / DELETE: logs imutáveis. Mesmo admin não pode
-- adulterar. Service role pode (pra retenção/arquivamento eventual).
