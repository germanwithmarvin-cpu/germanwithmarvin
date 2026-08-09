"use client";

import type { ReactNode } from "react";
import { money } from "@/lib/books";

// Kleine, wiederverwendete Bausteine der Buchhaltung. Bewusst schlicht: die
// Seite soll fuehren, nicht beeindrucken.

export const inputCls =
  "rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm w-full";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gold/20 bg-bordeaux-deep/25 p-4 ${className}`}>{children}</div>
  );
}

/** Beschriftetes Feld mit erklaerendem Untertext — das "was gehoert hier rein". */
export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-xs font-medium text-cream">{label}</span>
      {children}
      {hint && <span className="block text-[11px] leading-snug text-cream-dim">{hint}</span>}
    </label>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-cream-dim">{children}</p>;
}

export function Note({ tone = "info", children }: { tone?: "info" | "warn" | "ok"; children: ReactNode }) {
  const styles = {
    info: "border-gold/30 bg-gold/10 text-cream",
    warn: "border-bordeaux/40 bg-bordeaux/10 text-cream",
    ok: "border-emerald-700/30 bg-emerald-700/10 text-cream",
  }[tone];
  return <div className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${styles}`}>{children}</div>;
}

export function Money({ value, bold = false }: { value: number; bold?: boolean }) {
  const negative = value < 0;
  return (
    <span className={`tabular-nums ${bold ? "font-semibold" : ""} ${negative ? "text-bordeaux" : ""}`}>
      {money(value)}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-lg border border-gold/20 bg-bordeaux-deep/40 px-3 py-2">
      <div className="text-[11px] text-cream-dim">{label}</div>
      <div className="text-lg font-semibold tabular-nums">
        <Money value={value} />
      </div>
      {hint && <div className="text-[11px] text-cream-dim">{hint}</div>}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return <span className="text-xs text-cream-dim">{label}</span>;
}

/** Runder Schritt-Marker im gefuehrten Monatsablauf. */
export function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        done ? "bg-gold text-[#3a0a0a]" : "border border-gold/40 text-cream-dim"
      }`}
    >
      {done ? "✓" : n}
    </span>
  );
}

export function Th({ children, right = false }: { children?: ReactNode; right?: boolean }) {
  return (
    <th className={`px-2 py-1.5 text-[11px] font-medium text-cream-dim ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

export function Td({ children, right = false, className = "" }: { children?: ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-2 py-1.5 align-top ${right ? "text-right tabular-nums" : ""} ${className}`}>{children}</td>;
}

/** Datum als 03.08.2026 — ohne Zeitzonenfallen, der String kommt als YYYY-MM-DD. */
export function deDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d ? `${d}.${m}.${y}` : iso;
}
