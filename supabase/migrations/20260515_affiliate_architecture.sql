-- =============================================================
-- HomeOfficeLife — Arquitetura completa de afiliados nacionais
-- =============================================================
-- Cria affiliate_providers (catálogo de lojas/redes configuradas pelo
-- admin) + affiliate_products (produtos curados ligados a problemas
-- detectados pela IA) e estende affiliate_clicks com tracking detalhado.
--
-- Tudo configurável pelo admin: nenhum ID inventado. Se a config falta,
-- o produto aparece marcado como "afiliado pendente" e o link cai pra
-- busca da loja.

-- -------------------------------------------------------------
-- 1) affiliate_providers — catálogo de redes/lojas
-- -------------------------------------------------------------
CREATE TYPE public.affiliate_provider_status AS ENUM (
  'active', 'pending', 'paused', 'error'
);

CREATE TYPE public.affiliate_network_kind AS ENUM (
  'direct',          -- programa próprio da loja (Amazon Associados, ML)
  'awin',            -- Awin BR (Tok&Stok, Westwing, MadeiraMadeira, Leroy, Camicado)
  'lomadee',         -- Lomadee (Kabum, Pichau, Etna, Mobly)
  'admitad',
  'rakuten',
  'impact',
  'other'
);

CREATE TABLE public.affiliate_providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificação
  slug            TEXT NOT NULL UNIQUE,                 -- "amazon_br", "mercadolivre", "tokstok"
  name            TEXT NOT NULL,                        -- "Amazon BR", "Tok&Stok"
  network         public.affiliate_network_kind NOT NULL DEFAULT 'direct',
  status          public.affiliate_provider_status NOT NULL DEFAULT 'pending',

  -- IDs (preenchidos pelo admin após cadastro no programa)
  affiliate_id    TEXT,                                 -- tag/publisher/source id
  tracking_id     TEXT,                                 -- adicional (ML usa tracking_id, Amazon usa tag)
  subid_template  TEXT,                                 -- template de SubID, ex: "{diagnosis_id}-{problem_category}"

  -- Categorias permitidas / bloqueadas (text[])
  allowed_categories  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  blocked_categories  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  allowed_products    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  blocked_products    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- UTMs default (overridável por click)
  utm_source      TEXT DEFAULT 'deskly',
  utm_medium      TEXT DEFAULT 'affiliate',
  utm_campaign    TEXT,

  -- Deep link
  base_url            TEXT,                                 -- "https://www.amazon.com.br"
  deeplink_template   TEXT,                                 -- "{base_url}/s?k={query}&tag={affiliate_id}&utm_source={utm_source}"

  -- Métricas (atualizadas por triggers/jobs ou manualmente)
  commission_estimate NUMERIC(5,4) DEFAULT 0.03,            -- 0.04 = 4%
  fallback_search_url TEXT,                                 -- "https://www.amazon.com.br/s?k={query}&tag={affiliate_id}"
  last_test_at        TIMESTAMPTZ,
  last_test_status    TEXT,                                 -- "ok", "error_404", "error_redirect"
  notes               TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX affiliate_providers_status_idx ON public.affiliate_providers (status);
CREATE INDEX affiliate_providers_network_idx ON public.affiliate_providers (network);

ALTER TABLE public.affiliate_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers read public (active)" ON public.affiliate_providers
  FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "providers admin manage" ON public.affiliate_providers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------------------------
-- 2) affiliate_products — produtos curados que a IA pode recomendar
-- -------------------------------------------------------------
-- Diferente de setup_products (que são produtos amarrados a 1 setup).
-- Estes são GENÉRICOS — IA detectou "monitor baixo" → recomenda do
-- catálogo de affiliate_products que tem problem_category='ergonomia'.

CREATE TABLE public.affiliate_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  category            TEXT NOT NULL,                        -- "Suporte de notebook", "Monitor 24''"
  problem_category    TEXT NOT NULL,                        -- "ergonomia", "iluminacao", "cabos", etc

  provider_id         UUID NOT NULL REFERENCES public.affiliate_providers(id) ON DELETE RESTRICT,

  -- Link
  fallback_search_url TEXT NOT NULL,                        -- caso o deep link falhe
  product_url         TEXT,                                 -- URL direta do produto se houver
  image_url           TEXT,

  -- Preço (range pra absorver volatilidade)
  price_min           NUMERIC(10,2),
  price_max           NUMERIC(10,2),
  price_range         TEXT,                                 -- "R$ 80–150" (display friendly)

  status              public.affiliate_provider_status NOT NULL DEFAULT 'active',
  priority            INTEGER NOT NULL DEFAULT 50,          -- 0-100, maior = aparece primeiro
  reason              TEXT,                                 -- "Eleva monitor pra altura dos olhos"

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX affiliate_products_problem_idx ON public.affiliate_products (problem_category, status, priority DESC);
CREATE INDEX affiliate_products_provider_idx ON public.affiliate_products (provider_id);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "affiliate_products read public (active)" ON public.affiliate_products
  FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "affiliate_products admin manage" ON public.affiliate_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------------------------
