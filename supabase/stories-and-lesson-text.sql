-- ============================================================================
-- Update: Text unter dem Video (Skool-Stil) + neuer Geschichten-Bereich.
-- Mehrfach ausfuehrbar (idempotent).
-- ============================================================================

-- 1) Freitext unter dem Video pro Lektion
alter table public.lessons
  add column if not exists body text not null default '';

-- (Sicherheitshalber, falls noch nicht vorhanden: Quiz-Schalter)
alter table public.lessons
  add column if not exists quiz_enabled boolean not null default false;

-- 2) Geschichten (Lesetexte)
create table if not exists public.stories (
  id text primary key,
  title text not null default '',
  level text not null default 'A1',
  intro text not null default '',
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.stories enable row level security;

-- Lesen: fuer alle sichtbar (Zugriffssteuerung passiert in der App per Level/Code).
drop policy if exists "stories readable" on public.stories;
create policy "stories readable" on public.stories for select using (true);

-- Schreiben/Bearbeiten/Loeschen: nur Lehrer.
drop policy if exists "stories teacher insert" on public.stories;
create policy "stories teacher insert" on public.stories for insert with check (public.is_teacher());

drop policy if exists "stories teacher update" on public.stories;
create policy "stories teacher update" on public.stories for update using (public.is_teacher());

drop policy if exists "stories teacher delete" on public.stories;
create policy "stories teacher delete" on public.stories for delete using (public.is_teacher());
