-- ============================================================================
-- GRAMMATIK-CHECK: Ergebnisse
-- ----------------------------------------------------------------------------
-- Eine Zeile je Thema und Durchlauf. Der Schueler sieht seine eigenen Zeilen,
-- der Lehrer sieht alle - damit Marvin vor einer 1-zu-1-Stunde nachsehen kann,
-- woran es hakt.
--
-- Im Supabase SQL-Editor einfuegen und "Run". Idempotent.
-- ============================================================================

create table if not exists public.tr_check_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_slug text not null,
  correct int not null default 0,
  total int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tr_check_user_idx on public.tr_check_results (user_id, created_at desc);

alter table public.tr_check_results enable row level security;

drop policy if exists "read own or teacher" on public.tr_check_results;

create policy "read own or teacher" on public.tr_check_results
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_teacher)
  );

drop policy if exists "insert own" on public.tr_check_results;

create policy "insert own" on public.tr_check_results
  for insert to authenticated
  with check (user_id = auth.uid());
