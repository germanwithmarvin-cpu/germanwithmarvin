"use client";

// Satz als nummerierte Positionen. Kernidee: Das konjugierte Verb steht im
// Deutschen immer auf Position 2 – das ist eine räumliche Aussage und wird
// deshalb räumlich gezeigt statt beschrieben.
//
// Die Spalten sind gleich breit. Stehen mehrere Sätze untereinander, liegt das
// Verb dadurch immer in derselben Spalte – man sieht sofort, dass ringsum alles
// tauscht, das Verb aber bleibt.

export default function SentenceSlots({
  tokens,
  verb,
  size = "base",
}: {
  tokens: string[];
  verb?: number; // Index des konjugierten Verbs (0-basiert)
  size?: "base" | "small";
}) {
  const pad = size === "small" ? "px-2 py-1.5 text-sm" : "px-3 py-2.5 text-base";

  return (
    <div className="grid gap-2 my-1" style={{ gridTemplateColumns: `repeat(${tokens.length}, minmax(0, 1fr))` }}>
      {tokens.map((t, i) => {
        const isVerb = i === verb;
        return (
          <div key={i} className="flex flex-col items-center gap-1 min-w-0">
            {/* Positionsnummer */}
            <span
              className="text-[10px] font-bold leading-none rounded-full w-5 h-5 grid place-items-center shrink-0"
              style={{
                background: isVerb ? "var(--bordeaux)" : "color-mix(in srgb, var(--cream) 12%, transparent)",
                color: isVerb ? "#fff" : "var(--cream-dim)",
              }}
            >
              {i + 1}
            </span>
            {/* Satzbaustein */}
            <div
              className={`w-full text-center font-semibold rounded-lg ${pad} truncate`}
              style={
                isVerb
                  ? { background: "var(--bordeaux)", color: "#fff", boxShadow: "0 6px 14px -8px rgba(59,41,34,.55)" }
                  : { background: "var(--bordeaux-deep)", color: "var(--cream)" }
              }
              title={t}
            >
              {t}
            </div>
          </div>
        );
      })}
    </div>
  );
}
