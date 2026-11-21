import { createHmac } from "crypto";

// Signierter 1-Klick-Abmeldelink für Werbe-Mails (ohne Login). Der Token ist ein
// HMAC der user_id mit einem Server-Secret, damit niemand fremde Konten abmelden
// kann. Bevorzugt ein EIGENES UNSUB_SECRET (entkoppelt von CRON_SECRET), damit ein
// Leck des Cron-Secrets keine Abmeldungen fälschen kann. Fällt auf die alten
// Secrets zurück, damit bereits verschickte Abmeldelinks gültig bleiben.
function secrets(): string[] {
  const list: string[] = [];
  if (process.env.UNSUB_SECRET) list.push(process.env.UNSUB_SECRET);
  if (process.env.CRON_SECRET) list.push(process.env.CRON_SECRET);
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) list.push(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!list.length) list.push("dev-unsub-secret");
  return list;
}

function tokenWith(userId: string, key: string): string {
  return createHmac("sha256", key).update(userId).digest("hex").slice(0, 32);
}

export function unsubToken(userId: string): string {
  // Neue Links immer mit dem bevorzugten (ersten) Secret erzeugen.
  return tokenWith(userId, secrets()[0]);
}

export function unsubValid(userId: string, token: string): boolean {
  // Gegen alle bekannten Secrets prüfen → alte Links bleiben nach dem Wechsel gültig.
  return secrets().some((k) => {
    const expected = tokenWith(userId, k);
    // Längengleich → einfacher, zeitarmer Vergleich reicht hier (Token ist fix lang).
    return token.length === expected.length && token === expected;
  });
}

export function unsubUrl(baseUrl: string, userId: string): string {
  return `${baseUrl}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;
}