-- 3) ALTER affiliate_clicks — adiciona campos de tracking detalhado
-- -------------------------------------------------------------
-- Mantém compat com inserts antigos via colunas opcionais.

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS diagnosis_id         UUID,
  ADD COLUMN IF NOT EXISTS provider_id          UUID REFERENCES public.affiliate_providers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS affiliate_product_id UUID REFERENCES public.affiliate_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS problem_category     TEXT,
  ADD COLUMN IF NOT EXISTS product_category     TEXT,
  ADD COLUMN IF NOT EXISTS source_page          TEXT,        -- "diagnosis", "wishlist", "gallery", "kit", "marketplace"
  ADD COLUMN IF NOT EXISTS subid                TEXT,
  ADD COLUMN IF NOT EXISTS final_url            TEXT,        -- URL gerada (com tags)
  ADD COLUMN IF NOT EXISTS session_id           TEXT,
  ADD COLUMN IF NOT EXISTS device               TEXT;        -- "mobile", "desktop", "tablet"

CREATE INDEX IF NOT EXISTS affiliate_clicks_diagnosis_idx ON public.affiliate_clicks (diagnosis_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_provider_idx ON public.affiliate_clicks (provider_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_source_idx ON public.affiliate_clicks (source_page);

-- -------------------------------------------------------------
-- 4) Seed inicial dos providers (status='pending' até admin configurar)
-- -------------------------------------------------------------
INSERT INTO public.affiliate_providers (slug, name, network, status, base_url, fallback_search_url, commission_estimate, utm_campaign) VALUES
  ('amazon_br',       'Amazon BR',       'direct',   'active',  'https://www.amazon.com.br',          'https://www.amazon.com.br/s?k={query}&tag={affiliate_id}',                           0.0400, 'deskly_amazon'),
  ('mercado_livre',   'Mercado Livre',   'direct',   'active',  'https://www.mercadolivre.com.br',    'https://lista.mercadolivre.com.br/{query-slug}',                                     0.0500, 'deskly_ml'),
  ('magalu',          'Magalu',          'direct',   'active',  'https://www.magazinevoce.com.br',    'https://www.magazinevoce.com.br/magazinedesklylife/busca/{query}/',                  0.0400, 'deskly_magalu'),
  ('shopee',          'Shopee',          'direct',   'pending', 'https://shopee.com.br',              'https://shopee.com.br/search?keyword={query}',                                       0.0800, 'deskly_shopee'),
  ('aliexpress',      'AliExpress',      'direct',   'pending', 'https://pt.aliexpress.com',          'https://pt.aliexpress.com/wholesale?SearchText={query}',                              0.0500, 'deskly_aliexpress'),
  ('americanas',      'Americanas',      'lomadee',  'pending', 'https://www.americanas.com.br',      'https://www.americanas.com.br/busca/{query}',                                        0.0400, 'deskly_americanas'),
  ('carrefour',       'Carrefour',       'awin',     'pending', 'https://www.carrefour.com.br',       'https://www.carrefour.com.br/busca/{query}',                                         0.0400, 'deskly_carrefour'),
  ('casas_bahia',     'Casas Bahia',     'awin',     'pending', 'https://www.casasbahia.com.br',      'https://www.casasbahia.com.br/{query}/b',                                            0.0400, 'deskly_casasbahia'),
  ('ponto',           'Ponto',           'awin',     'pending', 'https://www.pontofrio.com.br',       'https://www.pontofrio.com.br/{query}/b',                                             0.0400, 'deskly_ponto'),
  ('extra',           'Extra',           'awin',     'pending', 'https://www.extra.com.br',           'https://www.extra.com.br/{query}/b',                                                 0.0300, 'deskly_extra'),
  ('madeira_madeira', 'MadeiraMadeira',  'awin',     'pending', 'https://www.madeiramadeira.com.br',  'https://www.madeiramadeira.com.br/busca?strBusca={query}',                           0.0600, 'deskly_madeiramadeira'),
  ('mobly',           'Mobly',           'lomadee',  'pending', 'https://www.mobly.com.br',           'https://www.mobly.com.br/catalogsearch/result/?q={query}',                           0.0500, 'deskly_mobly'),
  ('tokstok',         'Tok&Stok',        'awin',     'pending', 'https://www.tokstok.com.br',         'https://www.tokstok.com.br/buscapagina?ft={query}',                                  0.0500, 'deskly_tokstok'),
  ('kalunga',         'Kalunga',         'lomadee',  'pending', 'https://www.kalunga.com.br',         'https://www.kalunga.com.br/busca/{query}',                                           0.0400, 'deskly_kalunga'),
  ('kabum',           'Kabum',           'lomadee',  'pending', 'https://www.kabum.com.br',           'https://www.kabum.com.br/busca/{query}',                                             0.0530, 'deskly_kabum'),
  ('terabyte',        'Terabyte Shop',   'lomadee',  'pending', 'https://www.terabyteshop.com.br',    'https://www.terabyteshop.com.br/busca?str={query}',                                  0.0400, 'deskly_terabyte'),
  ('pichau',          'Pichau',          'lomadee',  'pending', 'https://www.pichau.com.br',          'https://www.pichau.com.br/search?q={query}',                                         0.0630, 'deskly_pichau'),
  ('dell',            'Dell BR',         'direct',   'pending', 'https://www.dell.com',               'https://www.dell.com/pt-br/shop/scc/sc/laptops?appliedRefinements=14628',            0.0400, 'deskly_dell'),
  ('lenovo',          'Lenovo BR',       'direct',   'pending', 'https://www.lenovo.com/br',          'https://www.lenovo.com/br/pt/search?text={query}',                                   0.0400, 'deskly_lenovo'),
  ('acer',            'Acer BR',         'direct',   'pending', 'https://store.acer.com/pt-br',       'https://store.acer.com/pt-br/search?q={query}',                                      0.0400, 'deskly_acer'),
  ('samsung',         'Samsung BR',      'direct',   'pending', 'https://www.samsung.com/br',         'https://www.samsung.com/br/search/?searchvalue={query}',                             0.0400, 'deskly_samsung'),
  ('logitech',        'Logitech BR',     'direct',   'pending', 'https://www.logitech.com',           'https://www.logitech.com/pt-br/search.html?q={query}',                               0.0500, 'deskly_logitech'),
  ('etna',            'Etna',            'lomadee',  'pending', 'https://www.etna.com.br',            'https://www.etna.com.br/{query}?searchterm={query}',                                 0.0500, 'deskly_etna'),
  ('camicado',        'Camicado',        'awin',     'pending', 'https://www.camicado.com.br',        'https://www.camicado.com.br/busca?ft={query}',                                       0.0500, 'deskly_camicado'),
  ('westwing',        'Westwing',        'awin',     'pending', 'https://www.westwing.com.br',        'https://www.westwing.com.br/?q={query}',                                             0.0700, 'deskly_westwing'),
  ('leroy_merlin',    'Leroy Merlin',    'awin',     'pending', 'https://www.leroymerlin.com.br',     'https://www.leroymerlin.com.br/busca?term={query}',                                  0.0400, 'deskly_leroy'),
  ('multilaser',      'Multilaser',      'direct',   'pending', 'https://www.multilaser.com.br',      'https://www.multilaser.com.br/busca/?searchterm={query}',                            0.0500, 'deskly_multilaser'),
  ('intelbras',       'Intelbras',       'direct',   'pending', 'https://loja.intelbras.com.br',      'https://loja.intelbras.com.br/buscapagina?ft={query}',                               0.0500, 'deskly_intelbras')
ON CONFLICT (slug) DO NOTHING;

-- Ativa os 3 que já têm programa
UPDATE public.affiliate_providers SET affiliate_id = 'deskly02-20', status = 'active' WHERE slug = 'amazon_br';
UPDATE public.affiliate_providers SET affiliate_id = 'belloliandriw', tracking_id = 'belloliandriw', status = 'active' WHERE slug = 'mercado_livre';
UPDATE public.affiliate_providers SET affiliate_id = 'magazinedesklylife', status = 'active' WHERE slug = 'magalu';

-- updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS providers_set_updated ON public.affiliate_providers;
CREATE TRIGGER providers_set_updated BEFORE UPDATE ON public.affiliate_providers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS affiliate_products_set_updated ON public.affiliate_products;
CREATE TRIGGER affiliate_products_set_updated BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
