import type { Category, Level, ExamMode, Difficulty, Section } from "@prisma/client";

export interface ExamConfig {
  category: Category;
  level: Level;
  mode: ExamMode;
  difficulty: Difficulty;
  questionCount: number;
  timeLimit: number; // seconds
  sectionPractice?: Section; // if set, only this section
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-3
  section: Section;
  difficulty: Difficulty;
  explanation: string;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  userAnswer: number | null;
  correctAnswer: number;
  section: Section;
  explanation: string;
  timeTaken: number; // seconds
}

export interface ExamState {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<number, number>; // questionIndex → optionIndex
  markedForReview: Set<number>;
  timeRemaining: number; // seconds
  questionTimestamps: Record<number, number>; // questionIndex → timestamp when navigated to
  startTime: number;
  isSubmitted: boolean;
}

export type ExamAction =
  | { type: "SET_ANSWER"; questionIndex: number; optionIndex: number }
  | { type: "TOGGLE_MARK_REVIEW"; questionIndex: number }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "TICK_TIMER" }
  | { type: "SUBMIT" };
