import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadQuestions, replenishQuestionCache } from "@/lib/exam/question-loader";
import type { Category, Level, ExamMode, Difficulty, Section } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    category,
    level,
    mode,
    difficulty,
    questionCount,
    timeLimit,
    sectionPractice,
  } = body as {
    category: Category;
    level: Level;
    mode: ExamMode;
    difficulty: Difficulty;
    questionCount: number;
    timeLimit: number;
    sectionPractice?: Section;
  };

  // Rate limit: 10 attempts per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttempts = await prisma.examAttempt.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: today },
    },
  });

  if (todayAttempts >= 10) {
    return NextResponse.json(
      { error: "Daily limit reached (10 exams/day)" },
      { status: 429 }
    );
  }

  // 1. Get seen question IDs to avoid repeats (last 15 attempts)
  const recentAttempts = await prisma.examAttempt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: { questionsData: true }
  });

  const excludeIds: string[] = [];
  recentAttempts.forEach(attempt => {
    const qs = (attempt.questionsData as any[]) || [];
    qs.forEach(q => {
      if (q.id && !q.id.startsWith('sample-')) {
        excludeIds.push(q.id);
      }
    });
  });

  // 2. Load questions INSTANTLY from cache/pool (LEAN mode to save memory)
  const questions = await loadQuestions(
    category,
    level,
    difficulty,
    questionCount,
    sectionPractice,
    excludeIds,
    true // lean: true
  );

  // 2. Create attempt
  const attempt = await prisma.examAttempt.create({
    data: {
      userId: session.user.id,
      category,
      level,
      mode,
      difficulty,
      questionCount,
      timeLimit: mode === "LEARNING" ? 0 : timeLimit,
      questionsData: questions as any,
    },
  });

  // 3. TRIGGER BACKGROUND REPLENISHMENT (Non-blocking)
  // This ensures the pool is always fresh for the next user/session
  // Next.js (especially on Vercel) keeps the execution context alive for a short time after response
  // For more robust needs, one would use a Queue or Vercel's `waitUntil` if on Edge.
  replenishQuestionCache(category, level, difficulty, sectionPractice).catch(err => {
    console.error("[BACKGROUND-REPLENISH-ERROR]:", err);
  });

  // 4. Respond IMMEDIATELY
  return NextResponse.json({ attemptId: attempt.id });
}
