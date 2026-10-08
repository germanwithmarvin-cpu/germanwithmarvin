-- Trial-E-Mail-Sequenz: merkt sich, welche Stufe ein Nutzer schon bekommen hat,
-- und liefert die Zielgruppe (Trial-Nutzer mit Werbe-Einwilligung, noch nicht
-- zahlend) für den täglichen Cron.

create table if not exists public.trial_email_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  stage   text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, stage)
);

-- Kandidaten für die Sequenz:
--   * kein Lehrer / kein Demo-Konto
--   * hat der Werbung zugestimmt (EU-Opt-in; Angebote nur mit Einwilligung)
--   * Registrierung in den letzten 25 Tagen (Sequenz läuft Tag 0–20)
--   * access_expires_at gesetzt UND <= heute + 30 Tage → Trial oder abgelaufener
--     Trial, aber KEIN Dauer-/Jahres-Zugang (einmaliges Jahr liegt ~365 Tage weg)
--   * (noch) kein aktives App-Abo in paid_subscriptions
-- Gibt zusätzlich die Tage seit Anmeldung und die bereits versandten Stufen zurück.
create or replace function public.trial_email_candidates()
returns table (user_id uuid, email text, full_name text, days_since int, sent_stages text[])
language sql security definer set search_path = public as $$
  select
    u.id,
    u.email::text,
    coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name')::text,
    floor(extract(epoch from (now() - u.created_at)) / 86400)::int,
    coalesce(array_remove(array_agg(l.stage), null), '{}')
  from auth.users u
  join public.profiles p on p.id = u.id
  left join public.trial_email_log l on l.user_id = u.id
  where coalesce(p.is_teacher, false) = false
    and coalesce(p.is_demo, false) = false
    and coalesce(p.marketing_consent, false) = true
    and u.created_at >= now() - interval '25 days'
    and p.access_expires_at is not null
    and p.access_expires_at <= now() + interval '30 days'
    and not exists (
      select 1 from public.paid_subscriptions ps
      where lower(ps.email) = lower(u.email) and ps.status in ('active', 'trialing')
    )
  group by u.id, p.id;
$$;

revoke all on function public.trial_email_candidates() from anon, authenticated;
grant execute on function public.trial_email_candidates() to service_role;
