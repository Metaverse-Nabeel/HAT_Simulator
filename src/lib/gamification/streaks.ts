import { prisma } from "@/lib/db";

export async function updateStreak(userId: string) {
  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId },
  });

  if (!profile) return { currentStreak: 0, multiplier: 1.0 };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = profile.lastActivityDate
    ? new Date(
        profile.lastActivityDate.getFullYear(),
        profile.lastActivityDate.getMonth(),
        profile.lastActivityDate.getDate()
      )
    : null;

  let newStreak = profile.currentStreak;

  if (!lastActivity) {
    // First activity ever
    newStreak = 1;
  } else {
    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) {
      // Already active today, no change
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = profile.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  const newLongest = Math.max(profile.longestStreak, newStreak);

  await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: now,
    },
  });

  return { currentStreak: newStreak, multiplier: 1.0 + newStreak * (1.0 / 30) };
}

export async function addXP(userId: string, xp: number) {
  await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      totalXP: { increment: xp },
    },
  });
}
