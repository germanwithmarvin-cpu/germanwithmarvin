"use client";

import { useState } from "react";
import {
  REVENUE_CATEGORIES,
  REVENUE_KINDS,
  netUsd,
  periodLabel,
  periodRange,
  round2,
  today,
  type RevenueRow,
} from "@/lib/books";
import { deleteRevenue, insertRevenue, rememberProduct, updateRevenue } from "@/lib/booksClient";
import type { StepProps } from "./MonthView";
import { Field, Hint, Money, Note, Td, Th, deDate, inputCls } from "./ui";

// Schritt 1: Stripe holen, dann jede Buchung einer Kategorie zuordnen.
//
// Die Zuordnung merkt sich das Tool je Stripe-Produkttext. Beim naechsten Monat
// laeuft sie von selbst durch — man ordnet jedes Produkt genau einmal zu.

type SyncResult = {
  found: number;
  imported: number;
  existing: number;
  ignored: number;
  sales: number;
  salesWithTax: number;
  warnings: string[];
};

export default function RevenueStep({ period, locked, revenue, settings, meta, reload }: StepProps) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const categories = [...REVENUE_CATEGORIES, ...(settings?.extra_revenue_categories ?? [])];
  const unassigned = revenue.filter((r) => r.kind !== "Stripe-Gebuehr" && !r.product);

  async function sync() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/books/stripe-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Der Abruf ist fehlgeschlagen.");
      else setResult(data);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Netzwerkfehler");
    } finally {
      setBusy(false);
    }
  }

  // Kategorie setzen — und gleich alle noch offenen Buchungen desselben
  // Stripe-Produkts mitnehmen. Das spart bei 40 Abo-Zeilen 39 Klicks.
  async function setCategory(row: RevenueRow, category: string) {
    await updateRevenue(row.id, { product: category });
    const raw = row.product_raw.trim().toLowerCase();
    if (raw && category) {
      await rememberProduct(raw, category);
      const siblings = revenue.filter(
        (r) => r.id !== row.id && !r.product && r.product_raw.trim().toLowerCase() === raw,
      );
      for (const s of siblings) await updateRevenue(s.id, { product: category });
      setInfo(
        siblings.length
          ? `„${row.product_raw}“ → ${category}. ${siblings.length} weitere Buchung(en) gleich mit zugeordnet und für künftige Monate gemerkt.`
          : `„${row.product_raw}“ → ${category}, für künftige Monate gemerkt.`,
      );
    }
    reload();
  }

  async function setTax(row: RevenueRow, value: number) {
    const fx = row.fx_rate || 1;
    await updateRevenue(row.id, { tax_usd: value, tax_original: round2(value / fx) });
    reload();
  }

  return (
    <div className="space-y-4">
      <Hint>
        Geholt wird der komplette Kalendermonat: Verkäufe, Erstattungen, Chargebacks und
        Stripe-Gebühren. Auszahlungen aufs Bankkonto bleiben außen vor — sie sind eine
        Geldbewegung, kein Erlös. Der Abruf lässt bereits vorhandene Buchungen unangetastet,
        du kannst ihn also gefahrlos wiederholen.
      </Hint>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={sync} disabled={busy || locked} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
          {busy ? "Hole Daten …" : `Stripe-Umsätze für ${periodLabel(period)} holen`}
        </button>
        {meta.synced_at && (
          <span className="text-xs text-cream-dim">
            zuletzt geholt: {new Date(meta.synced_at).toLocaleString("de-DE")}
          </span>
        )}
      </div>

      {error && <Note tone="warn">{error}</Note>}

      {result && (
        <Note tone="ok">
          {result.imported} neu übernommen · {result.existing} waren schon da ·{" "}
          {result.ignored} Geldbewegung(en) übersprungen · {result.sales} Verkäufe, davon{" "}
          {result.salesWithTax} mit ausgewiesener Steuer.
        </Note>
      )}
      {result?.warnings?.map((w, i) => (
        <Note key={i} tone="warn">{w}</Note>
      ))}
      {info && <Note tone="info">{info}</Note>}

      {unassigned.length > 0 && (
        <Note tone="warn">
          {unassigned.length} Buchung(en) haben noch keine Kategorie. Ohne Kategorie landen sie in
          der GuV unter „Nicht zugeordnet“.
        </Note>
      )}

      {revenue.length === 0 ? (
        <p className="text-sm text-cream-dim">Noch keine Buchungen in {periodLabel(period)}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[54rem] text-xs">
            <thead className="border-b border-gold/20">
              <tr>
                <Th>Datum</Th>
                <Th>Typ</Th>
                <Th>Produkt laut Stripe</Th>
                <Th>Kategorie</Th>
                <Th right>Brutto USD</Th>
                <Th right>Steuer USD</Th>
                <Th right>Netto USD</Th>
                <Th right>Gebühr USD</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => {
                const needsCat = r.kind !== "Stripe-Gebuehr" && !r.product;
                return (
                  <tr key={r.id} className={`border-b border-gold/10 ${needsCat ? "bg-bordeaux/10" : ""}`}>
                    <Td>{deDate(r.booked_on)}</Td>
                    <Td>
                      <span className={r.kind === "Verkauf" ? "" : "text-bordeaux"}>{r.kind}</span>
                      {r.source === "manuell" && <span className="ml-1 text-cream-dim">(manuell)</span>}
                    </Td>
                    <Td className="max-w-[14rem] truncate" >
                      <span title={`${r.product_raw}${r.stripe_ref ? ` · ${r.stripe_ref}` : ""}`}>
                        {r.product_raw || "—"}
                      </span>
                      {r.note && <span className="block text-[11px] text-bordeaux">{r.note}</span>}
                    </Td>
                    <Td>
                      {r.kind === "Stripe-Gebuehr" ? (
                        <span className="text-cream-dim">—</span>
                      ) : (
                        <select
                          value={r.product}
                          disabled={locked}
                          onChange={(e) => setCategory(r, e.target.value)}
                          className={`${inputCls} py-1 text-xs ${needsCat ? "border-bordeaux" : ""}`}
                        >
                          <option value="">— wählen —</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                    </Td>
                    <Td right><Money value={r.gross_usd} /></Td>
                    <Td right>
                      <input
                        type="number"
                        step="0.01"
                        disabled={locked}
                        defaultValue={r.tax_usd}
                        onBlur={(e) => {
                          const v = round2(Number(e.target.value) || 0);
                          if (v !== r.tax_usd) setTax(r, v);
                        }}
                        className={`${inputCls} w-24 py-1 text-right text-xs`}
                      />
                    </Td>
                    <Td right><Money value={netUsd(r)} bold /></Td>
                    <Td right><Money value={r.fee_usd} /></Td>
                    <Td right>
                      <button
                        disabled={locked}
                        onClick={async () => {
                          if (!confirm("Diese Buchung löschen? Ein erneuter Stripe-Abruf würde sie wieder holen.")) return;
                          await deleteRevenue(r.id);
                          reload();
                        }}
                        className="text-cream-dim hover:text-bordeaux disabled:opacity-40"
                        title="Löschen"
                      >
                        ✕
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <button onClick={() => setAdding(!adding)} disabled={locked} className="btn-outline px-3 py-1.5 text-xs disabled:opacity-50">
          {adding ? "Abbrechen" : "+ Einnahme von Hand (Preply, Skool, Überweisung)"}
        </button>
      </div>

      {adding && (
        <ManualRevenue
          period={period}
          categories={categories}
          onDone={() => { setAdding(false); reload(); }}
        />
      )}
    </div>
  );
}

// Einnahmen, die nicht über Stripe laufen — Preply, Skool, direkte Überweisung.
function ManualRevenue({
  period,
  categories,
  onDone,
}: {
  period: string;
  categories: string[];
  onDone: () => void;
}) {
  const range = periodRange(period);
  const [date, setDate] = useState(() => {
    const t = today();
    return t >= range.from && t <= range.to ? t : range.to;
  });
  const [kind, setKind] = useState<string>("Verkauf");
  const [product, setProduct] = useState(categories[0] ?? "");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [gross, setGross] = useState("");
  const [tax, setTax] = useState("");
  const [fx, setFx] = useState("1");
  const [fee, setFee] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = Number(fx) || 1;
  const grossUsd = round2((Number(gross) || 0) * rate);
  const taxUsd = round2((Number(tax) || 0) * rate);

  async function save() {
    if (!gross.trim()) { setError("Bitte einen Bruttobetrag eintragen."); return; }
    if (date < range.from || date > range.to) { setError(`Das Datum muss in ${periodLabel(period)} liegen.`); return; }
    setBusy(true);
    setError(null);
    const err = await insertRevenue({
      booked_on: date,
      kind,
      source: "manuell",
      product,
      product_raw: "",
      customer_country: country.toUpperCase(),
      currency: currency.toUpperCase(),
      gross_original: round2(Number(gross) || 0),
      tax_original: round2(Number(tax) || 0),
      fx_rate: rate,
      gross_usd: grossUsd,
      tax_usd: taxUsd,
      fee_usd: round2(Number(fee) || 0),
      note,
    });
    setBusy(false);
    if (err) { setError(err); return; }
    onDone();
  }

  return (
    <div className="space-y-3 rounded-xl border border-gold/25 bg-bordeaux-deep/40 p-4">
      <Hint>
        Für Einnahmen außerhalb von Stripe. Erstattungen trägst du als eigene Zeile mit
        <strong> negativem</strong> Betrag ein — bestehende Zeilen bitte nie überschreiben.
      </Hint>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Datum">
          <input type="date" value={date} min={range.from} max={range.to} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Typ">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            {REVENUE_KINDS.filter((k) => k !== "Stripe-Gebuehr").map((k) => <option key={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Kategorie">
          <select value={product} onChange={(e) => setProduct(e.target.value)} className={inputCls}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Währung" hint="Die Währung, in der du das Geld bekommen hast.">
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} maxLength={3} />
        </Field>
        <Field label="Brutto (Originalwährung)" hint="Der volle Betrag, den der Kunde gezahlt hat.">
          <input type="number" step="0.01" value={gross} onChange={(e) => setGross(e.target.value)} className={inputCls} />
        </Field>
        <Field label="davon Steuer" hint="Nur wenn Steuer enthalten war. Sonst 0 lassen.">
          <input type="number" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Kurs zu USD" hint="Bei USD einfach 1.">
          <input type="number" step="0.0001" value={fx} onChange={(e) => setFx(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Gebühr USD" hint="Was die Plattform einbehalten hat (Preply-Provision o. Ä.).">
          <input type="number" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Kundenland" hint="Zweibuchstaben-Code, z. B. DE. Optional.">
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} maxLength={2} />
        </Field>
      </div>
      <Field label="Notiz">
        <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
          {busy ? "Speichere …" : "Buchung anlegen"}
        </button>
        <span className="text-xs text-cream-dim">
          Brutto <Money value={grossUsd} /> · Steuer <Money value={taxUsd} /> · Netto{" "}
          <Money value={round2(grossUsd - taxUsd)} bold />
        </span>
      </div>
      {error && <Note tone="warn">{error}</Note>}
    </div>
  );
}
