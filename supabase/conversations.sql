-- ============================================================================
-- KONVERSATIONEN Lehrer <-> Schueler (aus dem Banner heraus) - German Simplified
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor "Run". Idempotent. Setzt is_teacher() voraus.
--
-- Lehrer schreibt einem Schueler -> Schueler sieht nach Login ein Banner und
-- kann antworten -> Lehrer bekommt (optional) eine E-Mail und sieht die Antwort
-- im Lehrerbereich. Lehrer kann die Konversation komplett schliessen.
-- ============================================================================

create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references auth.users(id) on delete cascade,
  status          text not null default $$open$$,   -- open | closed
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create index if not exists conversations_student_idx on public.conversations(student_id);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender          text not null,                     -- teacher | student
  body            text not null,
  read_by_teacher boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx on public.messages(conversation_id);

alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- Lehrer: volle Kontrolle ueber alles.
drop policy if exists "conv teacher all" on public.conversations;
create policy "conv teacher all" on public.conversations
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "msg teacher all" on public.messages;
create policy "msg teacher all" on public.messages
  for all using (public.is_teacher()) with check (public.is_teacher());

-- Schueler: nur die EIGENE Konversation + deren Nachrichten lesen.
drop policy if exists "conv student read" on public.conversations;
create policy "conv student read" on public.conversations
  for select to authenticated using (student_id = auth.uid());

drop policy if exists "msg student read" on public.messages;
create policy "msg student read" on public.messages
  for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.student_id = auth.uid()));

-- Schueler: nur in die EIGENE, OFFENE Konversation und nur als 'student' antworten.
drop policy if exists "msg student insert" on public.messages;
create policy "msg student insert" on public.messages
  for insert to authenticated
  with check (
    sender = $$student$$
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.student_id = auth.uid() and c.status = $$open$$
    )
  );

select $$conversations.sql angewandt$$ as status;
