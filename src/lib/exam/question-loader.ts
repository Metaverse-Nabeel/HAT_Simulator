import type { Category, Level, Section, Difficulty } from "@prisma/client";
import type { ExamQuestion } from "@/types/exam";
import { SECTION_DISTRIBUTION } from "@/lib/constants/exam";
import { getCachedQuestions, cacheQuestions } from "./question-cache";
import { generateQuestions } from "@/lib/ai/generate-questions";

export async function loadQuestions(
  category: Category,
  level: Level,
  difficulty: Difficulty,
  questionCount: number,
  sectionPractice?: Section,
  excludeIds: string[] = []
): Promise<ExamQuestion[]> {
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

  const allQuestions: ExamQuestion[] = [];

  // Process sections in parallel
  const sectionPromises = sections.map(async ({ section, count }) => {
    // 1. Try cache first
    const cached = await getCachedQuestions(
      category,
      level,
      section,
      difficulty,
      count,
      excludeIds
    );

    const questions: ExamQuestion[] = cached.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options as string[],
      correctAnswer: q.correctAnswer,
      section: q.section,
      difficulty: q.difficulty,
      explanation: q.explanation,
    }));

    // 2. If shortfall, generate via Claude AI
    const shortfall = count - questions.length;
    if (shortfall > 0) {
      try {
        const generated = await generateQuestions(
          category,
          level,
          section,
          difficulty,
          shortfall
        );

        if (generated.length > 0) {
          // Cache for future use
          await cacheQuestions(generated, category, level, section);

          // Add to results
          questions.push(
            ...generated.map((g, i) => ({
              id: `gen-${section}-${Date.now()}-${i}`,
              questionText: g.questionText,
              options: g.options,
              correctAnswer: g.correctAnswer,
              section,
              difficulty: (g.difficulty as Difficulty) || difficulty,
              explanation: g.explanation,
            }))
          );
        }
      } catch (err) {
        console.error(`AI generation failed for ${section}, using samples:`, err);
      }
    }

    // 3. If still short (API failed + empty cache), fill with samples
    const remaining = count - questions.length;
    if (remaining > 0) {
      questions.push(...generateSampleQuestions(section, difficulty, remaining));
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
