-- ============================================================
-- Onda 2 — Schema de IA + seed de affiliate_products
-- Projeto: HomeOfficeLife (setup-smart-style)
-- Aplicar via: SQL Editor do Supabase (idempotente — safe to re-run)
-- ============================================================

-- -------------------------------------------------------
-- 1) ai_styles — catálogo de estilos que a IA gera
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_styles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  prompt_template TEXT NOT NULL DEFAULT '',       -- template com {elementos}, {orcamento}
  palette         JSONB NOT NULL DEFAULT '[]',    -- ["#0E3D3F","#F36458",...]
  budget_min      INTEGER NOT NULL DEFAULT 0,     -- R$ mínimo do estilo
  budget_max      INTEGER NOT NULL DEFAULT 99999, -- R$ máximo (99999 = sem teto)
  trending        BOOLEAN NOT NULL DEFAULT FALSE,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 50,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_styles_active_idx ON public.ai_styles (active, sort_order);

ALTER TABLE public.ai_styles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_styles public read" ON public.ai_styles;
CREATE POLICY "ai_styles public read" ON public.ai_styles
  FOR SELECT USING (active = TRUE OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "ai_styles admin manage" ON public.ai_styles;
CREATE POLICY "ai_styles admin manage" ON public.ai_styles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS ai_styles_set_updated ON public.ai_styles;
CREATE TRIGGER ai_styles_set_updated
  BEFORE UPDATE ON public.ai_styles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- 2) ai_generations — registro de cada imagem gerada
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  analysis_id     UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  style_slug      TEXT REFERENCES public.ai_styles(slug) ON DELETE SET NULL,
  image_url       TEXT,                           -- URL da imagem gerada (nulo até ficar pronta)
  source_url      TEXT,                           -- URL da foto original do usuário
  prompt          TEXT NOT NULL DEFAULT '',
  model           TEXT NOT NULL DEFAULT 'flux-schnell', -- 'gpt-image-1' | 'flux-schnell'
  cost_cents      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','done','failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_generations_user_idx   ON public.ai_generations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_generations_status_idx ON public.ai_generations (status);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_generations owner read" ON public.ai_generations;
CREATE POLICY "ai_generations owner read" ON public.ai_generations
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "ai_generations owner insert" ON public.ai_generations;
CREATE POLICY "ai_generations owner insert" ON public.ai_generations
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "ai_generations admin manage" ON public.ai_generations;
CREATE POLICY "ai_generations admin manage" ON public.ai_generations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS ai_generations_set_updated ON public.ai_generations;
CREATE TRIGGER ai_generations_set_updated
  BEFORE UPDATE ON public.ai_generations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- 3) ai_diagnostics — resultado estruturado do diagnóstico
--    (complementa public.analyses, que guarda os sub-scores brutos)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_diagnostics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
  ambiente_valido BOOLEAN NOT NULL DEFAULT TRUE,  -- FALSE = foto rejeitada (objeto isolado)
  tipo            TEXT,                           -- 'home_office' | 'setup' | 'escritorio' | 'canto'
  scores          JSONB NOT NULL DEFAULT '{}',    -- {ergonomia:7,iluminacao:8,...}
  raw_response    JSONB,                          -- resposta completa do modelo
  model           TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_diagnostics_analysis_idx ON public.ai_diagnostics (analysis_id);

ALTER TABLE public.ai_diagnostics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_diagnostics owner read" ON public.ai_diagnostics;
CREATE POLICY "ai_diagnostics owner read" ON public.ai_diagnostics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analyses a
      WHERE a.id = analysis_id AND a.user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "ai_diagnostics admin manage" ON public.ai_diagnostics;
