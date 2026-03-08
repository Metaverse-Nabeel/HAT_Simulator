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

  // Determine section order: Default to typical HAT order
  const sectionOrder: Section[] = sectionPractice
    ? [sectionPractice]
    : ["VERBAL", "ANALYTICAL", "QUANTITATIVE"];

  // Process sections in specific order
  for (const section of sectionOrder) {
    const config = sections.find(s => s.section === section);
    if (!config) continue;

    const { count } = config;

    // 1. STRICT CACHE FIRST
    const cached = await getCachedQuestions(
      category,
      level,
      section,
      difficulty,
      count,
      excludeIds
    );

    // Shuffle cached questions in-memory to add variety within the section
    const shuffledCached = [...cached].sort(() => Math.random() - 0.5);

    const questions: LeanExamQuestion[] = shuffledCached.map((q) => {
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

    // 2. If short, fill with samples
    const remaining = count - questions.length;
    if (remaining > 0) {
      const samples = generateSampleQuestions(section, difficulty, remaining);
      questions.push(...samples);
    }

    allQuestions.push(...questions);
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
      // Check if we have enough questions in cache (threshold e.g. 200 for deep variety)
      const cached = await getCachedQuestions(category, level, section, difficulty, 200);

      if (cached.length < 200) {
        console.log(`[AI-REPLENISH] Low cache for ${section} (${cached.length}). Generating more...`);
        const generated = await generateQuestions(
          category,
          level,
          section,
          difficulty,
          50 // Generate in batches of 50 for efficiency
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
      { id: "s1", questionText: "Choose the word most similar in meaning to 'EPHEMERAL':", options: ["Permanent", "Transient", "Sturdy", "Ancient"], correctAnswer: 1, section: "VERBAL", difficulty: diff, explanation: "Ephemeral means lasting for a very short time." },
      { id: "s2", questionText: "Select the correct sentence:", options: ["Neither the teacher nor the students was present.", "Neither the teacher nor the students were present.", "Neither the teacher nor the students has been present.", "Neither the teacher nor the students is present."], correctAnswer: 1, section: "VERBAL", difficulty: diff, explanation: "With 'neither...nor', verb agrees with nearer subject." },
      { id: "s3", questionText: "TACITURN is to LOQUACIOUS as PARSIMONIOUS is to:", options: ["Generous", "Frugal", "Wealthy", "Greedy"], correctAnswer: 0, section: "VERBAL", difficulty: diff, explanation: "Opposite analogy." },
      { id: "s4", questionText: "Choose the synonym for 'OBDURATE':", options: ["Flexible", "Stubborn", "Fragile", "Swift"], correctAnswer: 1, section: "VERBAL", difficulty: diff, explanation: "Obdurate means stubbornly refusing to change." },
      { id: "s5", questionText: "Select the antonym for 'EBULLIENT':", options: ["Jubilant", "Depressed", "Enthusiastic", "Radiant"], correctAnswer: 1, section: "VERBAL", difficulty: diff, explanation: "Ebullient means cheerful and full of energy." },
      { id: "s6", questionText: "Identify the correctly spelled word:", options: ["Accomodate", "Accommodate", "Acomodate", "Accomoddat"], correctAnswer: 1, section: "VERBAL", difficulty: diff, explanation: "Correct spelling is double 'c' and double 'm'." },
      { id: "s7", questionText: "Fill in the blank: The meeting has been ____ until next Monday.", options: ["Put off", "Put on", "Put out", "Put by"], correctAnswer: 0, section: "VERBAL", difficulty: diff, explanation: "'Put off' means to postpone." },
      { id: "s8", questionText: "Complete the analogy: BREAD is to FLOUR as BUTTER is to:", options: ["Milk", "Wheat", "Oil", "Water"], correctAnswer: 0, section: "VERBAL", difficulty: diff, explanation: "Flour is the main ingredient of bread, milk is for butter." }
    ],
    ANALYTICAL: [
      { id: "s1", questionText: "If all Bloops are Razzles, and all Razzles are Lazzles, which must be true?", options: ["All Lazzles are Bloops", "All Bloops are Lazzles", "Some Lazzles are not Razzles", "No Bloops are Lazzles"], correctAnswer: 1, section: "ANALYTICAL", difficulty: diff, explanation: "Transitive property of sets." },
      { id: "s2", questionText: "If it rains, the ground gets wet. The ground is not wet. Conclusion:", options: ["It is raining", "It is not raining", "Ground is dry", "No conclusion"], correctAnswer: 1, section: "ANALYTICAL", difficulty: diff, explanation: "Modus tollens logic." },
      { id: "s3", questionText: "A is taller than B. C is taller than A. Who is the shortest?", options: ["A", "B", "C", "Cannot tell"], correctAnswer: 1, section: "ANALYTICAL", difficulty: diff, explanation: "B < A < C, so B is shortest." },
      { id: "s4", questionText: "If P > Q and Q > R, then:", options: ["P < R", "P = R", "P > R", "Q < R"], correctAnswer: 2, section: "ANALYTICAL", difficulty: diff, explanation: "Transitive comparison." },
      { id: "s5", questionText: "Six friends sit in a circle. If A sits opposite B, and C sits next to A, can C be opposite B?", options: ["Yes", "No", "Depends", "Always"], correctAnswer: 1, section: "ANALYTICAL", difficulty: diff, explanation: "A and B are already opposites." },
      { id: "s6", questionText: "In a family of four, X is Y's brother. Z is Y's father. W is Z's wife. W is X's:", options: ["Sister", "Aunt", "Mother", "Cousin"], correctAnswer: 2, section: "ANALYTICAL", difficulty: diff, explanation: "Logic based on family relations." },
      { id: "s7", questionText: "Which number comes next: 2, 4, 8, 16, ...?", options: ["20", "24", "32", "64"], correctAnswer: 2, section: "ANALYTICAL", difficulty: diff, explanation: "Geometric progression (x2)." },
      { id: "s8", questionText: "If RED is coded as 360, what is BLUE coded as? (R=18, E=5, D=4; product is 360)", options: ["480", "1200", "1000", "200"], correctAnswer: 0, section: "ANALYTICAL", difficulty: diff, explanation: "B=2, L=12, U=21, E=5. Product = 2*12*21*5 = 2520." }
    ],
    QUANTITATIVE: [
      { id: "s1", questionText: "If 3x + 7 = 22, what is the value of x?", options: ["3", "5", "7", "15"], correctAnswer: 1, section: "QUANTITATIVE", difficulty: diff, explanation: "3x = 15, x = 5." },
      { id: "s2", questionText: "A train travels 240 km in 3 hours. Speed in km/h?", options: ["60", "70", "80", "90"], correctAnswer: 2, section: "QUANTITATIVE", difficulty: diff, explanation: "D/T = 240/3 = 80." },
      { id: "s3", questionText: "What is 15% of 200?", options: ["15", "20", "30", "45"], correctAnswer: 2, section: "QUANTITATIVE", difficulty: diff, explanation: "0.15 * 200 = 30." },
      { id: "s4", questionText: "Solve: (2/5) + (1/10) =", options: ["3/15", "3/10", "1/2", "3/5"], correctAnswer: 2, section: "QUANTITATIVE", difficulty: diff, explanation: "4/10 + 1/10 = 5/10 = 1/2." },
      { id: "s5", questionText: "The area of a square is 64. What is its perimeter?", options: ["8", "16", "32", "64"], correctAnswer: 2, section: "QUANTITATIVE", difficulty: diff, explanation: "Side = 8, Perimeter = 32." },
      { id: "s6", questionText: "If a car is $20,000 and the price increases by 10%, new price?", options: ["$21,000", "$22,000", "$23,000", "$24,000"], correctAnswer: 1, section: "QUANTITATIVE", difficulty: diff, explanation: "20,000 + 2,000 = 22,000." },
      { id: "s7", questionText: "Average of 10, 20, 30, 40, 50?", options: ["25", "30", "35", "20"], correctAnswer: 1, section: "QUANTITATIVE", difficulty: diff, explanation: "Middle value of arithmetic sequence." },
      { id: "s8", questionText: "What is 2^5?", options: ["10", "16", "32", "64"], correctAnswer: 2, section: "QUANTITATIVE", difficulty: diff, explanation: "2*2*2*2*2 = 32." }
    ],
  };

  const samples = samplesBySection[section];
  // Shuffle samples to avoid picking same order every time
  const shuffledSamples = [...samples].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const base = shuffledSamples[i % shuffledSamples.length];
    questions.push({
      ...base,
      id: `sample-${section.toLowerCase()}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
    });
  }
  return questions;
}
