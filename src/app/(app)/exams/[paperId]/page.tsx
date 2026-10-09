"use client";

import { useParams } from "next/navigation";
import ExamRunner from "@/components/exams/ExamRunner";

export default function ExamPaperPage() {
  const { paperId } = useParams<{ paperId: string }>();
  if (!paperId) return null;
  return <ExamRunner paperId={paperId} />;
}
