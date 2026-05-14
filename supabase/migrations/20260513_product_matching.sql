-- Product Matching layer
-- Anexa produtos reais (com hyperlinks) aos touchpoints recomendados.
--
-- DECISÃO DE DESIGN: reaproveita `partners` (criada em
-- 20260513_homeoffice_analyses.sql) ao invés de criar `partner_stores`
-- separada. Adiciona só `priority` + `active`.
--
-- Tabelas novas:
--   - recommended_products  catálogo curado de produtos
--   - product_clicks        registro de clique antes do redirect
--   - product_impressions   (opcional) quem viu qual produto
--
-- Regra de ouro: IA nunca cria URL. Tudo vem desta tabela.
-- Coluna `affiliate_url` é prioritária sobre `product_url` no resolver.

-- Estende partners com priority + active
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS commission_estimate TEXT;

CREATE INDEX IF NOT EXISTS partners_active_priority_idx
  ON public.partners(active, priority DESC) WHERE active = TRUE;

-- =========================================================================
-- recommended_products
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.recommended_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chave do touchpoint (normalizada via normalizeTouchpointKey no client)
  -- Ex: "luminaria", "cortina", "planta", "estante", "organizador_cabos"
  touchpoint_key TEXT NOT NULL,
  -- Perfil opcional ("geral" = match universal). Match em cascata:
  -- 1) (touchpoint_key, profile_type) 2) (touchpoint_key, 'geral') 3) commercial_category
  profile_type public.profile_type NOT NULL DEFAULT 'geral',

  -- Produto
  product_name TEXT NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
  partner_name TEXT NOT NULL,         -- desnormalizado pra performance/historico
  -- URLs (pelo menos uma das duas obrigatória — checked via trigger)
  product_url TEXT,
  affiliate_url TEXT,
  -- FIXME(afiliado): preencher affiliate_url quando o programa for habilitado.
  --                  Por ora deixar NULL e o resolver cai pro product_url.

  image_url TEXT,
  price NUMERIC(10,2),
  price_range TEXT,                   -- ex: "R$ 80 a R$ 250"
  category TEXT,                      -- categoria descritiva ("iluminacao")
  commercial_category TEXT,           -- categoria comercial pra match fallback
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT product_has_url CHECK (
    product_url IS NOT NULL OR affiliate_url IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS rp_match_idx
  ON public.recommended_products(touchpoint_key, profile_type, active, priority DESC)
  WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS rp_commcat_idx
  ON public.recommended_products(commercial_category, active, priority DESC)
  WHERE active = TRUE;

ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rp_public_read" ON public.recommended_products
  FOR SELECT TO anon, authenticated USING (active = TRUE);

CREATE POLICY "rp_admin_write" ON public.recommended_products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS rp_touch_updated_at ON public.recommended_products;
CREATE TRIGGER rp_touch_updated_at BEFORE UPDATE ON public.recommended_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================================
-- product_clicks
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.product_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  touchpoint_id UUID REFERENCES public.touchpoints(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.recommended_products(id) ON DELETE RESTRICT,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  partner_name TEXT,
  destination_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'analysis_result',
  -- IP/UA capturados pela edge function pra fraude (não expõe pro client)
  ua TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pc_user_idx ON public.product_clicks(user_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS pc_product_idx ON public.product_clicks(product_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS pc_analysis_idx ON public.product_clicks(analysis_id, clicked_at DESC);

ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

-- Owner sees only own. Admin sees all.
CREATE POLICY "pc_owner_select" ON public.product_clicks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Insert é só via service_role na edge function. Não tem policy de insert
-- pra authenticated — usuário não escreve direto.

-- =========================================================================
-- product_impressions (opcional, ligar quando precisar de CTR real)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.product_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  touchpoint_id UUID REFERENCES public.touchpoints(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.recommended_products(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  partner_name TEXT,
  source TEXT NOT NULL DEFAULT 'analysis_result',
  shown_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pi_product_idx ON public.product_impressions(product_id, shown_at DESC);

ALTER TABLE public.product_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pi_admin_read" ON public.product_impressions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- SEEDS — 30 produtos (3 por touchpoint × 10 categorias)
-- =========================================================================
-- IMPORTANTE: product_url são placeholders seguros (URL de busca no parceiro,
-- não link direto a produto inexistente). Quando os afiliados estiverem
-- cadastrados, atualizar affiliate_url com tracking ID. FIXME(afiliado).

DO $$
DECLARE
  p_amazon UUID := (SELECT id FROM public.partners WHERE slug = 'amazon_br');
  p_ml     UUID := (SELECT id FROM public.partners WHERE slug = 'mercado_livre');
  p_magalu UUID := (SELECT id FROM public.partners WHERE slug = 'magalu');
  p_kalunga UUID := (SELECT id FROM public.partners WHERE slug = 'kalunga');
  p_tokstok UUID := (SELECT id FROM public.partners WHERE slug = 'tokstok');
  p_madeira UUID := (SELECT id FROM public.partners WHERE slug = 'madeira_madeira');
  p_mobly UUID := (SELECT id FROM public.partners WHERE slug = 'mobly');
  p_leroy UUID := (SELECT id FROM public.partners WHERE slug = 'leroy_merlin');
  p_cobasi UUID := (SELECT id FROM public.partners WHERE slug = 'cobasi');
  p_petz UUID := (SELECT id FROM public.partners WHERE slug = 'petz');
  p_shopee UUID := (SELECT id FROM public.partners WHERE slug = 'shopee');
BEGIN
  -- LUMINÁRIA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('luminaria','geral','Luminária articulada LED para home office', p_amazon, 'Amazon',  'https://www.amazon.com.br/s?k=luminaria+articulada+led+mesa', 'R$ 90 a R$ 250', 'iluminacao', ARRAY['led','articulada'], 10),
    ('luminaria','geral','Luminária de mesa com luz neutra 5000K',    p_tokstok,'Tok&Stok','https://www.tokstok.com.br/search?q=luminaria+de+mesa+led', 'R$ 200 a R$ 500', 'iluminacao', ARRAY['neutra','design'], 8),
    ('luminaria','criador','Ring light de mesa para videochamadas',    p_amazon, 'Amazon',  'https://www.amazon.com.br/s?k=ring+light+mesa+18+polegadas', 'R$ 130 a R$ 350', 'iluminacao', ARRAY['ringlight','video'], 9)
  ON CONFLICT DO NOTHING;

  -- CORTINA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('cortina','geral','Cortina blackout leve para escritório',  p_leroy, 'Leroy Merlin','https://www.leroymerlin.com.br/busca?term=cortina+blackout', 'R$ 150 a R$ 500', 'cortina_blackout', ARRAY['blackout','escritorio'], 10),
    ('cortina','geral','Cortina translúcida controle de luz',     p_tokstok,'Tok&Stok',   'https://www.tokstok.com.br/search?q=cortina+translucida', 'R$ 180 a R$ 600', 'cortina_rolo', ARRAY['translucida'], 8),
    ('cortina','geral','Persiana rolô para home office',          p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=persiana+rolo', 'R$ 120 a R$ 400', 'persiana', ARRAY['rolo','ajustavel'], 7)
  ON CONFLICT DO NOTHING;

  -- PLANTA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('planta','psicologo','Planta natural baixa manutenção (jiboia/zamioculca)', p_cobasi, 'Cobasi','https://www.cobasi.com.br/busca?q=jiboia+vaso', 'R$ 40 a R$ 150', 'planta_decorativa_interior', ARRAY['jiboia','baixa-manutencao'], 10),
    ('planta','geral','Planta artificial média para escritório',                  p_tokstok,'Tok&Stok','https://www.tokstok.com.br/search?q=planta+artificial', 'R$ 80 a R$ 250', 'planta_artificial', ARRAY['artificial','sem-manutencao'], 7),
    ('planta','geral','Vaso decorativo para mesa ou estante',                     p_petz,   'Petz','https://www.petz.com.br/busca?q=vaso+planta+decoracao', 'R$ 30 a R$ 120', 'vaso_decorativo', ARRAY['vaso'], 6)
  ON CONFLICT DO NOTHING;

  -- ESTANTE
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('estante','advogado','Estante baixa para fundo de videochamada',      p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=estante+livros', 'R$ 400 a R$ 1500', 'estante_livros', ARRAY['fundo-video'], 10),
    ('estante','geral','Estante modular para escritório',                   p_tokstok,'Tok&Stok','https://www.tokstok.com.br/search?q=estante+modular', 'R$ 600 a R$ 2500', 'estante_modular', ARRAY['modular','design'], 8),
    ('estante','geral','Prateleira decorativa para home office',            p_mobly,  'Mobly','https://www.mobly.com.br/catalogsearch/result/?q=prateleira+decorativa', 'R$ 150 a R$ 500', 'prateleira', ARRAY['parede'], 6)
  ON CONFLICT DO NOTHING;

  -- PAPEL DE PAREDE
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('papel_de_parede','geral','Papel de parede neutro para escritório', p_leroy, 'Leroy Merlin','https://www.leroymerlin.com.br/busca?term=papel+de+parede+neutro', 'R$ 80 a R$ 300', 'papel_de_parede_adesivo', ARRAY['neutro'], 9),
    ('papel_de_parede','criador','Adesivo de parede minimalista',         p_amazon,'Amazon','https://www.amazon.com.br/s?k=adesivo+parede+minimalista', 'R$ 50 a R$ 200', 'adesivo_parede', ARRAY['minimalista','adesivo'], 7),
    ('papel_de_parede','geral','Revestimento decorativo discreto',        p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=revestimento+parede', 'R$ 100 a R$ 400', 'revestimento', ARRAY['discreto'], 5)
  ON CONFLICT DO NOTHING;

  -- ORGANIZADOR DE CABOS
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('organizador_cabos','geral','Kit organizador de cabos (calha + velcro)', p_amazon, 'Amazon','https://www.amazon.com.br/s?k=kit+organizador+cabos+mesa', 'R$ 50 a R$ 150', 'organizador_cabos_calha', ARRAY['kit','calha'], 10),
    ('organizador_cabos','geral','Canaleta adesiva para fios',                 p_kalunga,'Kalunga','https://www.kalunga.com.br/busca/canaleta+cabos', 'R$ 30 a R$ 100', 'canaleta', ARRAY['adesiva'], 7),
    ('organizador_cabos','geral','Caixa organizadora de cabos com filtro',     p_shopee, 'Shopee','https://shopee.com.br/search?keyword=caixa+organizadora+cabos', 'R$ 40 a R$ 130', 'caixa_cabos', ARRAY['caixa','filtro'], 6)
  ON CONFLICT DO NOTHING;

  -- SUPORTE NOTEBOOK
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('suporte_notebook','dev','Suporte ergonômico altura ajustável',  p_amazon, 'Amazon','https://www.amazon.com.br/s?k=suporte+notebook+aluminio+ajustavel', 'R$ 120 a R$ 350', 'suporte_notebook_aluminio', ARRAY['aluminio','ajustavel'], 10),
    ('suporte_notebook','geral','Suporte dobrável de alumínio',        p_kalunga,'Kalunga','https://www.kalunga.com.br/busca/suporte+notebook+dobravel', 'R$ 80 a R$ 200', 'suporte_dobravel', ARRAY['dobravel','portatil'], 7),
    ('suporte_notebook','geral','Base elevada para notebook',          p_ml,     'Mercado Livre','https://lista.mercadolivre.com.br/base-elevada-notebook', 'R$ 50 a R$ 150', 'base_elevada', ARRAY['simples'], 5)
  ON CONFLICT DO NOTHING;

  -- MONITOR
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('monitor','geral','Monitor Full HD 24" para home office',      p_amazon, 'Amazon','https://www.amazon.com.br/s?k=monitor+24+full+hd+ips', 'R$ 700 a R$ 1300', 'monitor_externo', ARRAY['fullhd','ips'], 9),
    ('monitor','dev','Monitor ultrawide 34" para produtividade',   p_kalunga,'Kalunga','https://www.kalunga.com.br/busca/monitor+ultrawide+34', 'R$ 2200 a R$ 4000', 'monitor_ultrawide', ARRAY['ultrawide','dev'], 10),
    ('monitor','designer','Monitor 27" 4K IPS calibrado sRGB',      p_magalu, 'Magalu','https://www.magazineluiza.com.br/busca/monitor+27+4k+ips/', 'R$ 2500 a R$ 5000', 'monitor_4k', ARRAY['4k','calibrado'], 10)
  ON CONFLICT DO NOTHING;

  -- TAPETE
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('tapete','geral','Tapete neutro para escritório 2x3m',        p_tokstok,'Tok&Stok','https://www.tokstok.com.br/search?q=tapete+escritorio', 'R$ 400 a R$ 1500', 'tapete_grande', ARRAY['neutro','2x3'], 9),
    ('tapete','psicologo','Tapete acústico decorativo macio',       p_mobly,  'Mobly','https://www.mobly.com.br/catalogsearch/result/?q=tapete+macio', 'R$ 300 a R$ 1000', 'tapete_acustico', ARRAY['acustico','macio'], 8),
    ('tapete','geral','Tapete fibra natural conforto visual',       p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=tapete+fibra+natural', 'R$ 250 a R$ 800', 'tapete_fibra', ARRAY['fibra-natural'], 6)
  ON CONFLICT DO NOTHING;

  -- WEBCAM_MICROFONE
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('webcam_microfone','geral','Webcam Full HD 1080p',                          p_amazon, 'Amazon','https://www.amazon.com.br/s?k=webcam+full+hd+1080p+autofoco', 'R$ 250 a R$ 700', 'webcam_full_hd', ARRAY['1080p','autofoco'], 10),
    ('webcam_microfone','professor','Microfone USB direcional condensador',      p_kalunga,'Kalunga','https://www.kalunga.com.br/busca/microfone+usb+condensador', 'R$ 300 a R$ 900', 'microfone_usb_condensador', ARRAY['usb','condensador'], 10),
    ('webcam_microfone','geral','Kit iluminação + webcam para chamadas',         p_amazon, 'Amazon','https://www.amazon.com.br/s?k=kit+webcam+iluminacao+ring+light', 'R$ 400 a R$ 1200', 'kit_video_chamada', ARRAY['kit','iluminacao'], 8)
  ON CONFLICT DO NOTHING;
END $$;
