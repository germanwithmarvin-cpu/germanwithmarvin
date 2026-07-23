import type { Exercise } from "@/lib/training";

// Drill-Sets: Listen- und Musterstoff, aus dem beliebig viele Lückenaufgaben
// generiert werden. Für Themen, bei denen konstante Wiederholung mehr bringt
// als zwölf feste Aufgaben.
//
// Kernidee: nicht dieselben Aufgaben öfter zeigen (dann lernt man sie
// auswendig), sondern aus einer Liste immer neue Kombinationen ziehen –
// trainiert wird das Muster, nicht die Einzelaufgabe.
//
// Ein Eintrag = eine Antwort plus ein oder mehrere Sätze mit ___ an der Stelle
// der Lücke. Die Sätze sind so gebaut, dass GENAU EINE Antwort passt.
//
// Generierte Aufgaben tragen keine Datenbank-Kennung – sie werden nicht
// protokolliert. Reines Üben.

type DrillItem = {
  answer: string; // die gesuchte Lücke
  explain: string; // Erklärung nach dem Prüfen
  sentences: string[]; // Sätze mit ___
  alt?: string[]; // weitere korrekte Lösungen (z. B. Imperativ mit/ohne -e)
};

export type DrillSet = {
  key: string;
  unitSlug: string; // an welche Einheit der Intensiv-Modus gekoppelt ist
  title: string;
  items: DrillItem[];
};

// ─── Feste Präpositionen ─────────────────────────────────────────────────────
const PREP = (verb: string, govern: string, sentences: string[]): DrillItem => ({
  answer: verb.split(" ").pop()!,
  explain: `**${verb}** + ${govern}. The preposition belongs to the verb — you learn it as one piece.`,
  sentences,
});

const FIXED_PREPOSITIONS: DrillSet = {
  key: "fixed-prepositions",
  unitSlug: "fixed-prepositions",
  title: "Verbs with fixed prepositions",
  items: [
    PREP("warten auf", "Akkusativ", ["Ich warte ___ den Bus.", "Wir warten ___ das Ergebnis.", "Sie wartet ___ ihren Freund."]),
    PREP("denken an", "Akkusativ", ["Ich denke ___ dich.", "Denkst du ___ deine Familie?", "Er denkt oft ___ seine Kindheit."]),
    PREP("sich freuen auf", "Akkusativ", ["Ich freue mich ___ das Wochenende.", "Sie freut sich ___ die Reise.", "Wir freuen uns ___ den Urlaub."]),
    PREP("sich freuen über", "Akkusativ", ["Ich freue mich ___ dein Geschenk.", "Er freut sich ___ die gute Note.", "Sie freut sich ___ den Besuch."]),
    PREP("sich interessieren für", "Akkusativ", ["Ich interessiere mich ___ Musik.", "Sie interessiert sich ___ Politik.", "Interessierst du dich ___ Sport?"]),
    PREP("sich erinnern an", "Akkusativ", ["Ich erinnere mich ___ den Tag.", "Erinnerst du dich ___ mich?", "Sie erinnert sich ___ ihre Schulzeit."]),
    PREP("sich ärgern über", "Akkusativ", ["Ich ärgere mich ___ den Lärm.", "Er ärgert sich ___ das Wetter.", "Sie ärgert sich ___ ihren Chef."]),
    PREP("sprechen über", "Akkusativ", ["Wir sprechen ___ das Wetter.", "Sie spricht ___ ihre Arbeit.", "Lass uns ___ das Problem sprechen."]),
    PREP("sich kümmern um", "Akkusativ", ["Ich kümmere mich ___ die Kinder.", "Er kümmert sich ___ den Garten.", "Wer kümmert sich ___ den Hund?"]),
    PREP("bitten um", "Akkusativ", ["Ich bitte ___ Hilfe.", "Sie bittet ___ einen Rat.", "Darf ich ___ Ihre Aufmerksamkeit bitten?"]),
    PREP("sich bewerben um", "Akkusativ", ["Ich bewerbe mich ___ die Stelle.", "Er bewirbt sich ___ einen Job.", "Sie bewirbt sich ___ ein Stipendium."]),
    PREP("achten auf", "Akkusativ", ["Achte ___ die Zeit!", "Sie achtet ___ ihre Gesundheit.", "Bitte achten Sie ___ die Stufe."]),
    PREP("sich gewöhnen an", "Akkusativ", ["Ich gewöhne mich ___ das Wetter.", "Sie gewöhnt sich ___ die neue Stadt.", "Er gewöhnt sich ___ den Lärm."]),
    PREP("Angst haben vor", "Dativ", ["Ich habe Angst ___ Hunden.", "Sie hat Angst ___ der Prüfung.", "Er hat Angst ___ der Zukunft."]),
    PREP("teilnehmen an", "Dativ", ["Ich möchte ___ diesem Kurs teilnehmen.", "Sie nimmt ___ dem Wettbewerb teil.", "Wir nehmen ___ der Sitzung teil."]),
    PREP("sprechen mit", "Dativ", ["Ich spreche ___ meinem Chef.", "Sie spricht ___ dem Lehrer.", "Kann ich ___ dir sprechen?"]),
    PREP("sich treffen mit", "Dativ", ["Ich treffe mich ___ Anna.", "Wir treffen uns ___ Freunden.", "Er trifft sich ___ seinem Bruder."]),
    PREP("leiden unter", "Dativ", ["Er leidet ___ Kopfschmerzen.", "Sie leidet ___ der Hitze.", "Viele leiden ___ Stress."]),
    PREP("sich beschäftigen mit", "Dativ", ["Ich beschäftige mich ___ dem Thema.", "Sie beschäftigt sich ___ Kunst.", "Er beschäftigt sich ___ dem Projekt."]),
    PREP("träumen von", "Dativ", ["Ich träume ___ einer Reise.", "Sie träumt ___ einem Haus.", "Er träumt ___ einer besseren Zukunft."]),
    PREP("sich verabschieden von", "Dativ", ["Ich verabschiede mich ___ dir.", "Sie verabschiedet sich ___ ihren Gästen.", "Wir verabschieden uns ___ euch."]),
    PREP("gratulieren zu", "Dativ", ["Ich gratuliere dir ___ deinem Erfolg.", "Sie gratuliert ihm ___ dem Geburtstag.", "Wir gratulieren euch ___ der Hochzeit."]),
  ],
};

// ─── Genus: der, die, das ────────────────────────────────────────────────────
// Der klassische Auswendig-Drill. Antwort ist der/die/das, der Satz ist das
// Nomen selbst.
const G = (artikel: string, nomen: string, why: string): DrillItem => ({
  answer: artikel,
  explain: why,
  sentences: [`___ ${nomen}`],
});
const m = (n: string) => `**${n}** is masculine — der ${n}. Learn the article with the noun.`;
const f = (n: string) => `**${n}** is feminine — die ${n}. Learn the article with the noun.`;
const n = (nn: string) => `**${nn}** is neuter — das ${nn}. Learn the article with the noun.`;

const ARTICLES: DrillSet = {
  key: "articles",
  unitSlug: "articles",
  title: "der, die, das",
  items: [
    // maskulin
    G("der", "Tisch", m("Tisch")), G("der", "Stuhl", m("Stuhl")), G("der", "Mann", m("Mann")),
    G("der", "Hund", m("Hund")), G("der", "Baum", m("Baum")), G("der", "Apfel", m("Apfel")),
    G("der", "Computer", m("Computer")), G("der", "Schlüssel", m("Schlüssel")), G("der", "Wagen", m("Wagen")),
    G("der", "Garten", m("Garten")), G("der", "Tag", m("Tag")), G("der", "Sommer", m("Sommer")),
    G("der", "Zug", m("Zug")), G("der", "Beruf", m("Beruf")),
    // feminin
    G("die", "Frau", f("Frau")), G("die", "Blume", f("Blume")), G("die", "Katze", f("Katze")),
    G("die", "Lampe", f("Lampe")), G("die", "Tür", f("Tür")), G("die", "Straße", f("Straße")),
    G("die", "Schule", f("Schule")), G("die", "Stadt", f("Stadt")), G("die", "Sonne", f("Sonne")),
    G("die", "Uhr", f("Uhr")), G("die", "Nacht", f("Nacht")),
    G("die", "Wohnung", "**-ung** words are always feminine: die Wohnung. (also -heit, -keit, -schaft)"),
    G("die", "Freiheit", "**-heit** words are always feminine: die Freiheit."),
    G("die", "Möglichkeit", "**-keit** words are always feminine: die Möglichkeit."),
    G("die", "Freundschaft", "**-schaft** words are always feminine: die Freundschaft."),
    // neutrum
    G("das", "Buch", n("Buch")), G("das", "Kind", n("Kind")), G("das", "Haus", n("Haus")),
    G("das", "Auto", n("Auto")), G("das", "Fenster", n("Fenster")), G("das", "Bett", n("Bett")),
    G("das", "Glas", n("Glas")), G("das", "Wasser", n("Wasser")), G("das", "Brot", n("Brot")),
    G("das", "Bild", n("Bild")), G("das", "Zimmer", n("Zimmer")), G("das", "Jahr", n("Jahr")),
    G("das", "Hotel", n("Hotel")),
    G("das", "Mädchen", "**-chen** words are always neuter: das Mädchen — even though a Mädchen is a girl. The ending beats the meaning."),
    G("das", "Brötchen", "**-chen** words are always neuter: das Brötchen."),
  ],
};

// ─── Relativpronomen ─────────────────────────────────────────────────────────
// Muster-Drill: Genus kommt vom Nomen davor, Kasus von der Rolle im Satz. Das
// Verb im Relativsatz macht die Rolle eindeutig (kennen → Akk, helfen → Dativ,
// stehen → Nom).
const R = (answer: string, explain: string, sentence: string): DrillItem => ({ answer, explain, sentences: [sentence] });

const RELATIVE_PRONOUNS: DrillSet = {
  key: "relative-clauses",
  unitSlug: "relative-clauses",
  title: "Relative pronouns",
  items: [
    // maskulin
    R("der", "der Mann + subject (he stands) → Nominativ: **der**.", "Das ist der Mann, ___ dort steht."),
    R("den", "der Mann + direct object (I know him) → Akkusativ: **den**.", "Das ist der Mann, ___ ich kenne."),
    R("dem", "der Mann + helfen takes the Dativ → **dem**.", "Das ist der Mann, ___ ich helfe."),
    R("den", "der Film + direct object (I saw it) → Akkusativ: **den**.", "Das ist der Film, ___ ich gesehen habe."),
    R("der", "der Zug + subject (it is coming) → Nominativ: **der**.", "Das ist der Zug, ___ nach Berlin fährt."),
    // feminin
    R("die", "die Frau + subject (she stands) → Nominativ: **die**.", "Das ist die Frau, ___ dort steht."),
    R("die", "die Frau + direct object (I know her) → Akkusativ: **die** (feminine looks the same).", "Das ist die Frau, ___ ich kenne."),
    R("der", "die Frau + danken takes the Dativ → **der**.", "Das ist die Frau, ___ ich danke."),
    R("die", "die Stadt + direct object → Akkusativ: **die**.", "Das ist die Stadt, ___ ich besuche."),
    R("die", "die Blume + subject (it is blooming) → Nominativ: **die**.", "Das ist die Blume, ___ so schön blüht."),
    // neutrum
    R("das", "das Kind + subject (it plays) → Nominativ: **das**.", "Das ist das Kind, ___ dort spielt."),
    R("das", "das Buch + direct object (I read it) → Akkusativ: **das** (neuter looks the same).", "Das ist das Buch, ___ ich lese."),
    R("dem", "das Kind + helfen takes the Dativ → **dem**.", "Das ist das Kind, ___ ich helfe."),
    R("das", "das Auto + subject (it stands there) → Nominativ: **das**.", "Das ist das Auto, ___ vor dem Haus steht."),
    // plural
    R("die", "plural + subject (they play) → Nominativ: **die**.", "Das sind die Kinder, ___ dort spielen."),
    R("die", "plural + direct object (I know them) → Akkusativ: **die**.", "Das sind die Leute, ___ ich kenne."),
    R("denen", "plural + helfen takes the Dativ → **denen** (the one new plural form).", "Das sind die Leute, ___ ich helfe."),
    R("die", "plural + subject → Nominativ: **die**.", "Das sind die Bücher, ___ auf dem Tisch liegen."),
  ],
};

