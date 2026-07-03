-- Automatische Pushover-Benachrichtigungen (laufen 24/7 auf den Supabase-Servern).
-- Im SQL Editor einfügen und "Run".
--
-- Du wirst benachrichtigt bei:
--   🎉 neuem Schüler (Konto erstellt)
--   💬 neuer Schüler-Nachricht an dich
--   ✍️ neuer Schreibaufgabe

-- 1) HTTP-Erweiterung aktivieren (erlaubt der Datenbank, Pushover aufzurufen).
create extension if not exists pg_net with schema extensions;

-- 2) Benachrichtigungs-Funktion.
create or replace function public.notify_pushover()
returns trigger language plpgsql security definer as $$
declare
  who text;
  title text;
  msg text;
begin
  if tg_table_name = 'messages' then
    -- Nur echte Schüler-Nachrichten (nicht eigene Antworten / Auto-Antwort).
    if new.sender <> 'student' then return new; end if;
    select full_name into who from public.profiles where id = new.student_id;
    title := '💬 New message';
    msg := coalesce(who, 'A student') || ': ' || left(new.body, 160);

  elsif tg_table_name = 'writing_submissions' then
    select full_name into who from public.profiles where id = new.user_id;
    title := '✍️ New writing submission';
    msg := coalesce(who, 'A student') || ' submitted: ' || left(new.prompt, 120);

  elsif tg_table_name = 'profiles' then
    -- Neuer Schüler hat ein Konto erstellt.
    title := '🎉 New student';
    msg := coalesce(new.full_name, 'A new student') || ' just joined!';

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

-- 3) Auslöser auf den drei Tabellen.
drop trigger if exists pushover_on_new_student on public.profiles;
create trigger pushover_on_new_student after insert on public.profiles
  for each row execute function public.notify_pushover();

drop trigger if exists pushover_on_message on public.messages;
create trigger pushover_on_message after insert on public.messages
  for each row execute function public.notify_pushover();

drop trigger if exists pushover_on_writing on public.writing_submissions;
create trigger pushover_on_writing after insert on public.writing_submissions
  for each row execute function public.notify_pushover();

-- Falls du den Lektions-Auslöser zuvor schon angelegt hattest: entfernen.
drop trigger if exists pushover_on_lesson_done on public.lesson_progress;