CREATE POLICY "ai_diagnostics admin manage" ON public.ai_diagnostics
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------------------
-- 4) Seed — ai_styles (16 estilos do carrossel)
-- -------------------------------------------------------
INSERT INTO public.ai_styles (slug, name, budget_min, budget_max, trending, sort_order, palette)
VALUES
  ('home-office-moderno',     'Home office moderno',      3000,  5000,  TRUE,  1,  '["#2A8E8E","#F36458","#B5854A","#FBF8F1"]'),
  ('home-office-pequeno',     'Home office pequeno',       0,    1500,  TRUE,  2,  '["#0E3D3F","#6FB8B5","#FBF8F1","#F9A89A"]'),
  ('escritorio-executivo',    'Escritório executivo',     8000, 99999, FALSE, 3,  '["#0E3D3F","#155659","#B5854A","#FBF8F1"]'),
  ('consultorio-online',      'Consultório online',       1500,  5000, FALSE, 4,  '["#2A8E8E","#6FB8B5","#FBF8F1","#D9B58A"]'),
  ('home-office-economico',   'Home office econômico',     0,     700,  TRUE,  5,  '["#6FB8B5","#FBF8F1","#D9B58A","#F9A89A"]'),
  ('criador-de-conteudo',     'Criador de conteúdo',      1500,  5000, FALSE, 6,  '["#F36458","#0E3D3F","#B5854A","#FBF8F1"]'),
  ('gamer-clean',             'Gamer clean',              1500,  5000, FALSE, 7,  '["#0E3D3F","#2A8E8E","#F36458","#0F1F22"]'),
  ('escandinavo',             'Estilo escandinavo',       1500,  5000, FALSE, 8,  '["#FBF8F1","#D9B58A","#6FB8B5","#0E3D3F"]'),
  ('escritorio-juridico',     'Escritório jurídico',      5000,  8000, FALSE, 9,  '["#0E3D3F","#155659","#0F1F22","#B5854A"]'),
  ('professor-online',        'Professor online',          0,    3000, FALSE, 10, '["#2A8E8E","#6FB8B5","#F9A89A","#FBF8F1"]'),
  ('industrial',              'Estilo industrial',        5000, 99999, FALSE, 11, '["#0F1F22","#B5854A","#54676B","#FBF8F1"]'),
  ('minimalista',             'Home office minimalista',   0,    1500, FALSE, 12, '["#FBF8F1","#F7F4EC","#6FB8B5","#0E3D3F"]'),
  ('sem-comprar-nada',        'Sem comprar nada',          0,       0,  TRUE,  13, '["#FBF8F1","#6FB8B5","#D9B58A","#F9A89A"]'),
  ('home-office-quarto',      'Home office no quarto',    300,   1500, FALSE, 14, '["#FBF8F1","#D9B58A","#6FB8B5","#F9A89A"]'),
  ('home-office-sala',        'Home office na sala',      1500,  3000,  TRUE,  15, '["#FBF8F1","#B5854A","#2A8E8E","#F36458"]'),
  ('home-office-ergonomico',  'Home office ergonômico',    800,  2000,  TRUE,  16, '["#2A8E8E","#6FB8B5","#FBF8F1","#D9B58A"]')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------
-- 5) Seed — affiliate_products (30 produtos curados)
--    Usa subquery pra não depender de UUID fixo
-- -------------------------------------------------------
DO $$
DECLARE
  v_amazon   UUID;
  v_ml       UUID;
  v_magalu   UUID;
