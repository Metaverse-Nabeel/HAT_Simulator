import type { Category, Level, Section, Difficulty } from "@prisma/client";
import { CATEGORY_META, SECTION_LABELS } from "@/lib/constants/exam";

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  EASY: "Direct application of a formula, straightforward synonym, or basic one-step logic.",
  MEDIUM: "Requires 2-3 logical steps, combining two math concepts, or analogy with tricky distractors.",
  HARD: "Complex multi-step math word problems, dense reading comprehension paragraphs, heavily constrained analytical games.",
  SUPER_HARD: "Edge-case mathematics, obscure vocabulary, or analytical games requiring extensive mapping of variables.",
};

const SECTION_DESCRIPTIONS: Record<Section, string> = {
  VERBAL: "High-level vocabulary, nuanced analogies, and dense sentence completion. Focus on contextual meaning.",
  ANALYTICAL: "Complex logic games (grouping/ordering) with 3-5 conditions. Must require deduction, not just reading.",
  QUANTITATIVE: "Advanced algebra, geometry theorems, and multi-concept word problems (e.g., speed + ratios).",
};

export function buildSystemPrompt(): string {
  return `You are an elite Question Engineer for Pakistan's HEC HAT (Higher Education Aptitude Test).

CORE PRINCIPLES:
1. TARGET: Graduate aspirants (MS/MPhil/PhD). The tone must be academic and rigorous.
2. STRUCTURE: 4 options (A, B, C, D). exactly one correct answer.
3. EXPLANATIONS: Professional, step-by-step logical walkthroughs.
4. AUTHENTICITY: Mimic the HEC HAT style (Verbal analogies, Analytical puzzles, Quantitative theorems).
5. FORMAT: Return ONLY a valid JSON array. No text outside JSON.

FEW-SHOT EXAMPLES (INSPIRATION):

[Verbal]
Question: Choose the word most similar in meaning to "PRECIPITOUS".
Options: ["Cautious", "Steep", "Gradual", "Timid"]
Correct: 1 (Steep)
Explanation: "Precipitous" describes a very steep or overhanging cliff, or an action done suddenly without careful consideration. Among the options, "Steep" is the direct synonym.

[Analytical]
Question: Six people (P, Q, R, S, T, U) are sitting at a circular table. P is opposite Q. R is to the immediate right of P. If S is opposite R, who is to the immediate left of Q?
Options: ["T", "S", "U", "R"]
Correct: 1 (S)
Explanation: 1. P is at the top. 2. Q is at the bottom (opposite P). 3. R is to the right of P. 4. S is opposite R (which means S is to the left of Q). Therefore, S is to the immediate left of Q.

[Quantitative]
Question: The cost of 3 pens and 5 pencils is Rs. 110. If the price of a pen increases by 10% and a pencil decreases by 5%, the new cost is Rs. 118. Find the original price of a pen.
Options: ["Rs. 20", "Rs. 25", "Rs. 30", "Rs. 35"]
Correct: 0 (Rs. 20)
Explanation: Setup equations: 3x + 5y = 110. (3 * 1.1x) + (5 * 0.95y) = 118... Solving the system yields x=20.`;
}

export function buildUserPrompt(
  category: Category,
  level: Level,
  section: Section,
  difficulty: Difficulty,
  count: number
): string {
  const diff = difficulty === "RANDOM" ? "a mix of difficulties" : difficulty;
  const diffDesc = difficulty !== "RANDOM" ? `\nTarget Difficulty Depth: ${DIFFICULTY_DESCRIPTIONS[difficulty]}` : "";

  return `TASK: Generate exactly ${count} ${SECTION_LABELS[section]} questions.
PLATFORM: ${CATEGORY_META[category].label} (${level}).
FOCUS: ${SECTION_DESCRIPTIONS[section]}

CONSTRAINTS:
- Difficulty: ${diff}${diffDesc}
- Ensure options are distinct and plausible (no obvious throwaways unless EASY).
- The explanation must teach the logic required to solve the problem.

SCHEMA:
[
  {
    "questionText": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0,
    "explanation": "string",
    "difficulty": "EASY" | "MEDIUM" | "HARD" | "SUPER_HARD"
  }
]

IMPORTANT: Start and end with [ and ]. No markdown code blocks.`;
}
