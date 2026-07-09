-- Lehrer-Kontrolle: sichere Funktionen, die NUR fuer Lehrer Daten aller Schueler
-- zurueckgeben (Video-Abschluesse + Karteikarten-Fortschritt).
-- Setzt voraus, dass die Funktion public.is_teacher() existiert (siehe fix-lessons-rls.sql).
-- Mehrfach ausfuehrbar.

-- 1) Uebersicht ueber alle Schueler
create or replace function public.teacher_students()
returns table (
  student_id uuid,
  full_name text,
  email text,
  joined timestamptz,
  lessons_completed bigint,
  cards_learned bigint,
  cards_seen bigint,
  last_active timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(u.raw_user_meta_data->>'full_name', ''),
    u.email::text,
    p.created_at,
    (select count(*) from lesson_progress lp where lp.user_id = p.id),
    (select count(*) from fc_card_states s where s.user_id = p.id and s.repetitions >= 1),
    (select count(*) from fc_card_states s where s.user_id = p.id),
    (select max(r.reviewed_at) from fc_review_log r where r.user_id = p.id)
  from profiles p
  join auth.users u on u.id = p.id
  where public.is_teacher()
    and coalesce(p.is_teacher, false) = false
  order by p.created_at desc;
$$;

-- 2) Welche Lektionen hat EIN Schueler abgeschlossen?
create or replace function public.teacher_student_lessons(p_student uuid)
returns table (lesson_id text)
language sql
security definer
set search_path = public
as $$
  select lp.lesson_id
  from lesson_progress lp
  where lp.user_id = p_student
    and public.is_teacher();
$$;

-- 3) Karteikarten-Fortschritt EINES Schuelers je Level
create or replace function public.teacher_student_cards_by_level(p_student uuid)
returns table (level text, learned bigint, seen bigint)
language sql
security definer
set search_path = public
as $$
  select
    d.level,
    count(*) filter (where s.repetitions >= 1) as learned,
    count(*) as seen
  from fc_card_states s
  join fc_cards c on c.id = s.card_id
  join fc_decks d on d.id = c.deck_id
  where s.user_id = p_student
    and public.is_teacher()
  group by d.level
  order by d.level;
$$;

grant execute on function public.teacher_students() to authenticated;
grant execute on function public.teacher_student_lessons(uuid) to authenticated;
grant execute on function public.teacher_student_cards_by_level(uuid) to authenticated;
