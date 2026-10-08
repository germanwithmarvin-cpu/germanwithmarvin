import { createHmac } from "crypto";

// Signierter 1-Klick-Abmeldelink für Werbe-Mails (ohne Login). Der Token ist ein
// HMAC der user_id mit einem Server-Secret, damit niemand fremde Konten abmelden
// kann. CRON_SECRET ist als Secret ohnehin gesetzt; Fallback auf den Service-Key.
function secret(): string {
  return process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-unsub-secret";
}

export function unsubToken(userId: string): string {
  return createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 32);
}

export function unsubValid(userId: string, token: string): boolean {
  const expected = unsubToken(userId);
  // Längengleich → einfacher, zeitarmer Vergleich reicht hier (Token ist fix lang).
  return token.length === expected.length && token === expected;
}

export function unsubUrl(baseUrl: string, userId: string): string {
  return `${baseUrl}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubToken(userId)}`;
}
