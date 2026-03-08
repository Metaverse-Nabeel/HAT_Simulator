import { useReducer } from "react";
import type { ExamState, ExamAction, ExamQuestion } from "@/types/exam";

function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case "SET_ANSWER": {
      if (state.isSubmitted) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionIndex]: action.optionIndex },
      };
    }
    case "TOGGLE_MARK_REVIEW": {
      const next = new Set(state.markedForReview);
      if (next.has(action.questionIndex)) {
        next.delete(action.questionIndex);
      } else {
        next.add(action.questionIndex);
      }
      return { ...state, markedForReview: next };
    }
    case "GO_TO_QUESTION": {
      const now = Date.now();
      return {
        ...state,
        currentIndex: Math.max(0, Math.min(action.index, state.questions.length - 1)),
        questionTimestamps: { ...state.questionTimestamps, [action.index]: now },
      };
    }
    case "NEXT": {
      if (state.currentIndex >= state.questions.length - 1) return state;
      const nextIdx = state.currentIndex + 1;
      const now = Date.now();
      return {
        ...state,
        currentIndex: nextIdx,
        questionTimestamps: { ...state.questionTimestamps, [nextIdx]: now },
      };
    }
    case "PREV": {
      if (state.currentIndex <= 0) return state;
      const prevIdx = state.currentIndex - 1;
      const now = Date.now();
      return {
        ...state,
        currentIndex: prevIdx,
        questionTimestamps: { ...state.questionTimestamps, [prevIdx]: now },
      };
    }
    case "TICK_TIMER": {
      if (state.isSubmitted) return state;
      const next = state.timeRemaining - 1;
      if (next <= 0) {
        return { ...state, timeRemaining: 0, isSubmitted: true };
      }
      return { ...state, timeRemaining: next };
    }
    case "SUBMIT": {
      return { ...state, isSubmitted: true };
    }
    default:
      return state;
  }
}

export function createInitialState(
  questions: ExamQuestion[],
  timeLimit: number
): ExamState {
  return {
    questions,
    currentIndex: 0,
    answers: {},
    markedForReview: new Set(),
    timeRemaining: timeLimit,
    questionTimestamps: { 0: Date.now() },
    startTime: Date.now(),
    isSubmitted: false,
  };
}

export function useExamReducer(questions: ExamQuestion[], timeLimit: number) {
  return useReducer(examReducer, { questions, timeLimit }, ({ questions, timeLimit }) =>
    createInitialState(questions, timeLimit)
  );
}
