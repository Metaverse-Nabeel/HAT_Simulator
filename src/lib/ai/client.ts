import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const globalForAI = globalThis as unknown as {
  gemini: GoogleGenAI | undefined;
  groq: Groq | undefined;
};

// Initialize Gemini (Bonsai Frontier)
export const gemini =
  globalForAI.gemini ??
  new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Groq (High-performance inference)
export const groq =
  globalForAI.groq ??
  new Groq({ apiKey: process.env.GROQ_API_KEY }); // User will need to provide GROQ_API_KEY in .env

if (process.env.NODE_ENV !== "production") {
  globalForAI.gemini = gemini;
  globalForAI.groq = groq;
}
