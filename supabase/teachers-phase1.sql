-- ============================================================================
-- MEHR-LEHRER · PHASE 1: Datenmodell (Marvin = 1, Thanh Ha = 2)
-- ----------------------------------------------------------------------------
-- Auszufuehren ist die Dollar-Quoting-Fassung teachers-phase1-safe.sql.
-- REIN ADDITIV & idempotent (mehrfach ausfuehrbar): legt die teachers-Tabelle
-- an und haengt an alle Buchungstabellen eine teacher_id (Standard = 1 = Marvin).
-- Bestehende Buchungen/Guthaben/Abos bleiben unangetastet und zaehlen zu Marvin.
-- KEINE RPC- oder Webhook-Aenderung -> aktuelles Verhalten bleibt identisch.
-- Thanh Ha wird als Lehrerin 2 angelegt, aber active=false (noch nicht sichtbar).
-- ============================================================================

-- 1) Lehrer-Stammdaten + Profil
create table if not exists public.teachers (
  id                int primary key,
  slug              text unique not null,
  name              text not null,
  user_id           uuid references auth.users(id) on delete set null,  -- verknuepfter Login (Thanh Ha spaeter)
  display_role      text not null default '',
  bio               text not null default '',
  highlights        jsonb not null default '[]',
  languages         text not null default '',
  photo_url         text not null default '',
  hourly_rate_cents int,                 -- Marvin 5900, Thanh Ha 2500 (Anzeige/Phase 2)
  stripe_price_id   text,                 -- eigener Stripe-Preis je Lehrer (Phase 2)
  active            boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.teachers enable row level security;
drop policy if exists "read teachers" on public.teachers;
create policy "read teachers" on public.teachers for select using (true);
drop policy if exists "teacher manage teachers" on public.teachers;
create policy "teacher manage teachers" on public.teachers for all using (public.is_teacher()) with check (public.is_teacher());

-- Lehrer 1: Marvin (mit seinem Login verknuepft)
insert into public.teachers (id, slug, name, user_id, display_role, bio, highlights, languages, hourly_rate_cents, stripe_price_id, active, sort_order)
values (
  1, 'marvin', 'Marvin Graf',
  (select id from auth.users where email = 'marvin.h.graf@gmail.com'),
  'Founder & your main teacher',
  'Hi, I''m Marvin. I''ve been teaching German full-time for over 4 years, with thousands of one-on-one hours behind me. I built German Simplified to make the language actually click — clear explanations, real conversation, and a system that makes vocabulary and grammar stick. Whether you''re starting from zero or pushing toward an advanced level, I''ll meet you exactly where you are.',
  '["4+ years teaching · thousands of 1-on-1 lessons","Levels A1–C1 · structured, patient, no pressure","Creator of the German Simplified method"]'::jsonb,
  'German, English',
  5900, 'price_1TurQzEsa6rPVhI2C2QoyaeH', true, 1
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, user_id = excluded.user_id,
  display_role = excluded.display_role, bio = excluded.bio, highlights = excluded.highlights,
  languages = excluded.languages, hourly_rate_cents = excluded.hourly_rate_cents,
  stripe_price_id = coalesce(excluded.stripe_price_id, public.teachers.stripe_price_id),
  sort_order = excluded.sort_order;

-- Lehrer 2: Thanh Ha (Login/Foto/Preis folgen; noch NICHT sichtbar)
insert into public.teachers (id, slug, name, user_id, display_role, bio, highlights, languages, hourly_rate_cents, stripe_price_id, active, sort_order)
values (
  2, 'thanh-ha', 'Thanh Ha Nguyen',
  (select id from auth.users where email = 'thanhhang.de@gmail.com'),
  'German teacher · trilingual (VI · EN · DE)',
  'Hi, I''m Thanh Ha. I''m a German teacher with hundreds of hours of lessons and a real fascination for how languages work. I speak Vietnamese, English and German fluently, so I can explain the tricky parts in the way that clicks for you — and I know from my own journey what it takes to truly master German. Calm, encouraging and precise, I''ll help you build real confidence step by step.',
  '["Hundreds of 1-on-1 lessons · A1–B2","Fluent in Vietnamese, English & German — great for Vietnamese- and English-speaking learners","M.A. Languages & Cultures of Southeast Asia (Vietnam Studies), University of Hamburg","B.A. Linguistics (with Book Sciences), University of Mainz"]'::jsonb,
  'Vietnamese, English, German',
  2500, null, false, 2
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name,
  user_id = coalesce(excluded.user_id, public.teachers.user_id),
  display_role = excluded.display_role, bio = excluded.bio, highlights = excluded.highlights,
  languages = excluded.languages, hourly_rate_cents = excluded.hourly_rate_cents,
  sort_order = excluded.sort_order;


-- 2) teacher_id an alle Buchungstabellen anhaengen (Standard = 1 = Marvin).
--    Bestehende Zeilen werden dadurch automatisch Marvin zugeordnet.
alter table public.lesson_teacher_settings add column if not exists teacher_id int not null default 1;
alter table public.teacher_google         add column if not exists teacher_id int not null default 1;
alter table public.lesson_blocks          add column if not exists teacher_id int not null default 1;
alter table public.lesson_bookings        add column if not exists teacher_id int not null default 1;
alter table public.lesson_subscriptions   add column if not exists teacher_id int not null default 1;
alter table public.lesson_credit_grants   add column if not exists teacher_id int not null default 1;
alter table public.lesson_recurring       add column if not exists teacher_id int not null default 1;

-- 3) Fremdschluessel (idempotent: erst droppen, dann anlegen)
alter table public.lesson_teacher_settings drop constraint if exists fk_lts_teacher;
alter table public.lesson_teacher_settings add  constraint fk_lts_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.teacher_google          drop constraint if exists fk_tg_teacher;
alter table public.teacher_google          add  constraint fk_tg_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.lesson_blocks           drop constraint if exists fk_lb_teacher;
alter table public.lesson_blocks           add  constraint fk_lb_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.lesson_bookings         drop constraint if exists fk_lbk_teacher;
alter table public.lesson_bookings         add  constraint fk_lbk_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.lesson_subscriptions    drop constraint if exists fk_lsub_teacher;
alter table public.lesson_subscriptions    add  constraint fk_lsub_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.lesson_credit_grants    drop constraint if exists fk_lcg_teacher;
alter table public.lesson_credit_grants    add  constraint fk_lcg_teacher foreign key (teacher_id) references public.teachers(id);
alter table public.lesson_recurring        drop constraint if exists fk_lr_teacher;
alter table public.lesson_recurring        add  constraint fk_lr_teacher foreign key (teacher_id) references public.teachers(id);

-- 4) Je Lehrer genau EINE Einstellungs-/Google-Zeile
create unique index if not exists uniq_teacher_settings_teacher on public.lesson_teacher_settings(teacher_id);
create unique index if not exists uniq_teacher_google_teacher   on public.teacher_google(teacher_id);

-- 5) Eindeutigkeit zukunftssicher pro Lehrer statt global
--    (Zwei Lehrer duerfen dieselbe Uhrzeit haben; ein Schueler eine feste Zeit je Lehrer.)
drop index if exists public.uniq_active_slot;
create unique index if not exists uniq_active_slot_teacher
  on public.lesson_bookings (teacher_id, starts_at) where status = 'booked';
drop index if exists public.uniq_active_recurring;
create unique index if not exists uniq_active_recurring_teacher
  on public.lesson_recurring (student_id, teacher_id) where status = 'active';

-- Kontrolle: die Lehrer + wie viele Buchungen jedem zugeordnet sind
select t.id, t.name, t.active,
       (select count(*) from public.lesson_bookings b where b.teacher_id = t.id) as bookings
from public.teachers t order by t.sort_order;