// ─── Nomen-Verb-Verbindungen ─────────────────────────────────────────────────
// Die Lücke ist das feste Verb – der Teil, den man nicht raten kann. Die
// Erklärung nennt die ganze Verbindung.
const NV = (phrase: string, verb: string, meaning: string, sentences: string[]): DrillItem => ({
  answer: verb,
  explain: `**${phrase}** — ${meaning}. The verb is fixed; you learn the whole combination as one piece.`,
  sentences,
});

// Alle Sätze bewusst mit Modalverb oder zu-Infinitiv, damit das gesuchte Verb
// immer in der INFINITIV-Form am Ende steht – so passt die eine Antwort zu
// jedem Satz.
const NOUN_VERB: DrillSet = {
  key: "noun-verb-combinations",
  unitSlug: "noun-verb-combinations",
  title: "Noun-verb combinations",
  items: [
    NV("eine Entscheidung treffen", "treffen", "to decide", ["Ich muss eine Entscheidung ___ .", "Wir müssen bald eine Entscheidung ___ .", "Sie konnte keine Entscheidung ___ ."]),
    NV("Kritik üben", "üben", "to criticise", ["Man darf Kritik ___ .", "Er möchte Kritik an dem Plan ___ .", "Sie will keine Kritik ___ ."]),
    NV("zur Verfügung stellen", "stellen", "to provide", ["Können Sie den Raum zur Verfügung ___ ?", "Wir möchten die Daten zur Verfügung ___ .", "Die Firma kann mir einen Wagen zur Verfügung ___ ."]),
    NV("in Frage stellen", "stellen", "to question, to doubt", ["Ich möchte das nicht in Frage ___ .", "Niemand darf seine Ehrlichkeit in Frage ___ .", "Das könnte das ganze Projekt in Frage ___ ."]),
    NV("Rücksicht nehmen", "nehmen", "to be considerate", ["Du musst mehr Rücksicht ___ .", "Bitte versuch, Rücksicht auf die Nachbarn zu ___ .", "Er will keine Rücksicht ___ ."]),
    NV("in Kauf nehmen", "nehmen", "to accept (a drawback)", ["Wir müssen Verluste in Kauf ___ .", "Das würde ich gern in Kauf ___ .", "Sie muss den langen Weg in Kauf ___ ."]),
    NV("in Betracht ziehen", "ziehen", "to consider", ["Wir sollten alle Optionen in Betracht ___ .", "Er möchte einen Umzug in Betracht ___ .", "Das müssen wir in Betracht ___ ."]),
    NV("zum Ausdruck bringen", "bringen", "to express", ["Er möchte seine Sorgen zum Ausdruck ___ .", "Sie will ihre Freude zum Ausdruck ___ .", "Ich möchte meinen Dank zum Ausdruck ___ ."]),
    NV("eine Rolle spielen", "spielen", "to matter, to play a role", ["Geld soll dabei keine Rolle ___ .", "Bildung kann eine wichtige Rolle ___ .", "Das dürfte hier keine Rolle ___ ."]),
    NV("Hilfe leisten", "leisten", "to provide help", ["Wir wollen schnelle Hilfe ___ .", "Er kann Erste Hilfe ___ .", "Sie möchte finanzielle Hilfe ___ ."]),
    NV("Bescheid geben", "geben", "to let someone know", ["Kannst du mir bitte Bescheid ___ ?", "Ich werde dir morgen Bescheid ___ .", "Bitte versuchen Sie, mir rechtzeitig Bescheid zu ___ ."]),
    NV("Abschied nehmen", "nehmen", "to say goodbye", ["Wir müssen Abschied von den Gästen ___ .", "Sie will Abschied von ihrer Heimat ___ .", "Es fiel ihm schwer, Abschied zu ___ ."]),
    NV("in Anspruch nehmen", "nehmen", "to make use of, to take up", ["Das wird viel Zeit in Anspruch ___ .", "Ich möchte Ihre Hilfe gern in Anspruch ___ .", "Der Umbau könnte mehrere Wochen in Anspruch ___ ."]),
    NV("eine Frage stellen", "stellen", "to ask a question", ["Darf ich eine Frage ___ ?", "Er möchte eine schwierige Frage ___ .", "Die Schüler wollen viele Fragen ___ ."]),
    NV("Stellung nehmen", "nehmen", "to take a position, to comment", ["Der Minister muss zu den Vorwürfen Stellung ___ .", "Können Sie dazu Stellung ___ ?", "Sie wollte keine Stellung ___ ."]),
    NV("Wert legen auf", "legen", "to attach importance to", ["Ich möchte großen Wert auf Pünktlichkeit ___ .", "Sie will Wert auf gute Qualität ___ .", "Er kann keinen Wert auf Äußerlichkeiten ___ ."]),
    NV("einen Beitrag leisten", "leisten", "to make a contribution", ["Jeder kann einen Beitrag ___ .", "Sie möchte einen wichtigen Beitrag ___ .", "Wir wollen einen Beitrag zum Umweltschutz ___ ."]),
    NV("einen Fehler machen", "machen", "to make a mistake — the one case where machen is right", ["Jeder kann einen Fehler ___ .", "Man sollte keinen Fehler ___ .", "Wir dürfen keinen Fehler ___ ."]),
  ],
};

// ─── Formen bilden: ein generischer Eintrag „Wort → Form" ────────────────────
const F = (answer: string, prompt: string, explain: string): DrillItem => ({ answer, explain, sentences: [prompt] });
// wie F, aber mit weiteren korrekten Lösungen (z. B. Komm! / Komme!).
const Fa = (answer: string, alt: string[], prompt: string, explain: string): DrillItem => ({ answer, alt, explain, sentences: [prompt] });

// Plural
const PLURALS: DrillSet = {
  key: "plurals", unitSlug: "plurals", title: "Making nouns plural",
  items: [
    F("Tische", "der Tisch → die ___", "**-e**: die Tische."),
    F("Stühle", "der Stuhl → die ___", "**-e** with Umlaut: die Stühle."),
    F("Bücher", "das Buch → die ___", "**-er** with Umlaut: die Bücher."),
    F("Kinder", "das Kind → die ___", "**-er**: die Kinder."),
    F("Frauen", "die Frau → die ___", "**-en**: die Frauen."),
    F("Männer", "der Mann → die ___", "**-er** with Umlaut: die Männer."),
    F("Autos", "das Auto → die ___", "**-s** (foreign word): die Autos."),
    F("Häuser", "das Haus → die ___", "**-er** with Umlaut: die Häuser."),
    F("Äpfel", "der Apfel → die ___", "only an **Umlaut**: die Äpfel."),
    F("Bäume", "der Baum → die ___", "**-e** with Umlaut: die Bäume."),
    F("Blumen", "die Blume → die ___", "**-n**: die Blumen."),
    F("Hunde", "der Hund → die ___", "**-e**: die Hunde."),
    F("Katzen", "die Katze → die ___", "**-n**: die Katzen."),
    F("Bälle", "der Ball → die ___", "**-e** with Umlaut: die Bälle."),
    F("Ärzte", "der Arzt → die ___", "**-e** with Umlaut: die Ärzte."),
    F("Väter", "der Vater → die ___", "only an **Umlaut**: die Väter."),
    F("Mütter", "die Mutter → die ___", "only an **Umlaut**: die Mütter."),
    F("Bilder", "das Bild → die ___", "**-er**: die Bilder."),
    F("Städte", "die Stadt → die ___", "**-e** with Umlaut: die Städte."),
    F("Tage", "der Tag → die ___", "**-e**: die Tage."),
    F("Jahre", "das Jahr → die ___", "**-e**: die Jahre."),
    F("Hände", "die Hand → die ___", "**-e** with Umlaut: die Hände."),
    F("Freunde", "der Freund → die ___", "**-e**: die Freunde."),
    F("Wohnungen", "die Wohnung → die ___", "**-en** (all -ung words): die Wohnungen."),
    F("Wörter", "das Wort → die ___", "**-er** with Umlaut: die Wörter."),
    F("Brüder", "der Bruder → die ___", "**-er** with Umlaut: die Brüder."),
    F("Straßen", "die Straße → die ___", "**-n**: die Straßen."),
    F("Gläser", "das Glas → die ___", "**-er** with Umlaut: die Gläser."),
    F("Züge", "der Zug → die ___", "**-e** with Umlaut: die Züge."),
    F("Nächte", "die Nacht → die ___", "**-e** with Umlaut: die Nächte."),
  ],
};

// Präteritum (er/sie/es-Form)
const PRETERITE: DrillSet = {
  key: "preterite", unitSlug: "preterite", title: "The written past (Präteritum)",
  items: [
    F("ging", "gehen → er ___", "irregular: **ging** (no -te)."),
    F("kam", "kommen → er ___", "irregular: **kam**."),
    F("sah", "sehen → er ___", "irregular: **sah**."),
    F("war", "sein → er ___", "irregular: **war**."),
    F("hatte", "haben → er ___", "irregular: **hatte**."),
    F("wurde", "werden → er ___", "irregular: **wurde**."),
    F("gab", "geben → er ___", "irregular: **gab**."),
    F("nahm", "nehmen → er ___", "irregular: **nahm**."),
    F("fand", "finden → er ___", "irregular: **fand**."),
    F("sprach", "sprechen → er ___", "irregular: **sprach**."),
    F("fuhr", "fahren → er ___", "irregular: **fuhr**."),
    F("schrieb", "schreiben → er ___", "irregular: **schrieb**."),
    F("las", "lesen → er ___", "irregular: **las**."),
    F("aß", "essen → er ___", "irregular: **aß**."),
    F("trank", "trinken → er ___", "irregular: **trank**."),
    F("lief", "laufen → er ___", "irregular: **lief**."),
    F("schlief", "schlafen → er ___", "irregular: **schlief**."),
    F("trug", "tragen → er ___", "irregular: **trug**."),
    F("traf", "treffen → er ___", "irregular: **traf**."),
    F("dachte", "denken → er ___", "irregular: **dachte**."),
    F("brachte", "bringen → er ___", "irregular: **brachte**."),
    F("wusste", "wissen → er ___", "irregular: **wusste**."),
    F("machte", "machen → er ___", "regular: **machte** (stem + -te)."),
    F("sagte", "sagen → er ___", "regular: **sagte**."),
    F("arbeitete", "arbeiten → er ___", "regular, extra -e: **arbeitete**."),
    F("wohnte", "wohnen → er ___", "regular: **wohnte**."),
  ],
};

