"use client";

import { createClient } from "@/lib/supabase/client";

export type Sender = "teacher" | "student";
export type Conversation = { id: string; studentId: string; status: "open" | "closed"; lastMessageAt: string };
export type Message = { id: string; conversationId: string; sender: Sender; body: string; createdAt: string; readByTeacher: boolean };

function convFrom(r: Record<string, unknown>): Conversation {
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    status: (r.status as string) === "closed" ? "closed" : "open",
    lastMessageAt: r.last_message_at as string,
  };
}
function msgFrom(r: Record<string, unknown>): Message {
  return {
    id: r.id as string,
    conversationId: r.conversation_id as string,
    sender: (r.sender as string) === "teacher" ? "teacher" : "student",
    body: (r.body as string) ?? "",
    createdAt: r.created_at as string,
    readByTeacher: Boolean(r.read_by_teacher),
  };
}

async function messagesOf(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data } = await supabase.from("conversation_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  return (data ?? []).map(msgFrom);
}

// ---- Schüler ---------------------------------------------------------------

// Offene Konversation des eingeloggten Schülers (oder null) samt Nachrichten.
export async function getMyOpenConversation(): Promise<{ conversation: Conversation; messages: Message[] } | null> {
  const supabase = createClient();
  const { data } = await supabase.from("conversations").select("*").eq("status", "open")
    .order("last_message_at", { ascending: false }).limit(1);
  if (!data || !data[0]) return null;
  const conversation = convFrom(data[0]);
  return { conversation, messages: await messagesOf(conversation.id) };
}

// Antwort des Schülers läuft über die API-Route (dort E-Mail an den Lehrer).
export async function sendStudentReply(conversationId: string, body: string): Promise<{ error?: string }> {
  try {
    const res = await fetch("/api/conversation-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body }),
    });
    if (!res.ok) return { error: (await res.json().catch(() => ({}))).error || "Could not send." };
    return {};
  } catch {
    return { error: "Could not send." };
  }
}

// ---- Lehrer ----------------------------------------------------------------

// Aktuellste Konversation eines Schülers (offen bevorzugt) + Nachrichten.
export async function getConversation(studentId: string): Promise<{ conversation: Conversation | null; messages: Message[] }> {
  const supabase = createClient();
  const { data } = await supabase.from("conversations").select("*").eq("student_id", studentId)
    .order("last_message_at", { ascending: false }).limit(1);
  if (!data || !data[0]) return { conversation: null, messages: [] };
  const conversation = convFrom(data[0]);
  return { conversation, messages: await messagesOf(conversation.id) };
}

// Lehrer schreibt dem Schüler: offene Konversation nutzen/anlegen, Nachricht ablegen.
export async function sendTeacherMessage(studentId: string, body: string): Promise<{ error?: string; conversationId?: string }> {
  const supabase = createClient();
  const { data: open } = await supabase.from("conversations").select("id").eq("student_id", studentId).eq("status", "open")
    .order("last_message_at", { ascending: false }).limit(1);
  let conversationId = open?.[0]?.id as string | undefined;
  if (!conversationId) {
    const { data: created, error: cErr } = await supabase.from("conversations").insert({ student_id: studentId }).select("id").single();
    if (cErr || !created) return { error: cErr?.message || "Could not open conversation." };
    conversationId = created.id as string;
  }
  const { error } = await supabase.from("conversation_messages").insert({ conversation_id: conversationId, sender: "teacher", body: body.trim(), read_by_teacher: true });
  if (error) return { error: error.message };
  await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  return { conversationId };
}

// Konversation komplett schliessen (Schüler sieht das Banner dann nicht mehr).
export async function closeConversation(conversationId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("conversations").update({ status: "closed" }).eq("id", conversationId);
  return { error: error?.message };
}

// Schüler-Antworten als gelesen markieren.
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("conversation_messages").update({ read_by_teacher: true }).eq("conversation_id", conversationId).eq("sender", "student").eq("read_by_teacher", false);
}

// Schüler-IDs mit ungelesenen Antworten (für das 💬-Badge in der Liste).
export async function getStudentsWithUnread(): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase.from("conversation_messages").select("conversations(student_id)").eq("sender", "student").eq("read_by_teacher", false);
  const set = new Set<string>();
  for (const r of (data ?? []) as Record<string, unknown>[]) {
    const c = r.conversations as { student_id?: string } | { student_id?: string }[] | null;
    const sid = Array.isArray(c) ? c[0]?.student_id : c?.student_id;
    if (sid) set.add(sid);
  }
  return set;
}
