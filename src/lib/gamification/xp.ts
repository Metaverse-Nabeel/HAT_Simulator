import { XP_PER_DIFFICULTY } from "@/lib/constants/exam";
import type { Difficulty } from "@prisma/client";
import type { QuestionResult } from "@/types/exam";

export function calculateXP(
  results: QuestionResult[],
  difficulty: Difficulty,
  streakMultiplier: number
): number {
  const baseXP = XP_PER_DIFFICULTY[difficulty] ?? 2;
  const correctCount = results.filter(
    (r) => r.userAnswer === r.correctAnswer
  ).length;
  return Math.round(correctCount * baseXP * streakMultiplier);
}

export function getStreakMultiplier(currentStreak: number): number {
  // 1.0 at 0 days, scaling up to 2.0 at 30+ days
  return Math.min(2.0, 1.0 + currentStreak * (1.0 / 30));
}
