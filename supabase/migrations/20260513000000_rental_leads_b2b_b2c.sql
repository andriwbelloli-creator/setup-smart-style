-- Módulo de Locação Fase 1: lead gen B2B + B2C.
-- Deskly atua como vitrine, roteia interesse pro parceiro adequado.
-- Comissão por conversão fechada via tabela rental_partners.

-- =====================================================
-- PARCEIROS DE LOCAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rental_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  -- Quais tipos de lead o parceiro aceita: B2B, B2C ou ambos
  accepted_types TEXT[] NOT NULL DEFAULT ARRAY['B2B', 'B2C'],
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rental_partners read public active" ON public.rental_partners;
CREATE POLICY "rental_partners read public active"
  ON public.rental_partners FOR SELECT TO anon, authenticated
  USING (active);

-- =====================================================
-- LEADS DE LOCAÇÃO (B2B + B2C unificada)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rental_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID REFERENCES public.setups(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.rental_partners(id) ON DELETE SET NULL,

  lead_type TEXT NOT NULL CHECK (lead_type IN ('B2B', 'B2C')),

  -- Dados B2C (PF)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  cpf TEXT,

  -- Dados B2B (PJ)
  company_name TEXT,
  cnpj TEXT,
  employee_count INTEGER,

  -- Pedido
  estimated_budget NUMERIC(10, 2),
  rental_duration_months INTEGER NOT NULL DEFAULT 12,
  notes TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'converted', 'lost')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rental_leads_user_idx ON public.rental_leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS rental_leads_status_idx ON public.rental_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS rental_leads_type_idx ON public.rental_leads(lead_type, created_at DESC);

ALTER TABLE public.rental_leads ENABLE ROW LEVEL SECURITY;

-- Anônimo OU usuário pode criar lead. user_id pode ser NULL (visitante).
DROP POLICY IF EXISTS "rental_leads insert" ON public.rental_leads;
CREATE POLICY "rental_leads insert"
  ON public.rental_leads FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- User vê os próprios leads
DROP POLICY IF EXISTS "rental_leads read own" ON public.rental_leads;
CREATE POLICY "rental_leads read own"
  ON public.rental_leads FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin lê tudo
DROP POLICY IF EXISTS "rental_leads admin read" ON public.rental_leads;
CREATE POLICY "rental_leads admin read"
  ON public.rental_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin atualiza status (pending → contacted → converted/lost)
DROP POLICY IF EXISTS "rental_leads admin update" ON public.rental_leads;
CREATE POLICY "rental_leads admin update"
  ON public.rental_leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
DROP TRIGGER IF EXISTS rental_leads_touch ON public.rental_leads;
CREATE TRIGGER rental_leads_touch BEFORE UPDATE ON public.rental_leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================
-- SEED: 3 parceiros iniciais
-- =====================================================
INSERT INTO public.rental_partners (name, email, website, accepted_types) VALUES
  ('Tuim', 'parcerias@tuim.com.br', 'https://www.tuim.com.br', ARRAY['B2B', 'B2C']),
  ('TecMobile', 'contato@tecmobile.com.br', 'https://www.tecmobile.com.br', ARRAY['B2B']),
  ('Allugator', 'parcerias@allugator.com', 'https://www.allugator.com', ARRAY['B2C'])
ON CONFLICT DO NOTHING;
