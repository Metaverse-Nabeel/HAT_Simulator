import { gemini } from "./client";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import type { Category, Level, Section, Difficulty } from "@prisma/client";

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export async function generateQuestions(
  category: Category,
  level: Level,
  section: Section,
  difficulty: Difficulty,
  count: number,
  retries = 2
): Promise<GeneratedQuestion[]> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildUserPrompt(category, level, section, difficulty, count),
        config: {
          systemInstruction: buildSystemPrompt(),
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "";

      // Strip markdown code fences if present just in case the model wraps the output
      const cleaned = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed: GeneratedQuestion[] = JSON.parse(cleaned);

      // Validate
      const valid = parsed.filter(
        (q) =>
          q.questionText &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "number" &&
          q.correctAnswer >= 0 &&
          q.correctAnswer <= 3 &&
          q.explanation
      );

      if (valid.length > 0) {
        return valid.slice(0, count);
      }
    } catch (err) {
      console.error(`Question generation attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) throw err;
    }
  }

  return [];
}
