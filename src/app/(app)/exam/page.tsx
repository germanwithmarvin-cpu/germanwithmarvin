"use client";

import { useState } from "react";
import Link from "next/link";
import { estimateLevel, saveExamResult, type Question, type ExamResult } from "@/lib/exam";
import { buildPlacementExam } from "@/lib/placement";

type Phase = "intro" | "running" | "result";

export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function start() {
    setError(null);
    const questions = buildPlacementExam();
    setQuestions(questions);
    setAnswers(new Array(questions.length).fill(null));
    setIndex(0);
    setPhase("running");
  }

  async function answer(option: string) {
    const next = [...answers];
    next[index] = option;
    setAnswers(next);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      const r = estimateLevel(questions, next);
      setResult(r);
      setPhase("result");
      await saveExamResult(r);
    }
  }

  // ---- Intro ----
  if (phase === "intro") {
    return (
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold">Placement test 🎓</h1>
        <p className="text-cream-dim mt-2">
          40 multiple-choice questions, from beginner to upper-intermediate. We&apos;ll estimate your
          vocabulary level (A1–B2). There&apos;s no time limit — just pick the best meaning.
        </p>
        {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3 mt-4">{error}</p>}
        <button onClick={start} className="btn-gold px-6 py-3 mt-6">
          Start test
        </button>
      </div>
    );
  }

  // ---- Result ----
  if (phase === "result" && result) {
    return (
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold">Your result</h1>
        <div className="card p-6 mt-4 text-center">
          <div className="text-sm text-cream-dim">Estimated level</div>
          <div className="text-5xl font-bold text-gold-bright mt-1">{result.level}</div>
          <div className="text-cream-dim mt-2">{result.score} / {result.total} correct</div>
        </div>

        <div className="card p-5 mt-4">
          <h3 className="font-semibold mb-3">By level</h3>
          <div className="space-y-2">
            {result.perLevel.map((r) => {
              const pct = Math.round((r.correct / r.total) * 100);
              return (
                <div key={r.level}>
                  <div className="flex justify-between text-sm">
                    <span>{r.level}</span>
                    <span className="text-cream-dim">{r.correct}/{r.total} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bordeaux-deep/60 mt-1">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: pct >= 60 ? "var(--green-accent)" : "var(--gold)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => { setPhase("intro"); setResult(null); }} className="btn-outline px-4 py-2 text-sm">Take again</button>
          <Link href="/decks" className="btn-gold px-4 py-2 text-sm">Go study</Link>
        </div>
      </div>
    );
  }

  // ---- Running ----
  const q = questions[index];
  const progress = ((index) / questions.length) * 100;
  return (
    <div className="max-w-lg">
      <div className="h-2 rounded-full bg-bordeaux-deep/60 mb-6">
        <div className="h-2 rounded-full bg-gold-bright transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-sm text-cream-dim mb-2">Question {index + 1} of {questions.length}</div>

      <div className="card p-6">
        <div className="text-xs text-cream-dim">What does this mean?</div>
        <div className="text-2xl font-semibold mt-1">{q.prompt}</div>

        <div className="grid gap-2 mt-6">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => answer(opt)}
              className="btn-outline px-4 py-3 text-left hover:border-gold"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
