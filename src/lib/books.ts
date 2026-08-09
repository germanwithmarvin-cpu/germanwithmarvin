// Buchhaltung — German with Marvin LLC.
//
// Diese Datei ist das Regelwerk: Kategorien, Fristen, Erklaertexte und alle
// Rechenwege. Sie laeuft im Browser UND im Server-Route-Handler, importiert
// deshalb bewusst weder Supabase noch Stripe.
//
// Grundgedanke der Buchfuehrung (aus der bisherigen Excel-Datei uebernommen):
//   1. Brutto buchen, nicht die Auszahlung. Der volle Kundenpreis ist Umsatz,
//      die Stripe-Gebuehr ist Aufwand.
//   2. Steuer ist kein Erloes. Die von Stripe einbehaltene VAT/Sales Tax ist
//      ein durchlaufender Posten und steht in einer eigenen Spalte.
//   3. Keine Vermischung. Ausschliesslich Geschaeftskonto.

// ---- Kategorien -------------------------------------------------------------

// Die ersten beiden Eintraege entsprechen dem heutigen Produkt (ein
// All-Access-Abo, regulaer und rabattiert). Die Stufen A1–B2 stammen aus der
// bisherigen Excel-Datei und bleiben stehen, damit alte Buchungen und die
// Sicht des CPA unveraendert bleiben. Eigene Kategorien kommen ueber die
// Stammdaten dazu.
export const REVENUE_CATEGORIES = [
  "App-Abo",
  "App-Abo (rabattiert)",
  "1:1 Tutoring",
  "Mini-Book PDF",
  "Abo A1",
  "Abo A2",
  "Abo B1",
  "Abo B2",
  "Sonstiges",
] as const;

export const EXPENSE_CATEGORIES = [
  "Fremdleistung Lehrer",
  "Fremdleistung Sales-Partner",
  "Werbung (Meta Ads)",
  "Werbung (Google Ads)",
  "Software & Tools",
  "Hosting & Domain",
  "Bankgebuehren",
  "Compliance & Beratung",
  "Registered Agent & State Fees",
  "Buero & Ausstattung",
  "Sonstiges",
] as const;

// Bei diesen Kategorien fragt das Tool nach dem W-8BEN — es sind Zahlungen an
// auslaendische Dienstleister.
export const W8BEN_CATEGORIES: readonly string[] = [
  "Fremdleistung Lehrer",
  "Fremdleistung Sales-Partner",
];

export const REVENUE_KINDS = [
  "Verkauf",
  "Erstattung",
  "Chargeback",
  "Stripe-Gebuehr",
  "Sonstiges",
] as const;

export const OWNER_KINDS = [
  "Einlage (Owner Contribution)",
  "Entnahme (Owner Draw)",
  "Darlehen an LLC",
  "Darlehensrueckzahlung an Owner",
  "Sonstige Transaktion mit Owner",
] as const;

export type RevenueKind = (typeof REVENUE_KINDS)[number];
export type OwnerKind = (typeof OWNER_KINDS)[number];

// Was gehoert in welche Owner-Zeile? Wird im Tool direkt neben der Auswahl
// angezeigt und landet spaeter als Erlaeuterung auf dem 5472-Blatt.
export const OWNER_KIND_HELP: Record<string, string> = {
  "Einlage (Owner Contribution)":
    "Geld, das du in die LLC einlegst. Gehoert auf Form 5472, Part IV/V.",
  "Entnahme (Owner Draw)":
    "Auszahlungen an dich persoenlich. Gehoert auf Form 5472, Part IV/V.",
  "Darlehen an LLC":
    "Darlehen von dir an die LLC — eigener Meldeposten, nicht mit einer Einlage vermischen.",
  "Darlehensrueckzahlung an Owner":
    "Rueckzahlung eines Gesellschafterdarlehens an dich.",
  "Sonstige Transaktion mit Owner":
    "Alles Weitere zwischen dir und der LLC. Im Zweifel dem CPA vorlegen.",
};

export const CATEGORY_HELP: Record<string, string> = {
  "Fremdleistung Lehrer":
    "Honorare an unterrichtende Lehrer. W-8BEN vor der ersten Zahlung einholen.",
  "Fremdleistung Sales-Partner":
    "Provisionen an Vertriebspartner und Influencer. Ebenfalls W-8BEN-pflichtig.",
  "Werbung (Meta Ads)": "Anzeigenbudget und Gebuehren bei Meta.",
  "Werbung (Google Ads)": "Anzeigenbudget und Gebuehren bei Google Ads.",
  "Software & Tools": "Laufende Abos: Skool, Vercel, Supabase, Claude, Design-Tools.",
  "Hosting & Domain": "Domains, Hosting, Mailversand.",
  Bankgebuehren: "Kontofuehrung, Ueberweisungs- und Wechselkursgebuehren der Bank.",
  "Compliance & Beratung": "CPA, Steuerberatung, Rechtsberatung, Formularservice.",
  "Registered Agent & State Fees": "Registered Agent und Wyoming Annual Report / License Tax.",
  "Buero & Ausstattung": "Hardware, Mikrofon, Kamera, Software-Lizenzen fuer die Aufnahme.",
  Sonstiges: "Alles, was in keine andere Kategorie passt — bitte im Text genau beschreiben.",
};

