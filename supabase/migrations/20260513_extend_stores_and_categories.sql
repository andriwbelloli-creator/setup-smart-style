-- Estende o enum product_store pra incluir parceiros de móveis/decoração
-- relevantes pros novos touchpoints (cortinas, plantas, luminárias, papel
-- de parede, estantes).
--
-- Lojas adicionadas:
--   - tokstok        Tok&Stok (móveis, iluminação, decoração)
--   - madeira_madeira  MadeiraMadeira (móveis, organização)
--   - westwing       Westwing (decoração premium, cortinas, tapetes)
--   - leroy_merlin   Leroy Merlin (construção, papel de parede)
--   - etna           Etna (móveis, iluminação)
--   - camicado       Camicado (decoração, plantas, vasos)
--   - mobly          Mobly (móveis, estantes)
--
-- Comissão é estimativa inicial; admin pode ajustar via UI no futuro.
-- ALTER TYPE ... ADD VALUE é não-bloqueante mas precisa ser executado
-- fora de transação em alguns casos (Postgres < 12). Aqui usamos
-- ADD VALUE IF NOT EXISTS pra idempotência.

ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'tokstok';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'madeira_madeira';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'westwing';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'leroy_merlin';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'etna';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'camicado';
ALTER TYPE public.product_store ADD VALUE IF NOT EXISTS 'mobly';
