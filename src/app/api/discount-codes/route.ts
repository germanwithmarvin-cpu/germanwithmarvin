import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { APP_PRICE, APP_CURRENCY } from "@/lib/config";

export const runtime = "nodejs";

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

// Nur Lehrer dürfen Rabattcodes verwalten. Liefert den Stripe-Client zurück.
async function guard(): Promise<{ stripe?: Stripe; error?: Response }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: json({ error: "Not signed in - please log in again." }, 401) };

  // Teacher-Pruefung robust: zuerst die SECURITY-DEFINER-RPC is_teacher() (umgeht
  // RLS zuverlaessig), sonst der direkte Profil-Read als Fallback. maybeSingle()
  // wirft nicht, falls die Zeile ausbleibt.
  let isTeacher = false;
  const rpc = await supabase.rpc("is_teacher");
  if (rpc.data === true) isTeacher = true;
  else {
    const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(profile?.is_teacher);
  }
  if (!isTeacher) {
    // Selbst-erklaerende Meldung: zeigt, ALS WER man eingeloggt ist -> sofort klar,
    // ob es am falschen Konto liegt.
    return { error: json({ error: `Forbidden - you are signed in as ${user.email ?? "unknown"}, which is not a teacher account. Log out and sign in with your teacher email.` }, 403) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return { error: json({ error: "Stripe not configured: STRIPE_SECRET_KEY is missing in the deployment." }, 500) };
  return { stripe: new Stripe(secretKey) };
}

const CODE_RE = /^[A-Z0-9]{3,40}$/;

// Liste aktiver Rabattcodes (Promotion Codes) mit dem sich ergebenden Monatspreis.
export async function GET() {
  const { stripe, error } = await guard();
  if (error) return error;
  try {
    const promos = await stripe!.promotionCodes.list({ limit: 100, active: true });
    // Preis steht in den Metadaten (beim Anlegen gesetzt) – zuverlässiger als
    // den (evtl. nicht expandierten) Coupon aufzulösen.
    const items = promos.data.map((p) => ({
      id: p.id,
      code: p.code,
      price: p.metadata?.price ? Number(p.metadata.price) : null,
      timesRedeemed: p.times_redeemed,
      maxRedemptions: p.max_redemptions ?? null,
    }));
    return json({ items });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Stripe error" }, 400);
  }
}

// Neuen Rabattcode anlegen. Body: { code?, price, maxRedemptions? }.
export async function POST(req: Request) {
  const { stripe, error } = await guard();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const price = Number(body.price);
  const code = String(body.code ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const maxRedemptions = body.maxRedemptions ? Math.max(1, Math.round(Number(body.maxRedemptions))) : undefined;

  if (!Number.isFinite(price) || price <= 0 || price >= APP_PRICE) {
    return json({ error: `Price must be between $0 and $${APP_PRICE} (exclusive). For full free access, use an access code instead.` }, 400);
  }
  if (code && !CODE_RE.test(code)) {
    return json({ error: "Code may only contain letters and numbers (3–40 chars)." }, 400);
  }

  try {
    const coupon = await stripe!.coupons.create({
      amount_off: Math.round((APP_PRICE - price) * 100),
      currency: APP_CURRENCY.toLowerCase(),
      duration: "forever",
      name: `Custom price $${price}/mo`,
    });
    const promo = await stripe!.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      metadata: { price: String(price) },
      ...(code ? { code } : {}),
      ...(maxRedemptions ? { max_redemptions: maxRedemptions } : {}),
    });
    return json({ code: promo.code, price });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Stripe error" }, 400);
  }
}

// Rabattcode deaktivieren (?id=promo_...).
export async function DELETE(req: Request) {
  const { stripe, error } = await guard();
  if (error) return error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ error: "Missing id" }, 400);
  try {
    await stripe!.promotionCodes.update(id, { active: false });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Stripe error" }, 400);
  }
}
