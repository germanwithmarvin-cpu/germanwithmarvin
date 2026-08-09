"use client";

import { useState } from "react";
import { periodLabel, totalsFor } from "@/lib/books";
import { patchPeriod } from "@/lib/booksClient";
import type { StepProps } from "./MonthView";
import { Hint, Money, Note, Stat } from "./ui";

// Schritt 4: die Zahlen des Monats, eine automatische Pruefliste und der
// Abschluss. Blockierend ist nur, was die Buchhaltung wirklich unbrauchbar
// macht; alles andere ist ein Hinweis, kein Riegel.

type Check = { ok: boolean; blocking: boolean; text: string };

export default function ReviewStep({
  period,
  revenue,
  expenses,
  owner,
  meta,
  reload,
  steps,
}: StepProps & { steps: { step1Done: boolean; step2Done: boolean; step3Done: boolean } }) {
  const [busy, setBusy] = useState(false);
  const t = totalsFor(revenue, expenses, owner);
  const closed = Boolean(meta.closed_at);

  const noCategory = revenue.filter((r) => r.kind !== "Stripe-Gebuehr" && !r.product).length;
  const noReceipt = expenses.filter((e) => !e.receipt).length;
  const missingW8 = expenses.filter((e) => e.w8ben === "Nein").length;
  const salesNoTax = revenue.filter((r) => r.kind === "Verkauf" && r.tax_usd === 0).length;
  const ownerNoReceipt = owner.filter((o) => !o.receipt).length;
  const otherKind = revenue.filter((r) => r.kind === "Sonstiges").length;

  const checks: Check[] = [
    {
      ok: Boolean(meta.synced_at),
      blocking: true,
      text: meta.synced_at ? "Stripe-Umsätze wurden geholt" : "Schritt 1: Stripe-Umsätze wurden noch nicht geholt",
    },
    {
      ok: noCategory === 0,
      blocking: true,
      text: noCategory === 0 ? "Alle Buchungen haben eine Kategorie" : `${noCategory} Buchung(en) ohne Kategorie — sie landen sonst unter „Nicht zugeordnet“`,
    },
    {
      ok: otherKind === 0,
      blocking: true,
      text: otherKind === 0 ? "Keine unklaren Stripe-Vorgänge" : `${otherKind} Vorgang/Vorgänge mit unbekanntem Stripe-Typ — in Schritt 1 einordnen`,
    },
    {
      ok: steps.step2Done,
      blocking: true,
      text: steps.step2Done ? "Ausgaben als vollständig bestätigt" : "Schritt 2 ist noch nicht bestätigt",
    },
    {
      ok: steps.step3Done,
      blocking: true,
      text: steps.step3Done ? "Owner-Bewegungen als vollständig bestätigt" : "Schritt 3 ist noch nicht bestätigt",
    },
    {
      ok: noReceipt === 0,
      blocking: false,
      text: noReceipt === 0 ? "Zu jeder Ausgabe liegt ein Beleg" : `${noReceipt} Ausgabe(n) ohne abgelegten Beleg — Reg. 1.6038A-3 ist eigenständig bußgeldbewehrt`,
    },
    {
      ok: missingW8 === 0,
      blocking: false,
      text: missingW8 === 0 ? "Keine offenen W-8BEN" : `${missingW8} Zahlung(en) an Contractors ohne W-8BEN in der Akte`,
    },
    {
      ok: ownerNoReceipt === 0,
      blocking: false,
      text: ownerNoReceipt === 0 ? "Owner-Bewegungen sind belegt" : `${ownerNoReceipt} Owner-Bewegung(en) ohne Beleg`,
    },
    {
      ok: salesNoTax === 0,
      blocking: false,
      text: salesNoTax === 0 ? "Bei allen Verkäufen ist die Steuer ausgewiesen" : `${salesNoTax} Verkauf/Verkäufe mit Steuer 0,00 — prüfen, ob Stripe hier wirklich keine Steuer einbehalten hat`,
    },
  ];

  const blockers = checks.filter((c) => c.blocking && !c.ok);
  const hints = checks.filter((c) => !c.blocking && !c.ok);

  async function close(next: boolean) {
    setBusy(true);
    await patchPeriod(period, { closed_at: next ? new Date().toISOString() : null });
    await reload();
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Erlöse (netto)" value={t.revenueTotal} hint="ohne durchlaufende Steuer" />
        <Stat label="Ausgaben gesamt" value={t.expenseTotal} hint={`davon Stripe-Gebühren ${t.stripeFees.toFixed(2)}`} />
        <Stat label="Gewinn vor Steuern" value={t.profit} />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Durchlaufende Steuer" value={t.passThroughTax} hint="kein Erlös, nur weitergereicht" />
        <Stat label="Owner: in die LLC" value={t.ownerIn} />
        <Stat label="Owner: aus der LLC" value={t.ownerOut} />
      </div>

      <div className="space-y-1.5 rounded-xl border border-gold/20 bg-bordeaux-deep/30 p-4">
        <div className="text-sm font-semibold">Prüfliste</div>
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={c.ok ? "text-gold-bright" : c.blocking ? "text-bordeaux" : "text-cream-dim"}>
              {c.ok ? "✓" : c.blocking ? "✕" : "!"}
            </span>
            <span className={c.ok ? "text-cream-dim" : ""}>{c.text}</span>
          </div>
        ))}
      </div>

      {t.revenueByCategory["Nicht zugeordnet"] !== undefined && (
        <Note tone="warn">
          <Money value={t.revenueByCategory["Nicht zugeordnet"]} /> Erlöse stehen ohne Kategorie in
          der GuV. Das lässt sich in Schritt 1 in einem Klick beheben.
        </Note>
      )}

      {closed ? (
        <div className="space-y-3">
          <Note tone="ok">
            {periodLabel(period)} ist abgeschlossen — seit{" "}
            {meta.closed_at ? new Date(meta.closed_at).toLocaleString("de-DE") : ""}. Die Formulare
            der Schritte 1–3 sind gesperrt, damit nichts versehentlich verrutscht.
          </Note>
          <button onClick={() => close(false)} disabled={busy} className="btn-outline px-4 py-2 text-sm disabled:opacity-50">
            Monat wieder öffnen
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={() => close(true)}
            disabled={busy || blockers.length > 0}
            className="btn-gold px-4 py-2 text-sm disabled:opacity-40"
          >
            {busy ? "Schließe ab …" : `${periodLabel(period)} abschließen`}
          </button>
          {blockers.length > 0 ? (
            <Hint>
              Noch offen: {blockers.map((b) => b.text).join(" · ")}
            </Hint>
          ) : hints.length > 0 ? (
            <Hint>
              Abschluss ist möglich. Offene Hinweise bleiben bestehen und tauchen in der
              Jahresansicht wieder auf.
            </Hint>
          ) : (
            <Hint>Alles geprüft — der Monat kann zu.</Hint>
          )}
        </div>
      )}
    </div>
  );
}
