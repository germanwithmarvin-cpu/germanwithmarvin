-- Terminbuchung in der Datenbank. Im SQL Editor einfügen und "Run".

-- HTTP-Erweiterung sicherstellen (für die Push-Benachrichtigung bei Buchungen).
create extension if not exists pg_net with schema extensions;

-- 1) Deine Verfügbarkeit (eine Zeile, von dir im Lehrer-Bereich editierbar).
create table if not exists public.teacher_settings (
  id integer primary key default 1,
  weekdays integer[] not null default '{1,2,3,4,5}',          -- 0=So,1=Mo,…,6=Sa
  slots text[] not null default '{"09:00","10:00","11:00","14:00","15:00","16:00","17:00"}',
  session_minutes integer not null default 50,
  constraint single_row check (id = 1)
);
insert into public.teacher_settings (id) values (1) on conflict (id) do nothing;

alter table public.teacher_settings enable row level security;
drop policy if exists "anyone reads settings" on public.teacher_settings;
create policy "anyone reads settings" on public.teacher_settings
  for select using (auth.uid() is not null);
drop policy if exists "teacher updates settings" on public.teacher_settings;
create policy "teacher updates settings" on public.teacher_settings
  for update using (public.is_teacher());

-- 2) Buchungen.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  lesson_type text not null,
  starts_at timestamptz not null,
  duration_min integer not null default 50,
  status text not null default 'requested',   -- requested | confirmed | cancelled
  google_event_id text,                        -- für spätere Google-Kalender-Sync
  created_at timestamptz not null default now()
);
create index if not exists bookings_starts_idx on public.bookings (starts_at);

alter table public.bookings enable row level security;

drop policy if exists "student reads own bookings" on public.bookings;
create policy "student reads own bookings" on public.bookings
  for select using (student_id = auth.uid());
drop policy if exists "student creates own bookings" on public.bookings;
create policy "student creates own bookings" on public.bookings
  for insert with check (student_id = auth.uid());
drop policy if exists "teacher reads all bookings" on public.bookings;
create policy "teacher reads all bookings" on public.bookings
  for select using (public.is_teacher());
drop policy if exists "teacher updates bookings" on public.bookings;
create policy "teacher updates bookings" on public.bookings
  for update using (public.is_teacher());

-- 3) Belegte Zeiten: gibt nur die Startzeiten zurück (ohne zu verraten, wer gebucht hat),
--    damit die Buchungsseite belegte Slots ausblenden kann.
create or replace function public.taken_slots(from_ts timestamptz, to_ts timestamptz)
returns setof timestamptz language sql security definer stable as $$
  select starts_at from public.bookings
  where status <> 'cancelled' and starts_at >= from_ts and starts_at < to_ts;
$$;

-- 4) Pushover-Benachrichtigung um Buchungen erweitern.
--    (Ersetzt die Funktion komplett – enthält jetzt alle vier Auslöser.)
create or replace function public.notify_pushover()
returns trigger language plpgsql security definer as $$
declare
  who text;
  title text;
  msg text;
begin
  if tg_table_name = 'messages' then
    if new.sender <> 'student' then return new; end if;
    select full_name into who from public.profiles where id = new.student_id;
    title := '💬 New message';
    msg := coalesce(who, 'A student') || ': ' || left(new.body, 160);

  elsif tg_table_name = 'writing_submissions' then
    select full_name into who from public.profiles where id = new.user_id;
    title := '✍️ New writing submission';
    msg := coalesce(who, 'A student') || ' submitted: ' || left(new.prompt, 120);

  elsif tg_table_name = 'profiles' then
    title := '🎉 New student';
    msg := coalesce(new.full_name, 'A new student') || ' just joined!';

  elsif tg_table_name = 'bookings' then
    select full_name into who from public.profiles where id = new.student_id;
    title := '📅 New booking';
    msg := coalesce(who, 'A student') || ' booked a ' || new.lesson_type ||
           ' for ' || to_char(new.starts_at, 'Dy DD Mon, HH24:MI');

  else
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.pushover.net/1/messages.json',
    body := jsonb_build_object(
      'token', 'atdbw6ui8o5x5nkhkzmgr6t4s5kvhp',
      'user', 'ujahi6rc1y1zr7tj6zo1uf7od6qv16',
      'title', title,
      'message', msg
    )
  );
  return new;
end;
$$;

drop trigger if exists pushover_on_booking on public.bookings;
create trigger pushover_on_booking after insert on public.bookings
  for each row execute function public.notify_pushover();
