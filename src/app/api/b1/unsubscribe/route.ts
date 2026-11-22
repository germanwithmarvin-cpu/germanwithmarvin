import { createClient as createAdmin } from "@supabase/supabase-js";
import { subjectValid } from "@/lib/unsubscribe";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

function page(title: string, body: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title></head>
  <body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#FFF1D2;color:#3B2922;margin:0;">
    <div style="max-width:460px;margin:12vh auto;padding:28px;text-align:center;">
      <h1 style="color:#8A3030;font-size:22px;margin:0 0 10px;">${title}</h1>
      <p style="font-size:15px;line-height:1.5;">${body}</p>
    </div>
  </body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// 1-Klick-Abmeldung für B1-Leads (E-Mail-signiert, kein Login).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";

  if (email && subjectValid(email, token)) {
    try {
      await admin().from("b1_leads").update({ status: "unsubscribed", marketing_consent: false, updated_at: new Date().toISOString() }).eq("email", email);
    } catch {
      return page("Something went wrong", "We couldn't update your preferences automatically. Please reply to any email and we'll remove you.");
    }
    return page("You're unsubscribed", "You won't receive any more B1 emails from us. You can come back any time.");
  }
  return page("Link not valid", "This unsubscribe link is not valid. Please reply to any email and we'll remove you.");
}
