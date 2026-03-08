import { useReducer } from "react";
import type { ExamQuestion } from "@/types/exam";

export interface LearningState {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<number, number>; // questionIndex → selected option
  revealed: Set<number>; // indices where answer has been revealed
  correctCount: number;
  isEnded: boolean;
}

export type LearningAction =
  | { type: "SELECT_ANSWER"; questionIndex: number; optionIndex: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "END_SESSION" };

function learningReducer(state: LearningState, action: LearningAction): LearningState {
  switch (action.type) {
    case "SELECT_ANSWER": {
      if (state.revealed.has(action.questionIndex) || state.isEnded) return state;
      const q = state.questions[action.questionIndex];
      const isCorrect = action.optionIndex === q.correctAnswer;
      const nextRevealed = new Set(state.revealed);
      nextRevealed.add(action.questionIndex);
      return {
        ...state,
        answers: { ...state.answers, [action.questionIndex]: action.optionIndex },
        revealed: nextRevealed,
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
      };
    }
    case "NEXT": {
      if (state.currentIndex >= state.questions.length - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    }
    case "PREV": {
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };
    }
    case "GO_TO_QUESTION": {
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, state.questions.length - 1)),
      };
    }
    case "END_SESSION": {
      return { ...state, isEnded: true };
    }
    default:
      return state;
  }
}

export function useLearningReducer(questions: ExamQuestion[]) {
  return useReducer(learningReducer, questions, (qs): LearningState => ({
    questions: qs,
    currentIndex: 0,
    answers: {},
    revealed: new Set<number>(),
    correctCount: 0,
    isEnded: false,
  }));
}
