-- Marketplace C2C de Equipamentos Usados — Fase 1
-- Modelo "Fair Fees". Pagamentos via Pagar.me chegam na Fase 2.
-- HomeOfficeLife atua como vitrine: anúncio, descoberta, contato.

-- =====================================================
-- CATEGORIAS DE PRODUTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_categories read public" ON public.marketplace_categories;
CREATE POLICY "marketplace_categories read public"
  ON public.marketplace_categories FOR SELECT TO anon, authenticated
  USING (true);

INSERT INTO public.marketplace_categories (slug, name, position) VALUES
  ('monitores',   'Monitores',           1),
  ('cadeiras',    'Cadeiras',            2),
  ('mesas',       'Mesas',               3),
  ('teclados',    'Teclados',            4),
  ('mouses',      'Mouses',              5),
  ('audio',       'Áudio',               6),
  ('iluminacao',  'Iluminação',          7),
  ('webcams',     'Webcams e câmeras',   8),
  ('notebooks',   'Notebooks',           9),
  ('acessorios',  'Acessórios',         10)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- CONDIÇÕES DE CONSERVAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_conditions read public" ON public.marketplace_conditions;
CREATE POLICY "marketplace_conditions read public"
  ON public.marketplace_conditions FOR SELECT TO anon, authenticated
  USING (true);

INSERT INTO public.marketplace_conditions (slug, name, description, position) VALUES
  ('novo',        'Novo',        'Lacrado, nunca aberto.',                                       1),
  ('como-novo',   'Como Novo',   'Aberto/testado, sem marcas de uso, acompanha caixa.',          2),
  ('bom',         'Bom',         'Usado, funcional, com sinais leves de uso (riscos pequenos).', 3),
  ('aceitavel',   'Aceitável',   'Funcional, marcas de uso visíveis ou item descrito como tal.', 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ANÚNCIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 4 AND 100),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 4000),
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0 AND price < 1000000),

  category_id  UUID NOT NULL REFERENCES public.marketplace_categories(id)  ON DELETE RESTRICT,
  condition_id UUID NOT NULL REFERENCES public.marketplace_conditions(id)  ON DELETE RESTRICT,

  -- Galeria: URLs públicas do bucket marketplace_images.
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  city TEXT,
  state TEXT,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'sold')),

  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx    ON public.marketplace_listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx    ON public.marketplace_listings(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_listings_category_idx  ON public.marketplace_listings(category_id, status);
CREATE INDEX IF NOT EXISTS marketplace_listings_price_idx     ON public.marketplace_listings(price);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer um vê anúncios ativos; dono vê os próprios em qualquer status.
DROP POLICY IF EXISTS "marketplace_listings read active" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings read active"
  ON public.marketplace_listings FOR SELECT TO anon, authenticated
  USING (status = 'active' OR auth.uid() = seller_id);

-- Criação: usuário autenticado, listando-se como seller.
DROP POLICY IF EXISTS "marketplace_listings insert own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings insert own"
  ON public.marketplace_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Update: só dono.
DROP POLICY IF EXISTS "marketplace_listings update own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings update own"
  ON public.marketplace_listings FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Delete: só dono (ou admin via has_role já existente em outras políticas).
DROP POLICY IF EXISTS "marketplace_listings delete own" ON public.marketplace_listings;
CREATE POLICY "marketplace_listings delete own"
  ON public.marketplace_listings FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

-- Trigger updated_at (touch_updated_at criada em migrations anteriores).
DROP TRIGGER IF EXISTS marketplace_listings_touch ON public.marketplace_listings;
CREATE TRIGGER marketplace_listings_touch BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================
-- STORAGE: bucket marketplace_images
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace_images', 'marketplace_images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: dono pode subir em pasta = uid; leitura pública.
DROP POLICY IF EXISTS "marketplace_images public read" ON storage.objects;
CREATE POLICY "marketplace_images public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'marketplace_images');

DROP POLICY IF EXISTS "marketplace_images owner write" ON storage.objects;
CREATE POLICY "marketplace_images owner write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'marketplace_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "marketplace_images owner delete" ON storage.objects;
CREATE POLICY "marketplace_images owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'marketplace_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
