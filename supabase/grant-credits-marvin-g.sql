-- 3 Stunden-Guthaben für marvin.g.graf@gmail.com bei Lehrer 1 (Marvin),
-- 35 Tage gültig (wie ein normaler Monats-Grant). Manueller Einmal-Grant.
insert into public.lesson_credit_grants
  (user_id, teacher_id, credits_granted, credits_remaining, expires_at, stripe_invoice_id)
values (
  (select id from auth.users where lower(email) = lower('marvin.g.graf@gmail.com')),
  1, 3, 3, now() + interval '35 days', 'manual_' || gen_random_uuid()::text
)
returning id, user_id, teacher_id, credits_remaining, expires_at;
