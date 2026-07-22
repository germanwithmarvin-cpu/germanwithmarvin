"use client";

import SentenceSlots from "./SentenceSlots";

// Darstellung der Erklärung am Anfang einer Einheit.
//
// Vorher war das ein durchlaufender Text mit Hervorhebungen mittendrin – zu
// viel auf einmal, und Regel und Beispiel standen gleichwertig nebeneinander.
// Jetzt wird die Erklärung in BLÖCKE zerlegt: eine Regel, direkt darunter ihre
// Beispiele, mit Luft zum nächsten Block.
//
// Die Auszeichnung bleibt bewusst schlichter Text, damit die Inhalte in
// trainingSeed.ts lesbar bleiben. Zeilenanfänge steuern den Block:
//
//   ## Überschrift        -> Abschnitt (teilt die Erklärung in Kapitel)
//   > Regel               -> Regelblock (das Wichtige, hervorgehoben)
//   ! Achtung             -> Stolperfalle (eigene Farbe)
//   = Deutsch | English   -> Beispiel, gehört zum Block darüber
//   | a | b | c |         -> Tabellenzeile (Formen, Endungen)
//   @Ich|lerne*|Deutsch   -> Satzpositionen, * markiert das Verb
//   alles andere          -> normaler Absatz
//
// Innerhalb einer Zeile weiterhin: **wichtig** (gelber Marker), *Form*
// (Bordeaux-Chip).

type Example = { de: string; en: string };
type Block =
  | { t: "head"; text: string }
  | { t: "rule"; lines: string[]; examples: Example[] }
  | { t: "warn"; lines: string[]; examples: Example[] }
  | { t: "table"; rows: string[][] }
  | { t: "slots"; rows: { tokens: string[]; verb?: number }[] }
  | { t: "text"; lines: string[]; examples: Example[] };

function parse(theory: string): Block[] {
  const blocks: Block[] = [];
  const last = () => blocks[blocks.length - 1];

  for (const raw of theory.split("\n")) {
    const line = raw.trim();

    if (!line) { blocks.push({ t: "text", lines: [], examples: [] }); continue; }

    if (line.startsWith("## ")) { blocks.push({ t: "head", text: line.slice(3).trim() }); continue; }
    if (line.startsWith("> ")) { blocks.push({ t: "rule", lines: [line.slice(2).trim()], examples: [] }); continue; }
    if (line.startsWith("! ")) { blocks.push({ t: "warn", lines: [line.slice(2).trim()], examples: [] }); continue; }

    if (line.startsWith("= ")) {
      const [de, en = ""] = line.slice(2).split("|").map((s) => s.trim());
      const b = last();
      if (b && (b.t === "rule" || b.t === "warn" || b.t === "text")) b.examples.push({ de, en });
      else blocks.push({ t: "text", lines: [], examples: [{ de, en }] });
      continue;
    }

    if (line.startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter((c, i, a) => !(c === "" && (i === 0 || i === a.length - 1)));
      const b = last();
      if (b && b.t === "table") b.rows.push(cells);
      else blocks.push({ t: "table", rows: [cells] });
      continue;
    }

    if (line.startsWith("@")) {
      const parts = line.slice(1).split("|").map((t) => t.trim());
      const verb = parts.findIndex((t) => t.endsWith("*"));
      const row = { tokens: parts.map((t) => t.replace(/\*$/, "")), verb: verb >= 0 ? verb : undefined };
      const b = last();
      if (b && b.t === "slots") b.rows.push(row);
      else blocks.push({ t: "slots", rows: [row] });
      continue;
    }

    // Fortsetzungszeile eines Regel-/Achtung-Blocks, sonst normaler Text.
    const b = last();
    if (b && (b.t === "rule" || b.t === "warn") && b.examples.length === 0) { b.lines.push(line); continue; }
    if (b && b.t === "text" && b.examples.length === 0 && b.lines.length > 0) { b.lines.push(line); continue; }
    blocks.push({ t: "text", lines: [line], examples: [] });
  }

  return blocks.filter((b) => !(b.t === "text" && b.lines.length === 0 && b.examples.length === 0));
}

