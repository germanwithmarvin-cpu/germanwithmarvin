"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDecks } from "@/lib/decks";
import { countFlagged, getDeckProgress, getLearnedSummary, type DeckProgress } from "@/lib/study";
import { LEVELS, type Deck } from "@/lib/types";
import { getAccess, canAccessVocabLevel, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";

type DeckNode = { kind: "deck"; deck: Deck; prog: DeckProgress; done: boolean; current: boolean; firstOfLevel: boolean; locked: boolean };
type TrophyNode = { kind: "trophy"; name: string; icon: string; earned: boolean; champion: boolean; key: string };
type PathNode = DeckNode | TrophyNode;

// Pokal-Stufen, inspiriert von Fantasy-/RPG-Belohnungen (eigene Namen, kein Copyright).
const TIERS = [
  { icon: "🥉", name: "Bronze goblet" },
  { icon: "🥈", name: "Silver chalice" },
  { icon: "🏆", name: "Golden trophy" },
  { icon: "🛡️", name: "Guardian crest" },
  { icon: "🔮", name: "Mystic orb" },
  { icon: "💎", name: "Crystal relic" },
];

const ROW = 210; // vertikaler Abstand je Reihe (luftiger)
const TOP = 120; // Abstand oben (Platz für die erste Level-Marke)

// Kurz-Beschreibung je Niveau für die Level-Marken am Pfad.
const LEVEL_LABEL: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-intermediate", C1: "Advanced", C2: "Mastery",
};

// Themen-Emoji anhand des Deck-Titels.
function topicEmoji(title: string): string {
  const t = title.toLowerCase();
  const map: [string, string][] = [
    ["greeting", "👋"], ["number", "🔢"], ["time", "🕐"], ["family", "👪"], ["people", "👪"],
    ["eating", "🍽️"], ["food", "🍎"], ["drink", "🥤"], ["routine", "⏰"], ["feeling", "😊"],
    ["character", "😊"], ["past", "⏪"], ["verb", "⚡"], ["house", "🏠"], ["home", "🛋️"],
    ["living", "🛋️"], ["doctor", "🩺"], ["health", "🩺"], ["body", "💪"], ["colour", "🎨"],
    ["color", "🎨"], ["adjective", "🎨"], ["clothing", "👕"], ["weather", "⛅"], ["season", "🍂"],
    ["hobby", "🎮"], ["free time", "🎮"], ["media", "📺"], ["school", "🎓"], ["learning", "🎓"],
    ["animal", "🐾"], ["environment", "🌍"], ["nature", "🌿"], ["work", "💼"], ["office", "💼"],
    ["profession", "💼"], ["shopping", "🛒"], ["money", "💶"], ["service", "🏦"], ["travel", "✈️"],
    ["holiday", "🏖️"], ["city", "🏙️"], ["direction", "🧭"], ["transport", "🚌"], ["question", "❓"],
    ["adverb", "✨"], ["connector", "🔗"], ["preposition", "🧩"], ["case", "🧩"],
  ];
  for (const [k, e] of map) if (t.includes(k)) return e;
  return "📘";
}

