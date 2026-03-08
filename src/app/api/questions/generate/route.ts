import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuestions } from "@/lib/ai/generate-questions";
import { cacheQuestions } from "@/lib/exam/question-cache";
import type { Category, Level, Section, Difficulty } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 generation requests per day
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
      { error: "Daily limit reached", remaining: 0 },
      { status: 429 }
    );
  }

  const { category, level, section, difficulty, count } = (await req.json()) as {
    category: Category;
    level: Level;
    section: Section;
    difficulty: Difficulty;
    count: number;
  };

  const questions = await generateQuestions(
    category,
    level,
    section,
    difficulty,
    Math.min(count, 20) // max 20 per request
  );

  if (questions.length > 0) {
    await cacheQuestions(questions, category, level, section);
  }

  return NextResponse.json({
    generated: questions.length,
    remaining: 10 - todayAttempts - 1,
  });
}
