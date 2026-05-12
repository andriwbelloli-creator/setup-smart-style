-- Monetization foundation: affiliate tracking + subscription tiers

-- =============================================================
-- 1. AFFILIATE: track clicks on outbound product links
-- =============================================================
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.setup_products(id) on delete cascade,
  setup_id uuid references public.setups(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  -- denormalized for fast aggregation
  store public.product_store not null,
  ip_hash text, -- for unique-visitor rough estimate without storing PII
  user_agent text,
  referrer text,
  clicked_at timestamp with time zone not null default now()
);

create index affiliate_clicks_product_idx on public.affiliate_clicks(product_id, clicked_at desc);
create index affiliate_clicks_setup_idx on public.affiliate_clicks(setup_id, clicked_at desc);
create index affiliate_clicks_store_idx on public.affiliate_clicks(store, clicked_at desc);

alter table public.affiliate_clicks enable row level security;

-- Anyone can insert a click (anonymous tracking)
create policy "anyone can insert clicks"
  on public.affiliate_clicks for insert to anon, authenticated
  with check (true);

-- Only admins can read clicks (analytics)
create policy "admins read clicks"
  on public.affiliate_clicks for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- 2. SUBSCRIPTION PLANS (catalog) — static, seeded
-- =============================================================
create type public.subscription_tier as enum ('free', 'premium', 'pro');
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid'
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  tier public.subscription_tier not null unique,
  name text not null,
  description text,
  price_cents_brl integer not null default 0,
  billing_interval text not null default 'month',
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  stripe_price_id text, -- filled when Stripe is connected
  created_at timestamp with time zone not null default now()
);

alter table public.subscription_plans enable row level security;

create policy "plans readable by all"
  on public.subscription_plans for select to anon, authenticated using (active);

-- Seed the 3 tiers
insert into public.subscription_plans (tier, name, description, price_cents_brl, features) values
  ('free', 'Gratuito', 'Acesso à comunidade, galeria e 1 análise/mês.', 0,
    '["1 análise IA por mês", "Wishlist até 5 setups", "Acesso à galeria e comunidade"]'),
  ('premium', 'Premium', 'Pra quem usa o HomeOffice.life toda semana.', 990,
    '["Análise IA ilimitada", "Recomendações personalizadas", "Wishlist ilimitada", "Comparação de 2 setups", "Relatório PDF", "Sem anúncios"]'),
  ('pro', 'Pro', 'Pra criadores e profissionais.', 2990,
    '["Tudo do Premium", "Comparação ilimitada", "Destaque no perfil", "Consultoria 1-on-1 (15min/mês)", "Selo Pro na comunidade"]');

-- =============================================================
-- 3. SUBSCRIPTIONS (user state)
-- =============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  tier public.subscription_tier not null default 'free',
  status public.subscription_status not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean not null default false,
  -- gateway references (filled when payment is connected)
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index subscriptions_user_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);

alter table public.subscriptions enable row level security;

create policy "users read own subscription"
  on public.subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy "admins read all subscriptions"
  on public.subscriptions for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- inserts/updates only via service role (server-side after webhook)

-- Auto-create a 'free' subscription on user signup (extend existing handle_new_user)
create or replace function public.create_default_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from public.subscription_plans where tier = 'free' limit 1;
  insert into public.subscriptions (user_id, plan_id, tier, status)
  values (new.id, free_plan_id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_user_created_default_subscription
  after insert on auth.users
  for each row execute function public.create_default_subscription();

-- Backfill free subscriptions for existing users
insert into public.subscriptions (user_id, plan_id, tier, status)
select u.id, p.id, 'free', 'active'
from auth.users u
cross join public.subscription_plans p
where p.tier = 'free'
on conflict (user_id) do nothing;

-- =============================================================
-- 4. PAYMENTS log (for audit, filled by webhook later)
-- =============================================================
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null, -- 'stripe' | 'pagseguro' | 'asaas'
  event_type text not null, -- 'invoice.paid', 'subscription.canceled', etc
  external_id text, -- gateway's id for the event
  amount_cents integer,
  currency text default 'BRL',
  raw_payload jsonb,
  processed_at timestamp with time zone not null default now()
);

create index payment_events_user_idx on public.payment_events(user_id, processed_at desc);
create index payment_events_external_idx on public.payment_events(external_id);

alter table public.payment_events enable row level security;

create policy "users read own payment events"
  on public.payment_events for select to authenticated
  using (auth.uid() = user_id);
