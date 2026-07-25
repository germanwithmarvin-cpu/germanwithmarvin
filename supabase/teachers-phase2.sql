-- ============================================================================
-- MEHR-LEHRER · PHASE 2: Preis & Guthaben je Lehrer
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent, mehrfach ausfuehrbar.
-- WICHTIG: Zusammen mit dem zugehoerigen Deploy einspielen (der neue Webhook
-- nutzt ein manuelles Upsert und funktioniert vor UND nach dieser Migration).
--
-- 1) Thanh Has $25-Stripe-Preis hinterlegen (Lehrer 2).
-- 2) lesson_subscriptions: Primaerschluessel auf (user_id, teacher_id) erweitern,
--    damit ein Schueler je Lehrer ein eigenes Abo haben kann. Bestehende Zeilen
--    (alle teacher_id = 1 = Marvin) bleiben unveraendert.
-- ============================================================================

-- 1) Preis von Thanh Ha (Lehrer 2)
update public.teachers
set stripe_price_id = $$price_1Tx7BeEsa6rPVhI26Bq6oykq$$
where id = 2;

-- 2) Zusammengesetzter Primaerschluessel (idempotent: alten PK droppen, neuen setzen)
alter table public.lesson_subscriptions drop constraint if exists lesson_subscriptions_pkey;
alter table public.lesson_subscriptions add  primary key (user_id, teacher_id);

-- Kontrolle: Lehrer + hinterlegte Preise
select id, name, active, hourly_rate_cents, stripe_price_id
from public.teachers order by id;
