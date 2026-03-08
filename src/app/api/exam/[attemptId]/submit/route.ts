import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { QuestionResult } from "@/types/exam";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (attempt.status === "COMPLETED") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const { results, timeSpent } = (await req.json()) as {
    results: QuestionResult[];
    timeSpent: number;
  };

  // Score
  let score = 0;
  for (const r of results) {
    if (r.userAnswer === r.correctAnswer) {
      score++;
    }
  }

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      score,
      maxScore: results.length,
      timeSpent,
      resultsData: JSON.parse(JSON.stringify(results)),
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ score, maxScore: results.length });
}