// Catmull-Rom → glatte Kurve durch alle Punkte (Schlangenlinie).
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [progress, setProgress] = useState<Record<string, DeckProgress>>({});
  const [flagged, setFlagged] = useState(0);
  const [learnedTotal, setLearnedTotal] = useState(0);
  const [tier, setTier] = useState<AccessTier>("none");
  const [loading, setLoading] = useState(true);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el) setWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const onResize = () => containerRef.current && setWidth(containerRef.current.clientWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const nodes: PathNode[] = [];
  let prevLevel: string | null = null;
  let milestoneCount = 0;
  ordered.forEach((deck, i) => {
    nodes.push({ kind: "deck", deck, prog: progress[deck.id], done: isDone(deck), current: i === currentIndex, firstOfLevel: deck.level !== prevLevel, locked: !canAccessVocabLevel(tier, deck.level) });
    prevLevel = deck.level;
    const next = ordered[i + 1];
    const levelEnds = !next || next.level !== deck.level;
    const milestone = (i + 1) % 5 === 0 && !levelEnds;
    if (levelEnds) {
      nodes.push({ kind: "trophy", earned: ordered.slice(0, i + 1).every(isDone), key: `t-${i}`, icon: "👑", name: `${deck.level} Master`, champion: true });
    } else if (milestone) {
      const tier = TIERS[milestoneCount % TIERS.length];
      milestoneCount++;
      nodes.push({ kind: "trophy", earned: ordered.slice(0, i + 1).every(isDone), key: `t-${i}`, icon: tier.icon, name: tier.name, champion: false });
    }
  });

  // Serpentinen-Layout (Schlange): Reihen wechseln die Richtung. Spaltenzahl je Breite.
  // Bewusst wenige Spalten (max 3) für einen luftigen, gut lesbaren Pfad.
  const cols = Math.max(2, Math.min(3, Math.floor((width || 320) / 240)));
  const colW = (width || 320) / cols;
  const pos = (i: number) => {
    const r = Math.floor(i / cols);
    const p = i % cols;
    const c = r % 2 === 0 ? p : cols - 1 - p; // ungerade Reihen rückwärts → 180°-Wende
    return { x: colW * (c + 0.5), y: TOP + r * ROW };
  };
  const rowsCount = Math.max(1, Math.ceil(nodes.length / cols));
  const totalH = TOP + rowsCount * ROW;

  const points = nodes.map((_, i) => pos(i));
  const currentNodeIndex = nodes.findIndex((n) => n.kind === "deck" && n.current);
  const goneTo = currentNodeIndex === -1 ? nodes.length - 1 : currentNodeIndex;
  const trackD = smoothPath(points);
  const goldD = goneTo >= 1 ? smoothPath(points.slice(0, goneTo + 1)) : "";

  const stars = Array.from({ length: Math.max(16, Math.floor(totalH / 90)) }, (_, s) => ({
    x: ((s * 71 + 30) % Math.max(60, (width || 320) - 30)) + 12,
    y: ((s * 137 + 50) % Math.max(60, totalH - 30)) + 12,
    r: 1 + (s % 3) * 0.7,
    delay: (s % 5) * 0.6,
  }));

  const totalCards = ordered.reduce((s, d) => s + (progress[d.id]?.total ?? 0), 0);
  const knownCards = ordered.reduce((s, d) => s + (progress[d.id]?.known ?? 0), 0);
  const decksDone = ordered.filter(isDone).length;
  const pct = totalCards ? Math.round((knownCards / totalCards) * 100) : 0;

  if (!loading && tier !== "full") return <Paywall title="Unlock the flashcard trainer" />;

  return (
    <div className="grid md:grid-cols-[1fr_13rem] gap-8">
      <div>
        <h1 className="text-3xl font-bold">Your learning path</h1>
        <p className="text-cream-dim mt-2">Follow the trail step by step — or jump to any topic.</p>

        <div ref={setRef} className="relative mt-8 w-full" style={{ height: loading || ordered.length === 0 ? undefined : totalH }}>
          {loading && <p className="text-cream-dim">Loading…</p>}
          {!loading && ordered.length === 0 && (
            <div className="card p-6 text-cream-dim">No decks yet. Your teacher will add some soon.</div>
          )}

          {!loading && ordered.length > 0 && width > 0 && (
            <>
              <svg className="absolute inset-0 pointer-events-none" width={width} height={totalH} viewBox={`0 0 ${width} ${totalH}`} fill="none" aria-hidden="true">
                {/* Weiche Level-Auren + Boden-Schatten für Tiefe */}
                {nodes.map((n, i) => {
                  const { x, y } = points[i];
                  if (n.kind === "deck" && n.firstOfLevel) return <ellipse key={`h${i}`} cx={x} cy={y} rx={Math.min(150, colW * 0.86)} ry={78} fill="color-mix(in srgb, var(--bordeaux-soft) 70%, transparent)" opacity={0.38} />;
                  if (n.kind === "trophy") return <ellipse key={`h${i}`} cx={x} cy={y + 24} rx={70} ry={26} fill="color-mix(in srgb, var(--gold) 16%, transparent)" opacity={0.55} />;
                  return null;
                })}
                {nodes.map((n, i) => {
                  if (n.kind !== "deck") return null;
                  const { x, y } = points[i];
                  return <ellipse key={`s${i}`} cx={x} cy={y + NODE / 2 - 2} rx={30} ry={7} fill="rgba(59,41,34,0.13)" />;
                })}

                {/* Basis-Pfad: weiche "Straße" + zarte gestrichelte Richtungslinie */}
                <path d={trackD} stroke="var(--gold)" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" opacity={0.17} />
                <path d={trackD} stroke="var(--gold-bright)" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 20" opacity={0.28} />

                {/* Geschaffter Abschnitt: satt gold + darüber fließende Energie */}
                {goldD && <path d={goldD} stroke="var(--gold-bright)" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />}
                {goldD && <path className="trail-flow" d={goldD} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeDasharray="3 24" opacity={0.7} />}

                {/* Driftende Funken als lebendige Deko */}
                {stars.map((st, k) => (
                  <circle key={k} className="twinkle" cx={st.x} cy={st.y} r={st.r} fill="var(--gold-bright)" style={{ animationDelay: `${st.delay}s` }} />
                ))}
              </svg>

              {/* Level-Marken: schicke Pill am Anfang jedes Niveaus */}
              {nodes.map((node, i) => {
                if (node.kind !== "deck" || !node.firstOfLevel) return null;
                const { x, y } = points[i];
                return (
                  <div key={`lvl-${node.deck.id}`} className="absolute z-0" style={{ left: x, top: y - NODE / 2 - 30, transform: "translate(-50%, -100%)" }}>
                    <div
                      className="node-pop flex items-center gap-2 rounded-full px-4 py-1.5 whitespace-nowrap"
                      style={{
                        background: "color-mix(in srgb, var(--gold) 20%, var(--surface))",
                        border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)",
                        boxShadow: "0 6px 16px -10px rgba(59,41,34,0.4)",
                        animationDelay: `${Math.min(i * 0.04, 1.2)}s`,
                      }}
                    >
                      <span className="text-base font-bold" style={{ color: "var(--bordeaux)" }}>{node.deck.level}</span>
                      <span className="text-xs font-medium" style={{ color: "var(--cream-dim)" }}>{LEVEL_LABEL[node.deck.level] ?? ""}</span>
                    </div>
                  </div>
                );
              })}

              {nodes.map((node, i) => {
                const { x, y } = points[i];
                const breathe = node.kind === "deck" && node.current ? "breathe" : "";
                return (
                  <div key={node.kind === "deck" ? node.deck.id : node.key} className="absolute z-10" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
                    <div className="node-pop" style={{ animationDelay: `${Math.min(i * 0.04, 1.2)}s` }}>
                      <div className={breathe}>
                        {node.kind === "trophy" ? <TrophyNodeView icon={node.icon} name={node.name} earned={node.earned} champion={node.champion} /> : <DeckNodeView node={node} maxLabel={colW * 0.92} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <aside className="md:sticky md:top-6 h-max space-y-4">
        <div className="card p-5">
          <div className="text-base text-cream-dim">Overall progress</div>
          <div className="text-4xl font-bold text-gold-bright mt-1">{pct}%</div>
          <div className="h-2.5 rounded-full bg-bordeaux-deep/60 mt-3">
            <div className="h-2.5 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-sm text-cream-dim mt-3 space-y-1">
            <div>{knownCards} / {totalCards} cards learned</div>
            <div>{decksDone} / {ordered.length} topics completed</div>
          </div>
        </div>

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

        {/* Grammatik-Extra-Decks – neben dem Pfad auswählbar */}
        {grammarDecks.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 text-base mb-2"><span>🧩</span> Grammar packs</div>
            <div className="space-y-1">
              {grammarDecks.map((deck) => {
                const locked = !canAccessVocabLevel(tier, deck.level);
                const p = progress[deck.id];
                return (
                  <Link
                    key={deck.id}
                    href={locked ? "/redeem" : `/study/${deck.id}`}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm text-cream-dim hover:bg-gold/10 transition"
                    title={locked ? "Unlock with your access code" : undefined}
                  >
                    <span className="truncate">{deck.title}</span>
                    <span className="shrink-0 text-xs">{locked ? "🔒" : `${p?.known ?? 0}/${p?.total ?? 0}`}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

const NODE = 92; // Knoten-Durchmesser
const RING = 7; // Dicke des Fortschrittsrings

function DeckNodeView({ node, maxLabel }: { node: DeckNode; maxLabel: number }) {
  const { deck, prog, done, current, locked } = node;
  const frac = prog.total > 0 ? Math.min(1, prog.known / prog.total) : 0;
  const r = (NODE - RING) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * frac;

  const fill = locked
    ? { background: "color-mix(in srgb, var(--bordeaux) 12%, #fff)", color: "var(--cream-dim)", glow: "rgba(59,41,34,0.28)" }
    : done
    ? { background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116", glow: "color-mix(in srgb, var(--gold) 55%, transparent)" }
    : current
      ? { background: "linear-gradient(160deg, color-mix(in srgb, var(--bordeaux) 82%, #fff), var(--bordeaux))", color: "#fff", glow: "color-mix(in srgb, var(--bordeaux) 45%, transparent)" }
      : { background: "linear-gradient(160deg, #fff, var(--surface))", color: "var(--cream)", glow: "rgba(59,41,34,0.3)" };

  // Gesperrt (A2–B2 ohne Zugang) → führt zur Code-Einlöse-Seite statt zum Lernen.
  const href = locked ? "/redeem" : `/study/${deck.id}`;

  return (
    <Link href={href} className="group block relative" style={{ width: NODE, height: NODE }} title={locked ? "Unlock with membership" : undefined}>
      {current && !locked && <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 btn-gold px-3 py-1 text-xs whitespace-nowrap bob z-20">Start</span>}
      {current && !locked && <span className="pulse-ring absolute inset-0 rounded-full" style={{ border: "3px solid var(--gold-bright)" }} />}

      {/* Fortschritts-Ring (zeigt gelernte / gesamte Karten) */}
      <svg className="absolute inset-0 -rotate-90" width={NODE} height={NODE} viewBox={`0 0 ${NODE} ${NODE}`} aria-hidden="true">
        <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--cream) 14%, transparent)" strokeWidth={RING} />
        {frac > 0 && !locked && (
          <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke="var(--gold-bright)" strokeWidth={RING} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
        )}
      </svg>

      <div
        className={`absolute grid place-items-center rounded-full text-4xl transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1 ${locked ? "opacity-70" : ""}`}
        style={{ inset: RING + 2, background: fill.background, color: fill.color, boxShadow: `0 12px 24px -12px ${fill.glow}, inset 0 2px 3px rgba(255,255,255,0.35)` }}
      >
        {locked ? "🔒" : topicEmoji(deck.title)}
      </div>
      {done && !locked && (
        <span className="absolute -top-1 -right-1 w-6 h-6 grid place-items-center rounded-full text-xs z-20" style={{ background: "var(--green-accent)", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>✓</span>
      )}

      <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2 flex flex-col items-center" style={{ width: Math.max(96, maxLabel) }}>
        <span className={`text-sm text-center leading-tight ${current && !locked ? "text-cream font-medium" : "text-cream-dim"}`}>
          {deck.title.replace(/^[A-C][0-9] · /, "")}
        </span>
        <span className="text-xs text-cream-dim mt-0.5">{locked ? "🔒 membership" : `${prog.known}/${prog.total}`}</span>
      </div>
    </Link>
  );
}

function TrophyNodeView({ icon, name, earned, champion }: { icon: string; name: string; earned: boolean; champion: boolean }) {
  const size = champion ? 68 : 56;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {earned && champion && <span className="pulse-ring absolute inset-0 rounded-full" style={{ border: "3px solid var(--gold-bright)" }} />}
      <div
        className={`grid place-items-center rounded-full ${champion ? "text-4xl" : "text-2xl"} ${earned ? "bob" : ""}`}
        style={{
          width: size,
          height: size,
          background: earned
            ? "radial-gradient(circle at 50% 30%, var(--gold-bright), var(--gold) 70%, color-mix(in srgb, var(--gold) 60%, #000))"
            : "color-mix(in srgb, var(--bordeaux) 12%, #fff)",
          border: earned ? "1px solid color-mix(in srgb, #fff 30%, transparent)" : "1px solid color-mix(in srgb, var(--cream) 12%, transparent)",
          filter: earned ? "none" : "grayscale(0.8) brightness(0.8)",
          boxShadow: earned ? "0 0 22px -4px color-mix(in srgb, var(--gold) 70%, transparent), 0 8px 18px -8px rgba(0,0,0,0.5)" : "none",
        }}
        title={earned ? name : `${name} (locked)`}
      >
        {earned ? icon : "🔒"}
      </div>
      <span className={`absolute left-1/2 top-full -translate-x-1/2 mt-1 whitespace-nowrap text-xs ${earned ? "text-gold-bright font-medium" : "text-cream-dim"}`}>{name}</span>
    </div>
  );
}
