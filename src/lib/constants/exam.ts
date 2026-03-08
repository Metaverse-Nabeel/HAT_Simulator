import type { Category, Section } from "@prisma/client";

export const SECTION_DISTRIBUTION: Record<
  Category,
  Record<Section, number>
> = {
  HAT_I: { VERBAL: 30, ANALYTICAL: 30, QUANTITATIVE: 40 },
  HAT_II: { VERBAL: 30, ANALYTICAL: 40, QUANTITATIVE: 30 },
  HAT_III: { VERBAL: 40, ANALYTICAL: 35, QUANTITATIVE: 25 },
  HAT_IV: { VERBAL: 40, ANALYTICAL: 30, QUANTITATIVE: 30 },
  HAT_GENERAL: { VERBAL: 40, ANALYTICAL: 30, QUANTITATIVE: 30 },
};

export const CATEGORY_META: Record<
  Category,
  { label: string; tag: string; description: string; tagColor: string }
> = {
  HAT_I: {
    label: "HAT-I",
    tag: "HAT-I",
    description: "Engineering & Technology, CS, Mathematics, Physics",
    tagColor: "bg-teal-500",
  },
  HAT_II: {
    label: "HAT-II",
    tag: "HAT-II",
    description: "Management Sciences, Business Education",
    tagColor: "bg-teal-500",
  },
  HAT_III: {
    label: "HAT-III",
    tag: "HAT-III",
    description: "Arts & Humanities, Social Sciences, Psychology, Law",
    tagColor: "bg-teal-500",
  },
  HAT_IV: {
    label: "HAT-IV",
    tag: "HAT-IV",
    description: "Biological & Medical, Agriculture, Physical Sciences",
    tagColor: "bg-teal-500",
  },
  HAT_GENERAL: {
    label: "HAT-General",
    tag: "General",
    description: "Religious Studies",
    tagColor: "bg-navy-800",
  },
};

export const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "HARD", label: "Hard", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "SUPER_HARD", label: "Super Hard", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "RANDOM", label: "Random", color: "bg-navy-100 text-navy-700 border-navy-200" },
] as const;

export const XP_PER_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  SUPER_HARD: 5,
  RANDOM: 2,
} as const;

export const SECTION_LABELS: Record<Section, string> = {
  VERBAL: "Verbal Reasoning",
  ANALYTICAL: "Analytical Reasoning",
  QUANTITATIVE: "Quantitative Reasoning",
};

export const DEFAULT_QUESTION_COUNT = 100;
export const DEFAULT_TIME_LIMIT = 7200; // 120 minutes in seconds
export const MAX_DAILY_ATTEMPTS = 10;
