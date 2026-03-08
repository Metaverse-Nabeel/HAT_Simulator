import { PrismaClient, Category, Level, Difficulty, Section } from "@prisma/client";
import * as dotenv from "dotenv";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const prisma = new PrismaClient();

// Configuration
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const CATEGORIES: Category[] = ["HAT_I", "HAT_II", "HAT_III", "HAT_IV", "HAT_GENERAL"];
const LEVELS: Level[] = ["MS", "PHD"];
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD", "SUPER_HARD"];

const SECTION_DISTRIBUTION: Record<Category, Record<Section, number>> = {
    HAT_I: { VERBAL: 30, ANALYTICAL: 30, QUANTITATIVE: 40 },
    HAT_II: { VERBAL: 30, ANALYTICAL: 40, QUANTITATIVE: 30 },
    HAT_III: { VERBAL: 40, ANALYTICAL: 35, QUANTITATIVE: 25 },
    HAT_IV: { VERBAL: 40, ANALYTICAL: 30, QUANTITATIVE: 30 },
    HAT_GENERAL: { VERBAL: 40, ANALYTICAL: 30, QUANTITATIVE: 30 },
};

const SECTION_LABELS: Record<Section, string> = {
    VERBAL: "Verbal Reasoning",
    ANALYTICAL: "Analytical Reasoning",
    QUANTITATIVE: "Quantitative Reasoning",
};

function buildSystemPrompt(): string {
    return `You are an elite Question Engineer for Pakistan's HEC HAT (Higher Education Aptitude Test).
Graduate level aspirants (MS/MPhil/PhD). 4 options, exactly one correct.
Return ONLY a valid JSON array of questions.`;
}

function buildUserPrompt(section: Section, difficulty: string, count: number): string {
    return `Generate ${count} ${SECTION_LABELS[section]} questions. Difficulty: ${difficulty}.
Format: [{"questionText": "...", "options": ["A","B","C","D"], "correctAnswer": 0, "explanation": "..."}]`;
}

async function getQuestions(section: Section, difficulty: string, count: number): Promise<any[]> {
    const system = buildSystemPrompt();
    const user = buildUserPrompt(section, difficulty, count);

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "system", content: system }, { role: "user", content: user }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });
        const content = completion.choices[0]?.message?.content || "[]";
        const parsed: any = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : (parsed.questions || []);
    } catch (err: any) {
        console.error(`   ⚠️ Groq failed (${err.message}), trying Gemini...`);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`${system}\n\n${user}`);
        const text = result.response.text();
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed: any = JSON.parse(cleaned);
        return Array.isArray(parsed) ? parsed : (parsed.questions || []);
    }
}

async function main() {
    console.log("🚀 Starting Bulk Question Seeding...");

    for (const category of CATEGORIES) {
        for (const level of LEVELS) {
            for (const difficulty of DIFFICULTIES) {
                console.log(`\n📂 [${category}] [${level}] [${difficulty}]`);
                const sections = Object.keys(SECTION_DISTRIBUTION[category]) as Section[];

                for (const section of sections) {
                    const count = await prisma.question.count({
                        where: { category, level, difficulty, section }
                    });

                    const target = 100;
                    const needed = target - count;

                    if (needed <= 0) {
                        console.log(`✅ ${section}: Done (${count})`);
                        continue;
                    }

                    console.log(`📝 ${section}: Need ${needed}`);
                    let generated = 0;
                    while (generated < needed) {
                        const batch = Math.min(10, needed - generated);
                        try {
                            const qs = await getQuestions(section, difficulty, batch);
                            if (qs.length > 0) {
                                await prisma.question.createMany({
                                    data: qs.map(q => ({
                                        category, level, section,
                                        difficulty: difficulty as Difficulty,
                                        questionText: q.questionText,
                                        options: q.options,
                                        correctAnswer: q.correctAnswer,
                                        explanation: q.explanation
                                    }))
                                });
                                generated += qs.length;
                                console.log(`   + Added ${qs.length} (${generated}/${needed})`);
                            } else break;
                        } catch (e: any) {
                            console.error(`   ❌ Error: ${e.message}`);
                            break;
                        }
                    }
                }
            }
        }
    }
    console.log("\n🏁 Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
