"use client";

import { useEffect, useState } from "react";
import { submitWriting, getMySubmissions, type Submission } from "@/lib/writing";
import { getAccess, canAccessPremium } from "@/lib/access";
import Paywall from "@/components/Paywall";

const prompts = [
  "Describe your last holiday in German (about 80 words).",
  "Write an email in German cancelling an appointment.",
  "What would you do on a perfect day? Write it in German.",
];

export default function WritingPage() {
  const [prompt, setPrompt] = useState(prompts[0]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [premium, setPremium] = useState<boolean | null>(null);

  async function refresh() {
    setSubmissions(await getMySubmissions());
  }
  useEffect(() => {
    getAccess().then((a) => setPremium(canAccessPremium(a.tier)));
    refresh();
  }, []);

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    const { error } = await submitWriting(prompt, text.trim());
    setSaving(false);
    if (error) { setError(error); return; }
    setText("");
    refresh();
  }

  if (premium === false) return <Paywall title="Writing feedback is a membership feature" />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Submit a writing task</h1>

      <div className="card p-5 space-y-3">
        <label className="text-sm text-cream-dim">Choose a task</label>
        <select
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
        >
          {prompts.map((p) => <option key={p}>{p}</option>)}
        </select>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Write your text here…"
          className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold resize-y"
        />
        {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}
        <div className="flex justify-between items-center">
          <span className="text-sm text-cream-dim">{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
          <button onClick={handleSubmit} disabled={!text.trim() || saving} className="btn-gold px-6 py-2.5 disabled:opacity-40">
            {saving ? "Sending…" : "Send to me"}
          </button>
        </div>
      </div>

      {/* Verlauf der eigenen Einreichungen */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Your submissions</h2>
        {submissions.length === 0 && (
          <p className="text-sm text-cream-dim">No submissions yet. Write your first text above!</p>
        )}
        {submissions.map((s) => (
          <div key={s.id} className="card p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-cream-dim">{new Date(s.created_at).toLocaleDateString("en-GB")}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "reviewed" ? "bg-green-400/20 text-green-300" : "bg-gold/20 text-gold-bright"}`}>
                {s.status === "reviewed" ? "Reviewed" : "Waiting for feedback"}
              </span>
            </div>
            <div className="text-xs text-cream-dim">{s.prompt}</div>
            <p className="text-sm text-cream whitespace-pre-wrap">{s.body}</p>
            {s.feedback && (
              <div className="rounded-lg bg-green-400/10 border border-green-400/20 p-3 text-sm">
                <div className="font-semibold text-green-300 mb-1">Marvin&apos;s feedback</div>
                <p className="text-cream whitespace-pre-wrap">{s.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
