import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import {
  DEADLINES,
  EXPENSE_CATEGORIES,
  MONTH_NAMES,
  OWNER_KINDS,
  OWNER_KIND_HELP,
  REVENUE_CATEGORIES,
  netUsd,
  payoutUsd,
  round2,
  type ExpenseRow,
  type OwnerRow,
  type RevenueRow,
} from "@/lib/books";

// Export eines Steuerjahres als .xlsx — dieselben acht Blaetter wie die
// bisherige Datei, damit der CPA nichts Neues lernen muss.
//
// Bewusst ohne Formeln: es stehen fertige Werte drin. Eine Datei mit Formeln
// ist nur in Excel etwas wert; Werte kann jedes Programm einlesen.

export const runtime = "nodejs";
export const maxDuration = 60;

const MONEY = "#,##0.00";
const DATE_FMT = "dd.mm.yyyy";

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

type Sheet = ExcelJS.Worksheet;

function title(ws: Sheet, text: string, sub: string) {
  ws.getCell("A1").value = text;
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A2").value = sub;
  ws.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF666666" } };
}

function header(ws: Sheet, row: number, labels: string[]) {
  const r = ws.getRow(row);
  labels.forEach((label, i) => {
    const c = r.getCell(i + 1);
    c.value = label;
    c.font = { bold: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3E6C8" } };
    c.border = { bottom: { style: "thin", color: { argb: "FFBBBBBB" } } };
    c.alignment = { vertical: "middle", wrapText: true };
  });
  r.commit();
  ws.views = [{ state: "frozen", ySplit: row }];
}

function widths(ws: Sheet, cols: number[]) {
  cols.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

export async function GET(req: Request) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return json({ error: "Nicht angemeldet." }, 401);
  const rpc = await db.rpc("is_teacher");
  let isTeacher = rpc.data === true;
  if (!isTeacher) {
    const { data: profile } = await db.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(profile?.is_teacher);
  }
  if (!isTeacher) return json({ error: "Kein Zugriff." }, 403);

  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year")) || new Date().getFullYear();
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const [settingsRes, revRes, expRes, ownRes] = await Promise.all([
    db.from("book_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("book_revenue").select("*").gte("booked_on", from).lte("booked_on", to).order("booked_on"),
    db.from("book_expenses").select("*").gte("booked_on", from).lte("booked_on", to).order("booked_on"),
    db.from("book_owner").select("*").gte("booked_on", from).lte("booked_on", to).order("booked_on"),
  ]);

  const s = settingsRes.data ?? {};
  const revenue = (revRes.data ?? []) as unknown as RevenueRow[];
  const expenses = (expRes.data ?? []) as unknown as ExpenseRow[];
  const owner = (ownRes.data ?? []) as unknown as OwnerRow[];

  const revenueCats = [...REVENUE_CATEGORIES, ...(s.extra_revenue_categories ?? [])];
  const expenseCats = [...EXPENSE_CATEGORIES, ...(s.extra_expense_categories ?? [])];

  const wb = new ExcelJS.Workbook();
  wb.creator = String(s.company_name ?? "German with Marvin LLC");
  wb.created = new Date();

  // ---- Anleitung ------------------------------------------------------------
  const info = wb.addWorksheet("Anleitung");
  widths(info, [4, 34, 110]);
  title(
    info,
    `Buchhaltung  ·  ${s.company_name ?? "German with Marvin LLC"}`,
    `${s.state ?? "Wyoming"} Single-Member LLC  ·  ${s.tax_classification ?? "foreign-owned disregarded entity"}  ·  Buchfuehrungswaehrung ${s.currency ?? "USD"}  ·  Steuerjahr ${year}`,
  );
  const infoLines: [string, string][] = [
    ["Herkunft dieser Datei", "Export aus dem Buchhaltungs-Tool unter /buchhaltung. Aenderungen bitte dort vornehmen und neu exportieren — diese Datei wird nicht zurueckgelesen."],
    ["Werte statt Formeln", "Alle Summen sind ausgerechnet. Dadurch laesst sich die Datei in jedes Buchhaltungsprogramm einlesen, nicht nur in Excel."],
    ["", ""],
    ["Die drei Journale", ""],
    ["Umsatz", "Jede Stripe-Transaktion einzeln. Erstattungen und Chargebacks stehen als eigene Zeile mit negativem Betrag."],
    ["Ausgaben", "Alle Betriebsausgaben ausser Stripe-Gebuehren — die stehen im Umsatzjournal und wuerden sonst doppelt zaehlen."],
    ["Owner", "Geld zwischen Marvin persoenlich und der LLC. Grundlage der Form-5472-Meldung."],
    ["", ""],
    ["Drei Regeln", ""],
    ["1 · Brutto buchen", "Der volle Kundenpreis ist Umsatz, die Stripe-Gebuehr ist Aufwand — nicht die Auszahlung buchen."],
    ["2 · Steuer ist kein Erloes", "Von Stripe einbehaltene VAT/Sales Tax ist ein durchlaufender Posten in eigener Spalte."],
    ["3 · Keine Vermischung", "Ausschliesslich Geschaeftskonto. Private Ausgaben ueber das LLC-Konto machen die 5472-Meldung zum Ratespiel."],
    ["", ""],
    ["Aufbewahrung", "Treas. Reg. 1.6038A-3 verlangt Aufzeichnungen, die die gemeldeten Transaktionen belegen — eigenstaendig bussgeldbewehrt. Praktisch: 7 Jahre, Belege als PDF je Geschaeftsjahr."],
    ["W-8BEN", "Von jedem auslaendischen Contractor einholen und ablegen. Dokumentiert, dass keine US-Quellensteuer anfaellt."],
    ["", ""],
    ["Haftungsausschluss", "Arbeitswerkzeug, keine Steuerberatung. Ob die Einkuenfte 'effectively connected income' darstellen, gehoert einmal schriftlich von einem US-CPA bestaetigt."],
  ];
  infoLines.forEach(([k, v], i) => {
    const row = info.getRow(4 + i);
    row.getCell(2).value = k;
    row.getCell(2).font = { bold: true };
    row.getCell(3).value = v;
    row.getCell(3).alignment = { wrapText: true, vertical: "top" };
  });

  // ---- Einstellungen --------------------------------------------------------
  const set = wb.addWorksheet("Einstellungen");
  widths(set, [4, 38, 40, 6, 34]);
  title(set, "Stammdaten & Kategorien", "Stand des Exports. Gepflegt wird im Tool unter /buchhaltung → Stammdaten.");
  const stamm: [string, unknown][] = [
    ["Firmenname", s.company_name ?? ""],
    ["Gruendungsstaat", s.state ?? ""],
    ["Steuerliche Einordnung", s.tax_classification ?? ""],
    ["EIN", s.ein || "<nicht hinterlegt>"],
    ["Gruendungsmonat (Wyoming Annual Report)", s.formation_month ? MONTH_NAMES[s.formation_month - 1] : "<nicht hinterlegt>"],
    ["Registered Agent", s.registered_agent || "<nicht hinterlegt>"],
    ["Steuerjahr", year],
    ["Buchfuehrungswaehrung", s.currency ?? "USD"],
    ["Owner", s.owner_name ?? ""],
    ["Steuerliche Ansaessigkeit Owner", s.owner_residence ?? ""],
  ];
  stamm.forEach(([k, v], i) => {
    const r = set.getRow(5 + i);
    r.getCell(2).value = k;
    r.getCell(3).value = v as ExcelJS.CellValue;
  });
  set.getCell("E4").value = "Produktkategorien (Umsatz)";
  set.getCell("E4").font = { bold: true };
  revenueCats.forEach((c, i) => { set.getCell(5 + i, 5).value = c; });
  const expStart = 6 + revenueCats.length;
  set.getCell(expStart, 5).value = "Ausgabenkategorien";
  set.getCell(expStart, 5).font = { bold: true };
  expenseCats.forEach((c, i) => { set.getCell(expStart + 1 + i, 5).value = c; });
  set.getCell(expStart + expenseCats.length + 2, 5).value =
    "Stripe-Gebuehren stehen bewusst nicht in dieser Liste — sie werden im Umsatzjournal erfasst.";

  // ---- Umsatz ---------------------------------------------------------------
  const rev = wb.addWorksheet("Umsatz");
  widths(rev, [12, 14, 26, 20, 12, 10, 14, 14, 12, 13, 13, 13, 14, 13, 34]);
  title(rev, "Umsatzjournal", "Eine Zeile je Transaktion. Erstattungen und Chargebacks mit negativem Betrag.");
  header(rev, 4, [
    "Datum", "Typ", "Stripe-ID", "Produkt", "Kundenland", "Waehrung",
    "Brutto (Original)", "davon Steuer (Original)", "Kurs zu USD",
    "Brutto USD", "Steuer USD (durchlaufend)", "Nettoerloes USD",
    "Stripe-Gebuehren USD", "Auszahlung USD", "Notiz",
  ]);
  revenue.forEach((r, i) => {
    const row = rev.getRow(5 + i);
    row.values = [
      new Date(r.booked_on), r.kind, r.stripe_id ?? "", r.product, r.customer_country, r.currency,
      Number(r.gross_original), Number(r.tax_original), Number(r.fx_rate),
      Number(r.gross_usd), Number(r.tax_usd), netUsd({ gross_usd: Number(r.gross_usd), tax_usd: Number(r.tax_usd) }),
      Number(r.fee_usd),
      payoutUsd({ gross_usd: Number(r.gross_usd), tax_usd: Number(r.tax_usd), fee_usd: Number(r.fee_usd) }),
      r.note,
    ];
    row.getCell(1).numFmt = DATE_FMT;
    [7, 8, 10, 11, 12, 13, 14].forEach((c) => { row.getCell(c).numFmt = MONEY; });
    row.getCell(9).numFmt = "0.0000";
  });

  // ---- Ausgaben -------------------------------------------------------------
  const exp = wb.addWorksheet("Ausgaben");
  widths(exp, [12, 30, 36, 22, 10, 15, 12, 13, 12, 13, 34]);
  title(exp, "Ausgabenjournal", "Alle Betriebsausgaben ausser Stripe-Gebuehren.");
  header(exp, 4, [
    "Datum", "Kategorie", "Beschreibung", "Zahlungsempfaenger", "Waehrung",
    "Betrag (Original)", "Kurs zu USD", "Betrag USD", "Beleg abgelegt", "W-8BEN liegt vor", "Notiz",
  ]);
  expenses.forEach((e, i) => {
    const row = exp.getRow(5 + i);
    row.values = [
      new Date(e.booked_on), e.category, e.description, e.payee, e.currency,
      Number(e.amount_original), Number(e.fx_rate), Number(e.amount_usd),
      e.receipt ? "Ja" : "Nein", e.w8ben, e.note,
    ];
    row.getCell(1).numFmt = DATE_FMT;
    [6, 8].forEach((c) => { row.getCell(c).numFmt = MONEY; });
    row.getCell(7).numFmt = "0.0000";
  });

  // ---- Owner ----------------------------------------------------------------
  const own = wb.addWorksheet("Owner");
  widths(own, [12, 34, 40, 10, 15, 12, 13, 14, 34]);
  title(own, "Owner-Konto  ·  Grundlage der Form-5472-Meldung", "Jede Geldbewegung zwischen Owner und LLC. Kundenumsaetze gehoeren nicht hierher.");
  header(own, 4, [
    "Datum", "Typ", "Beschreibung", "Waehrung", "Betrag (Original)",
    "Kurs zu USD", "Betrag USD", "Beleg abgelegt", "Notiz",
  ]);
  owner.forEach((o, i) => {
    const row = own.getRow(5 + i);
    row.values = [
      new Date(o.booked_on), o.kind, o.description, o.currency,
      Number(o.amount_original), Number(o.fx_rate), Number(o.amount_usd),
      o.receipt ? "Ja" : "Nein", o.note,
    ];
    row.getCell(1).numFmt = DATE_FMT;
    [5, 7].forEach((c) => { row.getCell(c).numFmt = MONEY; });
    row.getCell(6).numFmt = "0.0000";
  });

  // ---- GuV ------------------------------------------------------------------
  const monthOf = (iso: string) => Number(iso.slice(5, 7)) - 1;
  const zero = () => Array.from({ length: 12 }, () => 0);

  const revByCat = new Map<string, number[]>();
  const feesPerMonth = zero();
  const taxPerMonth = zero();
  for (const r of revenue) {
    const m = monthOf(r.booked_on);
    feesPerMonth[m] = round2(feesPerMonth[m] + Number(r.fee_usd));
    taxPerMonth[m] = round2(taxPerMonth[m] + Number(r.tax_usd));
    if (r.kind === "Stripe-Gebuehr") continue;
    const key = r.product || "Nicht zugeordnet";
    if (!revByCat.has(key)) revByCat.set(key, zero());
    const arr = revByCat.get(key)!;
    arr[m] = round2(arr[m] + netUsd({ gross_usd: Number(r.gross_usd), tax_usd: Number(r.tax_usd) }));
  }
  const expByCat = new Map<string, number[]>();
  for (const e of expenses) {
    const m = monthOf(e.booked_on);
    if (!expByCat.has(e.category)) expByCat.set(e.category, zero());
    const arr = expByCat.get(e.category)!;
    arr[m] = round2(arr[m] + Number(e.amount_usd));
  }
  const ownerIn = zero();
  const ownerOut = zero();
  for (const o of owner) {
    const m = monthOf(o.booked_on);
    if (o.kind === "Einlage (Owner Contribution)" || o.kind === "Darlehen an LLC") ownerIn[m] = round2(ownerIn[m] + Number(o.amount_usd));
    else ownerOut[m] = round2(ownerOut[m] + Number(o.amount_usd));
  }

  const guv = wb.addWorksheet("GuV");
  widths(guv, [4, 38, ...Array.from({ length: 12 }, () => 12), 14]);
  title(guv, "Gewinn- und Verlustrechnung", `Steuerjahr ${year}. Gerechnet aus den drei Journalen.`);
  const guvHead = ["", "Position", ...MONTH_NAMES.map((m) => m.slice(0, 3)), "Gesamt"];
  header(guv, 5, guvHead);

  let line = 6;
  const writeLine = (label: string, months: number[], opts: { bold?: boolean } = {}) => {
    const row = guv.getRow(line++);
    row.getCell(2).value = label;
    if (opts.bold) row.getCell(2).font = { bold: true };
    let sum = 0;
    months.forEach((v, i) => {
      const c = row.getCell(3 + i);
      c.value = v;
      c.numFmt = MONEY;
      if (opts.bold) c.font = { bold: true };
      sum = round2(sum + v);
    });
    const total = row.getCell(15);
    total.value = sum;
    total.numFmt = MONEY;
    total.font = { bold: true };
    return sum;
  };
  const section = (label: string) => {
    const row = guv.getRow(line++);
    row.getCell(2).value = label;
    row.getCell(2).font = { bold: true, color: { argb: "FF8A3030" } };
  };

  section("ERLOESE  (netto, ohne durchlaufende Steuer)");
  const revTotals = zero();
  for (const cat of [...revenueCats, ...[...revByCat.keys()].filter((k) => !revenueCats.includes(k))]) {
    const months = revByCat.get(cat);
    if (!months) continue;
    writeLine(cat, months);
    months.forEach((v, i) => { revTotals[i] = round2(revTotals[i] + v); });
  }
  writeLine("Summe Erloese", revTotals, { bold: true });

  line++;
  section("AUSGABEN");
  const expTotals = [...feesPerMonth];
  writeLine("Stripe-Gebuehren", feesPerMonth);
  for (const cat of [...expenseCats, ...[...expByCat.keys()].filter((k) => !expenseCats.includes(k))]) {
    const months = expByCat.get(cat);
    if (!months) continue;
    writeLine(cat, months);
    months.forEach((v, i) => { expTotals[i] = round2(expTotals[i] + v); });
  }
  writeLine("Summe Ausgaben", expTotals, { bold: true });

  line++;
  writeLine("GEWINN VOR STEUERN", revTotals.map((v, i) => round2(v - expTotals[i])), { bold: true });

  line += 2;
  section("NACHRICHTLICH  (kein Bestandteil der GuV)");
  writeLine("Durchlaufende Steuer (von Stripe abgefuehrt)", taxPerMonth);
  writeLine("Owner-Einlagen", ownerIn);
  writeLine("Owner-Entnahmen", ownerOut);

  // ---- Form 5472 ------------------------------------------------------------
  const f = wb.addWorksheet("Form_5472");
  widths(f, [4, 38, 16, 92]);
  title(f, "Form 5472  ·  Vorbereitung", "Zusammenfassung der reportable transactions zwischen Owner und LLC. Basis: Blatt 'Owner'.");
  header(f, 5, ["", "Kategorie", "Betrag USD", "Erlaeuterung"]);
  let fRow = 6;
  let f5472Sum = 0;
  for (const kind of OWNER_KINDS) {
    const amount = round2(owner.filter((o) => o.kind === kind).reduce((a, o) => a + Number(o.amount_usd), 0));
    f5472Sum = round2(f5472Sum + amount);
    const row = f.getRow(fRow++);
    row.getCell(2).value = kind;
    row.getCell(3).value = amount;
    row.getCell(3).numFmt = MONEY;
    row.getCell(4).value = OWNER_KIND_HELP[kind] ?? "";
    row.getCell(4).alignment = { wrapText: true, vertical: "top" };
  }
  const sumRow = f.getRow(fRow++);
  sumRow.getCell(2).value = "Summe reportable transactions";
  sumRow.getCell(2).font = { bold: true };
  sumRow.getCell(3).value = f5472Sum;
  sumRow.getCell(3).numFmt = MONEY;
  sumRow.getCell(3).font = { bold: true };

  fRow += 1;
  f.getCell(fRow++, 2).value = "Was NICHT auf das 5472 gehoert";
  f.getCell(fRow, 2).value =
    "Kursverkaeufe an Endkunden sind keine reportable transactions. Das Formular erfasst ausschliesslich Vorgaenge zwischen der LLC und einer related party — also dem Owner. Umsaetze, Stripe-Gebuehren und Betriebsausgaben bleiben aussen vor.";
  f.getCell(fRow, 2).alignment = { wrapText: true, vertical: "top" };
  f.mergeCells(fRow, 2, fRow, 4);
  fRow += 3;
  f.getCell(fRow++, 2).value = "Checkliste zur Abgabe";
  [
    "Pro-forma Form 1120 mit Name, Adresse und EIN ausgefuellt",
    "Form 5472 mit den obenstehenden Betraegen ausgefuellt",
    "Frist 15. April beachtet — oder Form 7004 fuer Verlaengerung bis 15. Oktober eingereicht",
    "Einreichung per Post oder Fax an die dafuer vorgesehene IRS-Adresse",
    "Kopie und Sendenachweis abgelegt",
    "Belege zu allen Owner-Transaktionen archiviert (Reg. 1.6038A-3)",
  ].forEach((t) => { f.getCell(fRow++, 3).value = `☐  ${t}`; });
  fRow += 1;
  f.getCell(fRow, 2).value = "Versaeumnis der 5472-Abgabe: 25.000 USD je Jahr. Die Aufzeichnungspflicht ist eigenstaendig sanktioniert.";
  f.getCell(fRow, 2).font = { bold: true, color: { argb: "FF8A3030" } };

  // ---- Kalender -------------------------------------------------------------
  const cal = wb.addWorksheet("Kalender");
  widths(cal, [4, 34, 26, 12, 96]);
  title(cal, "Compliance-Kalender", "Stand August 2026. Fristen und Regeln aendern sich — einmal jaehrlich pruefen.");
  header(cal, 4, ["", "Pflicht", "Frist", "Ebene", "Anmerkung"]);
  DEADLINES.forEach((d, i) => {
    const row = cal.getRow(5 + i);
    row.getCell(2).value = d.duty;
    row.getCell(3).value =
      d.duty === "Wyoming Annual Report" && s.formation_month
        ? `${MONTH_NAMES[s.formation_month - 1]} (Jahrestag)`
        : d.due;
    row.getCell(4).value = d.level;
    row.getCell(5).value = d.note;
    row.getCell(5).alignment = { wrapText: true, vertical: "top" };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const name = `Buchhaltung_${String(s.company_name ?? "LLC").replace(/[^A-Za-z0-9]+/g, "_")}_${year}.xlsx`;
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
