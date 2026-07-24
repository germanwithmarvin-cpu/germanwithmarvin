-- ============================================================================
-- Vokabel-Aufräumen 1: ECHTE Karten-Kopien entfernen.
-- Betrifft nur Karten, bei denen Deutsch + Übersetzung + Beispiel IDENTISCH sind
-- (32 Stück). Behält je eine — bevorzugt im niedrigsten Level (A1 vor A2 …).
-- Löscht KEINE Decks und keinen Fortschritt, nur redundante Karten-Zeilen.
-- Gefahrlos; nach dem Lauf gibt es keine identischen Kopien mehr.
-- ============================================================================

with ranked as (
  select c.id,
    row_number() over (
      partition by lower(btrim(c.front)), lower(btrim(c.back)), lower(btrim(c.example))
      order by case d.level when 'A1' then 1 when 'A2' then 2 when 'B1' then 3 when 'B2' then 4 else 5 end, c.id
    ) as rn
  from public.fc_cards c
  join public.fc_decks d on d.id = c.deck_id
)
delete from public.fc_cards
where id in (select id from ranked where rn > 1);

-- Kontrolle: verbleibende Kartenzahl
select count(*) as karten_gesamt from public.fc_cards;
