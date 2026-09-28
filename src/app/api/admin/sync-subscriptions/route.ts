import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 60;

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

// Stripe hat current_period_end je nach API-Version am Abo oder am Item.
function periodEndISO(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0] as unknown as { current_period_end?: number };
  const subLvl = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? subLvl.current_period_end;
  return secs ? new Date(secs * 1000).toISOString() : null;
}

// Holt den App-Abo-Status ($39) frisch aus Stripe in paid_subscriptions —
// vor allem, damit Bestandsabos ihr Verlaengerungsdatum bekommen (der Webhook
// speicherte es frueher nicht). Lesson-Abos bleiben aussen vor (eigene Tabelle).
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  let isTeacher = false;
  const rpc = await supabase.rpc("is_teacher");
  if (rpc.data === true) isTeacher = true;
  else {
    const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(profile?.is_teacher);
  }
  if (!isTeacher) return json({ error: "Teachers only." }, 403);

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json({ error: "Stripe not configured" }, 500);
  const stripe = new Stripe(key);
  const db = admin();

  let updated = 0;
  try {
    for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer"] })) {
      if (sub.metadata?.kind === "lesson") continue; // Stunden-Abos leben in lesson_subscriptions
      const cust = sub.customer;
      const email = typeof cust === "string" ? null : (cust as Stripe.Customer)?.email ?? null;
      if (!email) continue;
      await db.from("paid_subscriptions").upsert(
        {
          email: email.toLowerCase(),
          stripe_customer_id: typeof cust === "string" ? cust : cust?.id ?? null,
          status: sub.status,
          current_period_end: periodEndISO(sub),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );
      updated++;
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }

  return json({ ok: true, updated });
}
