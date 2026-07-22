-- Word Rocket: Wochen-Bestenliste.
-- Tabelle für echte Scores + RLS + eine SECURITY-DEFINER-Funktion, die die
-- Wochen-Bestenliste liefert (echte Spieler + ein paar dezente Motivations-Namen,
-- damit die Liste nie leer wirkt). In Supabase → SQL Editor einfügen und ausführen.

create table if not exists public.fc_game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null default 'Student',
  score int not null check (score >= 0),
  created_at timestamptz not null default now()
);
create index if not exists fc_game_scores_created_idx on public.fc_game_scores (created_at desc);

alter table public.fc_game_scores enable row level security;

-- Jeder darf nur eigene Scores einfügen; direktes Lesen ist gesperrt
-- (die Bestenliste kommt ausschließlich aus der Funktion unten).
drop policy if exists "insert own score" on public.fc_game_scores;
create policy "insert own score" on public.fc_game_scores
  for insert to authenticated with check (user_id = auth.uid());

-- Wochen-Bestenliste: bester Score je echtem Spieler seit Wochenbeginn (Mo)
-- plus feste Motivations-Namen mit leicht wochenweise schwankenden Punkten.
create or replace function public.game_leaderboard_weekly()
returns table(rank int, name text, score int, is_me boolean)
language sql
security definer
set search_path = public
as $$
  with wk as (select date_trunc('week', now()) as start),
  real as (
    select s.user_id,
           split_part(coalesce(nullif(s.player_name, ''), 'Student'), ' ', 1) as name,
           max(s.score) as score
    from public.fc_game_scores s, wk
    where s.created_at >= wk.start
    group by s.user_id, split_part(coalesce(nullif(s.player_name, ''), 'Student'), ' ', 1)
  ),
  bots as (
    select null::uuid as user_id,
           b.name,
           b.base + (((extract(week from now())::int * b.k) % 47) - 23) as score
    from (values
      -- Kein "Lena" hier: so heisst die Lernbegleiterin im Trainingsbereich.
      ('Mira', 640, 7), ('Jonas', 560, 11), ('Sofia', 500, 13), ('Mateo', 430, 17),
      ('Emma', 370, 19), ('Noah', 310, 23), ('Yuki', 260, 29), ('Ben', 200, 31)
    ) as b(name, base, k)
  ),
  allrows as (
    select user_id, name, score from real
    union all
    select user_id, name, score from bots
  )
  select (row_number() over (order by score desc, name))::int as rank,
         name,
         score::int,
         (user_id is not null and user_id = auth.uid()) as is_me
  from allrows
  order by score desc, name
  limit 12;
$$;

grant execute on function public.game_leaderboard_weekly() to authenticated;
