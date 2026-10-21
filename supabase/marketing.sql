-- ============================================================================
-- Marketing: abgeschlossene Level-Tests speichern (nur Ergebnis + Zeit + Quelle,
-- KEINE sensiblen Daten). Geschrieben/gelesen ausschließlich über die Service-Role
-- (öffentliche API /api/level-test-done bzw. Admin /api/admin/metrics).
-- ============================================================================

create table if not exists public.level_test_results (
  id uuid primary key default gen_random_uuid(),
  result_level text,                 -- A1 | A2 | B1 | B2
  utm_source text,
  utm_medium text,
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists level_test_results_created on public.level_test_results(created_at);

-- RLS an, KEINE Policies → anon/authenticated haben keinen Zugriff; nur
-- service_role (API-Routen) umgeht RLS.
alter table public.level_test_results enable row level security;
revoke all on public.level_test_results from anon, authenticated;