// Partizip II (Perfekt)
const PARTIZIP: DrillSet = {
  key: "perfekt", unitSlug: "perfekt", title: "The past (Partizip II)",
  items: [
    F("gelernt", "lernen → Partizip II: ___", "regular: **ge- + stem + -t**: gelernt."),
    F("gemacht", "machen → Partizip II: ___", "regular: **gemacht**."),
    F("gekauft", "kaufen → Partizip II: ___", "regular: **gekauft**."),
    F("gespielt", "spielen → Partizip II: ___", "regular: **gespielt**."),
    F("gesagt", "sagen → Partizip II: ___", "regular: **gesagt**."),
    F("gearbeitet", "arbeiten → Partizip II: ___", "regular, extra -e: **gearbeitet**."),
    F("gesehen", "sehen → Partizip II: ___", "irregular: **gesehen**."),
    F("getrunken", "trinken → Partizip II: ___", "irregular: **getrunken**."),
    F("gegangen", "gehen → Partizip II: ___", "irregular: **gegangen**."),
    F("gekommen", "kommen → Partizip II: ___", "irregular: **gekommen**."),
    F("gegessen", "essen → Partizip II: ___", "irregular: **gegessen**."),
    F("gegeben", "geben → Partizip II: ___", "irregular: **gegeben**."),
    F("genommen", "nehmen → Partizip II: ___", "irregular: **genommen**."),
    F("gefunden", "finden → Partizip II: ___", "irregular: **gefunden**."),
    F("gesprochen", "sprechen → Partizip II: ___", "irregular: **gesprochen**."),
    F("geschrieben", "schreiben → Partizip II: ___", "irregular: **geschrieben**."),
    F("gelesen", "lesen → Partizip II: ___", "irregular: **gelesen**."),
    F("gefahren", "fahren → Partizip II: ___", "irregular (takes sein): **gefahren**."),
    F("gelaufen", "laufen → Partizip II: ___", "irregular (takes sein): **gelaufen**."),
    F("geschlafen", "schlafen → Partizip II: ___", "irregular: **geschlafen**."),
    F("studiert", "studieren → Partizip II: ___", "**no ge-** (verbs in -ieren): studiert."),
    F("verstanden", "verstehen → Partizip II: ___", "**no ge-** (non-separable prefix): verstanden."),
    F("aufgestanden", "aufstehen → Partizip II: ___", "**ge- in the middle** (separable): aufgestanden."),
    F("eingekauft", "einkaufen → Partizip II: ___", "separable: **eingekauft**."),
  ],
};

// Vokalwechsel (er-Form Präsens)
const STEM_CHANGING: DrillSet = {
  key: "stem-changing-verbs", unitSlug: "stem-changing-verbs", title: "Verbs that change their vowel",
  items: [
    F("fährt", "fahren → er ___", "a → ä: **fährt**."),
    F("schläft", "schlafen → er ___", "a → ä: **schläft**."),
    F("trägt", "tragen → er ___", "a → ä: **trägt**."),
    F("fällt", "fallen → er ___", "a → ä: **fällt**."),
    F("hält", "halten → er ___", "a → ä: **hält**."),
    F("läuft", "laufen → er ___", "au → äu: **läuft**."),
    F("spricht", "sprechen → er ___", "e → i: **spricht**."),
    F("isst", "essen → er ___", "e → i: **isst**."),
    F("gibt", "geben → er ___", "e → i: **gibt**."),
    F("hilft", "helfen → er ___", "e → i: **hilft**."),
    F("trifft", "treffen → er ___", "e → i: **trifft**."),
    F("vergisst", "vergessen → er ___", "e → i: **vergisst**."),
    F("sieht", "sehen → er ___", "e → ie: **sieht**."),
    F("liest", "lesen → er ___", "e → ie: **liest**."),
    F("nimmt", "nehmen → er ___", "special: **nimmt** (h drops, m doubles)."),
    F("wird", "werden → er ___", "special: **wird**."),
  ],
};

// Komparativ
const COMPARISONS: DrillSet = {
  key: "comparisons", unitSlug: "comparisons", title: "Comparing things",
  items: [
    F("kleiner", "klein → ___ (comparative)", "**-er**: kleiner."),
    F("größer", "groß → ___ (comparative)", "Umlaut + -er: **größer**."),
    F("älter", "alt → ___ (comparative)", "Umlaut + -er: **älter**."),
    F("jünger", "jung → ___ (comparative)", "Umlaut + -er: **jünger**."),
    F("länger", "lang → ___ (comparative)", "Umlaut + -er: **länger**."),
    F("kürzer", "kurz → ___ (comparative)", "Umlaut + -er: **kürzer**."),
    F("schneller", "schnell → ___ (comparative)", "**-er**: schneller."),
    F("langsamer", "langsam → ___ (comparative)", "**-er**: langsamer."),
    F("schöner", "schön → ___ (comparative)", "**-er**: schöner."),
    F("besser", "gut → ___ (comparative)", "irregular: **besser**."),
    F("mehr", "viel → ___ (comparative)", "irregular: **mehr**."),
    F("lieber", "gern → ___ (comparative)", "irregular: **lieber**."),
    F("höher", "hoch → ___ (comparative)", "irregular: **höher**."),
    F("wärmer", "warm → ___ (comparative)", "Umlaut + -er: **wärmer**."),
    F("kälter", "kalt → ___ (comparative)", "Umlaut + -er: **kälter**."),
    F("stärker", "stark → ___ (comparative)", "Umlaut + -er: **stärker**."),
    F("interessanter", "interessant → ___ (comparative)", "**-er**, no mehr: interessanter."),
    F("teurer", "teuer → ___ (comparative)", "the e drops: **teurer**."),
  ],
};

// Präsens (regelmäßig) – Person + Infinitiv → Form
const PRESENT: DrillSet = {
  key: "present-tense", unitSlug: "present-tense", title: "Verb endings (present tense)",
  items: [
    F("lerne", "Ich ___ Deutsch. (lernen)", "**ich** → -e: lerne."),
    F("wohnst", "Du ___ in Berlin. (wohnen)", "**du** → -st: wohnst."),
    F("trinkt", "Er ___ Kaffee. (trinken)", "**er** → -t: trinkt."),
    F("brauche", "Ich ___ ein Wörterbuch. (brauchen)", "**ich** → -e: brauche."),
    F("spielt", "Ihr ___ Fußball. (spielen)", "**ihr** → -t: spielt."),
    F("schreibe", "Ich ___ einen Brief. (schreiben)", "**ich** → -e: schreibe."),
    F("arbeitest", "Du ___ viel. (arbeiten)", "stem in -t, extra -e: **arbeitest**."),
    F("kauft", "Er ___ ein Auto. (kaufen)", "**er** → -t: kauft."),
    F("sagt", "Er ___ die Wahrheit. (sagen)", "**er** → -t: sagt."),
    F("macht", "Ihr ___ das zusammen. (machen)", "**ihr** → -t: macht."),
    F("wohnt", "Das Kind ___ hier. (wohnen)", "3rd person → -t: wohnt."),
    F("suchst", "Du ___ den Schlüssel. (suchen)", "**du** → -st: suchst."),
    F("lernst", "Du ___ schnell. (lernen)", "**du** → -st: lernst."),
    F("kommt", "Er ___ aus Spanien. (kommen)", "**er** → -t: kommt."),
    F("arbeite", "Ich ___ hier. (arbeiten)", "stem in -t, extra -e: **arbeite**."),
  ],
};

// Modalverben – Person → Form
const MODALS: DrillSet = {
  key: "modal-verbs", unitSlug: "modal-verbs", title: "Modal verbs",
  items: [
    F("kann", "Ich ___ gut schwimmen. (können)", "**ich** → kann (no ending)."),
    F("musst", "Du ___ heute arbeiten. (müssen)", "**du** → musst."),
    F("will", "Er ___ ins Kino gehen. (wollen)", "**er** → will (no ending)."),
    F("soll", "Er ___ pünktlich sein. (sollen)", "**er** → soll (no ending)."),
    F("dürft", "Ihr ___ hier bleiben. (dürfen)", "**ihr** → dürft."),
    F("muss", "Ich ___ nach Hause gehen. (müssen)", "**ich** → muss (no ending)."),
    F("sollst", "Du ___ mehr schlafen. (sollen)", "**du** → sollst."),
    F("kann", "Er ___ nicht kommen. (können)", "**er** → kann (same as ich)."),
    F("möchte", "Ich ___ einen Kaffee. (möchten)", "**ich** → möchte."),
    F("könnt", "Ihr ___ das machen. (können)", "**ihr** → könnt."),
    F("darf", "Ich ___ hier rauchen? (dürfen)", "**ich** → darf (no ending)."),
    F("wollt", "Ihr ___ ins Kino gehen. (wollen)", "**ihr** → wollt."),
  ],
};

// haben und sein
const HABEN_SEIN: DrillSet = {
  key: "haben-sein", unitSlug: "haben-sein", title: "haben and sein",
  items: [
    F("bin", "Ich ___ müde. (sein)", "**ich** → bin."),
    F("bist", "Du ___ nett. (sein)", "**du** → bist."),
    F("ist", "Er ___ Lehrer. (sein)", "**er** → ist."),
    F("sind", "Wir ___ zu Hause. (sein)", "**wir** → sind."),
    F("seid", "Ihr ___ spät dran. (sein)", "**ihr** → seid (not sind!)."),
    F("habe", "Ich ___ Hunger. (haben)", "**ich** → habe."),
    F("hast", "Du ___ Zeit. (haben)", "**du** → hast."),
    F("hat", "Er ___ ein Auto. (haben)", "**er** → hat."),
    F("sind", "Die Kinder ___ hier. (sein)", "plural → sind."),
    F("habt", "Ihr ___ Recht. (haben)", "**ihr** → habt."),
    F("ist", "Das Kind ___ klein. (sein)", "3rd person → ist."),
    F("bin", "Ich ___ aus Berlin. (sein)", "**ich** → bin."),
  ],
};

// Futur (werden + Infinitiv)
const FUTURE: DrillSet = {
  key: "future", unitSlug: "future", title: "Talking about the future",
  items: [
    F("werde", "Ich ___ morgen arbeiten. (werden)", "**ich** → werde."),
    F("wirst", "Du ___ das schaffen. (werden)", "**du** → wirst."),
    F("wird", "Er ___ bald kommen. (werden)", "**er** → wird."),
    F("wird", "Das Kind ___ groß. (werden)", "3rd person → wird."),
    F("werdet", "Ihr ___ viel lernen. (werden)", "**ihr** → werdet."),
    F("wird", "Es ___ morgen regnen. (werden)", "**es** → wird."),
    F("werde", "Ich ___ dir helfen. (werden)", "**ich** → werde."),
    F("wirst", "Du ___ es bald verstehen. (werden)", "**du** → wirst."),
  ],
};

