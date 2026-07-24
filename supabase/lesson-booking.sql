-- ============================================================================
-- 1-zu-1 Stunden – Phase 2: Verfügbarkeit, Buchungen, 24-h-Absage.
-- Setzt Phase 1 (lesson_credit_grants) voraus. Idempotent.
-- ============================================================================

-- Deine Verfügbarkeit + Einstellungen (eine Zeile, im Lehrerbereich editierbar).
create table if not exists public.lesson_teacher_settings (
  id int primary key default 1,
  timezone text not null default 'Europe/Berlin',   -- deine Zeitzone
  slot_minutes int not null default 50,
  lead_hours int not null default 12,                -- frühestens X h im Voraus buchbar
  horizon_days int not null default 28,              -- höchstens X Tage im Voraus
  buffer_minutes int not null default 10,            -- Pause zwischen Stunden
  weekly jsonb not null default '[]',                -- [{ "weekday":1, "start":"09:00", "end":"17:00" }]
  constraint single_row check (id = 1)
);
insert into public.lesson_teacher_settings (id) values (1) on conflict (id) do nothing;

alter table public.lesson_teacher_settings enable row level security;
drop policy if exists "anyone reads lesson settings" on public.lesson_teacher_settings;
create policy "anyone reads lesson settings" on public.lesson_teacher_settings
  for select using (auth.uid() is not null);
drop policy if exists "teacher writes lesson settings" on public.lesson_teacher_settings;
create policy "teacher writes lesson settings" on public.lesson_teacher_settings
  for update using (public.is_teacher());

-- Einmalige Blocker (Urlaub, Termine) – blenden Slots aus.
create table if not exists public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  note text default ''
);
alter table public.lesson_blocks enable row level security;
drop policy if exists "anyone reads blocks" on public.lesson_blocks;
create policy "anyone reads blocks" on public.lesson_blocks
  for select using (auth.uid() is not null);
drop policy if exists "teacher writes blocks" on public.lesson_blocks;
create policy "teacher writes blocks" on public.lesson_blocks
  for all using (public.is_teacher()) with check (public.is_teacher());

-- Buchungen.
create table if not exists public.lesson_bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'booked',   -- booked | cancelled_free | cancelled_late | completed | no_show
  grant_id uuid,                            -- konsumierte Guthaben-Zeile
  google_event_id text,
  meet_link text,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);
-- Doppelbuchung verhindern: pro Startzeit max. eine aktive Buchung.
create unique index if not exists uniq_active_slot on public.lesson_bookings (starts_at) where status = 'booked';
create index if not exists idx_bookings_student on public.lesson_bookings (student_id, starts_at);

alter table public.lesson_bookings enable row level security;
drop policy if exists "student reads own bookings" on public.lesson_bookings;
create policy "student reads own bookings" on public.lesson_bookings
  for select using (student_id = auth.uid());
drop policy if exists "teacher reads all bookings" on public.lesson_bookings;
create policy "teacher reads all bookings" on public.lesson_bookings
  for select using (public.is_teacher());
drop policy if exists "teacher updates bookings" on public.lesson_bookings;
create policy "teacher updates bookings" on public.lesson_bookings
  for update using (public.is_teacher());
-- Buchen/Absagen läuft über die SECURITY-DEFINER-Funktionen unten.

-- Belegte Slots (nur Startzeiten, ohne zu verraten wer) – für die Slot-Anzeige.
create or replace function public.taken_lesson_slots(p_from timestamptz, p_to timestamptz)
returns setof timestamptz language sql security definer stable as $$
  select starts_at from public.lesson_bookings
   where status = 'booked' and starts_at >= p_from and starts_at < p_to;
$$;

