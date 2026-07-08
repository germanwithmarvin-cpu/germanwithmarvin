-- Fuegt den An/Aus-Schalter fuers Quiz pro Lektion hinzu.
-- Quiz ist standardmaessig AUS (opt-in): erst aktivieren, dann erscheint ein Quiz.
-- Mehrfach ausfuehrbar.
alter table public.lessons
  add column if not exists quiz_enabled boolean not null default false;
