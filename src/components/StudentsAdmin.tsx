"use client";

import { useCallback, useEffect, useState } from "react";
import { getStudents, getStudentLessonIds, getStudentCardsByLevel, type StudentOverview, type CardsByLevel } from "@/lib/teacher";
import { getLessons } from "@/lib/lessons";
import type { Lesson } from "@/lib/data";
import { getBannerForTarget, saveBanner, clearBanner, type BannerTone } from "@/lib/banners";
import { getConversation, sendTeacherMessage, closeConversation, markConversationRead, getStudentsWithUnread, type Message } from "@/lib/conversations";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}

// Zugangsstatus aus scope + Ablaufdatum ableiten.
function access(s: StudentOverview): { text: string; color: string } {
  const exp = s.accessExpiresAt ? new Date(s.accessExpiresAt).getTime() : null;
  if (exp !== null) {
    const days = Math.ceil((exp - Date.now()) / 86_400_000);
    if (exp <= Date.now()) return { text: "Trial expired", color: "var(--red-accent)" };
    return { text: `Trial · ${days}d left`, color: days <= 2 ? "var(--gold-bright)" : "var(--green-accent)" };
  }
  if (s.accessScope === "full") return { text: "Full access", color: "var(--green-accent)" };
  return { text: s.accessScope || "no access", color: "var(--cream-dim)" };
}

// Kurzform der Herkunft (für die Detail-Ansicht).
function sourceLine(s: StudentOverview): string {
  const parts: string[] = [];
  if (s.signupGclid) parts.push("Google Ad");
  if (s.signupSource) parts.push(`source: ${s.signupSource}`);
  if (s.signupCampaign) parts.push(`campaign: ${s.signupCampaign}`);
  if (s.signupRef) parts.push(`ref: ${s.signupRef}`);
  if (parts.length === 0 && s.signupReferrer) parts.push(`from: ${s.signupReferrer}`);
  return parts.length ? parts.join(" · ") : "direct / unknown";
}

