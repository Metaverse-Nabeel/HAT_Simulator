import { GoogleGenAI } from "@google/genai";

const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenAI | undefined;
};

// Initialize the Bonsai Frontier model client (Gemini)
export const gemini =
  globalForGemini.gemini ??
  new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // User will need to provide GEMINI_API_KEY in .env

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini;
