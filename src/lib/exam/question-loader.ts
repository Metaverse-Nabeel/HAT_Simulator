import type { Category, Level, Section, Difficulty } from "@prisma/client";
import type { ExamQuestion, LeanExamQuestion } from "@/types/exam";
import { SECTION_DISTRIBUTION } from "@/lib/constants/exam";
import { getCachedQuestions, cacheQuestions } from "./question-cache";
import { generateQuestions } from "@/lib/ai/generate-questions";

export async function loadQuestions(
  category: Category,
  level: Level,
  difficulty: Difficulty,
  questionCount: number,
  sectionPractice?: Section,
  excludeIds: string[] = [],
  lean: boolean = false
): Promise<LeanExamQuestion[]> {
  const distribution = SECTION_DISTRIBUTION[category];

  // If practicing a single section, all questions from that section
  const sections: { section: Section; count: number }[] = sectionPractice
    ? [{ section: sectionPractice, count: questionCount }]
    : (Object.entries(distribution) as [Section, number][]).map(
      ([section, pct]) => ({
        section,
        count: Math.round((pct / 100) * questionCount),
      })
    );

  const allQuestions: LeanExamQuestion[] = [];

  // Process sections in parallel
  const sectionPromises = sections.map(async ({ section, count }) => {
    // 1. STRICT CACHE FIRST (No AI generation here to ensure instant response)
    const cached = await getCachedQuestions(
      category,
      level,
      section,
      difficulty,
      count, // Request the full amount
      excludeIds
    );

    const questions: LeanExamQuestion[] = cached.map((q) => {
      const base = {
        id: q.id,
        questionText: q.questionText,
        options: q.options as string[],
        correctAnswer: q.correctAnswer,
        section: q.section,
        difficulty: q.difficulty,
      };

      if (!lean) {
        return { ...base, explanation: q.explanation };
      }
      return base;
    });

    // 2. If short, fill with samples (to ensure user always gets a test immediately)
    const remaining = count - questions.length;
    if (remaining > 0) {
      const samples = generateSampleQuestions(section, difficulty, remaining);
      questions.push(...samples.map(q => {
        if (lean) {
          const { explanation, ...rest } = q;
          return rest;
        }
        return q;
      }));
    }

    return questions;
  });

  const results = await Promise.all(sectionPromises);
  for (const qs of results) {
    allQuestions.push(...qs);
  }

  // Shuffle
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  return allQuestions.slice(0, questionCount);
}

/**
 * Background Replenisher
 * This function is meant to be called asynchronously (not awaited)
 * It checks if cache is low and triggers AI generation to refill it.
 */
export async function replenishQuestionCache(
  category: Category,
  level: Level,
  difficulty: Difficulty,
  sectionPractice?: Section
) {
  const distribution = SECTION_DISTRIBUTION[category];
  const sections = sectionPractice
    ? [sectionPractice]
    : (Object.keys(distribution) as Section[]);

  for (const section of sections) {
    try {
      // Check if we have enough questions in cache (threshold e.g. 50)
      const cached = await getCachedQuestions(category, level, section, difficulty, 50);

      if (cached.length < 50) {
        console.log(`[AI-REPLENISH] Low cache for ${section} (${cached.length}). Generating more...`);
        const generated = await generateQuestions(
          category,
          level,
          section,
          difficulty,
          20 // Generate in batches of 20
        );

        if (generated.length > 0) {
          await cacheQuestions(generated, category, level, section);
          console.log(`[AI-REPLENISH] Added ${generated.length} new questions to ${section} cache.`);
        }
      }
    } catch (err) {
      console.error(`[AI-REPLENISH] Failed for ${section}:`, err);
    }
  }
}

