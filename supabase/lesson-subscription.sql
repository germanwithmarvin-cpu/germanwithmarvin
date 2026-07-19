-- ============================================================================
-- 1-zu-1 Stunden – Phase 1: Monats-Abo (Stripe) + Stunden-Guthaben.
-- Idempotent – kann mehrfach ausgeführt werden.
-- ============================================================================

-- Aktueller Abo-Zustand je Schüler (gepflegt vom Stripe-Webhook).
create table if not exists public.lesson_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  quantity int not null default 0,            -- Stunden/Monat aktuell
  pending_quantity int,                        -- geplante Änderung (Senkung zum Periodenende)
  status text not null default 'inactive',     -- active | past_due | canceled | inactive
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.lesson_subscriptions enable row level security;
drop policy if exists "own lesson sub" on public.lesson_subscriptions;
create policy "own lesson sub" on public.lesson_subscriptions
  for select using (auth.uid() = user_id);
-- Schreiben nur über service_role (Webhook) – keine Insert/Update-Policy für Nutzer.

-- Guthaben-Gutschriften. Jede Monatszahlung = eine Zeile mit eigenem Ablauf
-- (5 Wochen). Guthaben = Summe credits_remaining über alle noch gültigen Zeilen.
create table if not exists public.lesson_credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credits_granted int not null,
  credits_remaining int not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  stripe_invoice_id text unique,               -- Idempotenz: pro Rechnung nur einmal gutschreiben
  created_at timestamptz not null default now()
);

alter table public.lesson_credit_grants enable row level security;
drop policy if exists "own credit grants" on public.lesson_credit_grants;
create policy "own credit grants" on public.lesson_credit_grants
  for select using (auth.uid() = user_id);

create index if not exists idx_lesson_grants_user on public.lesson_credit_grants(user_id, expires_at);