// ---- Compliance-Kalender ----------------------------------------------------
// Stand August 2026. Fristen und Regeln aendern sich — einmal jaehrlich pruefen.

export type Deadline = {
  duty: string;
  due: string;
  level: "IRS" | "Wyoming" | "FinCEN" | "Vietnam";
  /** Monat der Faelligkeit (1..12) fuer die Sortierung; null = laufend/variabel. */
  month: number | null;
  day: number | null;
  note: string;
};

export const DEADLINES: Deadline[] = [
  {
    duty: "Form 5472 + Pro-forma 1120",
    due: "15. April",
    level: "IRS",
    month: 4,
    day: 15,
    note: "Verlaengerung auf 15. Oktober per Form 7004. Strafe bei Versaeumnis: 25.000 USD.",
  },
  {
    duty: "Aufzeichnungspflicht",
    due: "laufend",
    level: "IRS",
    month: null,
    day: null,
    note: "Reg. 1.6038A-3. Buecher und Belege, die die gemeldeten Transaktionen belegen. Eigenstaendig bussgeldbewehrt.",
  },
  {
    duty: "Form 1040-NR",
    due: "15. April",
    level: "IRS",
    month: 4,
    day: 15,
    note: "Nur bei effectively connected income. Bei Leistungserbringung ausschliesslich in Vietnam voraussichtlich nicht einschlaegig — einmal vom CPA bestaetigen lassen.",
  },
  {
    duty: "Wyoming Annual Report",
    due: "Jahrestag der Gruendung",
    level: "Wyoming",
    month: null,
    day: null,
    note: "License Tax mindestens 60 USD. Der Gruendungsmonat steht in den Stammdaten.",
  },
  {
    duty: "Registered Agent",
    due: "laufend",
    level: "Wyoming",
    month: null,
    day: null,
    note: "Muss durchgehend bestellt sein, sonst droht Administrative Dissolution.",
  },
  {
    duty: "BOI-Meldung an FinCEN",
    due: "entfaellt",
    level: "FinCEN",
    month: null,
    day: null,
    note: "Seit der Interim Final Rule vom 26.03.2025 sind in den USA gegruendete Entitaeten befreit. Regel ist noch nicht final — jaehrlich pruefen.",
  },
  {
    duty: "W-8BEN von Contractors",
    due: "vor erster Zahlung",
    level: "IRS",
    month: null,
    day: null,
    note: "Von jedem auslaendischen Lehrer und Sales-Partner einholen und ablegen.",
  },
  {
    duty: "Vietnam: persoenliche Steuer",
    due: "je nach Status",
    level: "Vietnam",
    month: null,
    day: null,
    note: "Ab 183 Tagen Ansaessigkeit greift die Besteuerung des Welteinkommens. Der Gewinn der disregarded entity ist unmittelbar dein Einkommen. Hier liegt deine materielle Steuerlast.",
  },
];

// ---- Zeilentypen ------------------------------------------------------------

export type RevenueRow = {
  id: string;
  booked_on: string;
  kind: string;
  source: string;
  stripe_id: string | null;
  stripe_ref: string;
  product: string;
  product_raw: string;
  customer_country: string;
  currency: string;
  gross_original: number;
  tax_original: number;
  fx_rate: number;
  gross_usd: number;
  tax_usd: number;
  fee_usd: number;
  note: string;
};

export type ExpenseRow = {
  id: string;
  booked_on: string;
  category: string;
  description: string;
  payee: string;
  currency: string;
  amount_original: number;
  fx_rate: number;
  amount_usd: number;
  receipt: boolean;
  w8ben: string;
  note: string;
};

export type OwnerRow = {
  id: string;
  booked_on: string;
  kind: string;
  description: string;
  currency: string;
  amount_original: number;
  fx_rate: number;
  amount_usd: number;
  receipt: boolean;
  note: string;
};

export type BookSettings = {
  company_name: string;
  state: string;
  tax_classification: string;
  ein: string;
  formation_month: number | null;
  registered_agent: string;
  tax_year: number;
  currency: string;
  owner_name: string;
  owner_residence: string;
  extra_revenue_categories: string[];
  extra_expense_categories: string[];
};

export type Period = {
  period: string;
  synced_at: string | null;
  closed_at: string | null;
  expenses_done: boolean;
  owner_done: boolean;
  note: string;
};

// ---- Rechnen ----------------------------------------------------------------

/** Nettoerloes = Brutto minus durchlaufende Steuer. Die Steuer war nie deins. */
export function netUsd(r: Pick<RevenueRow, "gross_usd" | "tax_usd">): number {
  return round2(r.gross_usd - r.tax_usd);
}

