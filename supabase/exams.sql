-- ============================================================================
-- PRÜFUNGSTRAINER (exam trainer) — Schema + RLS. Idempotent, erneut ausführbar.
-- Mock-Prüfungen (Goethe/telc-Mix) pro Level mit Lesen / Hören / Schreiben.
-- Lesen & Hören werden automatisch ausgewertet, Schreiben per KI (Haiku).
-- Teacher schreibt (is_teacher()), eingeloggte Nutzer lesen veröffentlichte Papers.
-- ============================================================================

-- ---- PAPERS (eine Prüfung = Level + Variante 1..3) -------------------------
create table if not exists public.exam_papers (
  id uuid primary key default gen_random_uuid(),
  level text not null,                      -- A1 / A2 / B1 / B2
  variant int not null default 1,           -- 1..3
  title text not null,
  subtitle text not null default '',
  is_published boolean not null default false,
  is_sample boolean not null default false, -- im Trial zugänglich (Häppchen)
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level, variant)
);

-- ---- SECTIONS (Module innerhalb einer Prüfung) -----------------------------
create table if not exists public.exam_sections (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.exam_papers(id) on delete cascade,
  module text not null,                     -- reading / listening / writing
  title text not null,
  instructions text not null default '',
  time_minutes int not null default 0,      -- Richtzeit (Timer) in Minuten
  sort_order int not null default 0
);
create index if not exists exam_sections_paper on public.exam_sections(paper_id);

-- ---- ITEMS (Reize + Fragen) ------------------------------------------------
-- kind:
--   'passage' = Lesetext (body)            'audio' = Hör-Clip (body=Transkript, audio_url)
--   'choice'  = Multiple Choice            'gap'   = Lücke/kurze Freitext-Antwort
--   'writing' = freie Schreibaufgabe (KI-Korrektur)
-- grp gruppiert einen Text/Clip mit seinen Fragen.
create table if not exists public.exam_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.exam_sections(id) on delete cascade,
  grp int not null default 0,
  kind text not null,
  prompt text not null default '',
  body text not null default '',            -- Lesetext bzw. Hör-Transkript
  audio_url text,
  data jsonb not null default '{}'::jsonb,   -- { "options": ["...","..."] }
  solution jsonb not null default '{}'::jsonb, -- choice: {"correct":0} · gap: {"answers":["..."]}
  points int not null default 1,
  min_words int,
  max_words int,
  sort_order int not null default 0
);
create index if not exists exam_items_section on public.exam_items(section_id);

-- ---- ATTEMPTS (ein Prüfungsdurchlauf eines Nutzers) ------------------------
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id uuid not null references public.exam_papers(id) on delete cascade,
  status text not null default 'in_progress', -- in_progress / submitted
  reading_score int, reading_max int,
  listening_score int, listening_max int,
  writing_score int, writing_max int,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists exam_attempts_user on public.exam_attempts(user_id, started_at desc);

-- ---- ANSWERS (auto-ausgewertete Items) -------------------------------------
create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  item_id uuid not null references public.exam_items(id) on delete cascade,
  given text,
  correct boolean,
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique (attempt_id, item_id)
);

-- ---- WRITING (freie Texte + KI-Feedback) -----------------------------------
create table if not exists public.exam_writing (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.exam_attempts(id) on delete set null,
  item_id uuid references public.exam_items(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  level text,
  prompt text,
  text text not null,
  ai_score int,
  ai_max int,
  ai_feedback jsonb,          -- { summary, band, criteria:[{name,score,max,note}], corrections:[{original,better,why}] }
  model text,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  status text not null default 'graded',
  created_at timestamptz not null default now()
);
create index if not exists exam_writing_user on public.exam_writing(user_id, created_at desc);

-- ---- AI-USAGE (Token-Zähler fürs Limit; server-seitig geschrieben) ---------
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  feature text not null default 'writing',
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_day on public.ai_usage(user_id, created_at desc);
create index if not exists ai_usage_created on public.ai_usage(created_at);

-- ============================ RLS ===========================================
alter table public.exam_papers   enable row level security;
alter table public.exam_sections enable row level security;
alter table public.exam_items    enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers  enable row level security;
alter table public.exam_writing  enable row level security;
alter table public.ai_usage      enable row level security;

-- Papers: eingeloggte sehen veröffentlichte; Lehrer sehen alles + schreiben.
drop policy if exists "exam_papers read" on public.exam_papers;
create policy "exam_papers read" on public.exam_papers
  for select to authenticated using (is_published or public.is_teacher());
drop policy if exists "exam_papers write" on public.exam_papers;
create policy "exam_papers write" on public.exam_papers
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Sections/Items: lesbar, wenn das Paper veröffentlicht ist (oder Lehrer); Lehrer schreibt.
drop policy if exists "exam_sections read" on public.exam_sections;
create policy "exam_sections read" on public.exam_sections
  for select to authenticated using (
    public.is_teacher() or exists (
      select 1 from public.exam_papers p where p.id = paper_id and p.is_published));
drop policy if exists "exam_sections write" on public.exam_sections;
create policy "exam_sections write" on public.exam_sections
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "exam_items read" on public.exam_items;
create policy "exam_items read" on public.exam_items
  for select to authenticated using (
    public.is_teacher() or exists (
      select 1 from public.exam_sections s join public.exam_papers p on p.id = s.paper_id
      where s.id = section_id and p.is_published));
drop policy if exists "exam_items write" on public.exam_items;
create policy "exam_items write" on public.exam_items
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- Attempts/Answers/Writing: jeder sieht/schreibt seine eigenen; Lehrer darf lesen.
drop policy if exists "exam_attempts own" on public.exam_attempts;
create policy "exam_attempts own" on public.exam_attempts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "exam_attempts teacher read" on public.exam_attempts;
create policy "exam_attempts teacher read" on public.exam_attempts
  for select to authenticated using (public.is_teacher());

drop policy if exists "exam_answers own" on public.exam_answers;
create policy "exam_answers own" on public.exam_answers
  for all to authenticated using (
    exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()))
  with check (
    exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = auth.uid()));

drop policy if exists "exam_writing own" on public.exam_writing;
create policy "exam_writing own" on public.exam_writing
  for select to authenticated using (user_id = auth.uid() or public.is_teacher());
-- Inserts in exam_writing + ai_usage passieren server-seitig (Service-Role, bypass RLS).

drop policy if exists "ai_usage own read" on public.ai_usage;
create policy "ai_usage own read" on public.ai_usage
  for select to authenticated using (user_id = auth.uid() or public.is_teacher());

grant select, insert, update, delete on
  public.exam_papers, public.exam_sections, public.exam_items,
  public.exam_attempts, public.exam_answers to authenticated;
grant select on public.exam_writing, public.ai_usage to authenticated;
