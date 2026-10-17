-- ============================================================================
-- Google-Kalender-Verknuepfungen der KUENFTIGEN Buchungen loesen, damit
-- "Sync lessons -> Google" sie im NEU verbundenen Konto (marvin.h.graf) neu
-- anlegt. REIHENFOLGE:
--   1) In der App Google auf marvin.h.graf UMVERBINDEN
--   2) dieses SQL ausfuehren
--   3) im Students-Tab "Sync lessons -> Google" klicken
-- Danach die alten Termine im germanwithmarvin.com-Kalender manuell loeschen.
-- ============================================================================

update public.lesson_bookings
set google_event_id = null, meet_link = null
where status = 'booked' and starts_at > now();

select count(*) as zurueckgesetzt
from public.lesson_bookings
where status = 'booked' and starts_at > now();