BEGIN

  SELECT id INTO v_amazon   FROM public.affiliate_providers WHERE slug = 'amazon_br'     LIMIT 1;
  SELECT id INTO v_ml       FROM public.affiliate_providers WHERE slug = 'mercado_livre'  LIMIT 1;
  SELECT id INTO v_magalu   FROM public.affiliate_providers WHERE slug = 'magalu'         LIMIT 1;

  -- Garante que os providers existem
  IF v_amazon IS NULL OR v_ml IS NULL OR v_magalu IS NULL THEN
    RAISE NOTICE 'Providers não encontrados — rode 20260515_affiliate_architecture.sql primeiro';
    RETURN;
  END IF;

  -- ---- ERGONOMIA ----
  INSERT INTO public.affiliate_products (name, category, problem_category, provider_id, fallback_search_url, price_min, price_max, price_range, priority, reason)
  VALUES
    ('Suporte de notebook articulado',
     'Suporte', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=suporte+notebook+articulado&tag=deskly02-20',
     80, 180, 'R$ 80–180', 90,
     'Eleva o notebook à altura dos olhos, aliviando cervical'),

    ('Suporte de monitor ajustável (braço)',
     'Suporte', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=braco+suporte+monitor+ajustavel&tag=deskly02-20',
     120, 350, 'R$ 120–350', 88,
     'Libera espaço na mesa e coloca o monitor na altura certa'),

    ('Cadeira ergonômica com apoio lombar',
     'Cadeira', 'ergonomia', v_ml,
     'https://lista.mercadolivre.com.br/cadeira-ergonomica-apoio-lombar',
     350, 1200, 'R$ 350–1.200', 95,
     'Suporte lombar reduz dores nas costas em jornadas longas'),

    ('Apoio lombar para cadeira',
     'Acessório', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=apoio+lombar+cadeira+home+office&tag=deskly02-20',
     40, 120, 'R$ 40–120', 75,
     'Solução econômica para corrigir postura sem trocar a cadeira'),

    ('Teclado ergonômico compacto',
     'Teclado', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=teclado+ergonomico+compacto&tag=deskly02-20',
     120, 400, 'R$ 120–400', 72,
     'Layout compacto mantém o mouse mais perto, reduzindo tensão no ombro'),

    ('Mouse vertical ergonômico',
     'Mouse', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=mouse+vertical+ergonomico&tag=deskly02-20',
     60, 200, 'R$ 60–200', 80,
     'Posição natural do pulso elimina tensão no antebraço'),

    ('Apoio de pulso para teclado',
     'Acessório', 'ergonomia', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/apoio+pulso+teclado/',
     25, 80, 'R$ 25–80', 65,
     'Reduz esforço repetitivo durante longas sessões de digitação'),

  -- ---- ILUMINAÇÃO ----
    ('Ring light LED 10" com suporte',
     'Iluminação', 'iluminacao', v_amazon,
     'https://www.amazon.com.br/s?k=ring+light+10+polegadas+suporte&tag=deskly02-20',
     80, 250, 'R$ 80–250', 85,
     'Iluminação frontal uniforme para videochamadas e criação de conteúdo'),

    ('Luminária de mesa LED com temperatura ajustável',
     'Iluminação', 'iluminacao', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/luminaria+mesa+led+temperatura/',
     60, 200, 'R$ 60–200', 82,
     'Luz quente/fria reduz fadiga ocular no trabalho noturno'),

    ('Painel LED para videoconferência',
     'Iluminação', 'iluminacao', v_amazon,
     'https://www.amazon.com.br/s?k=painel+led+videoconferencia+home+office&tag=deskly02-20',
     120, 350, 'R$ 120–350', 78,
     'Luz difusa bidirecional elimina sombras no rosto'),

    ('Fita LED para monitor (bias lighting)',
     'Iluminação', 'iluminacao', v_amazon,
     'https://www.amazon.com.br/s?k=fita+led+monitor+bias+lighting&tag=deskly02-20',
     30, 90, 'R$ 30–90', 60,
     'Reduz o contraste entre tela e ambiente, aliviando a vista'),

  -- ---- ORGANIZAÇÃO / CABOS ----
    ('Organizador de cabos com passa-cabos de mesa',
     'Organização', 'cabos', v_amazon,
     'https://www.amazon.com.br/s?k=organizador+cabos+mesa+home+office&tag=deskly02-20',
     25, 80, 'R$ 25–80', 85,
     'Elimina o "macarrão" de cabos em menos de 15 minutos'),

    ('Rack de cabos sob a mesa',
     'Organização', 'cabos', v_ml,
     'https://lista.mercadolivre.com.br/rack-cabos-embaixo-mesa',
     40, 120, 'R$ 40–120', 82,
     'Esconde extensões e cabos deixando o setup limpo'),

    ('Velcro para cabos (rolo 10m)',
     'Organização', 'cabos', v_amazon,
     'https://www.amazon.com.br/s?k=velcro+organizador+cabos+rolo&tag=deskly02-20',
     15, 40, 'R$ 15–40', 70,
     'Agrupa e identifica cabos sem gastar quase nada'),

    ('Organizador de mesa multifuncional',
     'Organização', 'organizacao', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/organizador+mesa+escritorio/',
     35, 120, 'R$ 35–120', 75,
     'Canetas, post-its e acessórios sempre no lugar certo'),

    ('Suporte para headset de mesa',
     'Suporte', 'organizacao', v_amazon,
     'https://www.amazon.com.br/s?k=suporte+headset+mesa&tag=deskly02-20',
     30, 90, 'R$ 30–90', 65,
     'Mantém o headset acessível sem ocupar espaço na bancada'),

  -- ---- MONITOR / TELA ----
    ('Monitor 24" Full HD IPS',
     'Monitor', 'produtividade', v_amazon,
     'https://www.amazon.com.br/s?k=monitor+24+polegadas+full+hd+ips&tag=deskly02-20',
     700, 1400, 'R$ 700–1.400', 90,
     'Segunda tela aumenta produtividade em até 40% no trabalho remoto'),

    ('Monitor 27" QHD IPS',
     'Monitor', 'produtividade', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/monitor+27+qhd/',
     1200, 2500, 'R$ 1.200–2.500', 85,
     'Resolução maior reduz a necessidade de zoom constante'),

  -- ---- PERIFÉRICOS ----
    ('Webcam Full HD 1080p com microfone',
     'Webcam', 'videochamadas', v_amazon,
     'https://www.amazon.com.br/s?k=webcam+full+hd+1080p+microfone&tag=deskly02-20',
     120, 400, 'R$ 120–400', 88,
     'Imagem nítida em videochamadas transmite mais profissionalismo'),

    ('Headset com cancelamento de ruído',
     'Headset', 'videochamadas', v_ml,
     'https://lista.mercadolivre.com.br/headset-cancelamento-ruido-home-office',
     80, 350, 'R$ 80–350', 85,
     'Isola barulho externo e melhora a qualidade de reuniões'),

    ('Microfone condensador USB',
     'Microfone', 'videochamadas', v_amazon,
     'https://www.amazon.com.br/s?k=microfone+condensador+usb+home+office&tag=deskly02-20',
     100, 400, 'R$ 100–400', 80,
     'Som claro e profissional para reuniões, podcasts e criação'),

    ('Hub USB-C 7 em 1',
     'Acessório', 'produtividade', v_amazon,
     'https://www.amazon.com.br/s?k=hub+usb+c+7+em+1&tag=deskly02-20',
     60, 180, 'R$ 60–180', 78,
     'Conecta monitor, HD externo e periféricos com um cabo só'),

    ('Teclado mecânico compacto TKL',
     'Teclado', 'produtividade', v_amazon,
     'https://www.amazon.com.br/s?k=teclado+mecanico+tkl+home+office&tag=deskly02-20',
     150, 500, 'R$ 150–500', 75,
     'Resposta tátil melhora velocidade de digitação e reduz erros'),

    ('Mouse sem fio silencioso',
     'Mouse', 'produtividade', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/mouse+sem+fio+silencioso/',
     40, 180, 'R$ 40–180', 72,
     'Sem barulho de clique — ideal para videoconferências e co-working'),

  -- ---- DECORAÇÃO / AMBIENTE ----
    ('Planta artificial realista (vaso incluso)',
     'Decoração', 'estetica', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/planta+artificial+escritorio/',
     35, 120, 'R$ 35–120', 68,
     'Traz vida ao setup sem preocupação com rega'),

    ('Quadro decorativo minimalista A3',
     'Decoração', 'estetica', v_ml,
     'https://lista.mercadolivre.com.br/quadro-decorativo-home-office-minimalista',
     40, 150, 'R$ 40–150', 65,
     'Personaliza o fundo de videochamadas de forma elegante'),

    ('Mesa regulável em altura (sit-stand)',
     'Mesa', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=mesa+regulavel+altura+home+office&tag=deskly02-20',
     800, 2500, 'R$ 800–2.500', 70,
     'Alternar entre sentado e em pé reduz dores crônicas nas costas'),

    ('Tapete antifadiga para home office',
     'Acessório', 'ergonomia', v_amazon,
     'https://www.amazon.com.br/s?k=tapete+antifadiga+escritorio&tag=deskly02-20',
     60, 180, 'R$ 60–180', 62,
     'Essencial com mesa sit-stand — reduz impacto ao ficar em pé'),

    ('Porta-monitor em madeira (risers)',
     'Suporte', 'organizacao', v_ml,
     'https://lista.mercadolivre.com.br/suporte-monitor-madeira-elevador',
     40, 150, 'R$ 40–150', 60,
     'Eleva o monitor e cria gaveta natural para teclado e mouse'),

    ('Régua de tomadas com USB (6 saídas)',
     'Elétrica', 'cabos', v_magalu,
     'https://www.magazinevoce.com.br/magazinedesklylife/busca/regua+tomadas+usb+6+saidas/',
     50, 150, 'R$ 50–150', 70,
     'Centraliza a alimentação do setup e elimina vários cabos no chão')

  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'affiliate_products seed concluído — 30 produtos inseridos (ou ignorados se já existiam)';

END $$;
