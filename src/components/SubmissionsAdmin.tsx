"use client";

import { useEffect, useState } from "react";
import { getAllSubmissions, saveFeedback, type Submission } from "@/lib/writing";

type Row = Submission & { student?: string };

export default function SubmissionsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setRows(await getAllSubmissions());
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function save(id: string) {
    setSavingId(id);
    await saveFeedback(id, draft.trim());
    setSavingId(null);
    setOpenId(null);
    setDraft("");
    refresh();
  }

  if (loading) return <p className="text-sm text-cream-dim">Loading submissions…</p>;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-cream-dim">
        No submissions yet. When students send writing tasks, they appear here.
        (If you expect to see some, make sure your account is set as teacher — see supabase/teacher.sql.)
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((s) => (
        <div key={s.id} className="card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{s.student}</span>
              <span className="text-xs text-cream-dim ml-2">{new Date(s.created_at).toLocaleDateString("en-GB")}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "reviewed" ? "bg-green-400/20 text-green-300" : "bg-gold/20 text-gold-bright"}`}>
              {s.status === "reviewed" ? "Reviewed" : "New"}
            </span>
          </div>
          <div className="text-xs text-cream-dim">{s.prompt}</div>
          <p className="text-sm text-cream whitespace-pre-wrap">{s.body}</p>

          {s.feedback && openId !== s.id && (
            <div className="rounded-lg bg-green-400/10 border border-green-400/20 p-3 text-sm">
              <div className="font-semibold text-green-300 mb-1">Your feedback</div>
              <p className="text-cream whitespace-pre-wrap">{s.feedback}</p>
            </div>
          )}

          {openId === s.id ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="Write your correction and feedback…"
                className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold resize-y"
              />
              <div className="flex gap-2">
                <button onClick={() => save(s.id)} disabled={savingId === s.id} className="btn-gold px-4 py-1.5 text-sm disabled:opacity-40">
                  {savingId === s.id ? "Saving…" : "Save feedback"}
                </button>
                <button onClick={() => { setOpenId(null); setDraft(""); }} className="btn-outline px-4 py-1.5 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setOpenId(s.id); setDraft(s.feedback ?? ""); }} className="btn-gold px-4 py-1.5 text-sm">
              {s.feedback ? "Edit feedback" : "Give feedback"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
