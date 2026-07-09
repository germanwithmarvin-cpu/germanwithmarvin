import React from "react";

// Leichter Markdown-Renderer für den "Skool-Style"-Text: Überschriften (#, ##, ###),
// **fett**, *kursiv*, `code`, Aufzählungen (- / •), nummerierte Listen (1.) und
// Links [Text](URL). Bewusst einfach gehalten; keine externe Abhängigkeit.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex =
    /(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined || m[4] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}${i}`}>{m[2] ?? m[4]}</strong>);
    } else if (m[6] !== undefined || m[8] !== undefined) {
      nodes.push(<em key={`${keyPrefix}${i}`}>{m[6] ?? m[8]}</em>);
    } else if (m[10] !== undefined) {
      nodes.push(<code key={`${keyPrefix}${i}`} className="px-1 rounded bg-bordeaux-deep/60 text-sm">{m[10]}</code>);
    } else if (m[12] !== undefined) {
      nodes.push(
        <a key={`${keyPrefix}${i}`} href={m[13]} target="_blank" rel="noreferrer" className="text-gold-bright underline underline-offset-4">
          {m[12]}
        </a>,
      );
    }
    last = regex.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const isHeading = (s: string) => /^#{1,3}\s+/.test(s);
  const isBullet = (s: string) => /^[-*•]\s+/.test(s);
  const isNumber = (s: string) => /^\d+\.\s+/.test(s);

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed === "") { i++; continue; }

    // Überschrift
    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      const level = h[1].length;
      const cls = level === 1 ? "text-2xl font-bold mt-4 mb-1" : level === 2 ? "text-xl font-semibold mt-4 mb-1" : "text-lg font-semibold mt-3 mb-1";
      blocks.push(React.createElement(`h${Math.min(level + 1, 4)}`, { key: key++, className: cls }, renderInline(h[2], `h${key}-`)));
      i++;
      continue;
    }

    // Aufzählung
    if (isBullet(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && isBullet(lines[i].trim())) {
        items.push(<li key={items.length}>{renderInline(lines[i].trim().replace(/^[-*•]\s+/, ""), `li${key}-${items.length}-`)}</li>);
        i++;
      }
      blocks.push(<ul key={key++} className="list-disc pl-5 space-y-1 my-2">{items}</ul>);
      continue;
    }

    // Nummerierte Liste
    if (isNumber(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && isNumber(lines[i].trim())) {
        items.push(<li key={items.length}>{renderInline(lines[i].trim().replace(/^\d+\.\s+/, ""), `ol${key}-${items.length}-`)}</li>);
        i++;
      }
      blocks.push(<ol key={key++} className="list-decimal pl-5 space-y-1 my-2">{items}</ol>);
      continue;
    }

    // Absatz (mehrere Zeilen bis zur nächsten Leerzeile/Sonderzeile)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !isHeading(lines[i].trim()) && !isBullet(lines[i].trim()) && !isNumber(lines[i].trim())) {
      para.push(lines[i].trim());
      i++;
    }
    const nodes: React.ReactNode[] = [];
    para.forEach((pl, idx) => {
      if (idx > 0) nodes.push(<br key={`br${key}-${idx}`} />);
      nodes.push(...renderInline(pl, `p${key}-${idx}-`));
    });
    blocks.push(<p key={key++} className="my-2 leading-relaxed">{nodes}</p>);
  }

  return <div className={className}>{blocks}</div>;
}
