"use client";

import { useEffect, useState } from "react";
import { GROUP_COURSE } from "@/lib/config";
import { courseFirstSession, formatInTz } from "@/lib/courseSchedule";

// Zeigt den ersten Kurstermin in der Zeitzone des Besuchers UND in deutscher Zeit.
// Clientseitig, weil die Besucher-Zeitzone nur im Browser bekannt ist.
export default function CourseScheduleDisplay() {
  const [local, setLocal] = useState<string | null>(null);
  const [berlin, setBerlin] = useState<string | null>(null);
  const [tzName, setTzName] = useState<string>("");

  useEffect(() => {
    const { startUtc } = courseFirstSession();
    setLocal(formatInTz(startUtc));
    setBerlin(formatInTz(startUtc, GROUP_COURSE.timezone));
    try { setTzName(Intl.DateTimeFormat().resolvedOptions().timeZone || "your time"); } catch { setTzName("your time"); }
  }, []);

  const dayNames: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
  const days = GROUP_COURSE.days.map((d) => dayNames[d] ?? d).join(" & ");

  return (
    <div className="rounded-2xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-6 space-y-3">
      <div className="text-lg font-bold text-[#8A3030]">{days} · {GROUP_COURSE.time}–{GROUP_COURSE.endTime}</div>
      <div className="text-sm text-[#3B2922]/80">
        {GROUP_COURSE.weeks} weeks · {GROUP_COURSE.totalSessions} live sessions ({GROUP_COURSE.sessionsPerWeek}× per week)
      </div>
      <div className="grid sm:grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl bg-white/70 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-[#3B2922]/55">German time (Europe/Berlin)</div>
          <div className="font-semibold text-[#8A3030]">{berlin ?? "…"}</div>
        </div>
        <div className="rounded-xl bg-white/70 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-[#3B2922]/55">Your time ({tzName})</div>
          <div className="font-semibold text-[#8A3030]">{local ?? "…"}</div>
        </div>
      </div>
      <p className="text-xs text-[#3B2922]/60">First session shown. The course then runs weekly at the same time.</p>
    </div>
  );
}
