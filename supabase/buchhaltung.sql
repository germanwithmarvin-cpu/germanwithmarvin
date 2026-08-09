-- ============================================================================
-- BUCHHALTUNG — German with Marvin LLC
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfuegen und "Run". Gefahrlos mehrfach ausfuehrbar.
--
-- Loest die Excel-Datei "Buchhaltung_GermanWithMarvin_LLC.xlsx" ab. Dieselbe
-- Struktur, nur als Tabellen: drei Journale (Umsatz / Ausgaben / Owner), dazu
-- Stammdaten und der Monatsabschluss. GuV und Form 5472 werden aus den
-- Journalen gerechnet und nirgends gespeichert.
--
-- Legt an:
--   book_settings     — Stammdaten (EIN, Registered Agent, Steuerjahr ...)
--   book_revenue      — Umsatzjournal (Stripe-Sync + manuelle Zeilen)
--   book_expenses     — Ausgabenjournal
--   book_owner        — Geldbewegungen zwischen Marvin und der LLC (Form 5472)
--   book_templates    — wiederkehrende Ausgaben als Ein-Klick-Vorlage
--   book_product_map  — Stripe-Produktname -> Umsatzkategorie (einmal zuordnen)
--   book_periods      — Monatsabschluss (gesynct am / abgeschlossen am)
--
-- Zugriff: ausschliesslich Lehrer-Konten (public.is_teacher()).
-- ============================================================================

-- 1) Stammdaten. Genau eine Zeile (id = 1), damit es kein "welche gilt?" gibt.
create table if not exists public.book_settings (
  id                  smallint primary key default 1 check (id = 1),
  company_name        text not null default $$German with Marvin LLC$$,
  state               text not null default $$Wyoming$$,
  tax_classification  text not null default $$Foreign-owned disregarded entity$$,
  ein                 text not null default $$$$,
  formation_month     smallint,                       -- 1..12, steuert den Wyoming Annual Report
  registered_agent    text not null default $$$$,
  tax_year            integer not null default extract(year from now())::int,
  currency            text not null default $$USD$$,  -- Buchfuehrungswaehrung
  owner_name          text not null default $$Marvin$$,
  owner_residence     text not null default $$Vietnam$$,
  -- Eigene Kategorien zusaetzlich zu den fest eingebauten (siehe src/lib/books.ts)
  extra_revenue_categories text[] not null default array[]::text[],
  extra_expense_categories text[] not null default array[]::text[],
  updated_at          timestamptz not null default now()
);
insert into public.book_settings (id) values (1) on conflict (id) do nothing;

-- 2) Umsatzjournal. Eine Zeile je Transaktion; Erstattungen und Chargebacks
--    sind eigene Zeilen mit negativem Betrag — nie eine bestehende Zeile aendern.
--
--    Warum sowohl Original- als auch USD-Betraege? Der USD-Wert ist der von
--    Stripe abgerechnete Betrag (die Wahrheit fuer die Buchfuehrung), der
--    Originalbetrag bleibt zum Nachvollziehen daneben stehen.
create table if not exists public.book_revenue (
  id               uuid primary key default gen_random_uuid(),
  booked_on        date not null,
  kind             text not null default $$Verkauf$$,   -- Verkauf | Erstattung | Chargeback | Stripe-Gebuehr | Sonstiges
  source           text not null default $$manuell$$,   -- stripe | manuell
  stripe_id        text unique,                          -- Balance-Transaction-ID -> Sync bleibt idempotent
  stripe_ref       text not null default $$$$,           -- Charge-/PaymentIntent-ID zum Nachschlagen
  product          text not null default $$$$,           -- Umsatzkategorie (leer = noch zuzuordnen)
  product_raw      text not null default $$$$,           -- was Stripe geliefert hat
  customer_country text not null default $$$$,
  currency         text not null default $$USD$$,        -- Originalwaehrung
  gross_original   numeric(14,2) not null default 0,
  tax_original     numeric(14,2) not null default 0,
  fx_rate          numeric(16,8) not null default 1,
  gross_usd        numeric(14,2) not null default 0,
  tax_usd          numeric(14,2) not null default 0,     -- durchlaufender Posten, nie Erloes
  fee_usd          numeric(14,2) not null default 0,     -- Stripe-Gebuehr
  note             text not null default $$$$,
  created_at       timestamptz not null default now()
);
create index if not exists book_revenue_date_idx on public.book_revenue(booked_on);

