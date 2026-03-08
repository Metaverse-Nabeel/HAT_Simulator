import { prisma } from "@/lib/db";
import type { Category, Level, Section, Difficulty } from "@prisma/client";

export async function getCachedQuestions(
  category: Category,
  level: Level,
  section: Section,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = []
) {
  const difficultyFilter = difficulty === "RANDOM" ? {} : { difficulty };

  return prisma.question.findMany({
    where: {
      category,
      level,
      section,
      ...difficultyFilter,
      id: { notIn: excludeIds },
    },
    take: count,
    orderBy: { createdAt: "desc" },
  });
}

export async function cacheQuestions(
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: string;
  }[],
  category: Category,
  level: Level,
  section: Section
) {
  const data = questions.map((q) => ({
    category,
    level,
    section,
    difficulty: q.difficulty as Difficulty,
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));

  const result = await prisma.question.createMany({ data });
  return result.count;
}

export async function getCacheStats() {
  const total = await prisma.question.count();
  const bySection = await prisma.question.groupBy({
    by: ["section"],
    _count: true,
  });
  const byCategory = await prisma.question.groupBy({
    by: ["category"],
    _count: true,
  });
  return { total, bySection, byCategory };
}
