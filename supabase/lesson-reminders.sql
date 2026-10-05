-- Erinnerungs-Mails für Stunden: merkt sich, ob für eine Buchung schon eine
-- Reminder-Mail rausging (damit der Cron sie nicht doppelt verschickt).
alter table public.lesson_bookings
  add column if not exists reminded_at timestamptz;

-- Schneller Zugriff für den Cron: offene, noch nicht erinnerte Buchungen.
create index if not exists lesson_bookings_reminder_idx
  on public.lesson_bookings (starts_at)
  where status = 'booked' and reminded_at is null;
