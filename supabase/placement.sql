-- ============================================================================
-- EINSTUFUNGSTEST (free placement test) für die öffentliche Ad-Landing /level-test.
-- Mehrteilig: Vokabeln / Grammatik / Lesen / Hören. Öffentlich (anonym) LESBAR,
-- nur Lehrer schreibt. Idempotent. Hör-Audios nimmt Marvin im Lehrerbereich auf.
-- ============================================================================

create table if not exists public.placement_questions (
  id uuid primary key default gen_random_uuid(),
  qkey text,                             -- stabiler Schlüssel fürs idempotente Seed (Audio bleibt erhalten)
  section text not null,                 -- vocab | grammar | reading | listening
  level text not null,                   -- A1 | A2 | B1 | B2
  grp int not null default 0,            -- gruppiert Lese-/Hör-Reiz mit seinen Fragen
  kind text not null,                    -- passage | audio | choice
  prompt text not null default '',
  body text not null default '',         -- Lesetext bzw. Hör-Transkript
  audio_url text,
  options jsonb not null default '[]'::jsonb,   -- ["a","b","c"]
  correct int,                           -- 0-basierter Index
  sort_order int not null default 0,
  is_published boolean not null default true
);
alter table public.placement_questions add column if not exists qkey text;
create unique index if not exists placement_qkey on public.placement_questions(qkey);
create index if not exists placement_order on public.placement_questions(sort_order);

alter table public.placement_questions enable row level security;

-- Öffentlich lesbar (anonym + eingeloggt), solange veröffentlicht; Lehrer sieht alles.
drop policy if exists "placement read" on public.placement_questions;
create policy "placement read" on public.placement_questions
  for select to anon, authenticated using (is_published or public.is_teacher());

-- Nur Lehrer schreibt.
drop policy if exists "placement write" on public.placement_questions;
create policy "placement write" on public.placement_questions
  for all to authenticated using (public.is_teacher()) with check (public.is_teacher());

grant select on public.placement_questions to anon, authenticated;
grant insert, update, delete on public.placement_questions to authenticated;
