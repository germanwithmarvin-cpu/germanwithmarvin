-- ============================================================================
-- A2 VOKABEL-AUSBAU · Batch 1 (ADD-ONLY, 180 neue Karten)
-- ----------------------------------------------------------------------------
-- Im Supabase SQL-Editor einfügen und "Run".
--
-- WICHTIG: Diese Datei loescht NICHTS. Sie fuegt nur neue Karten in die bereits
-- vorhandenen A2-Decks ein (per Deck-Titel + Besitzer gematcht). Bestehende
-- Karten, Decks und der Lern-Fortschritt bleiben komplett erhalten.
-- Neue Karten bekommen sort_order ab 101, damit sie hinten anschliessen.
-- ============================================================================

alter table public.fc_cards add column if not exists example    text not null default $$$$;
alter table public.fc_cards add column if not exists example_en text not null default $$$$;


-- ---------------------------------------------------------------------------
-- A2 · Daily routine
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$sich schminken$$, $$to put on make-up$$, $$reflexive$$, $${}$$, $$Sie schminkt sich vor dem Spiegel.$$, $$She puts on make-up in front of the mirror.$$, 101),
  ($$die Zahnbürste$$, $$toothbrush$$, $$$$, $${}$$, $$Meine Zahnbürste ist blau.$$, $$My toothbrush is blue.$$, 102),
  ($$die Seife$$, $$soap$$, $$$$, $${}$$, $$Ich wasche die Hände mit Seife.$$, $$I wash my hands with soap.$$, 103),
  ($$das Handtuch$$, $$towel$$, $$$$, $${}$$, $$Das Handtuch hängt im Bad.$$, $$The towel hangs in the bathroom.$$, 104),
  ($$der Föhn$$, $$hairdryer$$, $$$$, $${}$$, $$Nach der Dusche nehme ich den Föhn.$$, $$After the shower I use the hairdryer.$$, 105),
  ($$staubsaugen$$, $$to vacuum$$, $$separable$$, $${}$$, $$Am Samstag sauge ich Staub.$$, $$On Saturday I vacuum.$$, 106),
  ($$bügeln$$, $$to iron$$, $$$$, $${}$$, $$Ich bügele die Hemden am Abend.$$, $$I iron the shirts in the evening.$$, 107),
  ($$das Geschirr$$, $$the dishes$$, $$$$, $${}$$, $$Nach dem Essen spüle ich das Geschirr.$$, $$After the meal I wash the dishes.$$, 108),
  ($$der Feierabend$$, $$end of the working day$$, $$$$, $${}$$, $$Um fünf Uhr habe ich Feierabend.$$, $$At five I finish work for the day.$$, 109),
  ($$die Mittagspause$$, $$lunch break$$, $$$$, $${}$$, $$In der Mittagspause esse ich einen Salat.$$, $$During the lunch break I eat a salad.$$, 110),
  ($$pünktlich$$, $$punctual / on time$$, $$$$, $${}$$, $$Der Bus kommt immer pünktlich.$$, $$The bus is always on time.$$, 111),
  ($$verschlafen$$, $$to oversleep$$, $$$$, $${}$$, $$Ich habe heute verschlafen.$$, $$I overslept today.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Daily routine$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Feelings & character
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$die Angst$$, $$fear$$, $$$$, $${}$$, $$Sie hat Angst vor Hunden.$$, $$She is afraid of dogs.$$, 101),
  ($$die Freude$$, $$joy$$, $$$$, $${}$$, $$Das Geschenk macht mir große Freude.$$, $$The gift gives me great joy.$$, 102),
  ($$der Ärger$$, $$anger / trouble$$, $$$$, $${}$$, $$Im Büro gab es heute viel Ärger.$$, $$There was a lot of trouble at the office today.$$, 103),
  ($$eifersüchtig$$, $$jealous$$, $$$$, $${}$$, $$Er ist manchmal ein bisschen eifersüchtig.$$, $$He is sometimes a little jealous.$$, 104),
  ($$neugierig$$, $$curious$$, $$$$, $${}$$, $$Das Kind ist sehr neugierig.$$, $$The child is very curious.$$, 105),
  ($$großzügig$$, $$generous$$, $$$$, $${}$$, $$Meine Oma ist sehr großzügig.$$, $$My grandma is very generous.$$, 106),
  ($$hilfsbereit$$, $$helpful$$, $$$$, $${}$$, $$Mein Nachbar ist immer hilfsbereit.$$, $$My neighbour is always helpful.$$, 107),
  ($$sympathisch$$, $$likeable$$, $$$$, $${}$$, $$Die neue Kollegin ist sehr sympathisch.$$, $$The new colleague is very likeable.$$, 108),
  ($$mutig$$, $$brave$$, $$$$, $${}$$, $$Sei mutig und sag deine Meinung!$$, $$Be brave and say your opinion!$$, 109),
  ($$launisch$$, $$moody$$, $$$$, $${}$$, $$Am Morgen ist er oft launisch.$$, $$In the morning he is often moody.$$, 110),
  ($$sich verlieben$$, $$to fall in love$$, $$reflexive, + in$$, $${}$$, $$Sie hat sich in ihn verliebt.$$, $$She has fallen in love with him.$$, 111),
  ($$hoffen$$, $$to hope$$, $$$$, $${}$$, $$Ich hoffe, das Wetter wird besser.$$, $$I hope the weather gets better.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Feelings & character$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Work & office
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$der Arbeitgeber$$, $$employer$$, $$$$, $${}$$, $$Mein Arbeitgeber ist eine kleine Firma.$$, $$My employer is a small company.$$, 101),
  ($$der Arbeitnehmer$$, $$employee$$, $$$$, $${}$$, $$Jeder Arbeitnehmer hat Urlaub.$$, $$Every employee has holiday.$$, 102),
  ($$der Mitarbeiter$$, $$staff member / employee$$, $$$$, $${}$$, $$Die Firma sucht neue Mitarbeiter.$$, $$The company is looking for new staff.$$, 103),
  ($$die Abteilung$$, $$department$$, $$$$, $${}$$, $$Ich arbeite in der Abteilung Verkauf.$$, $$I work in the sales department.$$, 104),
  ($$das Vorstellungsgespräch$$, $$job interview$$, $$$$, $${}$$, $$Morgen habe ich ein Vorstellungsgespräch.$$, $$Tomorrow I have a job interview.$$, 105),
  ($$die Kündigung$$, $$notice / resignation$$, $$$$, $${}$$, $$Er hat seine Kündigung geschrieben.$$, $$He has written his resignation.$$, 106),
  ($$die Karriere$$, $$career$$, $$$$, $${}$$, $$Sie macht schnell Karriere.$$, $$She is quickly building a career.$$, 107),
  ($$die Konferenz$$, $$conference$$, $$$$, $${}$$, $$Die Konferenz dauert zwei Tage.$$, $$The conference lasts two days.$$, 108),
  ($$der Vorgesetzte$$, $$superior / boss$$, $$$$, $${}$$, $$Ich spreche mit meinem Vorgesetzten.$$, $$I am talking to my superior.$$, 109),
  ($$die Teilzeit$$, $$part-time$$, $$$$, $${}$$, $$Sie arbeitet in Teilzeit.$$, $$She works part-time.$$, 110),
  ($$die Vollzeit$$, $$full-time$$, $$$$, $${}$$, $$Ich habe eine Stelle in Vollzeit.$$, $$I have a full-time job.$$, 111),
  ($$der Feiertag$$, $$public holiday$$, $$$$, $${}$$, $$Am Feiertag ist das Büro geschlossen.$$, $$On the public holiday the office is closed.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Work & office$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Health & the doctor
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$die Untersuchung$$, $$examination / check-up$$, $$$$, $${}$$, $$Die Untersuchung dauert zehn Minuten.$$, $$The check-up takes ten minutes.$$, 101),
  ($$die Behandlung$$, $$treatment$$, $$$$, $${}$$, $$Die Behandlung hilft gegen die Schmerzen.$$, $$The treatment helps against the pain.$$, 102),
  ($$die Operation$$, $$operation / surgery$$, $$$$, $${}$$, $$Nach der Operation muss er sich ausruhen.$$, $$After the operation he has to rest.$$, 103),
  ($$der Verband$$, $$bandage$$, $$$$, $${}$$, $$Die Schwester macht einen Verband.$$, $$The nurse puts on a bandage.$$, 104),
  ($$das Pflaster$$, $$plaster / band-aid$$, $$$$, $${}$$, $$Ich klebe ein Pflaster auf die Wunde.$$, $$I put a plaster on the wound.$$, 105),
  ($$die Spritze$$, $$injection / shot$$, $$$$, $${}$$, $$Der Arzt gibt mir eine Spritze.$$, $$The doctor gives me an injection.$$, 106),
  ($$der Zahnarzt$$, $$dentist$$, $$$$, $${}$$, $$Ich gehe zweimal im Jahr zum Zahnarzt.$$, $$I go to the dentist twice a year.$$, 107),
  ($$der Blutdruck$$, $$blood pressure$$, $$$$, $${}$$, $$Mein Blutdruck ist heute normal.$$, $$My blood pressure is normal today.$$, 108),
  ($$die Allergie$$, $$allergy$$, $$$$, $${}$$, $$Ich habe eine Allergie gegen Katzen.$$, $$I have an allergy to cats.$$, 109),
  ($$die Impfung$$, $$vaccination$$, $$$$, $${}$$, $$Die Impfung schützt vor der Grippe.$$, $$The vaccination protects against the flu.$$, 110),
  ($$husten$$, $$to cough$$, $$$$, $${}$$, $$Das Kind hustet die ganze Nacht.$$, $$The child coughs all night.$$, 111),
  ($$niesen$$, $$to sneeze$$, $$$$, $${}$$, $$Bei Staub muss ich oft niesen.$$, $$With dust I often have to sneeze.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Health & the doctor$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Food & eating out
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$die Kneipe$$, $$pub$$, $$$$, $${}$$, $$Wir treffen uns in der Kneipe.$$, $$We are meeting at the pub.$$, 101),
  ($$die Bar$$, $$bar$$, $$$$, $${}$$, $$An der Bar gibt es guten Wein.$$, $$At the bar there is good wine.$$, 102),
  ($$der Snack$$, $$snack$$, $$$$, $${}$$, $$Am Nachmittag esse ich einen kleinen Snack.$$, $$In the afternoon I eat a small snack.$$, 103),
  ($$die Mahlzeit$$, $$meal$$, $$$$, $${}$$, $$Das Frühstück ist meine liebste Mahlzeit.$$, $$Breakfast is my favourite meal.$$, 104),
  ($$die Getränkekarte$$, $$drinks menu$$, $$$$, $${}$$, $$Können wir die Getränkekarte haben?$$, $$Can we have the drinks menu?$$, 105),
  ($$die Serviette$$, $$napkin$$, $$$$, $${}$$, $$Die Serviette liegt neben dem Teller.$$, $$The napkin is next to the plate.$$, 106),
  ($$das Besteck$$, $$cutlery$$, $$$$, $${}$$, $$Das Besteck ist aus Metall.$$, $$The cutlery is made of metal.$$, 107),
  ($$der Braten$$, $$roast$$, $$$$, $${}$$, $$Am Sonntag gibt es einen Braten.$$, $$On Sunday there is a roast.$$, 108),
  ($$die Pommes$$, $$fries / chips$$, $$plural$$, $${}$$, $$Zum Burger nehme ich Pommes.$$, $$With the burger I have fries.$$, 109),
  ($$das Menü$$, $$set meal / menu$$, $$$$, $${}$$, $$Das Menü kostet zwölf Euro.$$, $$The set meal costs twelve euros.$$, 110),
  ($$knusprig$$, $$crispy$$, $$$$, $${}$$, $$Das Brot ist frisch und knusprig.$$, $$The bread is fresh and crispy.$$, 111),
  ($$roh$$, $$raw$$, $$$$, $${}$$, $$Das Fleisch ist noch roh.$$, $$The meat is still raw.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Food & eating out$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Travel & holidays
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$der Reiseführer$$, $$guidebook / tour guide$$, $$$$, $${}$$, $$Im Reiseführer stehen viele Tipps.$$, $$There are many tips in the guidebook.$$, 101),
  ($$das Reisebüro$$, $$travel agency$$, $$$$, $${}$$, $$Wir buchen den Urlaub im Reisebüro.$$, $$We book the holiday at the travel agency.$$, 102),
  ($$der Abflug$$, $$departure (flight)$$, $$$$, $${}$$, $$Der Abflug ist um acht Uhr.$$, $$The departure is at eight in the morning.$$, 103),
  ($$die Landung$$, $$landing$$, $$$$, $${}$$, $$Die Landung war ganz ruhig.$$, $$The landing was very smooth.$$, 104),
  ($$das Visum$$, $$visa$$, $$$$, $${}$$, $$Für die Reise brauche ich ein Visum.$$, $$For the trip I need a visa.$$, 105),
  ($$die Jugendherberge$$, $$youth hostel$$, $$$$, $${}$$, $$Wir übernachten in einer Jugendherberge.$$, $$We are staying in a youth hostel.$$, 106),
  ($$die Ferienwohnung$$, $$holiday apartment$$, $$$$, $${}$$, $$Die Ferienwohnung liegt am Meer.$$, $$The holiday apartment is by the sea.$$, 107),
  ($$der Zoll$$, $$customs$$, $$$$, $${}$$, $$Am Zoll zeigen wir die Pässe.$$, $$At customs we show our passports.$$, 108),
  ($$der Sonnenbrand$$, $$sunburn$$, $$$$, $${}$$, $$Ohne Creme bekomme ich schnell einen Sonnenbrand.$$, $$Without cream I quickly get a sunburn.$$, 109),
  ($$das Zelt$$, $$tent$$, $$$$, $${}$$, $$Wir schlafen im Zelt.$$, $$We sleep in the tent.$$, 110),
  ($$zelten$$, $$to camp$$, $$$$, $${}$$, $$Im Sommer zelten wir am See.$$, $$In summer we camp by the lake.$$, 111),
  ($$die Halbpension$$, $$half board$$, $$$$, $${}$$, $$Das Hotel bietet Halbpension an.$$, $$The hotel offers half board.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Travel & holidays$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Shopping & services
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$die Filiale$$, $$branch (of a shop)$$, $$$$, $${}$$, $$Die Bank hat eine Filiale in der Stadt.$$, $$The bank has a branch in the city.$$, 101),
  ($$das Schaufenster$$, $$shop window$$, $$$$, $${}$$, $$Im Schaufenster steht eine schöne Jacke.$$, $$There is a nice jacket in the shop window.$$, 102),
  ($$der Warenkorb$$, $$shopping basket / cart$$, $$$$, $${}$$, $$Der Warenkorb ist schon fast voll.$$, $$The shopping basket is almost full already.$$, 103),
  ($$die Ware$$, $$goods / merchandise$$, $$$$, $${}$$, $$Die Ware kommt in zwei Tagen.$$, $$The goods arrive in two days.$$, 104),
  ($$die Marke$$, $$brand$$, $$$$, $${}$$, $$Diese Marke ist sehr bekannt.$$, $$This brand is very well known.$$, 105),
  ($$das Etikett$$, $$label / tag$$, $$$$, $${}$$, $$Auf dem Etikett steht der Preis.$$, $$The price is on the label.$$, 106),
  ($$die Garantie$$, $$warranty / guarantee$$, $$$$, $${}$$, $$Das Handy hat zwei Jahre Garantie.$$, $$The phone has a two-year warranty.$$, 107),
  ($$der Gutschein$$, $$voucher$$, $$$$, $${}$$, $$Zum Geburtstag bekomme ich einen Gutschein.$$, $$For my birthday I get a voucher.$$, 108),
  ($$die Zahlung$$, $$payment$$, $$$$, $${}$$, $$Die Zahlung war erfolgreich.$$, $$The payment was successful.$$, 109),
  ($$die Bestellung$$, $$order$$, $$$$, $${}$$, $$Meine Bestellung ist noch nicht da.$$, $$My order has not arrived yet.$$, 110),
  ($$liefern$$, $$to deliver$$, $$$$, $${}$$, $$Der Shop liefert bis nach Hause.$$, $$The shop delivers to your home.$$, 111),
  ($$die Öffnungszeiten$$, $$opening hours$$, $$plural$$, $${}$$, $$Die Öffnungszeiten stehen an der Tür.$$, $$The opening hours are on the door.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Shopping & services$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Home & living
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$die Wohngemeinschaft$$, $$flatshare (WG)$$, $$short: WG$$, $${}$$, $$Ich wohne in einer Wohngemeinschaft.$$, $$I live in a flatshare.$$, 101),
  ($$die Kaution$$, $$deposit$$, $$$$, $${}$$, $$Die Kaution beträgt eine Monatsmiete.$$, $$The deposit is one month rent.$$, 102),
  ($$der Mietvertrag$$, $$rental contract$$, $$$$, $${}$$, $$Wir unterschreiben heute den Mietvertrag.$$, $$We sign the rental contract today.$$, 103),
  ($$die Steckdose$$, $$power socket$$, $$$$, $${}$$, $$Die Steckdose ist neben dem Bett.$$, $$The power socket is next to the bed.$$, 104),
  ($$der Schalter$$, $$switch$$, $$$$, $${}$$, $$Der Schalter für das Licht ist links.$$, $$The switch for the light is on the left.$$, 105),
  ($$die Klimaanlage$$, $$air conditioning$$, $$$$, $${}$$, $$Im Sommer läuft die Klimaanlage.$$, $$In summer the air conditioning runs.$$, 106),
  ($$die Klingel$$, $$doorbell$$, $$$$, $${}$$, $$Die Klingel ist kaputt.$$, $$The doorbell is broken.$$, 107),
  ($$der Vorhang$$, $$curtain$$, $$$$, $${}$$, $$Am Abend schließe ich die Vorhänge.$$, $$In the evening I close the curtains.$$, 108),
  ($$der Rasen$$, $$lawn$$, $$$$, $${}$$, $$Im Sommer mähe ich den Rasen.$$, $$In summer I mow the lawn.$$, 109),
  ($$die Garage$$, $$garage$$, $$$$, $${}$$, $$Das Auto steht in der Garage.$$, $$The car is in the garage.$$, 110),
  ($$renovieren$$, $$to renovate$$, $$$$, $${}$$, $$Wir renovieren gerade die Küche.$$, $$We are renovating the kitchen right now.$$, 111),
  ($$streichen$$, $$to paint (walls)$$, $$$$, $${}$$, $$Ich streiche die Wand weiß.$$, $$I am painting the wall white.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Home & living$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Free time & media
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$der Verein$$, $$club / association$$, $$$$, $${}$$, $$Er spielt in einem Fußballverein.$$, $$He plays in a football club.$$, 101),
  ($$die Mitgliedschaft$$, $$membership$$, $$$$, $${}$$, $$Die Mitgliedschaft kostet zehn Euro im Monat.$$, $$The membership costs ten euros a month.$$, 102),
  ($$die Serie$$, $$series / show$$, $$$$, $${}$$, $$Wir sehen abends eine Serie.$$, $$In the evening we watch a series.$$, 103),
  ($$der Sender$$, $$TV channel / station$$, $$$$, $${}$$, $$Dieser Sender zeigt nur Sport.$$, $$This channel shows only sport.$$, 104),
  ($$die Fernbedienung$$, $$remote control$$, $$$$, $${}$$, $$Wo ist die Fernbedienung?$$, $$Where is the remote control?$$, 105),
  ($$der Bildschirm$$, $$screen$$, $$$$, $${}$$, $$Der Bildschirm ist sehr groß.$$, $$The screen is very big.$$, 106),
  ($$die Webseite$$, $$website$$, $$$$, $${}$$, $$Die Webseite lädt sehr langsam.$$, $$The website loads very slowly.$$, 107),
  ($$der Roman$$, $$novel$$, $$$$, $${}$$, $$Ich lese gerade einen spannenden Roman.$$, $$I am reading an exciting novel right now.$$, 108),
  ($$die Schlagzeile$$, $$headline$$, $$$$, $${}$$, $$Die Schlagzeile steht auf der ersten Seite.$$, $$The headline is on the front page.$$, 109),
  ($$der Journalist$$, $$journalist$$, $$$$, $${}$$, $$Der Journalist schreibt für eine Zeitung.$$, $$The journalist writes for a newspaper.$$, 110),
  ($$streamen$$, $$to stream$$, $$$$, $${}$$, $$Wir streamen den Film am Abend.$$, $$We stream the film in the evening.$$, 111),
  ($$das Abonnement$$, $$subscription$$, $$short: Abo$$, $${}$$, $$Ich habe ein Abonnement für Musik.$$, $$I have a subscription for music.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Free time & media$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · The past (Perfekt)
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$getroffen$$, $$met (treffen)$$, $$haben$$, $${}$$, $$Ich habe gestern einen Freund getroffen.$$, $$I met a friend yesterday.$$, 101),
  ($$geholfen$$, $$helped (helfen)$$, $$haben$$, $${}$$, $$Er hat mir beim Umzug geholfen.$$, $$He helped me with the move.$$, 102),
  ($$gebracht$$, $$brought (bringen)$$, $$haben$$, $${}$$, $$Sie hat den Kuchen gebracht.$$, $$She brought the cake.$$, 103),
  ($$gedacht$$, $$thought (denken)$$, $$haben$$, $${}$$, $$Ich habe an dich gedacht.$$, $$I thought of you.$$, 104),
  ($$gewusst$$, $$known (wissen)$$, $$haben$$, $${}$$, $$Das habe ich nicht gewusst.$$, $$I did not know that.$$, 105),
  ($$verstanden$$, $$understood (verstehen)$$, $$haben$$, $${}$$, $$Hast du die Frage verstanden?$$, $$Did you understand the question?$$, 106),
  ($$bekommen$$, $$received (bekommen)$$, $$haben$$, $${}$$, $$Ich habe einen Brief bekommen.$$, $$I received a letter.$$, 107),
  ($$angerufen$$, $$called (anrufen)$$, $$haben, separable$$, $${}$$, $$Sie hat mich gestern angerufen.$$, $$She called me yesterday.$$, 108),
  ($$eingeladen$$, $$invited (einladen)$$, $$haben, separable$$, $${}$$, $$Wir haben viele Gäste eingeladen.$$, $$We invited many guests.$$, 109),
  ($$gefeiert$$, $$celebrated (feiern)$$, $$haben$$, $${}$$, $$Wir haben die ganze Nacht gefeiert.$$, $$We celebrated all night.$$, 110),
  ($$gewonnen$$, $$won (gewinnen)$$, $$haben$$, $${}$$, $$Unsere Mannschaft hat gewonnen.$$, $$Our team won.$$, 111),
  ($$erzählt$$, $$told (erzählen)$$, $$haben$$, $${}$$, $$Er hat eine lustige Geschichte erzählt.$$, $$He told a funny story.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · The past (Perfekt)$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · More verbs
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$leihen$$, $$to lend / borrow$$, $$$$, $${}$$, $$Kannst du mir zehn Euro leihen?$$, $$Can you lend me ten euros?$$, 101),
  ($$schenken$$, $$to give (a gift)$$, $$$$, $${}$$, $$Ich schenke ihr Blumen.$$, $$I give her flowers.$$, 102),
  ($$wünschen$$, $$to wish$$, $$$$, $${}$$, $$Ich wünsche dir viel Glück.$$, $$I wish you good luck.$$, 103),
  ($$sich unterhalten$$, $$to have a conversation$$, $$reflexive$$, $${}$$, $$Wir unterhalten uns über den Film.$$, $$We are talking about the film.$$, 104),
  ($$sich streiten$$, $$to argue$$, $$reflexive$$, $${}$$, $$Die Kinder streiten sich oft.$$, $$The children often argue.$$, 105),
  ($$diskutieren$$, $$to discuss$$, $$$$, $${}$$, $$Wir diskutieren über Politik.$$, $$We are discussing politics.$$, 106),
  ($$überlegen$$, $$to consider / think about$$, $$$$, $${}$$, $$Ich überlege noch, was ich mache.$$, $$I am still thinking about what to do.$$, 107),
  ($$vergleichen$$, $$to compare$$, $$$$, $${}$$, $$Ich vergleiche die Preise im Internet.$$, $$I compare the prices online.$$, 108),
  ($$beschreiben$$, $$to describe$$, $$$$, $${}$$, $$Kannst du das Bild beschreiben?$$, $$Can you describe the picture?$$, 109),
  ($$verbessern$$, $$to improve$$, $$$$, $${}$$, $$Ich möchte mein Deutsch verbessern.$$, $$I want to improve my German.$$, 110),
  ($$erlauben$$, $$to allow$$, $$$$, $${}$$, $$Die Eltern erlauben das Spiel.$$, $$The parents allow the game.$$, 111),
  ($$teilnehmen$$, $$to take part$$, $$separable, + an$$, $${}$$, $$Viele Leute nehmen an dem Kurs teil.$$, $$Many people take part in the course.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · More verbs$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Connectors & adverbs
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$außerdem$$, $$besides / moreover$$, $$$$, $${}$$, $$Es ist spät, außerdem bin ich müde.$$, $$It is late, and besides I am tired.$$, 101),
  ($$jedoch$$, $$however$$, $$$$, $${}$$, $$Der Plan ist gut, jedoch teuer.$$, $$The plan is good, however expensive.$$, 102),
  ($$dennoch$$, $$nevertheless$$, $$$$, $${}$$, $$Es regnet, dennoch gehen wir spazieren.$$, $$It is raining, but we still go for a walk.$$, 103),
  ($$damit$$, $$so that$$, $$subordinate: verb at end$$, $${}$$, $$Ich lerne viel, damit ich die Prüfung bestehe.$$, $$I study a lot so that I pass the exam.$$, 104),
  ($$bevor$$, $$before$$, $$subordinate: verb at end$$, $${}$$, $$Bevor ich gehe, trinke ich einen Kaffee.$$, $$Before I leave, I drink a coffee.$$, 105),
  ($$nachdem$$, $$after$$, $$subordinate: verb at end$$, $${}$$, $$Nachdem wir gegessen haben, gehen wir spazieren.$$, $$After we have eaten, we go for a walk.$$, 106),
  ($$sobald$$, $$as soon as$$, $$subordinate: verb at end$$, $${}$$, $$Ich rufe an, sobald ich zu Hause bin.$$, $$I will call as soon as I am home.$$, 107),
  ($$seitdem$$, $$since (then)$$, $$$$, $${}$$, $$Seitdem wohnt sie in Berlin.$$, $$Since then she lives in Berlin.$$, 108),
  ($$übrigens$$, $$by the way$$, $$$$, $${}$$, $$Übrigens, morgen habe ich Zeit.$$, $$By the way, tomorrow I have time.$$, 109),
  ($$inzwischen$$, $$in the meantime$$, $$$$, $${}$$, $$Koch du, ich decke inzwischen den Tisch.$$, $$You cook, in the meantime I set the table.$$, 110),
  ($$kaum$$, $$hardly / barely$$, $$$$, $${}$$, $$Ich habe kaum geschlafen.$$, $$I hardly slept.$$, 111),
  ($$irgendwann$$, $$sometime / someday$$, $$$$, $${}$$, $$Irgendwann fahre ich nach Japan.$$, $$Someday I will travel to Japan.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Connectors & adverbs$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Nature & environment
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$der Umweltschutz$$, $$environmental protection$$, $$$$, $${}$$, $$Umweltschutz ist mir wichtig.$$, $$Environmental protection is important to me.$$, 101),
  ($$die Verschmutzung$$, $$pollution$$, $$$$, $${}$$, $$Die Verschmutzung der Luft ist ein Problem.$$, $$Air pollution is a problem.$$, 102),
  ($$der Abfall$$, $$waste / rubbish$$, $$$$, $${}$$, $$Der Abfall kommt in die richtige Tonne.$$, $$The waste goes into the right bin.$$, 103),
  ($$die Mülltrennung$$, $$waste separation$$, $$$$, $${}$$, $$Mülltrennung ist in Deutschland normal.$$, $$Waste separation is normal in Germany.$$, 104),
  ($$erneuerbar$$, $$renewable$$, $$$$, $${}$$, $$Wind ist eine erneuerbare Energie.$$, $$Wind is a renewable energy.$$, 105),
  ($$der Strom$$, $$electricity$$, $$$$, $${}$$, $$Der Strom ist heute teuer.$$, $$Electricity is expensive today.$$, 106),
  ($$das Benzin$$, $$petrol / gasoline$$, $$$$, $${}$$, $$Das Benzin wird immer teurer.$$, $$Petrol is getting more and more expensive.$$, 107),
  ($$die Überschwemmung$$, $$flood$$, $$$$, $${}$$, $$Nach dem Regen gab es eine Überschwemmung.$$, $$After the rain there was a flood.$$, 108),
  ($$das Erdbeben$$, $$earthquake$$, $$$$, $${}$$, $$Das Erdbeben war sehr stark.$$, $$The earthquake was very strong.$$, 109),
  ($$das Tal$$, $$valley$$, $$$$, $${}$$, $$Im Tal liegt ein kleines Dorf.$$, $$There is a small village in the valley.$$, 110),
  ($$die Landschaft$$, $$landscape / scenery$$, $$$$, $${}$$, $$Die Landschaft hier ist wunderschön.$$, $$The scenery here is beautiful.$$, 111),
  ($$giftig$$, $$toxic / poisonous$$, $$$$, $${}$$, $$Diese Pflanze ist giftig.$$, $$This plant is poisonous.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Nature & environment$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · City & transport
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$der Kreisverkehr$$, $$roundabout$$, $$$$, $${}$$, $$Am Kreisverkehr nimmst du die zweite Ausfahrt.$$, $$At the roundabout you take the second exit.$$, 101),
  ($$die Autobahn$$, $$motorway / highway$$, $$$$, $${}$$, $$Auf der Autobahn fahren wir schnell.$$, $$On the motorway we drive fast.$$, 102),
  ($$der Parkplatz$$, $$parking space / car park$$, $$$$, $${}$$, $$Vor dem Haus gibt es keinen Parkplatz.$$, $$There is no parking space in front of the house.$$, 103),
  ($$das Parkhaus$$, $$parking garage$$, $$$$, $${}$$, $$Ich stelle das Auto ins Parkhaus.$$, $$I put the car in the parking garage.$$, 104),
  ($$die Einbahnstraße$$, $$one-way street$$, $$$$, $${}$$, $$Das ist eine Einbahnstraße.$$, $$This is a one-way street.$$, 105),
  ($$der Zebrastreifen$$, $$zebra crossing$$, $$$$, $${}$$, $$Kinder gehen über den Zebrastreifen.$$, $$Children cross at the zebra crossing.$$, 106),
  ($$die Baustelle$$, $$construction site$$, $$$$, $${}$$, $$Wegen der Baustelle gibt es einen Stau.$$, $$Because of the construction site there is a traffic jam.$$, 107),
  ($$die Innenstadt$$, $$city centre$$, $$$$, $${}$$, $$In der Innenstadt sind viele Geschäfte.$$, $$There are many shops in the city centre.$$, 108),
  ($$der Stadtrand$$, $$outskirts$$, $$$$, $${}$$, $$Wir wohnen am Stadtrand.$$, $$We live on the outskirts.$$, 109),
  ($$der Unfall$$, $$accident$$, $$$$, $${}$$, $$Auf der Straße gab es einen Unfall.$$, $$There was an accident on the road.$$, 110),
  ($$tanken$$, $$to refuel / fill up$$, $$$$, $${}$$, $$Ich muss noch tanken.$$, $$I still have to fill up.$$, 111),
  ($$die Umleitung$$, $$detour / diversion$$, $$$$, $${}$$, $$Es gibt eine Umleitung um die Stadt.$$, $$There is a detour around the city.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · City & transport$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- ---------------------------------------------------------------------------
-- A2 · Prepositions & cases
-- ---------------------------------------------------------------------------
insert into public.fc_cards (deck_id, front, back, notes, tags, example, example_en, sort_order)
select d.id, v.front, v.back, v.notes, v.tags::text[], v.example, v.example_en, v.ord
from public.fc_decks d, (values
  ($$innerhalb$$, $$within / inside$$, $$+ Genitiv$$, $${}$$, $$Innerhalb einer Woche ist das Paket da.$$, $$Within a week the parcel is here.$$, 101),
  ($$außerhalb$$, $$outside of$$, $$+ Genitiv$$, $${}$$, $$Sie wohnt außerhalb der Stadt.$$, $$She lives outside the city.$$, 102),
  ($$entlang$$, $$along$$, $$+ Akkusativ (nachgestellt)$$, $${}$$, $$Wir gehen den Fluss entlang.$$, $$We walk along the river.$$, 103),
  ($$ab$$, $$from (starting point)$$, $$+ Dativ$$, $${}$$, $$Ab Montag habe ich Urlaub.$$, $$From Monday I am on holiday.$$, 104),
  ($$sich interessieren für$$, $$to be interested in$$, $$+ Akkusativ$$, $${}$$, $$Ich interessiere mich für Musik.$$, $$I am interested in music.$$, 105),
  ($$sich kümmern um$$, $$to take care of$$, $$+ Akkusativ$$, $${}$$, $$Sie kümmert sich um die Kinder.$$, $$She takes care of the children.$$, 106),
  ($$sich erinnern an$$, $$to remember$$, $$+ Akkusativ$$, $${}$$, $$Ich erinnere mich an den Urlaub.$$, $$I remember the holiday.$$, 107),
  ($$gehören zu$$, $$to belong to / be part of$$, $$+ Dativ$$, $${}$$, $$Der Garten gehört zum Haus.$$, $$The garden belongs to the house.$$, 108),
  ($$sich gewöhnen an$$, $$to get used to$$, $$+ Akkusativ$$, $${}$$, $$Ich gewöhne mich an das Wetter.$$, $$I am getting used to the weather.$$, 109),
  ($$bitten um$$, $$to ask for$$, $$+ Akkusativ$$, $${}$$, $$Er bittet um Hilfe.$$, $$He asks for help.$$, 110),
  ($$stolz auf$$, $$proud of$$, $$+ Akkusativ$$, $${}$$, $$Die Eltern sind stolz auf ihr Kind.$$, $$The parents are proud of their child.$$, 111),
  ($$zufrieden mit$$, $$satisfied with$$, $$+ Dativ$$, $${}$$, $$Ich bin zufrieden mit der Arbeit.$$, $$I am satisfied with the work.$$, 112)
) as v(front, back, notes, tags, example, example_en, ord)
where d.title = $$A2 · Prepositions & cases$$
  and d.owner_id = (select id from auth.users where email = $$marvin.h.graf@gmail.com$$);


-- Kontrolle: neue A2-Kartenzahl gesamt
select count(*) as a2_karten
from public.fc_cards c join public.fc_decks d on d.id = c.deck_id
where d.level = $$A2$$;
