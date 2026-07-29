"use client";

import { useEffect, useState } from "react";
import { getMyOpenConversation, sendStudentReply, type Message } from "@/lib/conversations";

// Schüler-Ansicht: Wenn der Lehrer geschrieben hat, erscheint nach dem Login
// oben ein Banner „Message from Marvin". Aufklappen -> Verlauf + Antwortfeld.
// Wegklickbar (✕); taucht bei einer NEUEN Nachricht wieder auf.
const DISMISS_KEY = "gs_conv_dismissed_v1";
function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + "…" : s; }
function readDismissed(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}"); } catch { return {}; }
}

export default function ConversationWidget() {
  const [convId, setConvId] = useState<string | null>(null);
  const [lastMsgAt, setLastMsgAt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyOpenConversation()
      .then((c) => {
        if (!c) return;
        const last = c.messages.length ? c.messages[c.messages.length - 1].createdAt : c.conversation.lastMessageAt;
        setConvId(c.conversation.id);
        setLastMsgAt(last);
        setMessages(c.messages);
        const dismissedAt = readDismissed()[c.conversation.id];
        if (dismissedAt && dismissedAt >= last) setHidden(true); // seit dem Wegklicken nichts Neues
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !convId || hidden) return null;

  function dismiss() {
    const d = readDismissed();
    d[convId!] = lastMsgAt || new Date().toISOString();
    try { localStorage.setItem(DISMISS_KEY, JSON.stringify(d)); } catch { /* egal */ }
    setHidden(true);
  }

  async function send() {
    const body = text.trim();
    if (!body || !convId || sending) return;
    setSending(true);
    const { error } = await sendStudentReply(convId, body);
    setSending(false);
    if (error) return;
    const now = new Date().toISOString();
    setMessages((m) => [...m, { id: `local-${Date.now()}`, conversationId: convId, sender: "student", body, createdAt: now, readByTeacher: false }]);
    setLastMsgAt(now);
    setText("");
  }

  const lastTeacher = [...messages].reverse().find((m) => m.sender === "teacher");

  return (
    <div style={{ background: "var(--bordeaux-soft)", color: "var(--cream)" }}>
      <div className="w-full px-4 py-2.5 text-sm flex items-center justify-center gap-3">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 min-w-0">
          <span className="truncate">💬 <b>Message from Marvin</b>{lastTeacher && !open ? ` — ${truncate(lastTeacher.body, 50)}` : ""}</span>
          <span className="opacity-70 shrink-0">{open ? "▲" : "▼ reply"}</span>
        </button>
        <button onClick={dismiss} aria-label="Dismiss" title="Dismiss" className="opacity-70 hover:opacity-100 shrink-0">✕</button>
      </div>
      {open && (
        <div className="px-4 pb-3 max-w-2xl mx-auto w-full">
          <div className="max-h-64 overflow-y-auto space-y-2 py-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "student" ? "justify-end" : "justify-start"}`}>
                <div
                  className="px-3 py-2 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap"
                  style={m.sender === "student"
                    ? { background: "var(--gold-bright)", color: "#3b2116" }
                    : { background: "rgba(0,0,0,0.22)", color: "var(--cream)" }}
                >
                  {m.body}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Write a reply…"
              className="flex-1 rounded-lg border border-gold/25 px-3 py-2 text-sm outline-none focus:border-gold"
              style={{ background: "rgba(0,0,0,0.22)", color: "var(--cream)" }}
            />
            <button onClick={send} disabled={sending} className="btn-gold px-4 py-2 text-sm disabled:opacity-50 shrink-0">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
