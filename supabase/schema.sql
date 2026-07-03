-- German Simplified — Datenbank-Schema
-- So benutzt du es: Supabase öffnen → linkes Menü "SQL Editor" → "New query"
-- → diesen gesamten Text einfügen → "Run". Fertig.

-- 1) Profil-Tabelle: ein Eintrag pro Schüler (verknüpft mit dem Login).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  xp integer not null default 0,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Fortschritt: welche Lektion ein Schüler abgeschlossen hat.
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- 3) Schreibaufgaben, die Schüler einreichen.
create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  body text not null,
  feedback text,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

-- Sicherheit: jeder Schüler darf nur seine eigenen Daten sehen/ändern (Row Level Security).
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.writing_submissions enable row level security;

create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create policy "own progress read"   on public.lesson_progress for select using (auth.uid() = user_id);
create policy "own progress insert" on public.lesson_progress for insert with check (auth.uid() = user_id);

create policy "own writing read"   on public.writing_submissions for select using (auth.uid() = user_id);
create policy "own writing insert" on public.writing_submissions for insert with check (auth.uid() = user_id);

-- Beim Registrieren automatisch ein Profil anlegen.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