export default function StudentsAdmin() {
  const [students, setStudents] = useState<StudentOverview[] | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showGlobal, setShowGlobal] = useState(false);
  const [unread, setUnread] = useState<Set<string>>(new Set());

  const refreshUnread = useCallback(() => { getStudentsWithUnread().then(setUnread).catch(() => {}); }, []);

  useEffect(() => {
    getStudents().then(setStudents);
    getLessons().then(setLessons);
    refreshUnread();
  }, [refreshUnread]);

  if (students === null) return <p className="text-sm text-cream-dim">Loading students…</p>;
  if (students.length === 0) {
    return (
      <p className="text-sm text-cream-dim">
        No students yet — or the teacher functions aren’t installed. Run <code>supabase/students-tracking-banners.sql</code> once.
      </p>
    );
  }

  const totalLessons = lessons.length;
  const consented = students.filter((s) => s.marketingConsent).length;

  return (
    <div className="space-y-3">
      {/* Kopf: Zusammenfassung + globales Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cream-dim">
          {students.length} student{students.length === 1 ? "" : "s"} · <span className="text-cream">{consented}</span> allow marketing 📣
        </p>
        <button onClick={() => setShowGlobal((v) => !v)} className="btn-outline px-3 py-1.5 text-sm">
          📣 Banner for everyone
        </button>
      </div>

      {showGlobal && (
        <div className="card p-4">
          <BannerEditor targetUserId={null} title="Website banner shown to ALL students after login" />
        </div>
      )}

      {students.map((s) => {
        const open = openId === s.studentId;
        const a = access(s);
        return (
          <div key={s.studentId} className="card p-0 overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : s.studentId)}
              className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-gold/5"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{s.fullName || s.email || "Student"}</div>
                <div className="text-xs text-cream-dim truncate">{s.email}</div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={s.marketingConsent
                      ? { background: "color-mix(in srgb, var(--green-accent) 20%, transparent)", color: "var(--green-accent)" }
                      : { background: "color-mix(in srgb, var(--cream-dim) 15%, transparent)", color: "var(--cream-dim)" }}
                  >
                    {s.marketingConsent ? "📣 Ads OK" : "🔕 No ads"}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--gold) 12%, transparent)", color: a.color }}>
                    {a.text}
                  </span>
                  {unread.has(s.studentId) && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "color-mix(in srgb, var(--gold-bright) 25%, transparent)", color: "var(--gold-bright)" }}>
                      💬 new reply
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm shrink-0">
                <div className="text-center">
                  <div className="text-gold-bright font-semibold">🎬 {s.lessonsCompleted}{totalLessons ? `/${totalLessons}` : ""}</div>
                  <div className="text-[11px] text-cream-dim">lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-gold-bright font-semibold">🗂️ {s.cardsLearned}</div>
                  <div className="text-[11px] text-cream-dim">cards</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-cream">{timeAgo(s.lastActive)}</div>
                  <div className="text-[11px] text-cream-dim">last active</div>
                </div>
                <span className="text-cream-dim">{open ? "▲" : "▼"}</span>
              </div>
            </button>

            {open && <StudentDetail student={s} lessons={lessons} onConversationRead={refreshUnread} />}
          </div>
        );
      })}
    </div>
  );
}

function StudentDetail({ student, lessons, onConversationRead }: { student: StudentOverview; lessons: Lesson[]; onConversationRead: () => void }) {
  const [lessonIds, setLessonIds] = useState<string[] | null>(null);
  const [cards, setCards] = useState<CardsByLevel[] | null>(null);

  useEffect(() => {
    getStudentLessonIds(student.studentId).then(setLessonIds);
    getStudentCardsByLevel(student.studentId).then(setCards);
  }, [student.studentId]);

  const doneSet = new Set(lessonIds ?? []);
  const a = access(student);

  return (
    <div className="border-t border-gold/15 p-4 space-y-5 bg-bordeaux-deep/30">
      {/* Profil & Herkunft */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <Fact label="Marketing" value={student.marketingConsent ? "✅ Allowed" : "🔕 Not allowed"} />
        <Fact label="Access" value={a.text} color={a.color} />
        <Fact label="Joined" value={fmtDate(student.joined)} />
        <Fact label="Reviews (total)" value={String(student.totalReviews)} />
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="text-[11px] uppercase tracking-wide text-cream-dim">Where they came from</div>
          <div className="text-cream mt-0.5">{sourceLine(student)}</div>
          {student.signupReferrer && <div className="text-xs text-cream-dim mt-0.5 truncate">referrer: {student.signupReferrer}</div>}
        </div>
      </div>

      {/* Konversation mit genau diesem Schüler */}
      <div className="card p-4">
        <ConversationPanel studentId={student.studentId} name={student.fullName || student.email} onRead={onConversationRead} />
      </div>

      {/* Fortschritt */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold mb-2">🎬 Video lessons</div>
          {lessonIds === null ? (
            <p className="text-xs text-cream-dim">Loading…</p>
          ) : lessons.length === 0 ? (
            <p className="text-xs text-cream-dim">No lessons yet.</p>
          ) : (
            <ul className="space-y-1">
              {lessons.map((l) => {
                const done = doneSet.has(l.id);
                return (
                  <li key={l.id} className="flex items-center gap-2 text-sm">
                    <span>{done ? "✅" : "⬜"}</span>
                    <span className={done ? "text-cream" : "text-cream-dim"}>
                      <span className="text-xs text-gold-bright">{l.level}</span> · {l.title}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">🗂️ Flashcards by level</div>
          {cards === null ? (
            <p className="text-xs text-cream-dim">Loading…</p>
          ) : cards.length === 0 ? (
            <p className="text-xs text-cream-dim">No flashcards studied yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {cards.map((c) => (
                <li key={c.level} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gold-bright">{c.level}</span>
                    <span className="text-cream-dim">{c.learned} learned · {c.seen} seen</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bordeaux-deep/70 mt-1">
                    <div className="h-1.5 rounded-full bg-gold-bright" style={{ width: `${c.seen ? (c.learned / c.seen) * 100 : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-cream-dim">{label}</div>
      <div className="mt-0.5 font-medium" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}

function ConversationPanel({ studentId, name, onRead }: { studentId: string; name: string; onRead: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [status, setStatus] = useState<"open" | "closed" | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { conversation, messages: msgs } = await getConversation(studentId);
    setConvId(conversation?.id ?? null);
    setStatus(conversation?.status ?? null);
    setMessages(msgs);
    setLoading(false);
    if (conversation && msgs.some((m) => m.sender === "student" && !m.readByTeacher)) {
      await markConversationRead(conversation.id);
      onRead();
    }
  }, [studentId, onRead]);

  useEffect(() => { load(); }, [load]);

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    const { error } = await sendTeacherMessage(studentId, body);
    setBusy(false);
    if (error) return;
    setText("");
    load();
  }
  async function close() {
    if (!convId || busy) return;
    setBusy(true);
    await closeConversation(convId);
    setBusy(false);
    load();
  }

  const inputCls = "flex-1 rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">💬 Conversation with {name}</span>
        {status === "open" && convId && (
          <button onClick={close} disabled={busy} className="btn-outline px-3 py-1 text-xs">Close conversation</button>
        )}
        {status === "closed" && <span className="text-[11px] text-cream-dim">closed</span>}
      </div>
      {loading ? (
        <p className="text-xs text-cream-dim">Loading…</p>
      ) : (
        <>
          {messages.length > 0 && (
            <div className="max-h-56 overflow-y-auto space-y-2 rounded-lg bg-bordeaux-deep/40 p-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "teacher" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap ${m.sender === "teacher" ? "bg-gold-bright text-[#3b2116]" : "bg-bordeaux-deep/70 text-cream"}`}>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder={messages.length ? "Write a reply…" : "Start a conversation — the student sees it after login."}
              className={inputCls}
            />
            <button onClick={send} disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50 shrink-0">Send</button>
          </div>
          {status === "closed" && <p className="text-[11px] text-cream-dim">Sending a new message reopens the conversation.</p>}
        </>
      )}
    </div>
  );
}

const TONES: { key: BannerTone; label: string }[] = [
  { key: "info", label: "Info (bordeaux)" },
  { key: "success", label: "Success (green)" },
  { key: "warning", label: "Highlight (gold)" },
];

function BannerEditor({ targetUserId, title }: { targetUserId: string | null; title: string }) {
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [tone, setTone] = useState<BannerTone>("info");
  const [hasActive, setHasActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBannerForTarget(targetUserId).then((b) => {
      if (cancelled) return;
      if (b) { setMessage(b.message); setCtaLabel(b.ctaLabel ?? ""); setCtaHref(b.ctaHref ?? ""); setTone(b.tone); setHasActive(true); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [targetUserId]);

  async function save() {
    if (!message.trim()) { setStatus("Please enter a message."); return; }
    setSaving(true); setStatus(null);
    const { error } = await saveBanner({ targetUserId, message, ctaLabel, ctaHref, tone });
    setSaving(false);
    if (error) { setStatus(error); return; }
    setHasActive(true); setStatus("Saved — it’s live ✓");
  }

  async function remove() {
    setSaving(true); setStatus(null);
    const { error } = await clearBanner(targetUserId);
    setSaving(false);
    if (error) { setStatus(error); return; }
    setHasActive(false); setMessage(""); setCtaLabel(""); setCtaHref(""); setStatus("Banner turned off.");
  }

  const inputCls = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">📣 {title}</span>
        {hasActive && <span className="text-[11px] text-green-accent font-semibold">● live</span>}
      </div>
      {loading ? (
        <p className="text-xs text-cream-dim">Loading…</p>
      ) : (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="e.g. Welcome back! Your next 1-on-1 slot is open — book it now."
            className={inputCls}
          />
          <div className="grid sm:grid-cols-3 gap-2">
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Button text (optional)" className={inputCls} />
            <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="Button link, e.g. /booking (optional)" className={`${inputCls} sm:col-span-2`} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={tone} onChange={(e) => setTone(e.target.value as BannerTone)} className={`${inputCls} w-auto`}>
              {TONES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <button onClick={save} disabled={saving} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
              {saving ? "Saving…" : hasActive ? "Update banner" : "Show banner"}
            </button>
            {hasActive && (
              <button onClick={remove} disabled={saving} className="btn-outline px-3 py-2 text-sm">Turn off</button>
            )}
            {status && <span className="text-xs text-cream-dim">{status}</span>}
          </div>
        </>
      )}
    </div>
  );
}
