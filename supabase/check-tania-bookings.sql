-- Tanias Buchungen: Status, Join-Link, Kalender-Verknuepfung. Im SQL-Editor "Run".
select b.starts_at, b.ends_at, b.status,
       (b.meet_link is not null)       as hat_join_link,
       (b.google_event_id is not null) as im_google_kalender
from public.lesson_bookings b
where b.student_id = (select id from auth.users where lower(email)=lower('taniaamanco@gmail.com'))
order by b.starts_at;