-- Buchen: Vorlauf/Horizont + Verfügbarkeitsfenster + Blocker + Überlappung +
-- Guthaben. Zieht 1 Stunde ab. (Siehe auch lesson-booking-hardening.sql.)
create or replace function public.book_lesson(p_start timestamptz)
returns uuid language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  s public.lesson_teacher_settings;
  v_end timestamptz;
  v_local timestamp;
  v_dow int;
  v_mins int;
  v_ok boolean;
  v_grant uuid;
  v_booking uuid;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into s from public.lesson_teacher_settings where id = 1;
  v_end := p_start + make_interval(mins => coalesce(s.slot_minutes, 50));

  if p_start < now() + make_interval(hours => coalesce(s.lead_hours, 12)) then
    raise exception 'too_soon';
  end if;
  if p_start > now() + make_interval(days => coalesce(s.horizon_days, 28)) then
    raise exception 'too_far';
  end if;

  -- Muss in ein wöchentliches Verfügbarkeitsfenster passen (Lehrer-Zeitzone).
  v_local := p_start at time zone coalesce(s.timezone, 'Europe/Berlin');
  v_dow  := extract(dow from v_local);                       -- 0=So..6=Sa
  v_mins := extract(hour from v_local) * 60 + extract(minute from v_local);
  select exists (
    select 1 from jsonb_array_elements(coalesce(s.weekly, '[]'::jsonb)) w
     where (w->>'weekday')::int = v_dow
       and v_mins >= split_part(w->>'start', ':', 1)::int * 60 + split_part(w->>'start', ':', 2)::int
       and v_mins + coalesce(s.slot_minutes, 50)
             <= split_part(w->>'end', ':', 1)::int * 60 + split_part(w->>'end', ':', 2)::int
  ) into v_ok;
  if not v_ok then raise exception 'outside_hours'; end if;

  if exists (
    select 1 from public.lesson_blocks where p_start < ends_at and v_end > starts_at
  ) then raise exception 'blocked'; end if;

  if exists (
    select 1 from public.lesson_bookings
     where status = 'booked' and p_start < ends_at and v_end > starts_at
  ) then raise exception 'slot_taken'; end if;

  select id into v_grant from public.lesson_credit_grants
    where user_id = uid and credits_remaining > 0 and expires_at > now()
    order by expires_at asc limit 1
    for update;
  if v_grant is null then raise exception 'no_credits'; end if;

  update public.lesson_credit_grants set credits_remaining = credits_remaining - 1 where id = v_grant;

  insert into public.lesson_bookings (student_id, starts_at, ends_at, status, grant_id)
    values (uid, p_start, v_end, 'booked', v_grant)
    returning id into v_booking;

  return v_booking;
exception when unique_violation then
  raise exception 'slot_taken';
end;
$$;

-- Absagen: Lehrer-Absage IMMER erstatten; Schüler-Absage nur >24 h vorher.
-- Erstattung geht auf die ursprünglich verbrauchte Gutschrift zurück.
create or replace function public.cancel_lesson(p_booking uuid)
returns text language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  b public.lesson_bookings;
  by_teacher boolean;
  is_free boolean;
  v_grant public.lesson_credit_grants;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into b from public.lesson_bookings where id = p_booking;
  if b.id is null then raise exception 'not_found'; end if;
  by_teacher := public.is_teacher();
  if b.student_id <> uid and not by_teacher then raise exception 'forbidden'; end if;
  if b.status <> 'booked' then raise exception 'not_active'; end if;

  is_free := by_teacher or b.starts_at > now() + interval '24 hours';

  update public.lesson_bookings
     set status = case when is_free then 'cancelled_free' else 'cancelled_late' end,
         cancelled_at = now()
   where id = b.id;

  if is_free then
    if b.grant_id is not null then
      select * into v_grant from public.lesson_credit_grants where id = b.grant_id;
    end if;
    if v_grant.id is not null and v_grant.expires_at > now() then
      update public.lesson_credit_grants set credits_remaining = credits_remaining + 1 where id = v_grant.id;
    else
      insert into public.lesson_credit_grants (user_id, credits_granted, credits_remaining, expires_at)
        values (b.student_id, 1, 1, now() + interval '35 days');
    end if;
  end if;

  return case when is_free then 'refunded' else 'forfeited' end;
end;
$$;

grant execute on function public.taken_lesson_slots(timestamptz, timestamptz) to authenticated;
grant execute on function public.book_lesson(timestamptz) to authenticated;
grant execute on function public.cancel_lesson(uuid) to authenticated;