// Reflexivpronomen
const REFLEXIVE: DrillSet = {
  key: "reflexive-verbs", unitSlug: "reflexive-verbs", title: "Reflexive verbs",
  items: [
    F("mich", "Ich freue ___ auf das Wochenende.", "**ich** → mich."),
    F("dich", "Du interessierst ___ für Musik.", "**du** → dich."),
    F("sich", "Er fühlt ___ nicht gut.", "**er** → sich."),
    F("uns", "Wir treffen ___ um acht.", "**wir** → uns."),
    F("euch", "Beeilt ___! (ihr)", "**ihr** → euch."),
    F("mich", "Ich erinnere ___ an den Tag.", "**ich** → mich."),
    F("dich", "Setz ___ auf den Stuhl! (du)", "**du** → dich."),
    F("sich", "Sie freut ___ über das Geschenk.", "3rd person → sich."),
    F("uns", "Wir verabschieden ___ von euch.", "**wir** → uns."),
    F("mir", "Ich wasche ___ die Hände.", "with a second object → Dativ: **mir**."),
  ],
};

// Objektpronomen (Akkusativ/Dativ)
const OBJECT_PRONOUNS: DrillSet = {
  key: "object-pronouns", unitSlug: "object-pronouns", title: "Object pronouns",
  items: [
    F("ihn", "Ich sehe den Mann. → Ich sehe ___ .", "Akkusativ, masculine → ihn."),
    F("ihm", "Ich helfe dem Mann. → Ich helfe ___ .", "Dativ (helfen), masculine → ihm."),
    F("sie", "Ich kenne die Frau. → Ich kenne ___ .", "Akkusativ, feminine → sie."),
    F("ihr", "Ich danke der Frau. → Ich danke ___ .", "Dativ (danken), feminine → ihr."),
    F("es", "Ich lese das Buch. → Ich lese ___ .", "Akkusativ, neuter → es."),
    F("sie", "Ich sehe die Kinder. → Ich sehe ___ .", "Akkusativ, plural → sie."),
    F("ihnen", "Ich helfe den Kindern. → Ich helfe ___ .", "Dativ, plural → ihnen."),
    F("mir", "Kannst du ___ helfen? (me)", "Dativ of ich → mir."),
    F("mich", "Er sieht ___ . (me)", "Akkusativ of ich → mich."),
    F("dich", "Ich verstehe ___ . (you, du)", "Akkusativ of du → dich."),
    F("uns", "Er besucht ___ . (us)", "Akkusativ of wir → uns."),
    F("ihm", "Ich gebe ___ das Buch. (dem Kind)", "Dativ, neuter → ihm."),
  ],
};

// Die vier Fälle – der Satz erzwingt den Kasus, (m/f/n/pl) gibt das Genus,
// damit hier wirklich nur der Kasus geübt wird (nicht das Auswendig-Genus).
const CASES: DrillSet = {
  key: "cases", unitSlug: "cases", title: "The four cases",
  items: [
    F("der", "___ Mann schläft. (m)", "subject → Nominativ: **der** Mann."),
    F("den", "Ich sehe ___ Mann. (m)", "sehen → Akkusativ, masc: **den** Mann."),
    F("dem", "Ich helfe ___ Mann. (m)", "helfen → Dativ, masc: **dem** Mann."),
    F("die", "___ Frau liest. (f)", "subject → Nominativ: **die** Frau."),
    F("die", "Ich kenne ___ Frau. (f)", "Akkusativ, fem = **die** (unchanged)."),
    F("der", "Ich danke ___ Frau. (f)", "danken → Dativ, fem: **der** Frau."),
    F("das", "___ Auto ist neu. (n)", "subject → Nominativ: **das** Auto."),
    F("das", "Ich kaufe ___ Auto. (n)", "Akkusativ, neuter = **das** (unchanged)."),
    F("dem", "Das Buch liegt auf ___ Tisch. (m)", "position → Dativ, masc: **dem** Tisch."),
    F("den", "Ich frage ___ Lehrer. (m)", "fragen → Akkusativ: **den** Lehrer."),
    F("dem", "Ich gebe ___ Kind ein Buch. (n)", "indirect object → Dativ: **dem** Kind."),
    F("die", "Ich sehe ___ Katze. (f)", "Akkusativ, fem = **die**."),
    F("den", "Das gehört ___ Kindern. (pl)", "Dativ Plural → **den** Kindern (+n)."),
    F("der", "Das ist das Auto ___ Frau. (f)", "possession → Genitiv, fem: **der** Frau."),
  ],
};

// Verben mit Dativ – der Clou ist: diese Verben nehmen Dativ, obwohl sich das
// wie ein Objekt anfuehlt. Antwort ist immer ein Dativ-Artikel.
const DATIVE_VERBS: DrillSet = {
  key: "verbs-and-cases", unitSlug: "verbs-and-cases", title: "Verbs that take the dative",
  items: [
    F("dem", "Ich helfe ___ Mann. (m)", "helfen + Dativ: **dem** Mann."),
    F("der", "Ich danke ___ Frau. (f)", "danken + Dativ: **der** Frau."),
    F("dem", "Das Buch gehört ___ Kind. (n)", "gehören + Dativ: **dem** Kind."),
    F("dem", "Der Film gefällt ___ Mann. (m)", "gefallen + Dativ: **dem** Mann."),
    F("dem", "Ich antworte ___ Lehrer. (m)", "antworten + Dativ: **dem** Lehrer."),
    F("der", "Ich folge ___ Frau. (f)", "folgen + Dativ: **der** Frau."),
    F("dem", "Ich glaube ___ Mann. (m)", "glauben + Dativ: **dem** Mann."),
    F("der", "Die Jacke passt ___ Frau. (f)", "passen + Dativ: **der** Frau."),
    F("dem", "Ich gratuliere ___ Freund. (m)", "gratulieren + Dativ: **dem** Freund."),
    F("der", "Das Kleid steht ___ Frau gut. (f)", "stehen (suit) + Dativ: **der** Frau."),
    F("den", "Das gehört ___ Kindern. (pl)", "Dativ Plural: **den** Kindern."),
    F("den", "Ich danke ___ Eltern. (pl)", "danken + Dativ Plural: **den** Eltern."),
    F("dem", "Ich helfe ___ Kind. (n)", "helfen + Dativ: **dem** Kind."),
    F("der", "Ich vertraue ___ Ärztin. (f)", "vertrauen + Dativ: **der** Ärztin."),
  ],
};

// Grundpraepositionen mit festem Fall (nur nicht-verschmelzende Praepositionen,
// damit die Antwort eindeutig bleibt: fuer/ohne/gegen/durch/um = Akk, mit/aus = Dat).
const PREPOSITIONS: DrillSet = {
  key: "prepositions", unitSlug: "prepositions", title: "Prepositions and their case",
  items: [
    F("den", "für ___ Mann (m)", "für + Akkusativ: **den** Mann."),
    F("die", "für ___ Frau (f)", "für + Akkusativ, fem: **die** Frau."),
    F("das", "für ___ Kind (n)", "für + Akkusativ, neuter: **das** Kind."),
    F("den", "ohne ___ Hund (m)", "ohne + Akkusativ: **den** Hund."),
    F("die", "ohne ___ Tasche (f)", "ohne + Akkusativ, fem: **die** Tasche."),
    F("die", "gegen ___ Wand (f)", "gegen + Akkusativ, fem: **die** Wand."),
    F("den", "durch ___ Park (m)", "durch + Akkusativ: **den** Park."),
    F("das", "durch ___ Fenster (n)", "durch + Akkusativ, neuter: **das** Fenster."),
    F("den", "um ___ Tisch (m)", "um + Akkusativ: **den** Tisch."),
    F("dem", "mit ___ Auto (n)", "mit + Dativ, neuter: **dem** Auto."),
    F("der", "mit ___ Freundin (f)", "mit + Dativ, fem: **der** Freundin."),
    F("dem", "mit ___ Hund (m)", "mit + Dativ, masc: **dem** Hund."),
    F("der", "aus ___ Stadt (f)", "aus + Dativ, fem: **der** Stadt."),
    F("dem", "aus ___ Haus (n)", "aus + Dativ, neuter: **dem** Haus."),
  ],
};

// Wechselpraepositionen – (wohin?) = Bewegung = Akkusativ, (wo?) = Ort = Dativ.
// Nur nicht-verschmelzende Praepositionen (auf/ueber/neben/hinter/unter), damit
// die Dativ-Antwort nicht zu im/am wird.
const TWO_WAY: DrillSet = {
  key: "two-way-prepositions", unitSlug: "two-way-prepositions", title: "Two-way prepositions",
  items: [
    F("den", "Ich lege das Buch auf ___ Tisch. (wohin? · m)", "movement → Akkusativ: auf **den** Tisch."),
    F("dem", "Das Buch liegt auf ___ Tisch. (wo? · m)", "position → Dativ: auf **dem** Tisch."),
    F("das", "Ich hänge ein Foto über ___ Sofa. (wohin? · n)", "movement → Akkusativ: über **das** Sofa."),
    F("dem", "Das Foto hängt über ___ Sofa. (wo? · n)", "position → Dativ: über **dem** Sofa."),
    F("das", "Ich stelle die Lampe neben ___ Bett. (wohin? · n)", "movement → Akkusativ: neben **das** Bett."),
    F("dem", "Die Lampe steht neben ___ Bett. (wo? · n)", "position → Dativ: neben **dem** Bett."),
    F("den", "Die Katze springt auf ___ Stuhl. (wohin? · m)", "movement → Akkusativ: auf **den** Stuhl."),
    F("dem", "Die Katze sitzt auf ___ Stuhl. (wo? · m)", "position → Dativ: auf **dem** Stuhl."),
    F("die", "Ich hänge das Handtuch hinter ___ Tür. (wohin? · f)", "movement → Akkusativ: hinter **die** Tür."),
    F("der", "Das Handtuch hängt hinter ___ Tür. (wo? · f)", "position → Dativ: hinter **der** Tür."),
    F("den", "Der Ball rollt unter ___ Tisch. (wohin? · m)", "movement → Akkusativ: unter **den** Tisch."),
    F("dem", "Der Ball liegt unter ___ Tisch. (wo? · m)", "position → Dativ: unter **dem** Tisch."),
    F("die", "Ich stelle das Glas auf ___ Kommode. (wohin? · f)", "movement → Akkusativ: auf **die** Kommode."),
    F("der", "Das Glas steht auf ___ Kommode. (wo? · f)", "position → Dativ: auf **der** Kommode."),
  ],
};

