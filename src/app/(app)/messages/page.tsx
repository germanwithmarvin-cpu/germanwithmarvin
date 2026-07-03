"use client";

import { useEffect, useRef, useState } from "react";
import { getMyThread, sendStudentMessage, type Message } from "@/lib/messages";
import { getAccess, canAccessPremium } from "@/lib/access";
import Paywall from "@/components/Paywall";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setMessages(await getMyThread());
    setLoading(false);
  }
  useEffect(() => {
    getAccess().then((a) => setPremium(canAccessPremium(a.tier)));
    refresh();
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    setSending(true);
    const body = input.trim();
    setInput("");
    await sendStudentMessage(body);
    await refresh();
    setSending(false);
  }

  if (premium === false) return <Paywall title="Direct messages are a membership feature" />;

  return (
    <div className="space-y-4 flex flex-col h-[70vh]">
      <h1 className="text-2xl font-bold">Message me</h1>
      <div className="card flex-1 p-4 overflow-y-auto space-y-3">
        {loading && <p className="text-sm text-cream-dim">Loading…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-cream-dim">No messages yet. Ask me anything below! 🙂</p>
        )}
        {messages.map((m) => {
          const mine = m.sender === "student";
          const system = m.sender === "system";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  mine
                    ? "bg-gold text-bordeaux-deep"
                    : system
                    ? "bg-bordeaux-deep/60 text-cream-dim italic border border-gold/20"
                    : "bg-bordeaux-soft text-cream"
                }`}
              >
                {!mine && !system && <div className="text-xs text-gold-bright mb-0.5">Marvin</div>}
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold"
        />
        <button onClick={send} disabled={sending} className="btn-gold px-5 disabled:opacity-50">
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
