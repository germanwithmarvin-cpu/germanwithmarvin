import { createClient } from "@supabase/supabase-js";

// Server-seitige Google-Kalender-Anbindung (nur in API-Routen benutzen).
// Nötige Env-Vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "openid",
  "email",
].join(" ");

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL = "https://www.googleapis.com/calendar/v3";

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function authUrl(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

// Autorisierungs-Code → Tokens (inkl. refresh_token) und speichern.
export async function exchangeCode(code: string, redirectUri: string): Promise<{ email?: string; error?: string }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.refresh_token) return { error: json.error_description || json.error || "No refresh token (revoke access in your Google account and try again)." };

  let email: string | undefined;
  try {
    const info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${json.access_token}` } });
    email = (await info.json()).email;
  } catch { /* egal */ }

  await admin().from("teacher_google").upsert({ id: 1, refresh_token: json.refresh_token, connected_email: email ?? null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  return { email };
}

export async function getConnection(): Promise<{ connected: boolean; email: string | null }> {
  const { data } = await admin().from("teacher_google").select("connected_email, refresh_token").eq("id", 1).maybeSingle();
  return { connected: Boolean(data?.refresh_token), email: data?.connected_email ?? null };
}

export async function disconnect(): Promise<void> {
  await admin().from("teacher_google").upsert({ id: 1, refresh_token: null, connected_email: null, updated_at: new Date().toISOString() }, { onConflict: "id" });
}

// Frisches Access-Token aus dem gespeicherten Refresh-Token.
async function accessToken(): Promise<string | null> {
  const { data } = await admin().from("teacher_google").select("refresh_token").eq("id", 1).maybeSingle();
  if (!data?.refresh_token) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  return res.ok ? (json.access_token as string) : null;
}

// Belegte Zeiten aus dem Google-Kalender (leer, wenn nicht verbunden).
// Liest die Termine direkt (calendar.events-Scope) statt der freeBusy-API,
// die einen eigenen Scope braucht. Termine, die als „frei"/abgesagt markiert
// sind, werden übersprungen; Ganztags-Termine zählen als belegt.
export async function busyIntervals(fromISO: string, toISO: string): Promise<{ start: string; end: string }[]> {
  const token = await accessToken();
  if (!token) return [];
  const url = new URL(`${CAL}/calendars/primary/events`);
  url.searchParams.set("timeMin", fromISO);
  url.searchParams.set("timeMax", toISO);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "2500");
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const json = await res.json();
  const out: { start: string; end: string }[] = [];
  for (const e of (json.items as Record<string, unknown>[] | undefined) ?? []) {
    if (e.status === "cancelled" || e.transparency === "transparent") continue;
    const s = e.start as { dateTime?: string; date?: string } | undefined;
    const en = e.end as { dateTime?: string; date?: string } | undefined;
    const start = s?.dateTime ?? (s?.date ? `${s.date}T00:00:00Z` : null);
    const end = en?.dateTime ?? (en?.date ? `${en.date}T00:00:00Z` : null);
    if (start && end) out.push({ start, end });
  }
  return out;
}

// Termin + Meet-Link anlegen. Gibt eventId + meetLink zurück (oder leer).
export async function createEvent(opts: { startISO: string; endISO: string; attendeeEmail?: string | null; timezone: string }): Promise<{ eventId?: string; meetLink?: string }> {
  const token = await accessToken();
  if (!token) return {};
  const res = await fetch(`${CAL}/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: "German lesson (1-on-1)",
      start: { dateTime: opts.startISO, timeZone: opts.timezone },
      end: { dateTime: opts.endISO, timeZone: opts.timezone },
      attendees: opts.attendeeEmail ? [{ email: opts.attendeeEmail }] : undefined,
      conferenceData: { createRequest: { requestId: `gwm-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    }),
  });
  if (!res.ok) return {};
  const json = await res.json();
  return { eventId: json.id, meetLink: json.hangoutLink ?? json.conferenceData?.entryPoints?.find((e: { entryPointType: string; uri: string }) => e.entryPointType === "video")?.uri };
}

export async function deleteEvent(eventId: string): Promise<void> {
  const token = await accessToken();
  if (!token) return;
  await fetch(`${CAL}/calendars/primary/events/${eventId}?sendUpdates=all`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}
