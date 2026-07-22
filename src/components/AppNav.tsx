"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/lessons", label: "Lessons", icon: "🎬" },
  { href: "/decks", label: "Flashcards", icon: "🗂️" },
  { href: "/game", label: "Word Rocket", icon: "🚀" },
  { href: "/stories", label: "Stories", icon: "📖" },
  { href: "/booking", label: "1-on-1 lessons", icon: "🗓️" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

// Nur für Lehrer sichtbar:
const teacherLink = { href: "/admin", label: "Teacher area", icon: "🛠️" };

export default function AppNav() {
  const path = usePathname();
  const router = useRouter();
  const [isTeacher, setIsTeacher] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setIsTeacher(Boolean(data?.is_teacher));
      setAvatarUrl((data?.avatar_url as string) ?? "");
    });
  }, []);

  const visibleLinks = isTeacher ? [...links, teacherLink] : links;

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-full md:w-72 shrink-0 md:min-h-screen border-b md:border-b-0 md:border-r border-gold/15 p-5">
      <div className="mb-8">
        <Logo href="/dashboard" size={96} />
      </div>
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto">
        {visibleLinks.map((l) => {
          const active = path === l.href || path.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base whitespace-nowrap transition ${
                active
                  ? "bg-gold/20 text-cream font-medium"
                  : "text-cream-dim hover:bg-gold/10"
              }`}
            >
              {l.href === "/profile" && avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="text-xl">{l.icon}</span>
              )}
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="hidden md:block mt-8 pt-4 border-t border-gold/15">
        <button onClick={signOut} className="text-sm text-cream-dim hover:text-cream">
          ← Sign out
        </button>
      </div>
    </aside>
  );
}
