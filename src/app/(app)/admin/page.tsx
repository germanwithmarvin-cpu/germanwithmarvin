"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LessonsAdmin from "@/components/LessonsAdmin";
import StoriesAdmin from "@/components/StoriesAdmin";
import StudentsAdmin from "@/components/StudentsAdmin";
import DecksAdmin from "@/components/admin/DecksAdmin";
import CodesAdmin from "@/components/admin/CodesAdmin";
import { createClient } from "@/lib/supabase/client";

const tabs = ["Students", "Lessons", "Stories", "Vocabulary", "Codes"] as const;
type Tab = (typeof tabs)[number];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("Students");
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  // Nur Lehrer-Konten dürfen diese Seite sehen.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
      if (data?.is_teacher) setAllowed(true);
      else { setAllowed(false); router.replace("/dashboard"); }
    });
  }, [router]);

  if (allowed !== true) {
    return <p className="text-sm text-cream-dim">Checking access…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher area</h1>
        <p className="text-cream-dim text-sm">See student progress, manage your content and access codes.</p>
      </div>

      <div className="flex gap-2 border-b border-gold/15">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
              tab === t ? "border-gold text-cream" : "border-transparent text-cream-dim hover:text-cream"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Students" && <StudentsAdmin />}

      {tab === "Lessons" && <LessonsAdmin />}

      {tab === "Stories" && <StoriesAdmin />}

      {tab === "Vocabulary" && <DecksAdmin />}

      {tab === "Codes" && <CodesAdmin />}
    </div>
  );
}
