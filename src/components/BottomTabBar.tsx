"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Mobile-Navigation als untere Tab-Leiste (nur < md). Desktop behält die
// Seitenleiste (AppNav). Die 4 wichtigsten Bereiche sind immer sichtbar, „More"
// öffnet ein Sheet mit allen übrigen — so entdecken Schüler alle Funktionen,
// statt durch einen horizontalen Streifen scrollen zu müssen.

const PRIMARY = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/booking", label: "1-on-1", icon: "🗓️" },
  { href: "/training", label: "Training", icon: "🎓" },
  { href: "/decks", label: "Cards", icon: "🗂️" },
];

const MORE = [
  { href: "/exams", label: "Exam prep", icon: "📝" },
  { href: "/lessons", label: "Lessons", icon: "🎬" },
  { href: "/words", label: "Vocabulary", icon: "🔊" },
  { href: "/game", label: "Word Rocket", icon: "🚀" },
  { href: "/stories", label: "Stories", icon: "📖" },
  { href: "/check", label: "Where you stand", icon: "🧭" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const TEACHER_MORE = [
  { href: "/admin", label: "Teacher area", icon: "🛠️" },
  { href: "/buchhaltung", label: "Buchhaltung", icon: "📒" },
];

export default function BottomTabBar() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("is_teacher, is_demo").eq("id", user.id).maybeSingle();
      setIsTeacher(Boolean(data?.is_teacher));
      setIsDemo(Boolean(data?.is_demo));
    });
  }, []);

  const active = (href: string) => path === href || path.startsWith(href + "/");

  // Demo-Konto darf nicht buchen → 1-on-1-Tab durch Lessons ersetzen; Lessons
  // dann nicht doppelt im More-Sheet.
  const primary = isDemo
    ? PRIMARY.map((t) => (t.href === "/booking" ? { href: "/lessons", label: "Lessons", icon: "🎬" } : t))
    : PRIMARY;
  const moreItems = [
    ...MORE.filter((m) => !(isDemo && m.href === "/lessons")),
    ...(isTeacher ? TEACHER_MORE : []),
  ];
  const moreActive = moreItems.some((m) => active(m.href));

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* „More"-Sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-bordeaux-deep border-t border-gold/20 rounded-t-2xl p-4"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gold/30 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-3 px-1 text-xs transition ${
                    active(m.href) ? "bg-gold/20 text-cream" : "text-cream-dim hover:bg-gold/10"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-center leading-tight">{m.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={signOut} className="w-full mt-3 text-sm text-cream-dim hover:text-cream py-2">
              ← Sign out
            </button>
          </div>
        </div>
      )}

      {/* Tab-Leiste */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bordeaux-deep/95 backdrop-blur border-t border-gold/15"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch">
          {primary.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                active(t.href) ? "text-gold-bright" : "text-cream-dim"
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
              moreActive || open ? "text-gold-bright" : "text-cream-dim"
            }`}
          >
            <span className="text-xl leading-none">☰</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
