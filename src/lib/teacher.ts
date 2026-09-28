"use client";

import { createClient } from "@/lib/supabase/client";

// Lehrer-Kontrolle: liest den Fortschritt aller Schüler über sichere RPCs
// (nur für Lehrer freigegeben, siehe supabase/teacher-analytics.sql).

export type StudentOverview = {
  studentId: string;
  fullName: string;
  email: string;
  joined: string | null;
  lessonsCompleted: number;
  cardsLearned: number;
  cardsSeen: number;
  lastActive: string | null;
  marketingConsent: boolean;
  accessScope: string | null;
  accessExpiresAt: string | null;
  signupSource: string | null;
  signupCampaign: string | null;
  signupGclid: string | null;
  signupRef: string | null;
  signupReferrer: string | null;
  totalReviews: number;
  // App-Abo ($39) aus paid_subscriptions (per E-Mail zugeordnet).
  subStatus: string | null;            // active | trialing | past_due | canceled | null (= kein Abo)
  subRenewsAt: string | null;          // naechste Verlaengerung / Ende der Periode
  subCancelAtPeriodEnd: boolean;       // laeuft zum Periodenende aus
  // 1-zu-1 Stunden
  lessonCredits: number;               // verbleibende Stunden (nicht abgelaufen)
  lessonsUpcoming: number;             // kuenftige gebuchte Stunden
  nextLessonAt: string | null;         // naechste gebuchte Stunde
  lessonsBooked: number;               // jemals gebucht (ohne Stornos)
};

export async function getStudents(): Promise<StudentOverview[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_students");
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    studentId: r.student_id as string,
    fullName: (r.full_name as string) || "",
    email: (r.email as string) || "",
    joined: (r.joined as string) ?? null,
    lessonsCompleted: Number(r.lessons_completed ?? 0),
    cardsLearned: Number(r.cards_learned ?? 0),
    cardsSeen: Number(r.cards_seen ?? 0),
    lastActive: (r.last_active as string) ?? null,
    marketingConsent: Boolean(r.marketing_consent),
    accessScope: (r.access_scope as string) ?? null,
    accessExpiresAt: (r.access_expires_at as string) ?? null,
    signupSource: (r.signup_source as string) ?? null,
    signupCampaign: (r.signup_campaign as string) ?? null,
    signupGclid: (r.signup_gclid as string) ?? null,
    signupRef: (r.signup_ref as string) ?? null,
    signupReferrer: (r.signup_referrer as string) ?? null,
    totalReviews: Number(r.total_reviews ?? 0),
    subStatus: (r.sub_status as string) ?? null,
    subRenewsAt: (r.sub_current_period_end as string) ?? null,
    subCancelAtPeriodEnd: Boolean(r.sub_cancel_at_period_end),
    lessonCredits: Number(r.lesson_credits ?? 0),
    lessonsUpcoming: Number(r.lessons_upcoming ?? 0),
    nextLessonAt: (r.next_lesson_at as string) ?? null,
    lessonsBooked: Number(r.lessons_booked ?? 0),
  }));
}

export type UpcomingLesson = { bookingId: string; startsAt: string; studentId: string; studentName: string; meetLink: string | null };

// Privater Stundenplan: alle kuenftigen gebuchten 1-zu-1-Stunden mit Namen +
// Meet-Link. Sichere Lehrer-RPC (umgeht die RLS-Unschaerfe des Tabellen-Reads).
export async function getTeacherUpcomingLessons(): Promise<UpcomingLesson[]> {
  const { data, error } = await createClient().rpc("teacher_upcoming_lessons");
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    bookingId: r.booking_id as string,
    startsAt: r.starts_at as string,
    studentId: r.student_id as string,
    studentName: (r.student_name as string) || "Student",
    meetLink: (r.meet_link as string) ?? null,
  }));
}

export async function getStudentLessonIds(studentId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_student_lessons", { p_student: studentId });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => r.lesson_id as string);
}

export type CardsByLevel = { level: string; learned: number; seen: number };

export async function getStudentCardsByLevel(studentId: string): Promise<CardsByLevel[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_student_cards_by_level", { p_student: studentId });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    level: (r.level as string) || "?",
    learned: Number(r.learned ?? 0),
    seen: Number(r.seen ?? 0),
  }));
}

// IP-Mehrfachkonto-Pruefung: Konten, die sich eine IP teilen (Audit-Log +
// gespeicherte IPs). Nur Lehrer (RPC ist is_teacher-gated). IP = nur ein Hinweis.
export type IpMatch = { ip: string; accountCount: number; emails: string[]; userIds: string[]; lastSeen: string | null };

export async function getIpMatches(): Promise<IpMatch[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_ip_matches");
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    ip: (r.ip as string) ?? "",
    accountCount: Number(r.account_count ?? 0),
    emails: (r.emails as string[]) ?? [],
    userIds: (r.user_ids as string[]) ?? [],
    lastSeen: (r.last_seen as string) ?? null,
  }));
}
