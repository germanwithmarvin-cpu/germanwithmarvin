-- Fuegt den An/Aus-Schalter fuers Quiz pro Lektion hinzu.
-- Bestehende Lektionen behalten ihr Quiz an (default true). Mehrfach ausfuehrbar.
alter table public.lessons
  add column if not exists quiz_enabled boolean not null default true;
