-- Has Verfuegbarkeit pruefen (teacher_id = 2). Im Supabase SQL-Editor "Run".
select teacher_id, timezone, slot_minutes, lead_hours, horizon_days,
       jsonb_array_length(coalesce(weekly, '[]'::jsonb)) as anzahl_zeitfenster,
       weekly
from public.lesson_teacher_settings
where teacher_id = 2;

select starts_at, ends_at from public.lesson_blocks where teacher_id = 2 order by starts_at;
