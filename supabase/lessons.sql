-- Lektionen in der Datenbank verwaltbar machen.
-- Im Supabase SQL Editor einfügen und "Run".

create table if not exists public.lessons (
  id text primary key,
  title text not null default '',
  level text not null default 'A1',
  topic text not null default '',
  description text not null default '',
  video_id text not null default '',
  duration_min integer not null default 0,
  xp integer not null default 100,
  quiz jsonb not null default '[]',         -- Liste von Quizfragen
  materials jsonb not null default '[]',    -- Liste von PDFs {title, url}
  sort_order integer not null default 0,    -- Reihenfolge im Lernpfad
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- Alle eingeloggten Nutzer dürfen Lektionen lesen.
drop policy if exists "anyone reads lessons" on public.lessons;
create policy "anyone reads lessons" on public.lessons
  for select using (auth.uid() is not null);

-- Nur Lehrer dürfen anlegen/ändern/löschen.
drop policy if exists "teacher inserts lessons" on public.lessons;
create policy "teacher inserts lessons" on public.lessons
  for insert with check (public.is_teacher());

drop policy if exists "teacher updates lessons" on public.lessons;
create policy "teacher updates lessons" on public.lessons
  for update using (public.is_teacher());

drop policy if exists "teacher deletes lessons" on public.lessons;
create policy "teacher deletes lessons" on public.lessons
  for delete using (public.is_teacher());

-- Die drei bestehenden Beispiel-Lektionen übernehmen (nur falls noch nicht vorhanden).
insert into public.lessons (id, title, level, topic, description, video_id, duration_min, xp, sort_order, materials, quiz)
values
(
  'artikel-der-die-das',
  'Der, die, das — understanding articles', 'A1', 'Grammar',
  'Learn how to recognise a noun''s gender and use the German articles with confidence.',
  'dQw4w9WgXcQ', 8, 100, 1,
  '[{"title":"Articles cheat sheet (PDF)","url":"/materials/example.pdf"}]',
  '[
    {"id":"q1","prompt":"Which article goes with “Sonne” (sun)?","options":[{"id":"a","text":"der"},{"id":"b","text":"die"},{"id":"c","text":"das"}],"correctOptionId":"b","explanation":"“Die Sonne” — most nouns ending in -e are feminine."},
    {"id":"q2","prompt":"Which article goes with “Mädchen” (girl)?","options":[{"id":"a","text":"der"},{"id":"b","text":"die"},{"id":"c","text":"das"}],"correctOptionId":"c","explanation":"“Das Mädchen” — nouns ending in -chen are always neuter (das)."}
  ]'
),
(
  'perfekt-vergangenheit',
  'The Perfekt — talking about the past', 'A2', 'Grammar',
  'How to form the Perfekt tense with “haben” and “sein” and speak naturally about the past.',
  'dQw4w9WgXcQ', 11, 150, 2,
  '[{"title":"Perfekt tense worksheet (PDF)","url":"/materials/example.pdf"}]',
  '[
    {"id":"q1","prompt":"“Ich ___ nach Berlin gefahren.” (I travelled to Berlin.)","options":[{"id":"a","text":"habe"},{"id":"b","text":"bin"},{"id":"c","text":"war"}],"correctOptionId":"b","explanation":"Verbs of motion (fahren, gehen) form the Perfekt with “sein”."}
  ]'
),
(
  'small-talk',
  'Small talk — starting a conversation', 'B1', 'Conversation',
  'Useful phrases to start a conversation in any situation.',
  'dQw4w9WgXcQ', 14, 200, 3,
  '[{"title":"Small talk phrases (PDF)","url":"/materials/example.pdf"}]',
  '[
    {"id":"q1","prompt":"Which reply is polite small talk?","options":[{"id":"a","text":"Was willst du? (What do you want?)"},{"id":"b","text":"Schönes Wetter heute, oder? (Nice weather today, right?)"},{"id":"c","text":"Keine Zeit. (No time.)"}],"correctOptionId":"b","explanation":"Talking about the weather is a classic, friendly way to open a conversation."}
  ]'
)
on conflict (id) do nothing;