// N-Deklination – schwache Maskulina bekommen im Akk/Dat/Gen ein -(e)n.
const N_DECLENSION: DrillSet = {
  key: "n-declension", unitSlug: "n-declension", title: "N-declension",
  items: [
    F("Studenten", "Ich sehe den ___ . (Student)", "n-declension: den **Studenten** (+en)."),
    F("Jungen", "Ich helfe dem ___ . (Junge)", "n-declension: dem **Jungen**."),
    F("Nachbarn", "das Auto des ___ (Nachbar)", "n-declension: des **Nachbarn**."),
    F("Kollegen", "Ich kenne den ___ . (Kollege)", "n-declension: den **Kollegen**."),
    F("Touristen", "Ich spreche mit dem ___ . (Tourist)", "n-declension: dem **Touristen**."),
    F("Polizisten", "Ich frage den ___ . (Polizist)", "n-declension: den **Polizisten**."),
    F("Menschen", "Ich glaube dem ___ . (Mensch)", "n-declension: dem **Menschen**."),
    F("Herrn", "der Hut des ___ (Herr)", "Herr → des **Herrn** (singular -n)."),
    F("Präsidenten", "Ich sehe den ___ . (Präsident)", "n-declension: den **Präsidenten**."),
    F("Kunden", "Ich berate den ___ . (Kunde)", "n-declension: den **Kunden**."),
    F("Kollegen", "Ich gebe dem ___ das Buch. (Kollege)", "n-declension, Dativ: dem **Kollegen**."),
    F("Namen", "Wie schreibt man den ___ ? (Name)", "Name → den **Namen**."),
  ],
};

// Genitiv-Praepositionen – wegen/waehrend/trotz/statt... + Genitiv.
// Antwort ist der Genitiv-Artikel: des (m/n) oder der (f/pl).
const GENITIVE_PREPS: DrillSet = {
  key: "genitive-prepositions", unitSlug: "genitive-prepositions", title: "Genitive prepositions",
  items: [
    F("des", "wegen ___ Wetters (n)", "wegen + Genitiv, neuter: **des** Wetters."),
    F("der", "während ___ Woche (f)", "während + Genitiv, fem: **der** Woche."),
    F("des", "trotz ___ Regens (m)", "trotz + Genitiv, masc: **des** Regens."),
    F("der", "wegen ___ Kinder (pl)", "Genitiv Plural: **der** Kinder."),
    F("des", "statt ___ Autos (n)", "statt + Genitiv, neuter: **des** Autos."),
    F("der", "während ___ Reise (f)", "während + Genitiv, fem: **der** Reise."),
    F("der", "trotz ___ Kälte (f)", "trotz + Genitiv, fem: **der** Kälte."),
    F("der", "außerhalb ___ Stadt (f)", "außerhalb + Genitiv, fem: **der** Stadt."),
    F("des", "wegen ___ Mannes (m)", "wegen + Genitiv, masc: **des** Mannes."),
    F("des", "aufgrund ___ Fehlers (m)", "aufgrund + Genitiv, masc: **des** Fehlers."),
    F("der", "innerhalb ___ Stunde (f)", "innerhalb + Genitiv, fem: **der** Stunde."),
    F("der", "während ___ Ferien (pl)", "Genitiv Plural: **der** Ferien."),
  ],
};

// Imperativ (du) – regelmäßige Verben akzeptieren beide Formen (Komm/Komme),
// die Vokalwechsler (e→i/ie) haben nur eine Form (Lies, Gib …).
const IMPERATIVE: DrillSet = {
  key: "imperative", unitSlug: "imperative", title: "The imperative (du)",
  items: [
    Fa("Komm", ["Komme"], "kommen → du: ___ !", "drop -st, no pronoun: **Komm!** (also Komme)."),
    Fa("Geh", ["Gehe"], "gehen → du: ___ !", "**Geh!** (also Gehe)."),
    Fa("Mach", ["Mache"], "machen → du: ___ !", "**Mach!** (also Mache)."),
    Fa("Hör", ["Höre"], "hören → du: ___ !", "**Hör!** (also Höre)."),
    Fa("Sag", ["Sage"], "sagen → du: ___ !", "**Sag!** (also Sage)."),
    Fa("Frag", ["Frage"], "fragen → du: ___ !", "**Frag!** (also Frage)."),
    Fa("Fahr", ["Fahre"], "fahren → du: ___ !", "a stays a: **Fahr!** (also Fahre)."),
    F("Warte", "warten → du: ___ !", "stem in -t keeps -e: **Warte!**"),
    F("Öffne", "öffnen → du: ___ !", "stem in -n keeps -e: **Öffne!**"),
    F("Lies", "lesen → du: ___ !", "e→ie: **Lies!**"),
    F("Iss", "essen → du: ___ !", "e→i: **Iss!**"),
    F("Nimm", "nehmen → du: ___ !", "irregular e→i: **Nimm!**"),
    F("Gib", "geben → du: ___ !", "e→i: **Gib!**"),
    F("Hilf", "helfen → du: ___ !", "e→i: **Hilf!**"),
    F("Sprich", "sprechen → du: ___ !", "e→i: **Sprich!**"),
    F("Sei", "sein → du: ___ !", "irregular: **Sei!**"),
  ],
};

// Konjunktiv II – Grundverb → Form. Wollen/sollen sind bewusst nicht dabei
// (ihr K II = Präteritum, das wäre zweideutig).
const KONJUNKTIV_2: DrillSet = {
  key: "konjunktiv-2", unitSlug: "konjunktiv-2", title: "Konjunktiv II",
  items: [
    F("hätte", "haben → ich ___ (Konjunktiv II)", "haben → **hätte**."),
    F("wäre", "sein → ich ___ (Konjunktiv II)", "sein → **wäre**."),
    F("würde", "werden → ich ___ (Konjunktiv II)", "werden → **würde**."),
    F("könnte", "können → ich ___ (Konjunktiv II)", "können → **könnte**."),
    F("müsste", "müssen → ich ___ (Konjunktiv II)", "müssen → **müsste**."),
    F("dürfte", "dürfen → ich ___ (Konjunktiv II)", "dürfen → **dürfte**."),
    F("hättest", "haben → du ___ (Konjunktiv II)", "du-form → **hättest**."),
    F("wären", "sein → wir ___ (Konjunktiv II)", "wir-form → **wären**."),
    F("könnten", "können → wir ___ (Konjunktiv II)", "wir-form → **könnten**."),
    F("würdest", "werden → du ___ (Konjunktiv II)", "du-form → **würdest**."),
    F("hätte", "haben → er ___ (Konjunktiv II)", "er-form = ich-form → **hätte**."),
    F("wäre", "sein → er ___ (Konjunktiv II)", "er-form → **wäre**."),
    F("möchte", "mögen → ich ___ (Konjunktiv II)", "mögen → **möchte**."),
    F("müssten", "müssen → wir ___ (Konjunktiv II)", "wir-form → **müssten**."),
  ],
};

// Adjektivendungen – Artikel + Nomen sind gegeben (also Genus/Kasus/Typ klar),
// gesucht ist das voll gebeugte Adjektiv (Grundform in Klammern).
const ADJECTIVE_ENDINGS: DrillSet = {
  key: "adjective-endings", unitSlug: "adjective-endings", title: "Adjective endings",
  items: [
    F("große", "Der ___ Mann lacht. (groß)", "def. article, Nom masc → -e: der **große** Mann."),
    F("großen", "Ich sehe den ___ Mann. (groß)", "def. article, Akk masc → -en: den **großen** Mann."),
    F("großen", "Ich helfe dem ___ Mann. (groß)", "def. article, Dativ → -en: dem **großen** Mann."),
    F("kleine", "Die ___ Frau lacht. (klein)", "def. article, Nom fem → -e: die **kleine** Frau."),
    F("kleine", "Ich kenne die ___ Frau. (klein)", "def. article, Akk fem → -e: die **kleine** Frau."),
    F("kleinen", "Ich helfe der ___ Frau. (klein)", "def. article, Dativ fem → -en: der **kleinen** Frau."),
    F("neue", "Das ___ Auto ist teuer. (neu)", "def. article, Nom neut → -e: das **neue** Auto."),
    F("neue", "Ich kaufe das ___ Auto. (neu)", "def. article, Akk neut → -e: das **neue** Auto."),
    F("großer", "Ein ___ Mann lacht. (groß)", "indef. article, Nom masc → -er: ein **großer** Mann."),
    F("großen", "Ich sehe einen ___ Mann. (groß)", "indef. article, Akk masc → -en: einen **großen** Mann."),
    F("kleine", "Eine ___ Frau lacht. (klein)", "indef. article, Nom fem → -e: eine **kleine** Frau."),
    F("neues", "Ein ___ Auto ist teuer. (neu)", "indef. article, Nom neut → -es: ein **neues** Auto."),
    F("neues", "Ich kaufe ein ___ Auto. (neu)", "indef. article, Akk neut → -es: ein **neues** Auto."),
    F("neuen", "Ich fahre mit einem ___ Auto. (neu)", "indef. article, Dativ → -en: mit einem **neuen** Auto."),
    F("netten", "Ich spreche mit einer ___ Frau. (nett)", "indef. article, Dativ fem → -en: mit einer **netten** Frau."),
  ],
};

// Ordnungszahlen – Ziffer → Wort. 1.–19. nehmen -te, ab 20. -ste; nach „am" Dativ.
const DATES_ORDINALS: DrillSet = {
  key: "dates-ordinals", unitSlug: "dates-ordinals", title: "Dates and ordinal numbers",
  items: [
    F("erste", "1 → der ___", "1 → **erste** (der erste)."),
    F("zweite", "2 → der ___", "2 → **zweite**."),
    F("dritte", "3 → der ___", "3 → **dritte** (irregular, not dreite)."),
    F("vierte", "4 → der ___", "4 → **vierte**."),
    F("fünfte", "5 → der ___", "5 → **fünfte**."),
    F("sechste", "6 → der ___", "6 → **sechste**."),
    Fa("siebte", ["siebente"], "7 → der ___", "7 → **siebte** (or siebente)."),
    F("achte", "8 → der ___", "8 → **achte** (only one t)."),
    F("neunte", "9 → der ___", "9 → **neunte**."),
    F("zehnte", "10 → der ___", "10 → **zehnte**."),
    F("zwanzigste", "20 → der ___", "from 20 on → -ste: **zwanzigste**."),
    F("hundertste", "100 → der ___", "100 → **hundertste**."),
    F("dritten", "am ___ Mai (3.)", "after am → Dativ -n: am **dritten** Mai."),
    F("ersten", "am ___ Januar (1.)", "after am → Dativ: am **ersten** Januar."),
  ],
};

// Possessivartikel – wie ein-Wörter gebeugt. (Person · Genus) ist gegeben,
// gesucht ist die volle Form mit Endung.
const POSSESSIVES: DrillSet = {
  key: "possessives", unitSlug: "possessives", title: "Possessive articles",
  items: [
    F("mein", "___ Vater ist nett. (my · m)", "Nom masc → **mein** Vater (no ending)."),
    F("meine", "___ Mutter ist nett. (my · f)", "Nom fem → **meine** Mutter."),
    F("mein", "___ Auto ist neu. (my · n)", "Nom neut → **mein** Auto (no ending)."),
    F("meinen", "Ich sehe ___ Vater. (my · m)", "Akk masc → **meinen** Vater."),
    F("meine", "Ich sehe ___ Mutter. (my · f)", "Akk fem → **meine** Mutter."),
    F("meinem", "Ich helfe ___ Vater. (my · m)", "Dativ masc → **meinem** Vater."),
    F("meiner", "Ich helfe ___ Mutter. (my · f)", "Dativ fem → **meiner** Mutter."),
    F("dein", "___ Bruder wohnt hier. (your · m)", "Nom masc → **dein** Bruder."),
    F("deine", "___ Schwester wohnt hier. (your · f)", "Nom fem → **deine** Schwester."),
    F("sein", "Das ist ___ Hund. (his · m)", "Nom masc → **sein** Hund."),
    F("ihre", "Das ist ___ Katze. (her · f)", "her + fem noun → **ihre** Katze."),
    F("unser", "Wir lieben ___ Land. (our · n)", "Akk neut → **unser** Land (no ending)."),
    F("meinem", "Ich spiele mit ___ Hund. (my · m)", "mit + Dativ masc → **meinem** Hund."),
    F("meinem", "Ich fahre mit ___ Auto. (my · n)", "mit + Dativ neut → **meinem** Auto."),
  ],
};

