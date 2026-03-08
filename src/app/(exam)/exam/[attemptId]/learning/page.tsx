import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { LearningClient } from "./learning-client";
import type { ExamQuestion } from "@/types/exam";

export default async function LearningPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    redirect("/dashboard");
  }

  if (attempt.status === "COMPLETED") {
    redirect(`/exam/${attemptId}/results`);
  }

  if (attempt.mode !== "LEARNING") {
    redirect(`/exam/${attemptId}/testing`);
  }

  const questions = attempt.questionsData as unknown as ExamQuestion[];

  return <LearningClient attemptId={attemptId} questions={questions} />;
}
