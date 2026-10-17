-- Tanias Stunden-Guthaben + Buchungen. Im Supabase SQL-Editor "Run".
-- (Service-Role sieht alles — RLS wird umgangen.)

with u as (
  select id from auth.users where lower(email) = lower('taniaamanco@gmail.com')
)
select
  coalesce((select sum(g.credits_remaining) from public.lesson_credit_grants g
            where g.user_id = (select id from u) and g.expires_at > now() and g.credits_remaining > 0), 0) as guthaben_stunden,
  (select count(*) from public.lesson_bookings b
     where b.student_id = (select id from u) and b.status not in ('cancelled_free','cancelled_late')) as buchungen_gesamt,
  (select count(*) from public.lesson_bookings b
     where b.student_id = (select id from u) and b.status = 'booked' and b.starts_at > now()) as anstehend,
  (select min(b.starts_at) from public.lesson_bookings b
     where b.student_id = (select id from u) and b.status = 'booked' and b.starts_at > now()) as naechste_stunde;

-- Alle ihre Buchungen im Detail:
select b.starts_at, b.status, b.teacher_id
from public.lesson_bookings b
where b.student_id = (select id from auth.users where lower(email) = lower('taniaamanco@gmail.com'))
order by b.starts_at desc;

-- Ihre Guthaben-Grants im Detail (inkl. Ablauf):
select g.created_at, g.credits_granted, g.credits_remaining, g.expires_at, g.stripe_invoice_id
from public.lesson_credit_grants g
where g.user_id = (select id from auth.users where lower(email) = lower('taniaamanco@gmail.com'))
order by g.created_at desc;