// Verneinung: kein (verneint Nomen ohne/mit unbestimmtem Artikel) vs. nicht
// (verneint Verben, Adjektive, bestimmte Nomen). Beides in einem Drill.
const NEGATION: DrillSet = {
  key: "negation", unitSlug: "negation", title: "Negation: nicht or kein",
  items: [
    F("keine", "Ich habe ___ Zeit.", "noun, no article → **keine** Zeit (fem)."),
    F("kein", "Ich habe ___ Auto.", "noun, no article → **kein** Auto (neut)."),
    F("kein", "Das ist ___ Problem.", "noun, no article → **kein** Problem (neut)."),
    F("keinen", "Ich habe ___ Hunger.", "noun, Akk masc → **keinen** Hunger."),
    F("keinen", "Sie hat ___ Freund.", "noun, Akk masc → **keinen** Freund."),
    F("keinen", "Ich trinke ___ Kaffee.", "noun, Akk masc → **keinen** Kaffee."),
    F("keine", "Ich habe ___ Kinder.", "plural noun → **keine** Kinder."),
    F("nicht", "Ich verstehe das ___ .", "negates the verb/definite → **nicht**."),
    F("nicht", "Ich komme heute ___ .", "negates the verb → **nicht**."),
    F("nicht", "Das Auto ist ___ teuer.", "negates an adjective → **nicht** teuer."),
    F("nicht", "Ich mag ihn ___ .", "negates the verb → **nicht**."),
    F("nicht", "Er wohnt ___ hier.", "negates the verb → **nicht**."),
    F("nicht", "Ich sehe den Film ___ .", "definite article → **nicht** (not kein)."),
    F("keine", "Wir haben ___ Milch mehr.", "noun, no article → **keine** Milch (fem)."),
  ],
};

// Trennbare Verben – die Vorsilbe wandert ans Satzende. Cue ist die englische
// Bedeutung (nicht der Infinitiv), damit die Vorsilbe nicht abschreibbar ist.
const SEPARABLE_VERBS: DrillSet = {
  key: "separable-verbs", unitSlug: "separable-verbs", title: "Separable verbs",
  items: [
    F("auf", "to get up → Ich stehe um 7 ___ .", "aufstehen → prefix **auf** goes to the end."),
    F("ein", "to go shopping → Wir kaufen heute ___ .", "einkaufen → prefix **ein**."),
    F("an", "to call (phone) → Ich rufe dich später ___ .", "anrufen → prefix **an**."),
    F("fern", "to watch TV → Am Abend sehe ich ___ .", "fernsehen → prefix **fern**."),
    F("auf", "to tidy up → Ich räume mein Zimmer ___ .", "aufräumen → prefix **auf**."),
    F("mit", "to come along → Kommst du ___ ?", "mitkommen → prefix **mit**."),
    F("ab", "to depart → Der Zug fährt um 8 ___ .", "abfahren → prefix **ab**."),
    F("an", "to arrive → Wir kommen um 10 ___ .", "ankommen → prefix **an**."),
    F("ein", "to invite → Ich lade dich ___ .", "einladen → prefix **ein**."),
    F("zu", "to close → Mach bitte die Tür ___ !", "zumachen → prefix **zu**."),
    F("auf", "to open → Mach das Fenster ___ !", "aufmachen → prefix **auf**."),
    F("weg", "to leave → Er geht früh ___ .", "weggehen → prefix **weg**."),
    F("zurück", "to come back → Ich komme bald ___ .", "zurückkommen → prefix **zurück**."),
    F("vor", "to prepare → Ich bereite das Essen ___ .", "vorbereiten → prefix **vor**."),
  ],
};

// ─── Satzbau: von Hand geschrieben (nicht aus Wortlisten generierbar) ────────

// Nebensätze – nach dass/weil/wenn/ob wandert das konjugierte Verb ans Ende.
// Cue ist der Infinitiv; gesucht ist die konjugierte Form am Satzende.
const SUBORDINATE_CLAUSES: DrillSet = {
  key: "subordinate-clauses", unitSlug: "subordinate-clauses", title: "Subordinate clauses",
  items: [
    F("kommt", "Ich weiß, dass er heute ___ . (kommen)", "Nebensatz: Verb ans Ende → **kommt**."),
    F("hat", "Ich glaube, dass sie recht ___ . (haben)", "Verb ans Ende → **hat**."),
    F("ist", "Er sagt, dass das Wetter schön ___ . (sein)", "Verb ans Ende → **ist**."),
    F("wohnt", "Ich weiß, dass sie in Berlin ___ . (wohnen)", "Verb ans Ende → **wohnt**."),
    F("arbeitet", "Sie sagt, dass er viel ___ . (arbeiten)", "Verb ans Ende → **arbeitet**."),
    F("regnet", "Ich bleibe zu Hause, weil es ___ . (regnen)", "weil: Verb ans Ende → **regnet**."),
    F("habe", "Ich komme nicht, weil ich keine Zeit ___ . (haben)", "weil: Verb ans Ende → **habe**."),
    F("bist", "Ruf mich an, wenn du fertig ___ . (sein)", "wenn: Verb ans Ende → **bist**."),
    F("kommst", "Ich frage, ob du morgen ___ . (kommen)", "ob: Verb ans Ende → **kommst**."),
    F("hilft", "Ich hoffe, dass er mir ___ . (helfen)", "Verb ans Ende → **hilft** (e→i)."),
    F("liest", "Sie sagt, dass sie gern ___ . (lesen)", "Verb ans Ende → **liest** (e→ie)."),
    F("schläft", "Sei leise, weil das Baby ___ . (schlafen)", "Verb ans Ende → **schläft** (a→ä)."),
    F("gehe", "Ich sage, dass ich nach Hause ___ . (gehen)", "Verb ans Ende → **gehe** (ich)."),
    F("versteht", "Ich hoffe, dass er mich ___ . (verstehen)", "Verb ans Ende → **versteht**."),
  ],
};

// Konnektoren – gesucht ist das Bindewort. Cue ist die englische Bedeutung
// (plus Wortstellungs-Hinweis, wo weil/denn sonst zweideutig wären).
const CONNECTORS: DrillSet = {
  key: "connectors", unitSlug: "connectors", title: "Connectors",
  items: [
    F("weil", "Ich lerne Deutsch, ___ ich in Berlin wohne. (because — verb goes to the end)", "reason, verb-final → **weil**."),
    F("aber", "Ich bin müde, ___ ich arbeite weiter. (but)", "contrast → **aber**."),
    F("deshalb", "Es regnet, ___ bleibe ich zu Hause. (therefore — note the inversion)", "consequence, position 1 → **deshalb**."),
    F("obwohl", "Ich gehe spazieren, ___ es regnet. (although)", "concession → **obwohl**."),
    F("denn", "Ich nehme einen Schirm, ___ es könnte regnen. (for — main-clause word order)", "reason, no inversion → **denn**."),
    F("wenn", "___ ich Zeit habe, lese ich. (when / if)", "condition → **wenn**."),
    F("dass", "Ich weiß, ___ er heute kommt. (that)", "content clause → **dass**."),
    F("oder", "Möchtest du Tee ___ Kaffee? (or)", "alternative → **oder**."),
    F("und", "Ich koche, ___ du deckst den Tisch. (and)", "addition → **und**."),
    F("damit", "Ich lerne viel, ___ ich die Prüfung bestehe. (so that)", "purpose → **damit**."),
    F("trotzdem", "Es regnet. ___ gehe ich spazieren. (nevertheless — note the inversion)", "concession, position 1 → **trotzdem**."),
    F("sondern", "Das ist nicht rot, ___ blau. (but rather — after a negation)", "correction → **sondern**."),
    F("ob", "Ich frage mich, ___ er heute kommt. (whether)", "indirect yes/no → **ob**."),
    F("bevor", "Ich frühstücke, ___ ich zur Arbeit gehe. (before)", "time → **bevor**."),
  ],
};

// Zweiteilige Konnektoren – die fehlende Hälfte des Paares.
const TWO_PART_CONNECTORS: DrillSet = {
  key: "two-part-connectors", unitSlug: "two-part-connectors", title: "Two-part connectors",
  items: [
    F("oder", "Entweder wir gehen ins Kino ___ wir bleiben zu Hause.", "entweder … **oder**."),
    F("noch", "Ich mag weder Kaffee ___ Tee.", "weder … **noch**."),
    F("auch", "Sie spricht nicht nur Deutsch, sondern ___ Englisch.", "nicht nur … sondern **auch**."),
    F("als", "Sowohl Anna ___ auch Tom kommen.", "sowohl … **als** auch."),
    F("aber", "Der Film war zwar lang, ___ interessant.", "zwar … **aber**."),
    F("desto", "Je mehr ich übe, ___ besser werde ich.", "je … **desto**."),
    F("entweder", "___ du hilfst mir, oder ich mache es allein.", "**entweder** … oder."),
    F("weder", "Er ist ___ groß noch klein.", "**weder** … noch."),
    F("sowohl", "___ im Sommer als auch im Winter ist es schön.", "**sowohl** … als auch."),
    F("sondern", "Ich trinke nicht nur Wasser, ___ auch Saft.", "nicht nur … **sondern** auch."),
    F("noch", "Weder er ___ sie war da.", "weder … **noch**."),
    F("desto", "Je früher, ___ besser.", "je … **desto**."),
    F("als", "Sowohl der Lehrer ___ auch die Schüler waren müde.", "sowohl … **als** auch."),
    F("aber", "Ich bin zwar müde, ___ ich mache weiter.", "zwar … **aber**."),
  ],
};

// Verbstellung – Verb an Position 2 (nach einem vorangestellten Teil), bei
// Ja/Nein-Fragen an Position 1. Cue nennt Infinitiv + Person/Satzart.
const VERB_POSITION: DrillSet = {
  key: "verb-position", unitSlug: "verb-position", title: "Verb position",
  items: [
    F("gehe", "Morgen ___ ich ins Kino. (gehen — ich)", "verb second → **gehe**."),
    F("Hast", "___ du morgen Zeit? (haben — yes/no question)", "yes/no question: verb first → **Hast**."),
    F("fährt", "Am Montag ___ er nach Berlin. (fahren — er)", "verb second → **fährt**."),
    F("Kommst", "___ du mit? (kommen — question)", "yes/no question: verb first → **Kommst**."),
    F("habe", "Heute ___ ich viel gemacht. (haben — ich)", "verb second → **habe**."),
    F("spielt", "Am Wochenende ___ sie Tennis. (spielen — sie, singular)", "verb second → **spielt**."),
    F("Wohnst", "___ du in Berlin? (wohnen — question)", "yes/no question → **Wohnst**."),
    F("ist", "Heute ___ das Wetter schön. (sein)", "verb second → **ist**."),
    F("geht", "Am Abend ___ er spazieren. (gehen — er)", "verb second → **geht**."),
    F("Bist", "___ du müde? (sein — question)", "yes/no question → **Bist**."),
    F("trinke", "Morgens ___ ich Kaffee. (trinken — ich)", "verb second → **trinke**."),
    F("Kannst", "___ du mir helfen? (können — question)", "yes/no question → **Kannst**."),
  ],
};

