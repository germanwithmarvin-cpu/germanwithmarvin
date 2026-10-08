-- E-Mail-Leads aus dem Lead-Magnet (gratis A1-Story gegen E-Mail).
-- Schreibt nur die API-Route über den Service-Zugang (RLS an, keine Policies
-- für anon/authenticated → nur Service-Role kommt dran).
create table if not exists public.leads (
  email             text primary key,
  source            text,
  marketing_consent boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.leads enable row level security;
