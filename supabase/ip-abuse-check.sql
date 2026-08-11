-- ============================================================================
-- IP-basierte Mehrfachkonto-/Missbrauchs-Pruefung
-- Im Supabase SQL-Editor "Run". Idempotent, mehrfach ausfuehrbar.
--
--  1) Spalten, um die IP kuenftiger Nutzer DAUERHAFT zu speichern
--     (profiles.signup_ip = erste erfasste IP, last_ip = zuletzt gesehene).
--     Geschrieben wird ueber /api/track-ip (service_role), nicht vom Client.
--  2) teacher_ip_matches(): findet Konten, die sich eine IP teilen. Quelle:
--     das Supabase-EIGENE Auth-Audit-Log (auch rueckwirkend) PLUS die
--     gespeicherten IPs (die ueberleben das Pruning des Logs). Nur Lehrer.
--
-- WICHTIG: Die IP ist nur ein HINWEIS, kein Beweis - Haushalte/WLAN/Mobilfunk
-- teilen sich IPs; ein Nutzer hat oft mehrere IPs.
-- ============================================================================

alter table public.profiles add column if not exists signup_ip  text;
alter table public.profiles add column if not exists last_ip     text;
alter table public.profiles add column if not exists last_ip_at  timestamptz;

create or replace function public.teacher_ip_matches()
returns table (
  ip            text,
  account_count int,
  emails        text[],
  user_ids      uuid[],
  last_seen     timestamptz
)
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_teacher() then
    raise exception 'forbidden';
  end if;

  return query
  with events as (
    -- jede (IP, Konto)-Kombination aus dem Auth-Audit-Log (Logins + Signups)
    select ale.ip_address::text                    as ip,
           (ale.payload ->> 'actor_id')::uuid       as uid,
           ale.created_at                           as ts
    from auth.audit_log_entries ale
    where ale.ip_address is not null
      and ale.ip_address::text <> ''
      and (ale.payload ->> 'actor_id') is not null
    union all
    -- plus dauerhaft gespeicherte IPs (ueberleben das Pruning des Logs)
    select p.signup_ip, p.id, p.last_ip_at
    from public.profiles p
    where p.signup_ip is not null and p.signup_ip <> ''
    union all
    select p.last_ip, p.id, p.last_ip_at
    from public.profiles p
    where p.last_ip is not null and p.last_ip <> ''
  ),
  per as (
    select e.ip, e.uid, max(e.ts) as last_seen
    from events e
    group by e.ip, e.uid
  )
  select
    per.ip,
    count(*)::int,
    array_agg(u.email order by u.email),
    array_agg(per.uid),
    max(per.last_seen)
  from per
  join auth.users u on u.id = per.uid
  group by per.ip
  having count(*) > 1
  order by count(*) desc, max(per.last_seen) desc nulls last;
end;
$fn$;

grant execute on function public.teacher_ip_matches() to authenticated;

select 'ip-abuse-check.sql angewandt' as status;
