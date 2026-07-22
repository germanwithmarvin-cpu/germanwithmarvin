-- ============================================================================
-- TRAINING: Aufgaben-Trakt ("App in der App")
-- ----------------------------------------------------------------------------
-- Vier Tabellen + RLS + die Muster-Einheit "Verb position".
-- Im Supabase SQL-Editor einfügen und "Run". Idempotent.
--
-- Bewusst in einfachen, einzelnen Anweisungen gehalten (keine CTE, keine
-- Spalten-Aliaslisten), damit es auch in Editoren laeuft, die Skripte an
-- Semikolons zerlegen.
-- ============================================================================

-- 1) Einheiten -------------------------------------------------------------
create table if not exists public.tr_units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null default '',
  level text not null default 'A1',
  theory text not null default '',
  lesson_id text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Aufgaben --------------------------------------------------------------
create table if not exists public.tr_exercises (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  kind text not null,
  prompt text not null,
  data jsonb not null default '{}'::jsonb,
  solution jsonb not null default '{}'::jsonb,
  explanation text not null default '',
  hint text not null default '',
  sort_order int not null default 0
);

create index if not exists tr_exercises_unit_idx on public.tr_exercises (unit_id, sort_order);

-- 3) Fortschritt je Schueler und Einheit -----------------------------------
create table if not exists public.tr_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id uuid not null references public.tr_units(id) on delete cascade,
  mastery int not null default 0,
  attempts int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

-- 4) Einzelne Antworten ----------------------------------------------------
create table if not exists public.tr_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.tr_exercises(id) on delete cascade,
  correct boolean not null,
  given text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists tr_attempts_user_idx on public.tr_attempts (user_id, created_at desc);

-- RLS ----------------------------------------------------------------------
alter table public.tr_units enable row level security;

alter table public.tr_exercises enable row level security;

alter table public.tr_progress enable row level security;

alter table public.tr_attempts enable row level security;

drop policy if exists tr_units_read on public.tr_units;

create policy tr_units_read on public.tr_units for select to authenticated using (is_published);

drop policy if exists tr_exercises_read on public.tr_exercises;

create policy tr_exercises_read on public.tr_exercises for select to authenticated using (true);

drop policy if exists tr_progress_own on public.tr_progress;

create policy tr_progress_own on public.tr_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tr_attempts_own on public.tr_attempts;

create policy tr_attempts_own on public.tr_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ============================================================================
