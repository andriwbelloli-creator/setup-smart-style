-- 15 produtos novos pros 5 touchpoints adicionados em touchpoint-rules.ts:
-- cadeira_ergonomica, mesa, painel_acustico, dock_hub, prateleira
--
-- Pattern: 3 produtos por touchpoint variando preço/parceiro.
-- product_url = busca no parceiro (placeholder). affiliate_url = NULL.
-- FIXME(afiliado): preencher affiliate_url quando programa rolar.

DO $$
DECLARE
  p_amazon UUID := (SELECT id FROM public.partners WHERE slug = 'amazon_br');
  p_ml UUID := (SELECT id FROM public.partners WHERE slug = 'mercado_livre');
  p_magalu UUID := (SELECT id FROM public.partners WHERE slug = 'magalu');
  p_kalunga UUID := (SELECT id FROM public.partners WHERE slug = 'kalunga');
  p_tokstok UUID := (SELECT id FROM public.partners WHERE slug = 'tokstok');
  p_madeira UUID := (SELECT id FROM public.partners WHERE slug = 'madeira_madeira');
  p_mobly UUID := (SELECT id FROM public.partners WHERE slug = 'mobly');
  p_leroy UUID := (SELECT id FROM public.partners WHERE slug = 'leroy_merlin');
  p_shopee UUID := (SELECT id FROM public.partners WHERE slug = 'shopee');
BEGIN
  -- CADEIRA ERGONÔMICA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('cadeira_ergonomica','dev','Cadeira ergonômica mesh com 5 ajustes',         p_amazon, 'Amazon',        'https://www.amazon.com.br/s?k=cadeira+ergonomica+mesh+5+ajustes', 'R$ 700 a R$ 2000', 'cadeira_ergonomica_mesh', ARRAY['mesh','5-ajustes','dev'], 10),
    ('cadeira_ergonomica','executivo','Cadeira executiva em couro com apoio cervical', p_tokstok,'Tok&Stok','https://www.tokstok.com.br/search?q=cadeira+executiva+couro', 'R$ 1500 a R$ 4000', 'cadeira_executiva_couro', ARRAY['couro','executiva'], 10),
    ('cadeira_ergonomica','geral','Cadeira de escritório com apoio lombar',     p_ml,     'Mercado Livre', 'https://lista.mercadolivre.com.br/cadeira-escritorio-apoio-lombar', 'R$ 400 a R$ 1200', 'cadeira_escritorio', ARRAY['apoio-lombar','basico'], 6)
  ON CONFLICT DO NOTHING;

  -- MESA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('mesa','geral','Mesa de escritório 120x60cm madeira maciça',                p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=mesa+escritorio+120+madeira', 'R$ 500 a R$ 1500', 'mesa_escritorio', ARRAY['madeira','120cm'], 10),
    ('mesa','dev','Mesa ampla 140x70cm pra dual monitor',                       p_mobly,  'Mobly',         'https://www.mobly.com.br/catalogsearch/result/?q=mesa+escritorio+140', 'R$ 800 a R$ 2200', 'mesa_ampla', ARRAY['ampla','dual-monitor'], 9),
    ('mesa','geral','Mesa regulável sentar/ficar de pé (sit-stand)',             p_tokstok,'Tok&Stok',     'https://www.tokstok.com.br/search?q=mesa+regulavel+sit+stand', 'R$ 1500 a R$ 4500', 'mesa_regulavel', ARRAY['regulavel','altura','sit-stand'], 8)
  ON CONFLICT DO NOTHING;

  -- PAINEL ACÚSTICO
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('painel_acustico','criador','Kit 12 painéis acústicos hexagonais',           p_amazon, 'Amazon',        'https://www.amazon.com.br/s?k=painel+acustico+hexagonal+kit', 'R$ 300 a R$ 800', 'painel_acustico_decorativo', ARRAY['hexagonal','kit','criador'], 10),
    ('painel_acustico','geral','Painel acústico decorativo espuma 50x50',         p_ml,     'Mercado Livre','https://lista.mercadolivre.com.br/painel-acustico-espuma-50x50', 'R$ 80 a R$ 250', 'painel_acustico_espuma', ARRAY['espuma','50x50'], 8),
    ('painel_acustico','professor','Painel acústico fibra mineral profissional',   p_shopee, 'Shopee',       'https://shopee.com.br/search?keyword=painel+acustico+fibra+mineral', 'R$ 200 a R$ 600', 'painel_acustico_fibra', ARRAY['fibra-mineral','profissional'], 7)
  ON CONFLICT DO NOTHING;

  -- DOCK / HUB
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('dock_hub','dev','Dock USB-C Thunderbolt 4 (CalDigit/Anker)',                p_amazon, 'Amazon',        'https://www.amazon.com.br/s?k=dock+thunderbolt+4+usb+c', 'R$ 1500 a R$ 3500', 'dock_thunderbolt', ARRAY['thunderbolt','pd-100w','dev'], 10),
    ('dock_hub','geral','Hub USB-C 7-em-1 com HDMI 4K + PD',                    p_kalunga,'Kalunga',       'https://www.kalunga.com.br/busca/hub+usb+c+7+em+1+hdmi', 'R$ 150 a R$ 400', 'hub_usb_c', ARRAY['7-em-1','hdmi','pd'], 9),
    ('dock_hub','geral','Hub USB-A multiportas alimentado',                      p_ml,     'Mercado Livre','https://lista.mercadolivre.com.br/hub-usb-multiportas-alimentado', 'R$ 80 a R$ 200', 'hub_usb_a', ARRAY['usb-a','basico'], 5)
  ON CONFLICT DO NOTHING;

  -- PRATELEIRA
  INSERT INTO public.recommended_products (touchpoint_key, profile_type, product_name, partner_id, partner_name, product_url, price_range, commercial_category, tags, priority)
  VALUES
    ('prateleira','designer','Prateleiras flutuantes madeira clara (kit 3)',       p_madeira,'MadeiraMadeira','https://www.madeiramadeira.com.br/busca?strBusca=prateleira+flutuante+madeira+kit', 'R$ 150 a R$ 450', 'prateleira_flutuante', ARRAY['flutuante','madeira','kit'], 10),
    ('prateleira','geral','Par de prateleiras de parede em L',                   p_leroy,  'Leroy Merlin', 'https://www.leroymerlin.com.br/busca?term=prateleira+parede+L', 'R$ 80 a R$ 250', 'prateleira_parede_L', ARRAY['parede','L','basica'], 7),
    ('prateleira','criador','Prateleira gallery wall com 3 níveis escalonados',  p_mobly,  'Mobly',         'https://www.mobly.com.br/catalogsearch/result/?q=prateleira+gallery+wall', 'R$ 200 a R$ 600', 'prateleira_gallery', ARRAY['gallery','criador','3-niveis'], 8)
  ON CONFLICT DO NOTHING;
END $$;
