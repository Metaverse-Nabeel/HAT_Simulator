import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loadQuestions } from "@/lib/exam/question-loader";
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

  // Load questions
  const questions = await loadQuestions(
    category,
    level,
    difficulty,
    questionCount,
    sectionPractice
  );

  // Create attempt
  const attempt = await prisma.examAttempt.create({
    data: {
      userId: session.user.id,
      category,
      level,
      mode,
      difficulty,
      questionCount,
      timeLimit: mode === "LEARNING" ? 0 : timeLimit,
      questionsData: JSON.parse(JSON.stringify(questions)),
    },
  });

  return NextResponse.json({ attemptId: attempt.id });
}