// Infinitiv mit zu – nach bestimmten Ausdrücken (vorhaben, versuchen, es ist
// wichtig …). Gesucht ist „zu + Infinitiv"; bei trennbaren Verben in die Mitte.
const INFINITIVE_ZU: DrillSet = {
  key: "infinitive-zu", unitSlug: "infinitive-zu", title: "Infinitive with zu",
  items: [
    F("zu lernen", "Es ist wichtig, viel ___ . (lernen)", "zu + Infinitiv → **zu lernen**."),
    F("zu arbeiten", "Ich habe vor, mehr ___ . (arbeiten)", "vorhaben → **zu arbeiten**."),
    F("zu rauchen", "Er hat aufgehört, ___ . (rauchen)", "aufhören → **zu rauchen**."),
    F("zu helfen", "Sie hat versprochen, mir ___ . (helfen)", "versprechen → **zu helfen**."),
    F("zu warten", "Ich habe keine Lust, hier ___ . (warten)", "Lust haben → **zu warten**."),
    F("zu essen", "Es ist gesund, langsam ___ . (essen)", "→ **zu essen**."),
    F("zu schlafen", "Ich versuche, früh ___ . (schlafen)", "versuchen → **zu schlafen**."),
    F("zu kommen", "Er hat vergessen, pünktlich ___ . (kommen)", "vergessen → **zu kommen**."),
    F("zu bleiben", "Ich habe beschlossen, hier ___ . (bleiben)", "beschließen → **zu bleiben**."),
    F("zu lesen", "Es macht Spaß, Bücher ___ . (lesen)", "→ **zu lesen**."),
    F("zu spielen", "Die Kinder haben angefangen, ___ . (spielen)", "anfangen → **zu spielen**."),
    F("aufzuräumen", "Ich habe vergessen, mein Zimmer ___ . (aufräumen)", "separable verb: zu goes inside → **aufzuräumen**."),
  ],
};

// Nebensätze mit Modalverben – das Modalverb steht ganz am Ende (hinter dem
// Infinitiv). Cue: Modal-Infinitiv + Person; der Vollverb-Infinitiv steht schon da.
const SUBORDINATE_MODALS: DrillSet = {
  key: "subordinate-modals", unitSlug: "subordinate-modals", title: "Modals in subordinate clauses",
  items: [
    F("muss", "Ich glaube, dass er heute arbeiten ___ . (müssen — er)", "modal goes to the very end → **muss**."),
    F("kann", "Ich weiß, dass sie gut schwimmen ___ . (können — sie sg)", "modal to the end → **kann**."),
    F("will", "Er sagt, dass er nach Hause gehen ___ . (wollen — er)", "modal to the end → **will**."),
    F("musst", "Ich hoffe, dass du nicht warten ___ . (müssen — du)", "modal to the end → **musst**."),
    F("darf", "Sie fragt, ob sie rauchen ___ . (dürfen — sie sg)", "modal to the end → **darf**."),
    F("soll", "Ich weiß nicht, was ich machen ___ . (sollen — ich)", "modal to the end → **soll**."),
    F("kannst", "Ich frage, ob du kommen ___ . (können — du)", "modal to the end → **kannst**."),
    F("will", "Ich glaube, dass sie schlafen ___ . (wollen — sie sg)", "modal to the end → **will**."),
    F("darfst", "Ich hoffe, dass du bleiben ___ . (dürfen — du)", "modal to the end → **darfst**."),
    F("kann", "Ich weiß, dass er nicht kochen ___ . (können — er)", "modal to the end → **kann**."),
    F("soll", "Sie sagt, dass er pünktlich sein ___ . (sollen — er)", "modal to the end → **soll**."),
    F("muss", "Es ist schade, dass sie gehen ___ . (müssen — sie sg)", "modal to the end → **muss**."),
  ],
};

// Plusquamperfekt – hatte/war + Partizip II (Vorvergangenheit). Gesucht ist das
// Hilfsverb; Bewegungs-/Zustandsverben nehmen war, der Rest hatte.
const PLUSQUAMPERFEKT: DrillSet = {
  key: "plusquamperfekt", unitSlug: "plusquamperfekt", title: "Past perfect (Plusquamperfekt)",
  items: [
    F("hatte", "Nachdem ich gegessen ___ , ging ich schlafen. (haben — ich)", "**hatte** + Partizip."),
    F("war", "Als der Zug ___ abgefahren, kam ich an. (sein — er)", "abfahren → sein: **war**."),
    F("hatte", "Sie ___ das Buch schon gelesen. (haben — sie sg)", "**hatte** gelesen."),
    F("hatten", "Wir ___ das Essen bestellt. (haben — wir)", "**hatten** bestellt."),
    F("war", "Er ___ nach Hause gegangen. (sein — er)", "gehen → sein: **war** gegangen."),
    F("hatte", "Ich ___ den Film schon gesehen. (haben — ich)", "**hatte** gesehen."),
    F("warst", "Du ___ zu spät gekommen. (sein — du)", "kommen → sein: **warst** gekommen."),
    F("hattest", "Du ___ die Tür geschlossen. (haben — du)", "**hattest** geschlossen."),
    F("war", "Nachdem sie ___ eingeschlafen, klingelte das Telefon. (sein — sie sg)", "einschlafen → sein: **war**."),
    F("hatte", "Er ___ mir vorher geholfen. (haben — er)", "**hatte** geholfen."),
    F("waren", "Die Gäste ___ schon gegangen. (sein — sie pl)", "**waren** gegangen."),
    F("hatte", "Ich ___ vergessen, dich anzurufen. (haben — ich)", "**hatte** vergessen."),
  ],
};

// Konjunktiv II der Vergangenheit – hätte/wäre + Partizip II (irreale
// Vergangenheit). Gesucht ist das Hilfsverb in der passenden Person.
const KONJUNKTIV_2_PAST: DrillSet = {
  key: "konjunktiv-2-past", unitSlug: "konjunktiv-2-past", title: "Konjunktiv II (past)",
  items: [
    F("hätte", "Wenn ich Zeit gehabt ___ , wäre ich gekommen. (haben — ich)", "irreal past: **hätte** + Partizip."),
    F("wäre", "Ich ___ gern gekommen, aber es ging nicht. (sein — ich)", "kommen → **wäre** gekommen."),
    F("hättest", "Du ___ das nicht sagen sollen. (haben — du)", "**hättest** … sollen."),
    F("wäre", "Er ___ fast zu spät gekommen. (sein — er)", "**wäre** gekommen."),
    F("hätte", "Sie ___ mehr lernen müssen. (haben — sie sg)", "**hätte** … müssen."),
    F("wären", "Wir ___ gern länger geblieben. (sein — wir)", "bleiben → **wären** geblieben."),
    F("hätte", "An deiner Stelle ___ ich das anders gemacht. (haben — ich)", "**hätte** gemacht."),
    F("wärst", "Du ___ beinahe gefallen. (sein — du)", "fallen → **wärst** gefallen."),
    F("hätten", "Wir ___ dir helfen können. (haben — wir)", "**hätten** … können."),
    F("wäre", "Wenn er schneller gewesen ___ , hätte er gewonnen. (sein — er)", "**wäre** gewesen."),
    F("hätte", "Ich ___ dich fast nicht erkannt. (haben — ich)", "**hätte** erkannt."),
    F("hättest", "Du ___ mir schreiben können. (haben — du)", "**hättest** … können."),
  ],
};

// Passiv (Vorgangspassiv) – werden + Partizip II. Gesucht ist die Form von
// werden in der angegebenen Zeit/Person; das Partizip steht schon da.
const PASSIVE: DrillSet = {
  key: "passive", unitSlug: "passive", title: "Passive voice",
  items: [
    F("wird", "Das Haus ___ gebaut. (present — es)", "Passiv Präsens: **wird** + Partizip."),
    F("werden", "Die Häuser ___ gebaut. (present — plural)", "**werden** gebaut."),
    F("wurde", "Das Auto ___ repariert. (past — es)", "Passiv Präteritum: **wurde** repariert."),
    F("wurden", "Die Briefe ___ geschrieben. (past — plural)", "**wurden** geschrieben."),
    F("wird", "Der Kuchen ___ gebacken. (present — er)", "**wird** gebacken."),
    F("wurde", "Das Fenster ___ geöffnet. (past — es)", "**wurde** geöffnet."),
    F("wird", "Die Tür ___ geschlossen. (present — sie sg)", "**wird** geschlossen."),
    F("werden", "Die Kinder ___ abgeholt. (present — plural)", "**werden** abgeholt."),
    F("wurde", "Der Dieb ___ gefangen. (past — er)", "**wurde** gefangen."),
    F("wird", "Das Problem ___ gelöst. (present — es)", "**wird** gelöst."),
    F("wurden", "Die Fragen ___ beantwortet. (past — plural)", "**wurden** beantwortet."),
    F("wird", "Hier ___ Deutsch gesprochen. (present)", "**wird** gesprochen."),
  ],
};

// Präposition + Relativpronomen – die Präposition bestimmt den Fall. Gesucht ist
// das Relativpronomen (nur Dativ + für-Akk-masc, damit die Antwort eindeutig ist).
const RELATIVE_PREPOSITIONS: DrillSet = {
  key: "relative-prepositions", unitSlug: "relative-prepositions", title: "Prepositions + relative pronouns",
  items: [
    F("dem", "Der Mann, mit ___ ich spreche, ist mein Chef. (m)", "mit + Dativ masc → **dem**."),
    F("der", "Die Frau, mit ___ ich arbeite, ist nett. (f)", "mit + Dativ fem → **der**."),
    F("dem", "Das Kind, mit ___ ich spiele, lacht. (n)", "mit + Dativ neut → **dem**."),
    F("denen", "Die Leute, mit ___ ich wohne, sind laut. (pl)", "mit + Dativ Plural → **denen**."),
    F("den", "Der Freund, für ___ ich das kaufe, hat Geburtstag. (m)", "für + Akkusativ masc → **den**."),
    F("dem", "Der Lehrer, bei ___ ich lerne, ist gut. (m)", "bei + Dativ masc → **dem**."),
    F("der", "Die Ärztin, bei ___ ich war, ist nett. (f)", "bei + Dativ fem → **der**."),
    F("dem", "Der Kollege, von ___ ich das weiß, ist zuverlässig. (m)", "von + Dativ masc → **dem**."),
    F("der", "Die Stadt, in ___ ich wohne, ist schön. (f)", "in + Dativ fem → **der**."),
    F("dem", "Das Dorf, in ___ ich geboren bin, ist klein. (n)", "in + Dativ neut → **dem**."),
    F("denen", "Die Kinder, von ___ ich spreche, sind meine. (pl)", "von + Dativ Plural → **denen**."),
    F("den", "Der Chef, für ___ ich arbeite, ist streng. (m)", "für + Akkusativ masc → **den**."),
  ],
};

