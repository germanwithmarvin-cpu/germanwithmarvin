-- Diagnose: Warum keine Slots bei Thanh Ha (teacher_id = 2)?
select
  s.teacher_id,
  s.timezone,
  s.slot_minutes,
  s.lead_hours,
  s.horizon_days,
  jsonb_array_length(coalesce(s.weekly, $$[]$$::jsonb)) as anzahl_zeitfenster,
  s.weekly as zeitfenster,
  (g.refresh_token is not null) as google_verbunden
from public.lesson_teacher_settings s
left join public.teacher_google g on g.teacher_id = s.teacher_id
where s.teacher_id = 2;
