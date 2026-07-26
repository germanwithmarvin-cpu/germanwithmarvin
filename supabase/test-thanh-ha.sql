-- ============================================================================
-- TEST 4b: Thanh Ha aktiv schalten + Test-Guthaben für den Test-Schüler
-- ----------------------------------------------------------------------------
-- ERST nach lessons-phase4b.sql + dem 4b-Deploy ausfuehren.
-- Schaltet Thanh Ha buchbar (active=true) und gibt dem Test-Konto
-- marvin.g.graf@gmail.com 2 Thanh-Ha-Stunden (ohne echte Zahlung), damit wir
-- eine Test-Buchung machen koennen. Falls der Test schiefgeht: active wieder auf
-- false setzen (update public.teachers set active=false where id=2;).
-- ============================================================================

update public.teachers set active = true where id = 2;

insert into public.lesson_credit_grants (user_id, teacher_id, credits_granted, credits_remaining, expires_at)
values ((select id from auth.users where email = $$marvin.g.graf@gmail.com$$), 2, 2, 2, now() + interval $$35 days$$);

select id, name, active from public.teachers order by id;
