import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: "middleware" wurde in "proxy" umbenannt.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Alle Seiten außer statischen Dateien und Bildern.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp|pdf)$).*)"],
};