// **Marker** und *Chip* innerhalb einer Zeile.
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, k) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <mark key={k} className="font-extrabold rounded px-1.5 py-0.5"
              style={{ background: "color-mix(in srgb, var(--gold) 42%, transparent)", color: "var(--cream)" }}>
              {part.slice(2, -2)}
            </mark>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          const chip = part.slice(1, -1);
          return (
            <span key={k} className={`font-bold rounded px-1.5 py-0.5 ${chip.length <= 24 ? "whitespace-nowrap" : ""}`}
              style={{ background: "var(--bordeaux)", color: "#fff" }}>
              {chip}
            </span>
          );
        }
        return <span key={k}>{part}</span>;
      })}
    </>
  );
}

function Examples({ items, compact }: { items: Example[]; compact: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className={`${compact ? "mt-2 space-y-1.5" : "mt-4 space-y-3"} pl-4 border-l-2`}
      style={{ borderColor: "color-mix(in srgb, var(--gold) 45%, transparent)" }}>
      {items.map((ex, i) => (
        <div key={i}>
          <div className={compact ? "text-[15px] font-semibold" : "text-[17px] font-semibold leading-relaxed"}>
            <Inline text={ex.de} />
          </div>
          {/* Auch die Übersetzung darf Auszeichnung tragen – dort steht oft der
              eigentliche Kontrast ("You **must not** come"). */}
          {ex.en && <div className="text-[13px] text-cream-dim mt-0.5"><Inline text={ex.en} /></div>}
        </div>
      ))}
    </div>
  );
}

export default function Theory({ text, compact = false }: { text: string; compact?: boolean }) {
  const blocks = parse(text);

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "head":
            return (
              <div key={i} className={`flex items-center gap-3 ${i === 0 ? "" : compact ? "pt-3" : "pt-6"}`}>
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] shrink-0" style={{ color: "var(--bordeaux)" }}>
                  {b.text}
                </h3>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--gold) 55%, transparent), transparent)" }} />
              </div>
            );

          case "rule":
          case "warn": {
            const warn = b.t === "warn";
            return (
              <div key={i} className={`rounded-2xl ${compact ? "p-4" : "p-5 sm:p-6"}`}
                style={{
                  background: warn
                    ? "color-mix(in srgb, var(--red-accent) 9%, transparent)"
                    : "color-mix(in srgb, var(--gold) 13%, transparent)",
                  borderLeft: `5px solid ${warn ? "var(--red-accent)" : "var(--gold)"}`,
                }}>
                <div className={compact ? "text-[15px] leading-7 space-y-1" : "text-[17px] leading-8 space-y-1.5"}>
                  {warn && <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] mb-1" style={{ color: "var(--red-accent)" }}>Watch out</div>}
                  {b.lines.map((l, k) => <div key={k}><Inline text={l} /></div>)}
                </div>
                <Examples items={b.examples} compact={compact} />
              </div>
            );
          }

          case "table":
            return (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--bordeaux-deep)" }}>
                {b.rows.map((cells, k) => (
                  <div key={k}
                    className={`grid grid-cols-2 ${cells.length > 2 ? "sm:grid-cols-4" : ""} gap-x-4 px-4 ${compact ? "py-1.5" : "py-2.5"}`}
                    style={{ borderTop: k === 0 ? "none" : "1px solid color-mix(in srgb, var(--cream) 8%, transparent)" }}>
                    {cells.map((c, n) => (
                      <div key={n} className={n % 2 === 0 ? "text-cream-dim text-[14px]" : "font-bold"}>
                        <Inline text={c} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );

          case "slots":
            return (
              <div key={i} className="space-y-3">
                {b.rows.map((r, k) => <SentenceSlots key={k} tokens={r.tokens} verb={r.verb} size={compact ? "small" : "base"} />)}
              </div>
            );

          default:
            return (
              <div key={i}>
                <p className={compact ? "text-[15px] leading-7 max-w-[68ch]" : "text-[17px] leading-8 max-w-[68ch]"}>
                  {b.lines.map((l, k) => <span key={k}>{k > 0 && <br />}<Inline text={l} /></span>)}
                </p>
                <Examples items={b.examples} compact={compact} />
              </div>
            );
        }
      })}
    </div>
  );
}
