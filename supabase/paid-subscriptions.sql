-- Pay-first-Modell: Stripe-Zahlungen werden per E-Mail einem Konto zugeordnet.
-- Der Webhook pflegt diese Tabelle; der Zugang wird live daraus abgeleitet.
-- Mehrfach ausfuehrbar.

create table if not exists public.paid_subscriptions (
  email text primary key,
  stripe_customer_id text,
  status text not null default 'active',
  updated_at timestamptz not null default now()
);

-- Kein Client-Zugriff: nur der Webhook (service_role) schreibt/liest direkt.
alter table public.paid_subscriptions enable row level security;

-- Zugang des eingeloggten Nutzers: 'full' wenn Lehrer, per Code freigeschaltet
-- (profiles.access_scope='full') ODER aktives Stripe-Abo unter seiner E-Mail; sonst 'none'.
create or replace function public.my_access()
returns text
language sql
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_teacher or p.access_scope = 'full')
    ) then 'full'
    when exists (
      select 1 from public.paid_subscriptions ps
      where lower(ps.email) = lower(auth.jwt() ->> 'email')
        and ps.status in ('active', 'trialing')
    ) then 'full'
    else 'none'
  end;
$$;

grant execute on function public.my_access() to authenticated;
