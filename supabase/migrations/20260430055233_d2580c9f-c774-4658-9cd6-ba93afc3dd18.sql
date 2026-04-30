
-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.user_career AS ENUM ('dev', 'designer', 'pm', 'creator', 'remoto', 'outro');
CREATE TYPE public.setup_status AS ENUM ('draft', 'published');
CREATE TYPE public.product_store AS ENUM ('amazon_br', 'mercado_livre', 'kabum', 'magalu', 'pichau', 'outro');

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  career public.user_career DEFAULT 'outro',
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles read public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := lower(regexp_replace(
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'
  ));
  IF base_username = '' OR base_username IS NULL THEN
    base_username := 'user';
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', final_username),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- USER ROLES (separate table, never on profiles)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles read public" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles admin manage" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SETUPS
-- =====================================================
CREATE TABLE public.setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  styles TEXT[] NOT NULL DEFAULT '{}',
  career public.user_career DEFAULT 'outro',
  budget_brl INTEGER NOT NULL DEFAULT 0,
  city TEXT,
  cover_url TEXT,
  status public.setup_status NOT NULL DEFAULT 'draft',
  ai_score NUMERIC(3,1),
  likes_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
CREATE INDEX setups_status_created_idx ON public.setups (status, created_at DESC);
CREATE INDEX setups_owner_idx ON public.setups (owner_id);

CREATE POLICY "setups read published or own" ON public.setups FOR SELECT
  USING (status = 'published' OR owner_id = auth.uid());
CREATE POLICY "setups insert own" ON public.setups FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "setups update own" ON public.setups FOR UPDATE
  USING (auth.uid() = owner_id);
CREATE POLICY "setups delete own" ON public.setups FOR DELETE
  USING (auth.uid() = owner_id);

-- =====================================================
-- SETUP IMAGES
-- =====================================================
CREATE TABLE public.setup_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_before BOOLEAN NOT NULL DEFAULT false,
  is_after BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.setup_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX setup_images_setup_idx ON public.setup_images (setup_id, position);

CREATE POLICY "setup_images read public" ON public.setup_images FOR SELECT USING (true);
CREATE POLICY "setup_images manage own" ON public.setup_images FOR ALL
  USING (EXISTS (SELECT 1 FROM public.setups s WHERE s.id = setup_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.setups s WHERE s.id = setup_id AND s.owner_id = auth.uid()));

-- =====================================================
-- SETUP PRODUCTS (hotspots)
-- =====================================================
CREATE TABLE public.setup_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  price_brl INTEGER NOT NULL DEFAULT 0,
  store public.product_store NOT NULL DEFAULT 'outro',
  affiliate_url TEXT,
  rating NUMERIC(2,1),
  x NUMERIC(5,2) NOT NULL DEFAULT 50,
  y NUMERIC(5,2) NOT NULL DEFAULT 50,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.setup_products ENABLE ROW LEVEL SECURITY;
CREATE INDEX setup_products_setup_idx ON public.setup_products (setup_id);

CREATE POLICY "setup_products read public" ON public.setup_products FOR SELECT USING (true);
CREATE POLICY "setup_products manage own" ON public.setup_products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.setups s WHERE s.id = setup_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.setups s WHERE s.id = setup_id AND s.owner_id = auth.uid()));

-- =====================================================
-- PRODUCT ALTERNATIVES
-- =====================================================
CREATE TABLE public.product_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.setup_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_brl INTEGER NOT NULL DEFAULT 0,
  store public.product_store NOT NULL DEFAULT 'outro',
  affiliate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_alternatives ENABLE ROW LEVEL SECURITY;
CREATE INDEX product_alternatives_product_idx ON public.product_alternatives (product_id);

CREATE POLICY "product_alt read public" ON public.product_alternatives FOR SELECT USING (true);
CREATE POLICY "product_alt manage own" ON public.product_alternatives FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.setup_products p
    JOIN public.setups s ON s.id = p.setup_id
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.setup_products p
    JOIN public.setups s ON s.id = p.setup_id
    WHERE p.id = product_id AND s.owner_id = auth.uid()
  ));

-- =====================================================
-- LIKES & SAVES
-- =====================================================
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, setup_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE INDEX likes_setup_idx ON public.likes (setup_id);

CREATE POLICY "likes read public" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes insert own" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes delete own" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.saves (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, setup_id)
);
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
CREATE INDEX saves_setup_idx ON public.saves (setup_id);

CREATE POLICY "saves read own" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves insert own" ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saves delete own" ON public.saves FOR DELETE USING (auth.uid() = user_id);

-- Counter triggers
CREATE OR REPLACE FUNCTION public.bump_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.setups SET likes_count = likes_count + 1 WHERE id = NEW.setup_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.setups SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.setup_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_likes_count();

CREATE OR REPLACE FUNCTION public.bump_saves_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.setups SET saves_count = saves_count + 1 WHERE id = NEW.setup_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.setups SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.setup_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER saves_count_trigger
  AFTER INSERT OR DELETE ON public.saves
  FOR EACH ROW EXECUTE FUNCTION public.bump_saves_count();

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX comments_setup_idx ON public.comments (setup_id, created_at DESC);

CREATE POLICY "comments read public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments insert own" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments update own" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments delete own" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- AI ANALYSES
-- =====================================================
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  setup_id UUID REFERENCES public.setups(id) ON DELETE SET NULL,
  image_url TEXT,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_score NUMERIC(3,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_analyses_owner_idx ON public.ai_analyses (owner_id, created_at DESC);

CREATE POLICY "ai_analyses read own or anon" ON public.ai_analyses FOR SELECT
  USING (owner_id IS NULL OR owner_id = auth.uid());
CREATE POLICY "ai_analyses insert any" ON public.ai_analyses FOR INSERT
  WITH CHECK (owner_id IS NULL OR owner_id = auth.uid());

-- =====================================================
-- updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER setups_touch BEFORE UPDATE ON public.setups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================
-- STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('setups', 'setups', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "setups storage read public" ON storage.objects FOR SELECT
  USING (bucket_id = 'setups');
CREATE POLICY "setups storage insert own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'setups'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "setups storage update own" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'setups'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "setups storage delete own" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'setups'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