-- 3) Ausgabenjournal. Ohne Stripe-Gebuehren — die stehen im Umsatzjournal und
--    wuerden hier ein zweites Mal zaehlen.
create table if not exists public.book_expenses (
  id              uuid primary key default gen_random_uuid(),
  booked_on       date not null,
  category        text not null default $$Sonstiges$$,
  description     text not null default $$$$,
  payee           text not null default $$$$,
  currency        text not null default $$USD$$,
  amount_original numeric(14,2) not null default 0,
  fx_rate         numeric(16,8) not null default 1,
  amount_usd      numeric(14,2) not null default 0,
  receipt         boolean not null default false,        -- Beleg abgelegt
  w8ben           text not null default $$n/a$$,         -- Ja | Nein | n/a (nur bei Fremdleistung relevant)
  note            text not null default $$$$,
  created_at      timestamptz not null default now()
);
create index if not exists book_expenses_date_idx on public.book_expenses(booked_on);

-- 4) Owner-Konto. Grundlage der Form-5472-Meldung — der einzige Teil der
--    Buchhaltung, den der IRS tatsaechlich sieht.
create table if not exists public.book_owner (
  id              uuid primary key default gen_random_uuid(),
  booked_on       date not null,
  kind            text not null default $$Entnahme (Owner Draw)$$,
  description     text not null default $$$$,
  currency        text not null default $$USD$$,
  amount_original numeric(14,2) not null default 0,
  fx_rate         numeric(16,8) not null default 1,
  amount_usd      numeric(14,2) not null default 0,
  receipt         boolean not null default false,
  note            text not null default $$$$,
  created_at      timestamptz not null default now()
);
create index if not exists book_owner_date_idx on public.book_owner(booked_on);

-- 5) Wiederkehrende Ausgaben als Vorlage (Skool-Abo, Registered Agent, ...).
--    Im Tool ein Klick statt jeden Monat dieselben Felder tippen.
create table if not exists public.book_templates (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  category        text not null default $$Sonstiges$$,
  payee           text not null default $$$$,
  description     text not null default $$$$,
  currency        text not null default $$USD$$,
  amount_original numeric(14,2) not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 6) Stripe-Produkt -> Umsatzkategorie. Einmal zuordnen, danach ordnet der
--    Sync von selbst zu.
create table if not exists public.book_product_map (
  raw        text primary key,   -- normalisierter Produkttext aus Stripe
  category   text not null,
  created_at timestamptz not null default now()
);

-- 7) Monatsabschluss. Ein Datensatz je Monat, Schluessel im Format 2026-08.
create table if not exists public.book_periods (
  period      text primary key check (period ~ $$^[0-9]{4}-[0-9]{2}$$),
  synced_at   timestamptz,                    -- zuletzt Stripe geholt
  closed_at   timestamptz,                    -- Monat abgeschlossen
  -- Schritt 2 und 3 lassen sich nicht aus den Daten ableiten: "keine Ausgabe
  -- im Monat" kann heissen "noch nichts erfasst" oder "es gab keine". Deshalb
  -- bestaetigt man sie im Tool ausdruecklich.
  expenses_done boolean not null default false,
  owner_done    boolean not null default false,
  note        text not null default $$$$
);
-- Nachruesten, falls die Tabelle aus einer frueheren Fassung stammt.
alter table public.book_periods add column if not exists expenses_done boolean not null default false;
alter table public.book_periods add column if not exists owner_done    boolean not null default false;

-- 8) RLS: nur Lehrer-Konten. Der Stripe-Sync laeuft ueber den Service-Role-Key
--    und umgeht RLS ohnehin.
alter table public.book_settings    enable row level security;
alter table public.book_revenue     enable row level security;
alter table public.book_expenses    enable row level security;
alter table public.book_owner       enable row level security;
alter table public.book_templates   enable row level security;
alter table public.book_product_map enable row level security;
alter table public.book_periods     enable row level security;

drop policy if exists "teacher manage book_settings" on public.book_settings;
create policy "teacher manage book_settings" on public.book_settings
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_revenue" on public.book_revenue;
create policy "teacher manage book_revenue" on public.book_revenue
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_expenses" on public.book_expenses;
create policy "teacher manage book_expenses" on public.book_expenses
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_owner" on public.book_owner;
create policy "teacher manage book_owner" on public.book_owner
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_templates" on public.book_templates;
create policy "teacher manage book_templates" on public.book_templates
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_product_map" on public.book_product_map;
create policy "teacher manage book_product_map" on public.book_product_map
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "teacher manage book_periods" on public.book_periods;
create policy "teacher manage book_periods" on public.book_periods
  for all using (public.is_teacher()) with check (public.is_teacher());

-- Kontrolle
select $$buchhaltung.sql angewandt$$ as status;
