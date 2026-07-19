-- ============================================================================
-- 1-zu-1 Stunden – Phase 3: Google-Kalender-Verbindung des Lehrers.
-- Speichert NUR den Refresh-Token (serverseitig). Keine Lese-Policy → nur der
-- Service-Role-Zugriff (API-Routen) kommt dran; Schüler sehen den Token nie.
-- Idempotent.
-- ============================================================================

create table if not exists public.teacher_google (
  id int primary key default 1,
  refresh_token text,
  connected_email text,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.teacher_google enable row level security;
-- Absichtlich KEINE Policies: normale Nutzer haben keinen Zugriff.
-- Nur der Service-Role-Key (in den Google-API-Routen) liest/schreibt hier.