// Fallback sample questions when both cache and AI are empty
function generateSampleQuestions(
  section: Section,
  difficulty: Difficulty,
  count: number
): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  const diff = difficulty === "RANDOM" ? "MEDIUM" : difficulty;

  const samplesBySection: Record<Section, ExamQuestion[]> = {
    VERBAL: [
      {
        id: "s",
        questionText: "Choose the word most similar in meaning to 'EPHEMERAL':",
        options: ["Permanent", "Transient", "Sturdy", "Ancient"],
        correctAnswer: 1,
        section: "VERBAL",
        difficulty: diff,
        explanation: "Ephemeral means lasting for a very short time, synonymous with transient.",
      },
      {
        id: "s",
        questionText: "Select the correct sentence:",
        options: [
          "Neither the teacher nor the students was present.",
          "Neither the teacher nor the students were present.",
          "Neither the teacher nor the students has been present.",
          "Neither the teacher nor the students is present.",
        ],
        correctAnswer: 1,
        section: "VERBAL",
        difficulty: diff,
        explanation: "With 'neither...nor', the verb agrees with the nearer subject. 'Students' is plural, so 'were' is correct.",
      },
      {
        id: "s",
        questionText: "TACITURN is to LOQUACIOUS as PARSIMONIOUS is to:",
        options: ["Generous", "Frugal", "Wealthy", "Greedy"],
        correctAnswer: 0,
        section: "VERBAL",
        difficulty: diff,
        explanation: "Taciturn (quiet) is opposite of loquacious (talkative). Parsimonious (stingy) is opposite of generous.",
      },
    ],
    ANALYTICAL: [
      {
        id: "s",
        questionText: "If all Bloops are Razzles, and all Razzles are Lazzles, which must be true?",
        options: ["All Lazzles are Bloops", "All Bloops are Lazzles", "Some Lazzles are not Razzles", "No Bloops are Lazzles"],
        correctAnswer: 1,
        section: "ANALYTICAL",
        difficulty: diff,
        explanation: "Since Bloops ⊂ Razzles ⊂ Lazzles, all Bloops must also be Lazzles (transitive property).",
      },
      {
        id: "s",
        questionText: "If it rains, the ground gets wet. The ground is not wet. What can you conclude?",
        options: ["It is raining", "It is not raining", "The ground is dry because of the sun", "Nothing can be concluded"],
        correctAnswer: 1,
        section: "ANALYTICAL",
        difficulty: diff,
        explanation: "By contrapositive: If rain → wet ground, then not wet → not raining (modus tollens).",
      },
      {
        id: "s",
        questionText: "Five people (A, B, C, D, E) sit in a row. A is not at either end. D is at the right end. Who CANNOT sit at the left end?",
        options: ["B", "C", "A", "E"],
        correctAnswer: 2,
        section: "ANALYTICAL",
        difficulty: diff,
        explanation: "A cannot sit at either end as stated in the constraint.",
      },
    ],
    QUANTITATIVE: [
      {
        id: "s",
        questionText: "If 3x + 7 = 22, what is the value of x?",
        options: ["3", "5", "7", "15"],
        correctAnswer: 1,
        section: "QUANTITATIVE",
        difficulty: diff,
        explanation: "3x + 7 = 22 → 3x = 15 → x = 5.",
      },
      {
        id: "s",
        questionText: "A train travels 240 km in 3 hours. What is its speed in km/h?",
        options: ["60", "70", "80", "90"],
        correctAnswer: 2,
        section: "QUANTITATIVE",
        difficulty: diff,
        explanation: "Speed = Distance / Time = 240 / 3 = 80 km/h.",
      },
      {
        id: "s",
        questionText: "What is the probability of getting exactly 2 heads when flipping 3 fair coins?",
        options: ["1/8", "3/8", "1/2", "1/4"],
        correctAnswer: 1,
        section: "QUANTITATIVE",
        difficulty: diff,
        explanation: "Total outcomes = 8. Exactly 2 heads (HHT, HTH, THH) = 3. Probability = 3/8.",
      },
    ],
  };

  const samples = samplesBySection[section];
  for (let i = 0; i < count; i++) {
    const base = samples[i % samples.length];
    questions.push({
      ...base,
      id: `sample-${section.toLowerCase()}-${Date.now()}-${i}`,
    });
  }
  return questions;
}
