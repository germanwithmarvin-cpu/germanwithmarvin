import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/mail";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

// §312k BGB "Kündigungsbutton": der angemeldete Nutzer kann hier seine
// laufenden (automatisch verlängernden) Abos selbst kündigen — App-Abo
// (paid_subscriptions) UND Stunden-Abos (lesson_subscriptions). Gekündigt wird
// IMMER zum Ende der bezahlten Periode (cancel_at_period_end), nie sofort, damit
// der Zugang bis dahin erhalten bleibt. Eine Eingangsbestätigung geht per E-Mail
// raus (dauerhafter Datenträger).

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
// current_period_end liegt je nach Stripe-API-Version am Abo oder am Item.
function periodEndISO(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0] as unknown as { current_period_end?: number };
  const subLvl = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? subLvl.current_period_end;
  return secs ? new Date(secs * 1000).toISOString() : null;
}
const ACTIVE = ["active", "trialing", "past_due", "unpaid"];

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ error: "Stripe not configured" }, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);
  const { data: dp } = await supabase.from("profiles").select("is_demo").eq("id", user.id).maybeSingle();
  if (dp?.is_demo) return json({ error: "Not available on the demo account." }, 403);

  const stripe = new Stripe(secretKey);
  const db = admin();
  const email = (user.email ?? "").toLowerCase();
  const cancelled: { type: string; endsAt: string | null }[] = [];

  try {
    // 1) App-Abo (paid_subscriptions ist per E-Mail verschlüsselt; die konkrete
    //    Subscription-ID holen wir über den Stripe-Customer).
    if (email) {
      const { data: paid } = await db
        .from("paid_subscriptions")
        .select("stripe_customer_id, status")
        .eq("email", email)
        .maybeSingle();
      if (paid?.stripe_customer_id && ACTIVE.includes(String(paid.status))) {
        const subs = await stripe.subscriptions.list({ customer: String(paid.stripe_customer_id), status: "active", limit: 20 });
        for (const s of subs.data) {
          if (!s.cancel_at_period_end) await stripe.subscriptions.update(s.id, { cancel_at_period_end: true });
          cancelled.push({ type: "app", endsAt: periodEndISO(s) });
        }
        // Flag nur setzen, wenn es wirklich ein laufendes Abo gab (ein einmaliger
        // Jahreskauf hat eine paid_subscriptions-Zeile, aber keine Subscription).
        if (subs.data.length) {
          await db.from("paid_subscriptions").update({ cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq("email", email);
        }
      }
    }

    // 2) Stunden-Abos (können je Lehrkraft mehrere sein).
    const { data: lessons } = await db
      .from("lesson_subscriptions")
      .select("stripe_subscription_id, status, cancel_at_period_end, current_period_end")
      .eq("user_id", user.id);
    for (const l of lessons ?? []) {
      if (!l.stripe_subscription_id || !ACTIVE.includes(String(l.status))) continue;
      if (!l.cancel_at_period_end) {
        await stripe.subscriptions.update(String(l.stripe_subscription_id), { cancel_at_period_end: true });
        await db.from("lesson_subscriptions").update({ cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq("stripe_subscription_id", l.stripe_subscription_id);
      }
      cancelled.push({ type: "lessons", endsAt: (l.current_period_end as string) ?? null });
    }

    if (cancelled.length === 0) {
      return json({ ok: true, cancelled: 0, message: "no-active-subscription" });
    }

    // Eingangsbestätigung auf dauerhaftem Datenträger (§312k BGB).
    const now = new Date();
    const ends = cancelled
      .map((c) => (c.endsAt ? new Date(c.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null))
      .filter(Boolean) as string[];
    const endsLine = ends.length ? `Your access stays active until ${ends.sort().slice(-1)[0]} and will not renew after that.` : "Your subscription will not renew after the current paid period.";
    const text = `Hi,\n\nwe received your cancellation request on ${now.toUTCString()}.\n\n${endsLine}\n\nYou keep full access until then. If this was a mistake, just reply to this email and we'll help.\n\nGerman with Marvin`;
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
      <h1 style="color:#8A3030;font-size:20px;margin:0 0 12px;">Cancellation received</h1>
      <p style="font-size:15px;line-height:1.55;">Hi, we received your cancellation request on <strong>${now.toUTCString()}</strong>.</p>
      <p style="font-size:15px;line-height:1.55;">${endsLine} You keep full access until then.</p>
      <p style="font-size:15px;line-height:1.55;">If this was a mistake, just reply to this email and we'll help.</p>
      <p style="font-size:13px;color:#6b5a4a;">German with Marvin</p>
    </div>`;
    await sendEmail({ to: user.email!, replyTo: SITE.contactEmail, subject: "Your cancellation — confirmation", html, text });

    return json({ ok: true, cancelled: cancelled.length, items: cancelled });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}
