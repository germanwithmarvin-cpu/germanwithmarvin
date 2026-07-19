"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyProfile, saveMyName, saveMyAvatar, changeMyPassword, type MyProfile } from "@/lib/profile";
import { uploadFile } from "@/lib/upload";
import { loadProgress } from "@/lib/progress";
import { getLessons } from "@/lib/lessons";
import { getStats, type Stats } from "@/lib/stats";
import { getLearnedSummary } from "@/lib/study";
import { getDecks } from "@/lib/decks";
import { getDeckProgress } from "@/lib/study";
import { getAccess, type AccessTier } from "@/lib/access";
import { LEVELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { SITE } from "@/lib/config";

// Rang anhand gelernter Karten – kleine spielerische Stufe im Profilkopf.
const RANKS: [number, string, string][] = [
  [0, "Newcomer", "🌱"],
  [50, "Explorer", "🧭"],
  [200, "Adventurer", "🎒"],
  [500, "Pathfinder", "🗺️"],
  [1000, "Wordsmith", "🔥"],
  [1500, "Master", "👑"],
];
function rankFor(cards: number): { name: string; icon: string; next?: number } {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (cards >= RANKS[i][0]) idx = i;
  return { name: RANKS[idx][1], icon: RANKS[idx][2], next: RANKS[idx + 1]?.[0] };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savedName, setSavedName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fortschritt & Statistik
  const [lessonsDone, setLessonsDone] = useState(0);
  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [xp, setXp] = useState(0);
  const [learned, setLearned] = useState<{ total: number; byLevel: Record<string, number> }>({ total: 0, byLevel: {} });
  const [stats, setStats] = useState<Stats | null>(null);
  const [tier, setTier] = useState<AccessTier>("none");
  const [levelTotals, setLevelTotals] = useState<Record<string, { total: number; known: number }>>({});

  // Passwort ändern
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile().then((p) => { setProfile(p); setName(p?.fullName ?? ""); });
    getAccess().then((a) => setTier(a.tier));
    Promise.all([loadProgress(), getLessons(), getStats(), getLearnedSummary(), getDecks(), getDeckProgress()])
      .then(([prog, ls, st, sum, decks, dprog]) => {
        setLessonsDone(prog.completedLessons.length);
        setXp(prog.xp);
        setLessonsTotal(ls.length);
        setStats(st);
        setLearned(sum);
        // Karten je Level aggregieren (für Level-Master-Abzeichen)
        const agg: Record<string, { total: number; known: number }> = {};
        for (const d of decks) {
          const p = dprog[d.id];
          if (!p) continue;
          const cur = agg[d.level] ?? { total: 0, known: 0 };
          agg[d.level] = { total: cur.total + p.total, known: cur.known + p.known };
        }
        setLevelTotals(agg);
      });
  }, []);

  async function onName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true); setSavedName(false); setErr(null);
    const { error } = await saveMyName(name.trim());
    setSavingName(false);
    if (error) { setErr(error); return; }
    setSavedName(true);
    setProfile((p) => (p ? { ...p, fullName: name.trim() } : p));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) { setErr("Please choose a PNG or JPG image."); return; }
    setUploading(true); setErr(null);
    const { url, error } = await uploadFile(file, profile.id, "avatars");
    if (fileRef.current) fileRef.current.value = "";
    if (error || !url) { setUploading(false); setErr(error ?? "Upload failed"); return; }
    const { error: saveErr } = await saveMyAvatar(url);
    setUploading(false);
    if (saveErr) { setErr(saveErr); return; }
    setProfile((p) => (p ? { ...p, avatarUrl: url } : p));
  }

  async function removePhoto() {
    setErr(null);
    const { error } = await saveMyAvatar("");
    if (error) { setErr(error); return; }
    setProfile((p) => (p ? { ...p, avatarUrl: "" } : p));
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw1.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    if (pw1 !== pw2) { setPwMsg("The two passwords don't match."); return; }
    setPwBusy(true);
    const { error } = await changeMyPassword(pw1);
    setPwBusy(false);
    if (error) { setPwMsg(error); return; }
    setPw1(""); setPw2("");
    setPwMsg("✓ Password changed.");
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
  }

  const pct = lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;
  const rank = rankFor(learned.total);
  const memberSince = profile?.memberSince
    ? new Date(profile.memberSince).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "";

  // Abzeichen aus den geladenen Daten ableiten.
  const badges = useMemo(() => {
    const accuracy = stats?.accuracy ?? 0;
    const streak = stats?.streak ?? 0;
    const mature = stats?.mature ?? 0;
    const list: { icon: string; title: string; desc: string; earned: boolean; hint?: string }[] = [
      { icon: "🌱", title: "First steps", desc: "Finish your first lesson", earned: lessonsDone >= 1, hint: `${lessonsDone}/1` },
      { icon: "📘", title: "Getting serious", desc: "Finish 10 lessons", earned: lessonsDone >= 10, hint: `${Math.min(lessonsDone, 10)}/10` },
      { icon: "🎓", title: "Graduate", desc: "Finish every lesson", earned: lessonsTotal > 0 && lessonsDone >= lessonsTotal, hint: `${lessonsDone}/${lessonsTotal || "?"}` },
      { icon: "🌟", title: "Word starter", desc: "Learn 50 cards", earned: learned.total >= 50, hint: `${Math.min(learned.total, 50)}/50` },
      { icon: "🧠", title: "Card collector", desc: "Learn 250 cards", earned: learned.total >= 250, hint: `${Math.min(learned.total, 250)}/250` },
      { icon: "💎", title: "Vocabulary master", desc: "Learn 1000 cards", earned: learned.total >= 1000, hint: `${Math.min(learned.total, 1000)}/1000` },
      { icon: "🔥", title: "On a roll", desc: "Reach a 7-day streak", earned: streak >= 7, hint: `${Math.min(streak, 7)}/7 days` },
      { icon: "⚡", title: "Unstoppable", desc: "Reach a 30-day streak", earned: streak >= 30, hint: `${Math.min(streak, 30)}/30 days` },
      { icon: "🎯", title: "Sharp shooter", desc: "90%+ accuracy", earned: accuracy >= 90 && (stats?.totalReviews ?? 0) >= 50, hint: `${accuracy}%` },
      { icon: "🏛️", title: "Well anchored", desc: "100 cards well memorised", earned: mature >= 100, hint: `${Math.min(mature, 100)}/100` },
    ];
    // Level-Master-Abzeichen (alle Karten eines Levels gelernt).
    for (const lv of LEVELS) {
      const t = levelTotals[lv];
      if (!t || t.total === 0) continue;
      list.push({ icon: "👑", title: `${lv} master`, desc: `Learn every ${lv} card`, earned: t.known >= t.total, hint: `${t.known}/${t.total}` });
    }
    return list;
  }, [lessonsDone, lessonsTotal, learned.total, stats, levelTotals]);

  const earnedCount = badges.filter((b) => b.earned).length;

  if (!profile) return <p className="text-sm text-cream-dim">Loading your profile…</p>;

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Your profile</h1>

      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>}

      {/* ---------- Kopf: Bild + Name + Rang + Mitgliedschaft ---------- */}
      <div className="card p-6 md:p-7 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: "radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 60%)" }} />
        <div className="shrink-0 text-center relative">
          <div className="w-32 h-32 rounded-full p-[3px]" style={{ background: "linear-gradient(150deg, var(--gold-bright), var(--bordeaux))" }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-surface grid place-items-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">{rank.icon}</span>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={onFile} className="hidden" />
          <div className="mt-3 flex flex-col gap-1">
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline px-3 py-1.5 text-sm disabled:opacity-50">
              {uploading ? "Uploading…" : profile.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {profile.avatarUrl && (
              <button onClick={removePhoto} className="text-xs text-red-700 hover:text-red-700">Remove photo</button>
            )}
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: "color-mix(in srgb, var(--gold) 22%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)", color: "var(--bordeaux)" }}>
              <span>{rank.icon}</span> {rank.name}
            </span>
            {tier === "full" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium" style={{ background: "color-mix(in srgb, var(--green-accent) 16%, transparent)", color: "var(--green-accent)" }}>✓ Full access</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium" style={{ background: "color-mix(in srgb, var(--red-accent) 15%, transparent)", color: "var(--red-accent)" }}>No active access</span>
            )}
            {memberSince && <span className="text-xs text-cream-dim">Member since {memberSince}</span>}
          </div>

          <form onSubmit={onName} className="space-y-3">
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Name</label>
              <input value={name} onChange={(e) => { setName(e.target.value); setSavedName(false); }} className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-cream-dim">Email</label>
              <div className="text-sm text-cream-dim px-3 py-2 rounded-lg bg-bordeaux-deep/40 border border-gold/15">{profile.email}</div>
            </div>
            <button type="submit" disabled={savingName} className="btn-gold px-5 py-2 text-sm disabled:opacity-50">
              {savingName ? "Saving…" : savedName ? "Saved ✓" : "Save name"}
            </button>
          </form>
        </div>
      </div>

      {/* ---------- Statistik-Kacheln ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat value={`${lessonsDone}/${lessonsTotal}`} label="Lessons done" />
        <Stat value={learned.total} label="Cards learned" />
        <Stat value={xp} label="XP earned" />
        <Stat value={stats?.streak ?? 0} label="Day streak 🔥" />
        <Stat value={`${stats?.accuracy ?? 0}%`} label="Accuracy" />
        <Stat value={stats?.mature ?? 0} label="Well memorised" />
        <Stat value={stats?.learning ?? 0} label="Still learning" />
        <Stat value={stats?.totalReviews ?? 0} label="Total reviews" />
      </div>

      {/* ---------- Abzeichen ---------- */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold">Achievements</h2>
          <span className="text-sm text-cream-dim">{earnedCount}/{badges.length} unlocked</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map((b) => (
            <div key={b.title} className={`card p-4 flex items-center gap-3 ${b.earned ? "" : "opacity-70"}`} title={b.desc}>
              <div className="w-12 h-12 shrink-0 grid place-items-center rounded-full text-2xl"
                style={b.earned
                  ? { background: "radial-gradient(circle at 50% 30%, var(--gold-bright), var(--gold) 75%)", boxShadow: "0 6px 16px -8px color-mix(in srgb, var(--gold) 70%, transparent)" }
                  : { background: "color-mix(in srgb, var(--cream) 10%, transparent)", filter: "grayscale(0.9)", opacity: 0.7 }}>
                {b.earned ? b.icon : "🔒"}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">{b.title}</div>
                <div className="text-xs text-cream-dim leading-tight">{b.earned ? b.desc : b.hint ?? b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Detaillierte Statistik ---------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Your progress in detail</h2>

        {/* 30-Tage-Aktivität */}
        <div className="card p-5">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-cream-dim">Activity — last 30 days</span>
            <span className="text-gold-bright">{stats?.reviewsByDay.reduce((s, d) => s + d.count, 0) ?? 0} reviews</span>
          </div>
          <ActivityChart data={stats?.reviewsByDay ?? []} />
        </div>

        {/* Lektions-Fortschritt */}
        <div className="card p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-cream-dim">Lesson progress</span>
            <span className="text-gold-bright">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-bordeaux-deep/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold to-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Karten je Level */}
        {Object.keys(levelTotals).length > 0 && (
          <div className="card p-5">
            <div className="text-sm font-medium mb-3">Cards learned by level</div>
            <div className="space-y-2.5">
              {LEVELS.filter((l) => (levelTotals[l]?.total ?? 0) > 0).map((l) => {
                const t = levelTotals[l];
                const p = t.total ? Math.round((t.known / t.total) * 100) : 0;
                return (
                  <div key={l}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gold-bright font-semibold">{l}</span>
                      <span className="text-cream-dim">{t.known}/{t.total} cards</span>
                    </div>
                    <div className="h-2 rounded-full bg-bordeaux-deep/70 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ---------- Konto & Mitgliedschaft ---------- */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Account & membership</h2>

        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Access</div>
              <div className="text-sm text-cream-dim">
                {tier === "full" ? "You have full access to all lessons, flashcards and stories." : "You don't have full access yet."}
              </div>
            </div>
            {tier === "full" ? (
              <span className="rounded-full px-3 py-1 text-sm font-medium shrink-0" style={{ background: "color-mix(in srgb, var(--green-accent) 16%, transparent)", color: "var(--green-accent)" }}>✓ Active</span>
            ) : (
              <Link href="/redeem" className="btn-gold px-4 py-2 text-sm shrink-0">Redeem a code</Link>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/redeem" className="btn-outline px-3 py-1.5 text-sm">Have a code?</Link>
            <a href={SITE.skoolUrl} target="_blank" rel="noreferrer" className="btn-outline px-3 py-1.5 text-sm">⭐ Skool community</a>
            <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="btn-outline px-3 py-1.5 text-sm">1-on-1 on Preply</a>
          </div>
        </div>

        {/* Passwort ändern */}
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">Change password</div>
          <form onSubmit={onPassword} className="grid sm:grid-cols-2 gap-3 max-w-xl">
            <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="New password" autoComplete="new-password" className="rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm" />
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" className="rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm" />
            <div className="sm:col-span-2 flex items-center gap-3">
              <button type="submit" disabled={pwBusy} className="btn-gold px-5 py-2 text-sm disabled:opacity-50">{pwBusy ? "Saving…" : "Update password"}</button>
              {pwMsg && <span className={`text-sm ${pwMsg.startsWith("✓") ? "text-green-700" : "text-red-700"}`}>{pwMsg}</span>}
            </div>
          </form>
        </div>

        <div>
          <button onClick={signOut} className="btn-outline px-4 py-2 text-sm">← Sign out</button>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold text-gold-bright">{value}</div>
      <div className="text-xs text-cream-dim mt-1">{label}</div>
    </div>
  );
}

// Kleines Balkendiagramm der letzten 30 Tage.
function ActivityChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0) return <p className="text-sm text-cream-dim">No activity yet — start learning to see your history here.</p>;
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const h = d.count > 0 ? Math.max(8, Math.round((d.count / max) * 100)) : 3;
        const day = new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
        return (
          <div key={d.date} className="flex-1 rounded-t transition-all" title={`${day}: ${d.count} reviews`}
            style={{ height: `${h}%`, background: d.count > 0 ? "linear-gradient(180deg, var(--gold-bright), var(--gold))" : "color-mix(in srgb, var(--cream) 12%, transparent)" }} />
        );
      })}
    </div>
  );
}
