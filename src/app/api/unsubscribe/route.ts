import { createClient as createAdmin } from "@supabase/supabase-js";
import { unsubValid } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

function page(title: string, msg: string): Response {
  const body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#FFF1D2;color:#3B2922;margin:0;">
    <div style="max-width:460px;margin:12vh auto;padding:28px;text-align:center;">
      <h1 style="color:#8A3030;font-size:22px;">${title}</h1>
      <p style="font-size:15px;line-height:1.5;">${msg}</p>
      <p style="margin-top:24px;"><a href="https://www.germanwithmarvin.com/" style="color:#8A3030;">← Back to German with Marvin</a></p>
    </div>
  </body></html>`;
  return new Response(body, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// 1-Klick-Abmeldung von Werbe-Mails. Link aus der Mail: ?u=<user>&t=<token>.
// Setzt profiles.marketing_consent = false (kein Login nötig, Token-signiert).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("u") ?? "";
  const token = url.searchParams.get("t") ?? "";

  if (!userId || !token || !unsubValid(userId, token)) {
    return page("Link not valid", "This unsubscribe link is invalid or expired. You can also just reply to any email and we'll remove you.");
  }

  try {
    await admin().from("profiles").update({ marketing_consent: false }).eq("id", userId);
  } catch {
    return page("Something went wrong", "We couldn't update your preferences automatically. Please reply to any email and we'll remove you.");
  }

  return page("You're unsubscribed", "You won't receive marketing emails from German with Marvin anymore. Important account emails (like lesson details) may still be sent.");
}
