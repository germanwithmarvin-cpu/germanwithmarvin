import { createClient } from "@supabase/supabase-js";

// Server-seitige Google-Kalender-Anbindung (nur in API-Routen benutzen).
// Nötige Env-Vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SUPABASE_SERVICE_ROLE_KEY

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events", // Termine anlegen/löschen
  "https://www.googleapis.com/auth/calendar.readonly", // alle Kalender lesen (belegte Zeiten)
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

// IDs aller Kalender des Kontos (Fallback: nur "primary").
async function calendarIds(token: string): Promise<string[]> {
  try {
    const res = await fetch(`${CAL}/users/me/calendarList?minAccessRole=reader`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return ["primary"];
    const json = await res.json();
    const ids = ((json.items as Record<string, unknown>[]) ?? []).map((c) => c.id as string).filter(Boolean);
    return ids.length ? ids : ["primary"];
  } catch {
    return ["primary"];
  }
}

// Belegte Zeiten aus ALLEN Kalendern des Lehrers (leer, wenn nicht verbunden).
// Nutzt freeBusy über alle Kalender – braucht calendar.readonly.
export async function busyIntervals(fromISO: string, toISO: string): Promise<{ start: string; end: string }[]> {
  const token = await accessToken();
  if (!token) return [];
  const ids = await calendarIds(token);
  const res = await fetch(`${CAL}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: fromISO, timeMax: toISO, items: ids.slice(0, 50).map((id) => ({ id })) }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  const out: { start: string; end: string }[] = [];
  for (const cal of Object.values((json.calendars as Record<string, { busy?: { start: string; end: string }[] }>) ?? {})) {
    for (const b of cal.busy ?? []) out.push({ start: b.start, end: b.end });
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

// Diagnose: welches Konto ist verbunden, funktioniert der Zugriff, welche
// Rechte/Termine sind da. Nur für die Fehlersuche.
export async function diagnose(): Promise<Record<string, unknown>> {
  const { data } = await admin().from("teacher_google").select("refresh_token, connected_email").eq("id", 1).maybeSingle();
  if (!data?.refresh_token) return { connected: false };

  const tokRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) return { connected: true, connectedEmail: data.connected_email, tokenRefresh: false, error: tok.error_description || tok.error };

  const at = tok.access_token as string;
  let scope: string | undefined, tokenEmail: string | undefined;
  try {
    const ti = await (await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${at}`)).json();
    scope = ti.scope; tokenEmail = ti.email;
  } catch { /* egal */ }

  const now = new Date().toISOString();
  const to = new Date(Date.now() + 35 * 86400e3).toISOString();
  const evRes = await fetch(`${CAL}/calendars/primary/events?timeMin=${now}&timeMax=${to}&singleEvents=true&maxResults=10`, { headers: { Authorization: `Bearer ${at}` } });
  const evJson = await evRes.json();
  const items = (evJson.items as Record<string, unknown>[]) ?? [];

  // Alle Kalender des Kontos auflisten (zeigt, ob Termine woanders liegen).
  let calendars: unknown = "n/a";
  try {
    const calRes = await fetch(`${CAL}/users/me/calendarList`, { headers: { Authorization: `Bearer ${at}` } });
    const calJson = await calRes.json();
    calendars = calRes.ok
      ? (calJson.items as Record<string, unknown>[] ?? []).map((c) => ({ id: c.id, summary: c.summary, primary: c.primary ?? false, accessRole: c.accessRole }))
      : { error: calJson.error?.message ?? calJson.error };
  } catch (e) { calendars = { error: String(e) }; }

  // Reale Belegt-Abfrage (über alle Kalender) als Gegenprobe.
  let busy: unknown;
  try { const bi = await busyIntervals(now, to); busy = { count: bi.length, sample: bi.slice(0, 6) }; } catch (e) { busy = { error: String(e) }; }

  return {
    busy,
    connected: true,
    connectedEmail: data.connected_email,
    tokenEmail,
    tokenRefresh: true,
    scope,
    primaryEventsOk: evRes.ok,
    primaryEventsError: evRes.ok ? undefined : evJson.error?.message ?? evJson.error,
    primaryEventCount35d: items.length,
    primarySample: items.slice(0, 6).map((e) => ({ summary: e.summary, start: e.start, transparency: e.transparency, status: e.status })),
    calendars,
  };
}

export async function deleteEvent(eventId: string): Promise<void> {
  const token = await accessToken();
  if (!token) return;
  await fetch(`${CAL}/calendars/primary/events/${eventId}?sendUpdates=all`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}
