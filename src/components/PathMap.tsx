"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// Gemeinsame Lernpfad-Darstellung für Flashcards & Lessons:
// serpentinenförmiger Pfad mit großen Knoten vor einer München-Alpen-Kulisse.

export type PathNodeItem = {
  kind: "node";
  id: string;
  href: string;
  emoji: string;
  title: string;
  sub: string; // kleine Zeile unter dem Titel (z. B. "5/23" oder "12 min")
  state: "done" | "current" | "normal" | "locked";
  frac: number; // Fortschrittsring 0..1
  firstOfLevel?: boolean;
  level?: string; // z. B. "A1" – für die Level-Marke
  levelLabel?: string; // z. B. "Beginner"
};
export type PathTrophyItem = {
  kind: "trophy";
  id: string;
  icon: string;
  name: string;
  earned: boolean;
  champion: boolean;
};
export type PathItem = PathNodeItem | PathTrophyItem;

const ROW = 258; // vertikaler Abstand je Reihe
const TOP = 150; // Abstand oben (Platz für die erste Level-Marke)
const NODE = 116; // Knoten-Durchmesser
const RING = 9; // Dicke des Fortschrittsrings

// Themen-Emoji anhand eines Titels – von beiden Seiten nutzbar.
export function topicEmoji(title: string): string {
  const t = title.toLowerCase();
  const map: [string, string][] = [
    ["greeting", "👋"], ["number", "🔢"], ["time", "🕐"], ["family", "👪"], ["people", "👪"],
    ["eating", "🍽️"], ["food", "🍎"], ["drink", "🥤"], ["routine", "⏰"], ["feeling", "😊"],
    ["character", "😊"], ["past", "⏪"], ["verb", "⚡"], ["house", "🏠"], ["home", "🛋️"],
    ["living", "🛋️"], ["doctor", "🩺"], ["health", "🩺"], ["body", "💪"], ["colour", "🎨"],
    ["color", "🎨"], ["adjective", "🎨"], ["clothing", "👕"], ["weather", "⛅"], ["season", "🍂"],
    ["hobby", "🎮"], ["free time", "🎮"], ["media", "📺"], ["school", "🎓"], ["learning", "🎓"],
    ["study", "🎓"], ["animal", "🐾"], ["environment", "🌍"], ["nature", "🌿"], ["work", "💼"],
    ["office", "💼"], ["profession", "💼"], ["shopping", "🛒"], ["money", "💶"], ["service", "🏦"],
    ["travel", "✈️"], ["holiday", "🏖️"], ["city", "🏙️"], ["direction", "🧭"], ["transport", "🚌"],
    ["question", "❓"], ["grammar", "🧩"], ["adverb", "✨"], ["connector", "🔗"],
    ["preposition", "🧩"], ["case", "🧩"], ["intro", "⭐"], ["start", "⭐"], ["tip", "💡"],
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

export function PathMap({ items }: { items: PathItem[] }) {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el) setWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Serpentine (Schlange), randfüllend: 3 Knoten pro Zeile auf Desktop, 2 auf Mobil.
  const W = width || 320;
  const cols = W >= 680 ? 3 : 2;
  const PAD = 82;
  const usable = Math.max(1, W - PAD * 2);
  const colW = W / cols;
  const pos = (i: number) => {
    const r = Math.floor(i / cols);
    const p = i % cols;
    const c = r % 2 === 0 ? p : cols - 1 - p; // ungerade Reihen rückwärts
    const x = PAD + usable * (c / (cols - 1));
    return { x, y: TOP + r * ROW };
  };
  const rowsCount = Math.max(1, Math.ceil(items.length / cols));
  const totalH = TOP + rowsCount * ROW;

  const points = items.map((_, i) => pos(i));
  const currentIndex = items.findIndex((n) => n.kind === "node" && n.state === "current");
  const goneTo = currentIndex === -1 ? items.length - 1 : currentIndex;
  const trackD = smoothPath(points);
  const goldD = goneTo >= 1 ? smoothPath(points.slice(0, goneTo + 1)) : "";

  return (
    <div ref={setRef} className="relative w-full border-y border-gold/25" style={{ height: items.length === 0 ? 260 : totalH, overflowX: "clip" }}>
      {items.length === 0 && <div className="card p-6 text-cream-dim m-4">Nothing here yet.</div>}

      {items.length > 0 && width > 0 && (
        <>
          {/* Persistente Kulisse – bleibt beim Scrollen im Blick */}
          <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none" style={{ marginBottom: "-100vh", zIndex: 0 }}>
            <MunichScene />
          </div>

          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <svg className="absolute inset-0 pointer-events-none" width={width} height={totalH} viewBox={`0 0 ${width} ${totalH}`} fill="none" aria-hidden="true">
              {/* Level-Auren + Boden-Schatten für Tiefe */}
              {items.map((n, i) => {
                const { x, y } = points[i];
                if (n.kind === "node" && n.firstOfLevel) return <ellipse key={`h${i}`} cx={x} cy={y} rx={Math.min(150, colW * 0.86)} ry={78} fill="color-mix(in srgb, var(--bordeaux-soft) 70%, transparent)" opacity={0.38} />;
                if (n.kind === "trophy") return <ellipse key={`h${i}`} cx={x} cy={y + 24} rx={70} ry={26} fill="color-mix(in srgb, var(--gold) 16%, transparent)" opacity={0.55} />;
                return null;
              })}
              {items.map((n, i) => {
                if (n.kind !== "node") return null;
                const { x, y } = points[i];
                return <ellipse key={`s${i}`} cx={x} cy={y + NODE / 2 - 2} rx={30} ry={7} fill="rgba(59,41,34,0.13)" />;
              })}

              {/* Basis-Pfad: weiche "Straße" + zarte gestrichelte Richtungslinie */}
              <path d={trackD} stroke="var(--gold)" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" opacity={0.17} />
              <path d={trackD} stroke="var(--gold-bright)" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 20" opacity={0.28} />

              {/* Geschaffter Abschnitt: satt gold + darüber fließende Energie */}
              {goldD && <path d={goldD} stroke="var(--gold-bright)" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />}
              {goldD && <path className="trail-flow" d={goldD} stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeDasharray="3 24" opacity={0.7} />}
            </svg>

            {/* Level-Marken am Anfang jedes Niveaus */}
            {items.map((node, i) => {
              if (node.kind !== "node" || !node.firstOfLevel) return null;
              const { x, y } = points[i];
              return (
                <div key={`lvl-${node.id}`} className="absolute z-0" style={{ left: x, top: y - NODE / 2 - 30, transform: "translate(-50%, -100%)" }}>
                  <div
                    className="node-pop flex items-center gap-2 rounded-full px-4 py-1.5 whitespace-nowrap"
                    style={{
                      background: "color-mix(in srgb, var(--gold) 20%, var(--surface))",
                      border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)",
                      boxShadow: "0 6px 16px -10px rgba(59,41,34,0.4)",
                      animationDelay: `${Math.min(i * 0.04, 1.2)}s`,
                    }}
                  >
                    {node.level && <span className="text-base font-bold" style={{ color: "var(--bordeaux)" }}>{node.level}</span>}
                    <span className="text-xs font-medium" style={{ color: "var(--cream-dim)" }}>{node.levelLabel ?? ""}</span>
                  </div>
                </div>
              );
            })}

            {items.map((node, i) => {
              const { x, y } = points[i];
              const breathe = node.kind === "node" && node.state === "current" ? "breathe" : "";
              return (
                <div key={node.id} className="absolute z-10" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
                  <div className="node-pop" style={{ animationDelay: `${Math.min(i * 0.04, 1.2)}s` }}>
                    <div className={breathe}>
                      {node.kind === "trophy"
                        ? <TrophyNodeView icon={node.icon} name={node.name} earned={node.earned} champion={node.champion} />
                        : <NodeView node={node} maxLabel={Math.min(colW * 0.92, 170)} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function NodeView({ node, maxLabel }: { node: PathNodeItem; maxLabel: number }) {
  const { emoji, title, sub, state, frac, href } = node;
  const locked = state === "locked";
  const done = state === "done";
  const current = state === "current";
  const r = (NODE - RING) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(1, Math.max(0, frac));

  const fill = locked
    ? { background: "color-mix(in srgb, var(--bordeaux) 12%, #fff)", color: "var(--cream-dim)", glow: "rgba(59,41,34,0.28)" }
    : done
    ? { background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116", glow: "color-mix(in srgb, var(--gold) 55%, transparent)" }
    : current
      ? { background: "linear-gradient(160deg, color-mix(in srgb, var(--bordeaux) 82%, #fff), var(--bordeaux))", color: "#fff", glow: "color-mix(in srgb, var(--bordeaux) 45%, transparent)" }
      : { background: "linear-gradient(160deg, #fff, var(--surface))", color: "var(--cream)", glow: "rgba(59,41,34,0.3)" };

  return (
    <Link href={href} className="group block relative" style={{ width: NODE, height: NODE }} title={locked ? "Unlock with membership" : title}>
      {current && !locked && <span className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 btn-gold px-3 py-1 text-xs whitespace-nowrap bob z-20">Start</span>}
      {current && !locked && <span className="pulse-ring absolute inset-0 rounded-full" style={{ border: "3px solid var(--gold-bright)" }} />}

      {/* Fortschritts-Ring */}
      <svg className="absolute inset-0 -rotate-90" width={NODE} height={NODE} viewBox={`0 0 ${NODE} ${NODE}`} aria-hidden="true">
        <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--cream) 14%, transparent)" strokeWidth={RING} />
        {frac > 0 && !locked && (
          <circle cx={NODE / 2} cy={NODE / 2} r={r} fill="none" stroke="var(--gold-bright)" strokeWidth={RING} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
        )}
      </svg>

      <div
        className={`absolute grid place-items-center rounded-full text-5xl transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-1 ${locked ? "opacity-70" : ""}`}
        style={{ inset: RING + 2, background: fill.background, color: fill.color, boxShadow: `0 14px 28px -12px ${fill.glow}, inset 0 2px 4px rgba(255,255,255,0.4)` }}
      >
        {locked ? "🔒" : emoji}
      </div>
      {done && !locked && (
        <span className="absolute -top-1 -right-1 w-7 h-7 grid place-items-center rounded-full text-sm z-20" style={{ background: "var(--green-accent)", color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>✓</span>
      )}

      <div className="absolute left-1/2 top-full -translate-x-1/2 mt-2.5 flex flex-col items-center" style={{ width: Math.max(110, maxLabel) }}>
        <span className={`path-label text-[15px] text-center leading-tight ${current && !locked ? "text-cream font-semibold" : "text-cream font-medium"}`}>
          {title}
        </span>
        <span className="path-label text-xs text-cream-dim mt-0.5 font-medium">{locked ? "🔒 membership" : sub}</span>
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
      <span className={`path-label absolute left-1/2 top-full -translate-x-1/2 mt-1 whitespace-nowrap text-xs font-medium ${earned ? "text-gold-bright" : "text-cream-dim"}`}>{name}</span>
    </div>
  );
}

// Panorama-Kulisse: warmer Himmel, Sonne, Wolken, Alpen mit Schnee und die
// München-Skyline (Frauenkirche, Rathausturm, Olympiaturm) als Silhouette.
export function MunichScene() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id="ms-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dbe8ef" />
          <stop offset="0.42" stopColor="#f6e6c6" />
          <stop offset="0.78" stopColor="#fdeecd" />
          <stop offset="1" stopColor="#fff2d6" />
        </linearGradient>
        <radialGradient id="ms-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6a3" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe6a3" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="1440" height="900" fill="url(#ms-sky)" />

      <circle cx="1150" cy="180" r="230" fill="url(#ms-sun)" />
      <circle cx="1150" cy="180" r="54" fill="#ffd982" opacity="0.9" />

      <g fill="#ffffff">
        <g className="cloud-a" opacity="0.85">
          <ellipse cx="300" cy="150" rx="72" ry="26" />
          <ellipse cx="362" cy="140" rx="52" ry="30" />
          <ellipse cx="248" cy="160" rx="46" ry="22" />
        </g>
        <g className="cloud-b" opacity="0.7">
          <ellipse cx="840" cy="115" rx="60" ry="22" />
          <ellipse cx="892" cy="106" rx="42" ry="26" />
        </g>
      </g>

      <path d="M0,700 L110,560 L230,610 L340,470 L470,590 L610,440 L760,560 L900,470 L1040,580 L1180,480 L1300,560 L1440,500 L1440,740 L0,740 Z" fill="#b7c6cf" opacity="0.5" />

      <path d="M0,730 L90,610 L200,560 L300,450 L390,540 L470,360 L560,470 L650,410 L770,540 L880,450 L980,350 L1090,470 L1190,400 L1300,540 L1380,460 L1440,560 L1440,760 L0,760 Z" fill="#9db0ba" opacity="0.72" />
      <g fill="#f4f8fa" opacity="0.95">
        <path d="M470,360 L502,408 L440,408 Z" />
        <path d="M980,350 L1014,400 L948,400 Z" />
        <path d="M300,450 L328,490 L272,490 Z" />
        <path d="M1190,400 L1218,442 L1162,442 Z" />
        <path d="M650,410 L676,448 L624,448 Z" />
      </g>

      {/* München-Skyline – hintere Häuserreihe */}
      <g fill="#a9694a" opacity="0.55">
        <rect x="40" y="740" width="90" height="160" />
        <rect x="150" y="710" width="70" height="190" />
        <rect x="250" y="750" width="80" height="150" />
        <rect x="1080" y="730" width="80" height="170" />
        <rect x="1210" y="750" width="70" height="150" />
        <rect x="1300" y="712" width="90" height="188" />
      </g>

      {/* München-Skyline – vordere Silhouette mit Wahrzeichen */}
      <g fill="#71301f" opacity="0.9">
        <rect x="90" y="770" width="70" height="130" />
        <rect x="180" y="800" width="60" height="100" />
        <rect x="330" y="760" width="80" height="140" />

        {/* Neues Rathaus – gotischer Turm */}
        <rect x="440" y="560" width="34" height="340" />
        <path d="M440,560 L457,505 L474,560 Z" />
        <rect x="452" y="486" width="10" height="24" />

        {/* Peterskirche – Spitzturm */}
        <rect x="512" y="640" width="30" height="260" />
        <path d="M512,640 L527,585 L542,640 Z" />

        {/* Frauenkirche – zwei Türme mit Zwiebelhauben */}
        <rect x="600" y="600" width="46" height="300" />
        <rect x="672" y="600" width="46" height="300" />
        <path d="M600,600 Q623,558 646,600 Z" />
        <path d="M672,600 Q695,558 718,600 Z" />
        <ellipse cx="623" cy="576" rx="24" ry="20" />
        <ellipse cx="695" cy="576" rx="24" ry="20" />
        <rect x="619" y="548" width="8" height="16" />
        <rect x="691" y="548" width="8" height="16" />

        <rect x="760" y="780" width="80" height="120" />
        <rect x="860" y="750" width="70" height="150" />
        <rect x="948" y="800" width="70" height="100" />

        {/* Olympiaturm – Nadel mit Kanzel */}
        <rect x="1148" y="470" width="12" height="430" />
        <ellipse cx="1154" cy="548" rx="26" ry="18" />
        <rect x="1151" y="430" width="6" height="44" />

        <rect x="1230" y="790" width="70" height="110" />
        <rect x="1330" y="770" width="80" height="130" />
      </g>
    </svg>
  );
}
