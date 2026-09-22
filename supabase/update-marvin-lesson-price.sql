-- ============================================================================
-- Marvins Stunden-Preis (Lehrer 1) auf die neue Stripe-Price-ID umstellen.
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent.
-- Grund: teachers.stripe_price_id hat im Checkout Vorrang vor der Config —
-- ohne dieses Update greift die neue Preis-ID beim echten Buchen NICHT.
-- ============================================================================

update public.teachers
set stripe_price_id = 'price_1UGCpOEsa6rPVhI2woGYgISc'
where id = 1;

-- Kontrolle: sollte fuer id=1 die neue Preis-ID zeigen
select id, name, active, hourly_rate_cents, stripe_price_id
from public.teachers order by id;