/** Was am Ende auf dem Konto landet: Nettoerloes minus Stripe-Gebuehr. */
export function payoutUsd(r: Pick<RevenueRow, "gross_usd" | "tax_usd" | "fee_usd">): number {
  return round2(r.gross_usd - r.tax_usd - r.fee_usd);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type MonthTotals = {
  /** Erloese je Umsatzkategorie (netto, ohne durchlaufende Steuer). */
  revenueByCategory: Record<string, number>;
  revenueTotal: number;
  /** Ausgaben je Kategorie; "Stripe-Gebuehren" kommt aus dem Umsatzjournal. */
  expenseByCategory: Record<string, number>;
  stripeFees: number;
  expenseTotal: number;
  profit: number;
  passThroughTax: number;
  ownerIn: number;
  ownerOut: number;
};

export function totalsFor(
  revenue: RevenueRow[],
  expenses: ExpenseRow[],
  owner: OwnerRow[],
): MonthTotals {
  const revenueByCategory: Record<string, number> = {};
  let stripeFees = 0;
  let passThroughTax = 0;

  for (const r of revenue) {
    // Gebuehren fallen auf jeder Zeile an — auch auf Erstattungen und auf
    // reinen Gebuehrenzeilen (Stripe Billing), die keinen Erloes tragen.
    stripeFees += r.fee_usd;
    passThroughTax += r.tax_usd;
    if (r.kind === "Stripe-Gebuehr") continue;
    const key = r.product || "Nicht zugeordnet";
    revenueByCategory[key] = round2((revenueByCategory[key] ?? 0) + netUsd(r));
  }

  const expenseByCategory: Record<string, number> = {};
  for (const e of expenses) {
    expenseByCategory[e.category] = round2((expenseByCategory[e.category] ?? 0) + e.amount_usd);
  }

  const revenueTotal = round2(Object.values(revenueByCategory).reduce((a, b) => a + b, 0));
  stripeFees = round2(stripeFees);
  const expenseTotal = round2(Object.values(expenseByCategory).reduce((a, b) => a + b, 0) + stripeFees);

  let ownerIn = 0;
  let ownerOut = 0;
  for (const o of owner) {
    if (o.kind === "Einlage (Owner Contribution)" || o.kind === "Darlehen an LLC") ownerIn += o.amount_usd;
    else ownerOut += o.amount_usd;
  }

  return {
    revenueByCategory,
    revenueTotal,
    expenseByCategory,
    stripeFees,
    expenseTotal,
    profit: round2(revenueTotal - expenseTotal),
    passThroughTax: round2(passThroughTax),
    ownerIn: round2(ownerIn),
    ownerOut: round2(ownerOut),
  };
}

/** Summen je Form-5472-Kategorie fuer ein Steuerjahr. */
export function form5472Totals(owner: OwnerRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const kind of OWNER_KINDS) out[kind] = 0;
  for (const o of owner) out[o.kind] = round2((out[o.kind] ?? 0) + o.amount_usd);
  return out;
}

// ---- Perioden ---------------------------------------------------------------

export const MONTH_NAMES = [
  "Januar", "Februar", "Maerz", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** "2026-08" */
export function periodKey(year: number, month1: number): string {
  return `${year}-${String(month1).padStart(2, "0")}`;
}

export function parsePeriod(period: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function periodLabel(period: string): string {
  const p = parsePeriod(period);
  return p ? `${MONTH_NAMES[p.month - 1]} ${p.year}` : period;
}

/** Erster und letzter Tag des Monats als ISO-Datum (YYYY-MM-DD, UTC-basiert). */
export function periodRange(period: string): { from: string; to: string } {
  const p = parsePeriod(period);
  if (!p) throw new Error(`Ungueltige Periode: ${period}`);
  const last = new Date(Date.UTC(p.year, p.month, 0)).getUTCDate();
  return {
    from: `${period}-01`,
    to: `${period}-${String(last).padStart(2, "0")}`,
  };
}

export function currentPeriod(now = new Date()): string {
  return periodKey(now.getFullYear(), now.getMonth() + 1);
}

/** Der zuletzt vollstaendig vergangene Monat — den will man normalerweise buchen. */
export function previousPeriod(period: string): string {
  const p = parsePeriod(period);
  if (!p) return period;
  return p.month === 1 ? periodKey(p.year - 1, 12) : periodKey(p.year, p.month - 1);
}

export function nextPeriod(period: string): string {
  const p = parsePeriod(period);
  if (!p) return period;
  return p.month === 12 ? periodKey(p.year + 1, 1) : periodKey(p.year, p.month + 1);
}

// ---- Waehrung ---------------------------------------------------------------

// Stripe rechnet in der kleinsten Einheit. Bei diesen Waehrungen gibt es keine
// Nachkommastellen — 1000 heisst dort 1000, nicht 10,00.
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg",
  "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);
// Und bei diesen drei Nachkommastellen.
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

/** Stripe-Betrag (kleinste Einheit) in einen normalen Betrag umrechnen. */
export function fromStripeAmount(amount: number, currency: string): number {
  const c = currency.toLowerCase();
  if (ZERO_DECIMAL.has(c)) return amount;
  if (THREE_DECIMAL.has(c)) return round2(amount / 1000);
  return round2(amount / 100);
}

export function money(n: number, currency = "USD"): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "";
  const body = abs.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${sign}${symbol}${body}` : `${sign}${body} ${currency}`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
