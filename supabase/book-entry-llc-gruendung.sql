-- ============================================================================
-- Buchung: LLC-Gruendung (llc-starten.de), privat bezahlt, in 2 Raten.
-- Im Supabase SQL-Editor "Run". Mehrfach ausfuehrbar (WHERE NOT EXISTS schuetzt
-- vor Doppelbuchung). Betraege in USD via EZB-Referenzkurs am Zahlungstag.
--   Rechnung 000-1660  20.06.2026  299,00 EUR  (Kurs 1,1467)  = 342,86 USD
--   Rechnung 000-1670  24.06.2026  300,00 EUR  (Kurs 1,1340)  = 340,20 USD
-- Weil privat bezahlt: je Rechnung eine AUSGABE + eine OWNER-EINLAGE (Form 5472).
-- ============================================================================

-- 1) Ausgaben
insert into public.book_expenses
  (booked_on, category, description, payee, currency, amount_original, fx_rate, amount_usd, receipt, w8ben, note)
select $$2026-06-20$$, $$Compliance & Beratung$$, $$LLC-Gruendung – 1. Teilzahlung (50%)$$, $$STARTEN LLC (llc-starten.de)$$, $$EUR$$, 299.00, 1.1467, 342.86, true, $$n/a$$, $$Rechnung 000-1660; privat bezahlt; EZB-Kurs 19.06.2026$$
where not exists (select 1 from public.book_expenses where description = $$LLC-Gruendung – 1. Teilzahlung (50%)$$ and booked_on = $$2026-06-20$$);

insert into public.book_expenses
  (booked_on, category, description, payee, currency, amount_original, fx_rate, amount_usd, receipt, w8ben, note)
select $$2026-06-24$$, $$Compliance & Beratung$$, $$LLC-Gruendung – 2. Teilzahlung (50%)$$, $$STARTEN LLC (llc-starten.de)$$, $$EUR$$, 300.00, 1.1340, 340.20, true, $$n/a$$, $$Rechnung 000-1670; privat bezahlt; EZB-Kurs 24.06.2026$$
where not exists (select 1 from public.book_expenses where description = $$LLC-Gruendung – 2. Teilzahlung (50%)$$ and booked_on = $$2026-06-24$$);

-- 2) Owner-Einlagen (Gegenbuchung zu den privat bezahlten Ausgaben)
insert into public.book_owner
  (booked_on, kind, description, currency, amount_original, fx_rate, amount_usd, receipt, note)
select $$2026-06-20$$, $$Einlage (Owner Contribution)$$, $$Privat bezahlte LLC-Gruendung (Rechnung 000-1660)$$, $$EUR$$, 299.00, 1.1467, 342.86, true, $$Gegenbuchung zur privat bezahlten Ausgabe – Form 5472$$
where not exists (select 1 from public.book_owner where description = $$Privat bezahlte LLC-Gruendung (Rechnung 000-1660)$$ and booked_on = $$2026-06-20$$);

insert into public.book_owner
  (booked_on, kind, description, currency, amount_original, fx_rate, amount_usd, receipt, note)
select $$2026-06-24$$, $$Einlage (Owner Contribution)$$, $$Privat bezahlte LLC-Gruendung (Rechnung 000-1670)$$, $$EUR$$, 300.00, 1.1340, 340.20, true, $$Gegenbuchung zur privat bezahlten Ausgabe – Form 5472$$
where not exists (select 1 from public.book_owner where description = $$Privat bezahlte LLC-Gruendung (Rechnung 000-1670)$$ and booked_on = $$2026-06-24$$);

-- Kontrolle
select $$Ausgaben$$ as journal, booked_on, category as art, amount_original, currency, amount_usd from public.book_expenses where description like $$LLC-Gruendung%$$
union all
select $$Owner$$, booked_on, kind, amount_original, currency, amount_usd from public.book_owner where description like $$Privat bezahlte LLC-Gruendung%$$
order by booked_on;
