import type { Category, Level, Section, Difficulty } from "@prisma/client";
import { CATEGORY_META, SECTION_LABELS } from "@/lib/constants/exam";

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  EASY: "Direct application of a formula, straightforward synonym, or basic one-step logic.",
  MEDIUM: "Requires 2-3 logical steps, combining two math concepts, or analogy with tricky distractors.",
  HARD: "Complex multi-step math word problems, dense reading comprehension paragraphs, heavily constrained analytical games.",
  SUPER_HARD: "Edge-case mathematics, obscure vocabulary, or analytical games requiring extensive mapping of variables.",
};

const SECTION_DESCRIPTIONS: Record<Section, string> = {
  VERBAL: "Vocabulary/Synonyms, Sentence Completion, Analogies, Antonyms, Reading Comprehension, Sentence Correction. Test vocabulary, reading comprehension, and sentence structure.",
  ANALYTICAL: "Logic puzzles (grouping, ordering, scheduling), Critical reasoning, Conditional logic, Syllogisms. Use scenario-based formats with strict logical bounds.",
  QUANTITATIVE: "Arithmetic, Algebra, Geometry, Number Theory, Speed/Distance/Time, Statistics, Probability. Test mathematical aptitude at the 16-year education level.",
};

export function buildSystemPrompt(): string {
  return `You are a question generator for Pakistan's HEC HAT (Higher Education Aptitude Test) simulator.

CORE RULES:
1. Target audience: Graduate-level applicants (MS/MPhil/PhD) in Pakistan.
2. Every question MUST have exactly 4 options (A, B, C, D).
3. Every question MUST have exactly one correct answer (index 0-3).
4. Every question MUST include a detailed explanation.
5. Questions must be original and not copied from any source.
6. Avoid culturally biased or offensive content.
7. For Analytical Reasoning, ensure questions follow strict logical bounds without multiple interpretations.
8. Output ONLY valid JSON — no markdown, no code fences, no extra text.

SAMPLE PATTERNS:
- Verbal: "Choose the word most similar in meaning to X", "Complete the sentence: ...", "X is to Y as A is to ___"
- Quantitative: "If 8^n = 16^4, find n", "The average of 5 numbers is 12.6...", ratio/proportion word problems
- Analytical: "Seven supervisors F,G,H,J,K,M,N. Messages can be sent..." with condition-based deduction questions`;
}

export function buildUserPrompt(
  category: Category,
  level: Level,
  section: Section,
  difficulty: Difficulty,
  count: number
): string {
  const diff = difficulty === "RANDOM" ? "a mix of Easy, Medium, Hard, and Super Hard" : difficulty;
  const diffDesc = difficulty !== "RANDOM" ? `\nDifficulty guide: ${DIFFICULTY_DESCRIPTIONS[difficulty]}` : "";

  return `Generate exactly ${count} ${SECTION_LABELS[section]} questions for the ${CATEGORY_META[category].label} category at the ${level} level.

Difficulty: ${diff}${diffDesc}
Section: ${SECTION_LABELS[section]}
Section focus: ${SECTION_DESCRIPTIONS[section]}

Return a JSON array with this exact schema:
[
  {
    "questionText": "string — the full question",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0,
    "explanation": "string — detailed explanation of why the correct answer is right",
    "difficulty": "EASY" | "MEDIUM" | "HARD" | "SUPER_HARD"
  }
]

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation outside JSON.`;
}
