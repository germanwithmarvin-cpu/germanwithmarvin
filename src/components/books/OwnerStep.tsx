"use client";

import { useEffect, useState } from "react";
import {
  OWNER_KINDS,
  OWNER_KIND_HELP,
  periodLabel,
  periodRange,
  round2,
  today,
} from "@/lib/books";
import { deleteOwner, insertOwner, patchPeriod, updateOwner } from "@/lib/booksClient";
import type { StepProps } from "./MonthView";
import { Field, Hint, Money, Note, Td, Th, deDate, inputCls } from "./ui";

// Schritt 3: Geld zwischen Marvin persoenlich und der LLC. Das ist der einzige
// Teil der Buchhaltung, den der IRS tatsaechlich zu sehen bekommt — Form 5472
// speist sich vollstaendig aus diesen Zeilen.

export default function OwnerStep({ period, locked, owner, meta, reload }: StepProps) {
  const range = periodRange(period);
  const [date, setDate] = useState(() => {
    const t = today();
    return t >= range.from && t <= range.to ? t : range.to;
  });
  const [kind, setKind] = useState<string>("Entnahme (Owner Draw)");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [fx, setFx] = useState("1");
  const [receipt, setReceipt] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setDate((d) => (d >= range.from && d <= range.to ? d : range.to)); }, [range.from, range.to]);

  const rate = Number(fx) || 1;
  const amountUsd = round2((Number(amount) || 0) * rate);
  const inSum = round2(owner.filter((o) => o.kind === "Einlage (Owner Contribution)" || o.kind === "Darlehen an LLC").reduce((a, o) => a + o.amount_usd, 0));
  const outSum = round2(owner.filter((o) => o.kind !== "Einlage (Owner Contribution)" && o.kind !== "Darlehen an LLC").reduce((a, o) => a + o.amount_usd, 0));

  async function save() {
    if (!amount.trim()) { setError("Bitte einen Betrag eintragen."); return; }
    if (date < range.from || date > range.to) { setError(`Das Datum muss in ${periodLabel(period)} liegen.`); return; }
    setBusy(true); setError(null);
    const err = await insertOwner({
      booked_on: date,
      kind,
      description,
      currency: currency.toUpperCase(),
      amount_original: round2(Number(amount) || 0),
      fx_rate: rate,
      amount_usd: amountUsd,
      receipt,
      note,
    });
    setBusy(false);
    if (err) { setError(err); return; }
    setDescription(""); setAmount(""); setNote(""); setReceipt(false);
    reload();
  }

  return (
    <div className="space-y-4">
      <Note tone="warn">
        Nur Geld zwischen dir persönlich und der LLC. Kundenumsätze gehören <strong>nicht</strong>{" "}
        hierher. Diese Zeilen sind die Grundlage der Form-5472-Meldung — Versäumnis kostet
        25.000 USD je Jahr.
      </Note>

      <div className="space-y-3 rounded-xl border border-gold/25 bg-bordeaux-deep/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Datum">
            <input type="date" value={date} min={range.from} max={range.to} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Typ" hint={OWNER_KIND_HELP[kind]} className="sm:col-span-2">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
              {OWNER_KINDS.map((k) => <option key={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Beschreibung" hint="Kurz und eindeutig — das liest im Zweifel ein Prüfer." className="sm:col-span-2">
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="z. B. Überweisung auf Privatkonto" />
          </Field>
          <Field label="Währung">
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} maxLength={3} />
          </Field>
          <Field label="Betrag (Originalwährung)">
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Kurs zu USD" hint="Bei USD einfach 1.">
            <input type="number" step="0.0001" value={fx} onChange={(e) => setFx(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Notiz">
            <input value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={receipt} onChange={(e) => setReceipt(e.target.checked)} />
          Beleg ist abgelegt (Kontoauszug genügt)
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={save} disabled={busy || locked} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
            {busy ? "Speichere …" : "Bewegung erfassen"}
          </button>
          <span className="text-xs text-cream-dim">= <Money value={amountUsd} bold /></span>
        </div>
        {error && <Note tone="warn">{error}</Note>}
      </div>

      {owner.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-xs">
            <thead className="border-b border-gold/20">
              <tr><Th>Datum</Th><Th>Typ</Th><Th>Beschreibung</Th><Th right>Betrag USD</Th><Th>Beleg</Th><Th></Th></tr>
            </thead>
            <tbody>
              {owner.map((o) => (
                <tr key={o.id} className="border-b border-gold/10">
                  <Td>{deDate(o.booked_on)}</Td>
                  <Td>{o.kind}</Td>
                  <Td>{o.description || "—"}</Td>
                  <Td right><Money value={o.amount_usd} /></Td>
                  <Td>
                    <button
                      disabled={locked}
                      onClick={async () => { await updateOwner(o.id, { receipt: !o.receipt }); reload(); }}
                      className={o.receipt ? "text-gold-bright" : "text-bordeaux underline"}
                    >
                      {o.receipt ? "Ja" : "fehlt"}
                    </button>
                  </Td>
                  <Td right>
                    <button
                      disabled={locked}
                      onClick={async () => { if (confirm("Bewegung löschen?")) { await deleteOwner(o.id); reload(); } }}
                      className="text-cream-dim hover:text-bordeaux disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-cream-dim">
            In die LLC: <Money value={inSum} /> · aus der LLC: <Money value={outSum} />
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gold/15 pt-3">
        <button
          disabled={locked}
          onClick={async () => { await patchPeriod(period, { owner_done: !meta.owner_done }); reload(); }}
          className={`${meta.owner_done ? "btn-outline" : "btn-gold"} px-4 py-2 text-sm disabled:opacity-50`}
        >
          {meta.owner_done ? "Bestätigung zurücknehmen" : "Owner-Bewegungen sind vollständig"}
        </button>
        <Hint>Auch „in diesem Monat gab es keine“ ist eine Aussage, die dokumentiert gehört.</Hint>
      </div>
    </div>
  );
}
