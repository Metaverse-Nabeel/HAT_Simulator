import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ResultsClient } from "./results-client";
import type { QuestionResult } from "@/types/exam";

export default async function ResultsPage({
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

  if (attempt.status !== "COMPLETED") {
    redirect(`/exam/${attemptId}/testing`);
  }

  const results = attempt.resultsData as unknown as QuestionResult[];

  return (
    <ResultsClient
      attemptId={attemptId}
      score={attempt.score ?? 0}
      maxScore={attempt.maxScore ?? 0}
      timeSpent={attempt.timeSpent ?? 0}
      timeLimit={attempt.timeLimit}
      category={attempt.category}
      mode={attempt.mode}
      results={results}
      xpEarned={attempt.xpEarned ?? 0}
    />
  );
}
