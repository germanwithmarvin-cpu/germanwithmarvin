"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { getMyProfile, saveMyName, saveMyAvatar, type MyProfile } from "@/lib/profile";
import { uploadFile } from "@/lib/upload";
import { loadProgress } from "@/lib/progress";
import { getLessons } from "@/lib/lessons";
import { getStats } from "@/lib/stats";
import { getLearnedSummary } from "@/lib/study";
import { LEVELS } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savedName, setSavedName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fortschritt
  const [lessonsDone, setLessonsDone] = useState(0);
  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [learned, setLearned] = useState<{ total: number; byLevel: Record<string, number> }>({ total: 0, byLevel: {} });

  useEffect(() => {
    getMyProfile().then((p) => { setProfile(p); setName(p?.fullName ?? ""); });
    Promise.all([loadProgress(), getLessons(), getStats(), getLearnedSummary()]).then(([prog, ls, stats, sum]) => {
      setLessonsDone(prog.completedLessons.length);
      setXp(prog.xp);
      setLessonsTotal(ls.length);
      setStreak(stats.streak);
      setLearned(sum);
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

  if (!profile) return <p className="text-sm text-cream-dim">Loading your profile…</p>;

  const pct = lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Your profile</h1>

      {err && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>}

      {/* Kopf: Bild + Name */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 text-center">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-bordeaux-deep/60 border border-gold/25 grid place-items-center">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
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

        <div className="flex-1 w-full">
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

      {/* Fortschritt */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat value={`${lessonsDone}/${lessonsTotal}`} label="Lessons done" />
          <Stat value={learned.total} label="Cards learned" />
          <Stat value={xp} label="XP earned" />
          <Stat value={streak} label="Day streak 🔥" />
        </div>

        <div className="card p-5 mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-cream-dim">Lesson progress</span>
            <span className="text-gold-bright">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-bordeaux-deep/70 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold to-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {learned.total > 0 && (
          <div className="card p-5 mt-4">
            <div className="text-sm font-medium mb-2">Cards learned by level</div>
            <div className="space-y-1.5">
              {LEVELS.filter((l) => (learned.byLevel[l] ?? 0) > 0).map((l) => (
                <div key={l} className="flex items-center justify-between text-sm">
                  <span className="text-gold-bright">{l}</span>
                  <span className="text-cream-dim">{learned.byLevel[l]} cards</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
