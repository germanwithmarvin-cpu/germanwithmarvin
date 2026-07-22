"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDecks } from "@/lib/decks";
import { countFlagged, getDeckProgress, getLearnedSummary, type DeckProgress } from "@/lib/study";
import { LEVELS, type Deck } from "@/lib/types";
import { getAccess, canAccessVocabLevel, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";
import { PathMap, topicEmoji, type PathItem } from "@/components/PathMap";

// Pokal-Stufen, inspiriert von Fantasy-/RPG-Belohnungen (eigene Namen, kein Copyright).
const TIERS = [
  { icon: "🥉", name: "Bronze goblet" },
  { icon: "🥈", name: "Silver chalice" },
  { icon: "🏆", name: "Golden trophy" },
  { icon: "🛡️", name: "Guardian crest" },
  { icon: "🔮", name: "Mystic orb" },
  { icon: "💎", name: "Crystal relic" },
];

const LEVEL_LABEL: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-intermediate", C1: "Advanced", C2: "Mastery",
};

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [progress, setProgress] = useState<Record<string, DeckProgress>>({});
  const [flagged, setFlagged] = useState(0);
  const [learnedTotal, setLearnedTotal] = useState(0);
  const [tier, setTier] = useState<AccessTier>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    countFlagged().then(setFlagged);
    getLearnedSummary().then((s) => setLearnedTotal(s.total));
    getAccess().then((a) => setTier(a.tier));
    Promise.all([getDecks(), getDeckProgress()]).then(([d, p]) => {
      setDecks(d);
      setProgress(p);
      setLoading(false);
    });
  }, []);

  // Normaler Lernpfad = category 'path'. Grammatik-Decks laufen separat.
  const ordered = decks
    .filter((d) => d.category !== "grammar" && (progress[d.id]?.total ?? 0) > 0)
    .sort((a, b) => {
      const lv = LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level);
      return lv !== 0 ? lv : a.sortOrder - b.sortOrder;
    });

  const grammarDecks = decks
    .filter((d) => d.category === "grammar" && (progress[d.id]?.total ?? 0) > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const isDone = (d: Deck) => {
    const p = progress[d.id];
    return !!p && p.total > 0 && p.known >= p.total;
  };
  const currentIndex = ordered.findIndex((d) => !isDone(d) && canAccessVocabLevel(tier, d.level));

  // PathItems: Deck-Knoten + Pokale an Level-Enden (👑) und Meilensteinen.
  const items: PathItem[] = [];
  let prevLevel: string | null = null;
  let milestoneCount = 0;
  ordered.forEach((deck, i) => {
    const prog = progress[deck.id];
    const locked = !canAccessVocabLevel(tier, deck.level);
    const done = isDone(deck);
    items.push({
      kind: "node",
      id: deck.id,
      href: locked ? "/redeem" : `/study/${deck.id}`,
      emoji: topicEmoji(deck.title),
      title: deck.title.replace(/^[A-C][0-9] · /, ""),
      sub: `${prog.known}/${prog.total}`,
      state: locked ? "locked" : done ? "done" : i === currentIndex ? "current" : "normal",
      frac: prog.total > 0 ? prog.known / prog.total : 0,
      firstOfLevel: deck.level !== prevLevel,
      level: deck.level,
      levelLabel: LEVEL_LABEL[deck.level],
    });
    prevLevel = deck.level;
    const next = ordered[i + 1];
    const levelEnds = !next || next.level !== deck.level;
    const milestone = (i + 1) % 5 === 0 && !levelEnds;
    if (levelEnds) {
      items.push({ kind: "trophy", id: `t-${i}`, earned: ordered.slice(0, i + 1).every(isDone), icon: "👑", name: `${deck.level} Master`, champion: true });
    } else if (milestone) {
      const t = TIERS[milestoneCount % TIERS.length];
      milestoneCount++;
      items.push({ kind: "trophy", id: `t-${i}`, earned: ordered.slice(0, i + 1).every(isDone), icon: t.icon, name: t.name, champion: false });
    }
  });

  const totalCards = ordered.reduce((s, d) => s + (progress[d.id]?.total ?? 0), 0);
  const knownCards = ordered.reduce((s, d) => s + (progress[d.id]?.known ?? 0), 0);
  const decksDone = ordered.filter(isDone).length;
  const pct = totalCards ? Math.round((knownCards / totalCards) * 100) : 0;

  if (!loading && tier !== "full") return <Paywall title="Unlock the flashcard trainer" />;

  return (
    <div className="pb-6">
      {/* Kopf: Titel + kompakter Gesamtfortschritt */}
      <div className="px-6 pt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your learning path</h1>
          <p className="text-cream-dim mt-2">Climb from the streets of Munich all the way up to the Alps — one topic at a time.</p>
        </div>
        <div className="flex items-center gap-4 card px-5 py-3">
          <div>
            <div className="text-3xl font-bold text-gold-bright leading-none">{pct}%</div>
            <div className="text-xs text-cream-dim mt-1">{knownCards}/{totalCards} cards · {decksDone}/{ordered.length} topics</div>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-bordeaux-deep/60 self-center">
            <div className="h-2.5 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Voll-Breite: Panorama-Pfad links bis zum Rand + Grammatik/Wiederholen rechts */}
      <div className="mt-6 grid lg:grid-cols-[1fr_16rem]">
        <div className="w-full">
          {loading ? (
            <p className="text-cream-dim px-6 py-10">Loading…</p>
          ) : ordered.length === 0 ? (
            <div className="card p-6 text-cream-dim m-6">No decks yet. Your teacher will add some soon.</div>
          ) : (
            <PathMap items={items} />
          )}
        </div>

        {/* Rechte Spalte: Wiederholen + Grammatik-Decks */}
        <aside className="px-6 pt-6 lg:px-4 lg:pt-6 lg:border-l lg:border-gold/15 space-y-4 lg:sticky lg:top-6 self-start h-max">
          {/* Review – gehört zu den Flashcards (keine eigene Navigations-Kategorie) */}
          <div className="card p-4">
            <div className="flex items-center gap-2 text-base mb-2"><span>🔁</span> Review</div>
            <p className="text-xs text-cream-dim mb-2">Freshen up cards you already know — all of them, by level, or just your marked ones.</p>
            <Link href="/review" className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm text-cream-dim hover:bg-gold/10 transition">
              <span>📚 Learned cards {learnedTotal > 0 && <span className="text-cream-dim">({learnedTotal})</span>}</span>
              <span className="text-gold-bright">→</span>
            </Link>
            <Link href="/study/marked" className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm text-cream-dim hover:bg-gold/10 transition">
              <span>🔖 Marked cards {flagged > 0 && <span className="text-cream-dim">({flagged})</span>}</span>
              <span className="text-gold-bright">→</span>
            </Link>
          </div>

          {/* Grammatik-Decks stehen jetzt als eigene, breite Sektion unter dem Pfad. */}
        </aside>
      </div>

      {/* Grammatik-Decks: eigene, gut sichtbare Sektion in voller Breite.
          relative+z-10 sorgt dafür, dass sie garantiert über der Panorama-Kulisse liegt. */}
      {grammarDecks.length > 0 && (
        <section className="relative z-10 px-6 mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><span>🧩</span> Grammar packs</h2>
              <p className="text-cream-dim text-sm mt-1">
                Targeted practice next to the path — cases, prepositions, verbs and fixed expressions.
              </p>
            </div>
            <span className="text-xs text-cream-dim">{grammarDecks.length} packs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {grammarDecks.map((deck) => {
              const locked = !canAccessVocabLevel(tier, deck.level);
              const p = progress[deck.id];
              const total = p?.total ?? 0;
              const known = p?.known ?? 0;
              const deckPct = total ? Math.round((known / total) * 100) : 0;
              return (
                <Link
                  key={deck.id}
                  href={locked ? "/redeem" : `/study/${deck.id}`}
                  className="card p-4 flex flex-col gap-2 transition hover:border-gold/50"
                  title={locked ? "Unlock with your access code" : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold leading-tight">{deck.title}</div>
                    <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                      {deck.level}
                    </span>
                  </div>
                  {deck.description && <p className="text-xs text-cream-dim line-clamp-2">{deck.description}</p>}
                  <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between text-[11px] text-cream-dim mb-1">
                      <span>{locked ? "🔒 Locked" : `${known}/${total} cards`}</span>
                      {!locked && <span className="text-gold-bright font-semibold">{deckPct}%</span>}
                    </div>
                    <div className="h-1.5 rounded-full bg-bordeaux-deep/60">
                      <div className="h-1.5 rounded-full bg-gold-bright transition-all" style={{ width: `${deckPct}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
