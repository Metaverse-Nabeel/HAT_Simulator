import { gemini, groq } from "./client";
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
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(category, level, section, difficulty, count);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let text = "";

      // Attempt 1 & 2: Use Groq (Llama 3.3 70B is elite for reasoning)
      // Attempt 3: Use Gemini as fallback
      if (attempt < 2 && process.env.GROQ_API_KEY) {
        try {
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" },
          });
          text = completion.choices[0]?.message?.content || "";
        } catch (groqErr) {
          console.error("Groq generation failed, falling back to Gemini:", groqErr);
          // Don't throw, let it fall through to Gemini logic or next retry
        }
      }

      if (!text) {
        const response = await gemini.models.generateContent({
          model: "gemini-2.0-flash", // Corrected model name
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
          }
        });
        text = response.text || "";
      }

      const cleaned = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Some models might wrap the array in an object like { "questions": [...] }
      let parsed: any = JSON.parse(cleaned);
      if (!Array.isArray(parsed) && parsed.questions) {
        parsed = parsed.questions;
      }

      if (!Array.isArray(parsed)) {
        throw new Error("Generated content is not an array");
      }

      const valid = parsed.filter(
        (q: any) =>
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
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error(`Question generation attempt ${attempt + 1} failed:`, errorMsg);

      // If we've exhausted all retries, throw a descriptive error for the UI
      if (attempt === retries) {
        if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("exhausted") || errorMsg.includes("rate limit")) {
          throw new Error("AI engine is currently at capacity (Quota Exhausted). Using backup pool...");
        }
        throw new Error(`AI Generation failed after ${retries + 1} attempts: ${errorMsg}`);
      }
    }
  }

  return [];
}
