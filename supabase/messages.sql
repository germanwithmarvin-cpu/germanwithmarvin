-- Echtes Nachrichtensystem (Schüler ↔ Lehrer).
-- Im Supabase SQL Editor einfügen und "Run".

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade, -- wem der Gesprächsfaden gehört
  sender text not null check (sender in ('student', 'teacher', 'system')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_student_idx on public.messages (student_id, created_at);

alter table public.messages enable row level security;

-- Schüler: nur den eigenen Gesprächsfaden lesen und darin schreiben.
drop policy if exists "student reads own messages" on public.messages;
create policy "student reads own messages" on public.messages
  for select using (student_id = auth.uid());

drop policy if exists "student writes own messages" on public.messages;
create policy "student writes own messages" on public.messages
  for insert with check (student_id = auth.uid() and sender in ('student', 'system'));

-- Lehrer: alle Gesprächsfäden lesen und antworten.
drop policy if exists "teacher reads all messages" on public.messages;
create policy "teacher reads all messages" on public.messages
  for select using (public.is_teacher());

drop policy if exists "teacher writes messages" on public.messages;
create policy "teacher writes messages" on public.messages
  for insert with check (public.is_teacher() and sender = 'teacher');
