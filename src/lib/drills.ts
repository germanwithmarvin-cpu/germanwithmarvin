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

const SETS: Record<string, DrillSet> = {
  [FIXED_PREPOSITIONS.unitSlug]: FIXED_PREPOSITIONS,
  [ARTICLES.unitSlug]: ARTICLES,
  [RELATIVE_PRONOUNS.unitSlug]: RELATIVE_PRONOUNS,
  [NOUN_VERB.unitSlug]: NOUN_VERB,
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
    answers: [p.item.answer],
    order: [],
    verb: -1,
    explain: p.item.explain,
    hint: "",
  }));
}
