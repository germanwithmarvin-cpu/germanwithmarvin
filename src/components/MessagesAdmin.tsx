"use client";

import { useEffect, useRef, useState } from "react";
import { getThreads, getThread, sendTeacherReply, type Thread, type Message } from "@/lib/messages";

export default function MessagesAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refreshThreads() {
    setThreads(await getThreads());
    setLoading(false);
  }
  useEffect(() => { refreshThreads(); }, []);

  async function openThread(studentId: string) {
    setOpenId(studentId);
    setThread(await getThread(studentId));
  }
  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [thread]);

  async function send() {
    if (!reply.trim() || !openId || sending) return;
    setSending(true);
    await sendTeacherReply(openId, reply.trim());
    setReply("");
    setThread(await getThread(openId));
    refreshThreads();
    setSending(false);
  }

  if (loading) return <p className="text-sm text-cream-dim">Loading messages…</p>;
  if (threads.length === 0) return <p className="text-sm text-cream-dim">No messages from students yet.</p>;

  const current = threads.find((t) => t.studentId === openId);

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4">
      {/* Liste der Gesprächsfäden */}
      <div className="space-y-2">
        {threads.map((t) => (
          <button
            key={t.studentId}
            onClick={() => openThread(t.studentId)}
            className={`w-full text-left card p-3 transition ${openId === t.studentId ? "border-gold" : "hover:border-gold/50"}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{t.studentName}</span>
              {t.unreplied && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold text-bordeaux-deep">New</span>}
            </div>
            <div className="text-xs text-cream-dim truncate mt-1">{t.last.body}</div>
          </button>
        ))}
      </div>

      {/* Geöffneter Gesprächsfaden */}
      <div className="card p-4 flex flex-col h-[60vh]">
        {!current ? (
          <div className="grid place-items-center flex-1 text-sm text-cream-dim">Select a conversation</div>
        ) : (
          <>
            <div className="font-semibold mb-3">{current.studentName}</div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {thread.map((m) => {
                const fromTeacher = m.sender === "teacher";
                const system = m.sender === "system";
                return (
                  <div key={m.id} className={`flex ${fromTeacher ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      fromTeacher ? "bg-gold text-bordeaux-deep" : system ? "bg-bordeaux-deep/60 text-cream-dim italic border border-gold/20" : "bg-bordeaux-soft text-cream"
                    }`}>
                      {m.body}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Write a reply…"
                className="flex-1 rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
              />
              <button onClick={send} disabled={sending} className="btn-gold px-5 disabled:opacity-50">
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
