-- Marketplace C2C Fase 2: propostas (offers) + favoritos (saves)
-- Propostas: comprador faz oferta em R$ + mensagem. Vendedor aceita/recusa.
-- Status fluxo: pending -> accepted | rejected | withdrawn (pelo comprador).

-- =====================================================
-- PROPOSTAS DE COMPRA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  price_offered NUMERIC(10, 2) NOT NULL CHECK (price_offered > 0 AND price_offered < 1000000),
  message TEXT CHECK (char_length(message) <= 1000),

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_offers_listing_idx ON public.marketplace_offers(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_offers_buyer_idx   ON public.marketplace_offers(buyer_id,  created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_offers_seller_idx  ON public.marketplace_offers(seller_id, status, created_at DESC);

-- Comprador não pode enviar 2 propostas pendentes pro mesmo anúncio.
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_offers_unique_pending
  ON public.marketplace_offers(listing_id, buyer_id)
  WHERE status = 'pending';

ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;

-- Comprador cria proposta (e tem que ser comprador, NÃO o dono)
DROP POLICY IF EXISTS "marketplace_offers insert as buyer" ON public.marketplace_offers;
CREATE POLICY "marketplace_offers insert as buyer"
  ON public.marketplace_offers FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = buyer_id
    AND buyer_id <> seller_id
    AND EXISTS (
      SELECT 1 FROM public.marketplace_listings l
      WHERE l.id = listing_id AND l.seller_id = marketplace_offers.seller_id AND l.status = 'active'
    )
  );

-- Comprador e vendedor leem suas propostas
DROP POLICY IF EXISTS "marketplace_offers read own" ON public.marketplace_offers;
CREATE POLICY "marketplace_offers read own"
  ON public.marketplace_offers FOR SELECT TO authenticated
  USING (auth.uid() IN (buyer_id, seller_id));

-- Comprador pode "withdraw" sua proposta (status pending -> withdrawn)
-- Vendedor pode aceitar/recusar (pending -> accepted/rejected)
DROP POLICY IF EXISTS "marketplace_offers update by parties" ON public.marketplace_offers;
CREATE POLICY "marketplace_offers update by parties"
  ON public.marketplace_offers FOR UPDATE TO authenticated
  USING (auth.uid() IN (buyer_id, seller_id))
  WITH CHECK (auth.uid() IN (buyer_id, seller_id));

DROP TRIGGER IF EXISTS marketplace_offers_touch ON public.marketplace_offers;
CREATE TRIGGER marketplace_offers_touch BEFORE UPDATE ON public.marketplace_offers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================
-- FAVORITOS (saves) — usuário marca anúncios pra ver depois
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marketplace_saves (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS marketplace_saves_user_idx    ON public.marketplace_saves(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_saves_listing_idx ON public.marketplace_saves(listing_id);

ALTER TABLE public.marketplace_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_saves read own" ON public.marketplace_saves;
CREATE POLICY "marketplace_saves read own"
  ON public.marketplace_saves FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "marketplace_saves insert own" ON public.marketplace_saves;
CREATE POLICY "marketplace_saves insert own"
  ON public.marketplace_saves FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "marketplace_saves delete own" ON public.marketplace_saves;
CREATE POLICY "marketplace_saves delete own"
  ON public.marketplace_saves FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
