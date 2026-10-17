-- ============================================================================
-- NUR falls die App nach der Stripe-Kündigung noch ein aktives Abo zeigt.
-- Setzt Tanias altes Stunden-Abo (Lehrer 1 = Marvin) auf 'canceled', damit die
-- Neukauf-Sperre im Checkout wegfällt. WICHTIG: Erst in Stripe kündigen, sonst
-- läuft die Abbuchung weiter — dieses SQL ändert nur die App-Anzeige, nicht Stripe.
-- E-Mail unten anpassen. Im Supabase SQL-Editor "Run".
-- ============================================================================

update public.lesson_subscriptions
set status = 'canceled', cancel_at_period_end = true, updated_at = now()
where teacher_id = 1
  and user_id = (select id from auth.users where lower(email) = lower('TANIA_EMAIL_HIER'));

-- Kontrolle
select user_id, teacher_id, status, quantity, stripe_subscription_id
from public.lesson_subscriptions
where user_id = (select id from auth.users where lower(email) = lower('TANIA_EMAIL_HIER'));