// Partizip als Adjektiv – Partizip I (Infinitiv + d) oder Partizip II, attributiv
// gebeugt. Alle im Nominativ mit bestimmtem Artikel → Endung -e.
const PARTICIPLES_AS_ADJECTIVES: DrillSet = {
  key: "participles-as-adjectives", unitSlug: "participles-as-adjectives", title: "Participles as adjectives",
  items: [
    F("schlafende", "der ___ Hund (schlafen — Partizip I)", "Partizip I + Endung: **schlafende** Hund."),
    F("weinende", "das ___ Kind (weinen — Partizip I)", "Partizip I: **weinende** Kind."),
    F("lachende", "der ___ Mann (lachen — Partizip I)", "Partizip I: **lachende** Mann."),
    F("ankommende", "der ___ Zug (ankommen — Partizip I)", "Partizip I: **ankommende** Zug."),
    F("kochende", "das ___ Wasser (kochen — Partizip I)", "Partizip I: **kochende** Wasser."),
    F("geöffnete", "der ___ Brief (öffnen — Partizip II)", "Partizip II: **geöffnete** Brief."),
    F("geschlossene", "das ___ Fenster (schließen — Partizip II)", "Partizip II: **geschlossene** Fenster."),
    F("gestrichene", "die ___ Wand (streichen — Partizip II)", "Partizip II: **gestrichene** Wand."),
    F("geparkte", "das ___ Auto (parken — Partizip II)", "Partizip II: **geparkte** Auto."),
    F("gelesene", "das ___ Buch (lesen — Partizip II)", "Partizip II: **gelesene** Buch."),
    F("gestellte", "die ___ Frage (stellen — Partizip II)", "Partizip II: **gestellte** Frage."),
    F("gefallene", "der ___ Baum (fallen — Partizip II)", "Partizip II: **gefallene** Baum."),
  ],
};

// Indirekte Rede – Konjunktiv I (meist 3. Person: er/sie + -e, sein → sei).
const INDIRECT_SPEECH: DrillSet = {
  key: "indirect-speech", unitSlug: "indirect-speech", title: "Indirect speech (Konjunktiv I)",
  items: [
    F("sei", "Er sagt, er ___ krank. (sein — er, Konjunktiv I)", "sein → **sei**."),
    F("habe", "Sie sagt, sie ___ keine Zeit. (haben — sie sg, Konjunktiv I)", "haben → **habe**."),
    F("komme", "Er meint, er ___ später. (kommen — er, Konjunktiv I)", "kommen → **komme**."),
    F("gehe", "Sie sagt, sie ___ nach Hause. (gehen — sie sg, Konjunktiv I)", "gehen → **gehe**."),
    F("könne", "Er sagt, er ___ nicht helfen. (können — er, Konjunktiv I)", "können → **könne**."),
    F("wolle", "Sie sagt, sie ___ mitkommen. (wollen — sie sg, Konjunktiv I)", "wollen → **wolle**."),
    F("müsse", "Er sagt, er ___ arbeiten. (müssen — er, Konjunktiv I)", "müssen → **müsse**."),
    F("werde", "Sie sagt, sie ___ bald fertig. (werden — sie sg, Konjunktiv I)", "werden → **werde**."),
    F("seien", "Sie sagt, die Kinder ___ müde. (sein — pl, Konjunktiv I)", "sein Plural → **seien**."),
    F("wisse", "Er sagt, er ___ nichts davon. (wissen — er, Konjunktiv I)", "wissen → **wisse**."),
    F("dürfe", "Sie sagt, sie ___ nicht kommen. (dürfen — sie sg, Konjunktiv I)", "dürfen → **dürfe**."),
    F("habe", "Er behauptet, er ___ das nicht gesagt. (haben — er, Konjunktiv I)", "haben → **habe**."),
  ],
};

// Gradpartikeln auch / nur / schon / erst – die richtige Partikel nach Bedeutung.
const AUCH_NUR_SCHON_ERST: DrillSet = {
  key: "auch-nur-schon-erst", unitSlug: "auch-nur-schon-erst", title: "auch, nur, schon, erst",
  items: [
    F("schon", "Es ist ___ spät, wir müssen gehen. (already)", "already → **schon**."),
    F("erst", "Es ist ___ 8 Uhr, wir haben viel Zeit. (only / not until)", "sooner than expected → **erst**."),
    F("nur", "Ich habe ___ 5 Euro dabei. (only, no more)", "no more than → **nur**."),
    F("auch", "Ich komme, und mein Bruder kommt ___ . (too / also)", "in addition → **auch**."),
    F("schon", "Bist du ___ fertig? Das ging schnell! (already)", "already → **schon**."),
    F("erst", "Ich bin ___ gestern angekommen. (only / just recently)", "not until → **erst**."),
    F("nur", "Das kostet ___ 3 Euro, sehr günstig. (only)", "no more than → **nur**."),
    F("erst", "Ich stehe am Wochenende ___ um zehn auf. (not until)", "not until → **erst**."),
    F("erst", "Der Film fängt ___ um neun an. (not until)", "not until → **erst**."),
    F("schon", "Wir sind ___ da, das war schnell. (already)", "already → **schon**."),
    F("nur", "Ich wollte ___ helfen, nicht stören. (just / only)", "nothing more than → **nur**."),
    F("auch", "Nicht nur ich mag das, du magst es ___ . (too)", "in addition → **auch**."),
  ],
};

const SETS: Record<string, DrillSet> = {
  [FIXED_PREPOSITIONS.unitSlug]: FIXED_PREPOSITIONS,
  [ARTICLES.unitSlug]: ARTICLES,
  [RELATIVE_PRONOUNS.unitSlug]: RELATIVE_PRONOUNS,
  [NOUN_VERB.unitSlug]: NOUN_VERB,
  [PLURALS.unitSlug]: PLURALS,
  [PRETERITE.unitSlug]: PRETERITE,
  [PARTIZIP.unitSlug]: PARTIZIP,
  [STEM_CHANGING.unitSlug]: STEM_CHANGING,
  [COMPARISONS.unitSlug]: COMPARISONS,
  [PRESENT.unitSlug]: PRESENT,
  [MODALS.unitSlug]: MODALS,
  [HABEN_SEIN.unitSlug]: HABEN_SEIN,
  [FUTURE.unitSlug]: FUTURE,
  [REFLEXIVE.unitSlug]: REFLEXIVE,
  [OBJECT_PRONOUNS.unitSlug]: OBJECT_PRONOUNS,
  [CASES.unitSlug]: CASES,
  [DATIVE_VERBS.unitSlug]: DATIVE_VERBS,
  [PREPOSITIONS.unitSlug]: PREPOSITIONS,
  [TWO_WAY.unitSlug]: TWO_WAY,
  [N_DECLENSION.unitSlug]: N_DECLENSION,
  [GENITIVE_PREPS.unitSlug]: GENITIVE_PREPS,
  [IMPERATIVE.unitSlug]: IMPERATIVE,
  [KONJUNKTIV_2.unitSlug]: KONJUNKTIV_2,
  [ADJECTIVE_ENDINGS.unitSlug]: ADJECTIVE_ENDINGS,
  [DATES_ORDINALS.unitSlug]: DATES_ORDINALS,
  [POSSESSIVES.unitSlug]: POSSESSIVES,
  [NEGATION.unitSlug]: NEGATION,
  [SEPARABLE_VERBS.unitSlug]: SEPARABLE_VERBS,
  [SUBORDINATE_CLAUSES.unitSlug]: SUBORDINATE_CLAUSES,
  [CONNECTORS.unitSlug]: CONNECTORS,
  [TWO_PART_CONNECTORS.unitSlug]: TWO_PART_CONNECTORS,
  [VERB_POSITION.unitSlug]: VERB_POSITION,
  [INFINITIVE_ZU.unitSlug]: INFINITIVE_ZU,
  [SUBORDINATE_MODALS.unitSlug]: SUBORDINATE_MODALS,
  [PLUSQUAMPERFEKT.unitSlug]: PLUSQUAMPERFEKT,
  [KONJUNKTIV_2_PAST.unitSlug]: KONJUNKTIV_2_PAST,
  [PASSIVE.unitSlug]: PASSIVE,
  [RELATIVE_PREPOSITIONS.unitSlug]: RELATIVE_PREPOSITIONS,
  [PARTICIPLES_AS_ADJECTIVES.unitSlug]: PARTICIPLES_AS_ADJECTIVES,
  [INDIRECT_SPEECH.unitSlug]: INDIRECT_SPEECH,
  [AUCH_NUR_SCHON_ERST.unitSlug]: AUCH_NUR_SCHON_ERST,
};

export function getDrillForUnit(unitSlug: string): DrillSet | null {
  return SETS[unitSlug] ?? null;
}

const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } };

// Fallback-Drill für Einheiten ohne eigene Wortliste: die vorhandenen Aufgaben
// der Einheit, endlos durchgemischt. Kein „frisch generiert", aber ein echter
// Intensiv-Lauf mit Fehler-Schleife – und er funktioniert für jeden
// Aufgabentyp, auch Satzbau (order). Neue Kennungen, damit nichts protokolliert
// wird und die Fehler-Schleife jede Position einzeln behandelt.
export function buildFallbackDrill(exercises: Exercise[], count: number): Exercise[] {
  if (exercises.length === 0) return [];
  const pool = [...exercises];
  shuffle(pool);
  const out: Exercise[] = [];
  let i = 0;
  while (out.length < count) {
    if (i >= pool.length) {
      const last = pool[pool.length - 1];
      shuffle(pool);
      if (pool[0] === last && pool.length > 1) [pool[0], pool[1]] = [pool[1], pool[0]];
      i = 0;
    }
    out.push({ ...pool[i], id: `drill-fallback-${out.length}` });
    i++;
  }
  return out;
}

// Zieht `count` frische Aufgaben. Erst werden alle (Eintrag × Satz)-Kombinationen
// gemischt; reicht das nicht, wird nachgefüllt – aber nie derselbe Satz direkt
// hintereinander.
export function generateDrill(set: DrillSet, count: number): Exercise[] {
  const pairs: { item: DrillItem; sentence: string }[] = [];
  for (const item of set.items) for (const sentence of item.sentences) pairs.push({ item, sentence });

  const shuffle = () => { for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]; } };
  shuffle();

  const chosen: typeof pairs = [];
  let i = 0;
  while (chosen.length < count) {
    if (i >= pairs.length) {
      const last = chosen[chosen.length - 1];
      shuffle();
      if (pairs[0] === last && pairs.length > 1) [pairs[0], pairs[1]] = [pairs[1], pairs[0]];
      i = 0;
    }
    chosen.push(pairs[i++]);
  }

  return chosen.map((p, idx) => ({
    id: `drill-${set.key}-${idx}`,
    kind: "gap" as const,
    prompt: p.sentence,
    options: [],
    tokens: [],
    correct: -1,
    answers: [p.item.answer, ...(p.item.alt ?? [])],
    order: [],
    verb: -1,
    explain: p.item.explain,
    hint: "",
  }));
}
