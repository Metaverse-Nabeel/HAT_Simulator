"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamHeader } from "@/components/exam/exam-header";
import { OptionCard } from "@/components/exam/option-card";
import { ExplanationPanel } from "@/components/exam/explanation-panel";
import { QuestionNavigator } from "@/components/exam/question-navigator";
import { useLearningReducer } from "@/hooks/use-learning-reducer";
import { SECTION_LABELS } from "@/lib/constants/exam";
import type { ExamQuestion } from "@/types/exam";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect } from "react";

interface LearningClientProps {
  attemptId: string;
  questions: ExamQuestion[];
}

export function LearningClient({ attemptId, questions }: LearningClientProps) {
  const router = useRouter();
  const [state, dispatch] = useLearningReducer(questions);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});

  const currentQuestion = state.questions[state.currentIndex];
  const isRevealed = state.revealed.has(state.currentIndex);
  const answeredCount = Object.keys(state.answers).length;
  const progressPct = Math.round((answeredCount / state.questions.length) * 100);

  // Fetch explanation when revealed
  useEffect(() => {
    if (isRevealed && !explanations[currentQuestion.id] && !loadingExplanations[currentQuestion.id]) {
      // If it was already in the question object (e.g. from a sample), use it
      if (currentQuestion.explanation) {
        setExplanations(prev => ({ ...prev, [currentQuestion.id]: currentQuestion.explanation }));
        return;
      }

      const fetchExplanation = async () => {
        setLoadingExplanations(prev => ({ ...prev, [currentQuestion.id]: true }));
        try {
          const res = await fetch(`/api/questions/${currentQuestion.id}/explanation`);
          const data = await res.json();
          if (data.explanation) {
            setExplanations(prev => ({ ...prev, [currentQuestion.id]: data.explanation }));
          }
        } catch (error) {
          console.error("Failed to fetch explanation:", error);
        } finally {
          setLoadingExplanations(prev => ({ ...prev, [currentQuestion.id]: false }));
        }
      };

      fetchExplanation();
    }
  }, [isRevealed, currentQuestion.id, explanations, loadingExplanations, currentQuestion.explanation]);

  const endSession = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    dispatch({ type: "END_SESSION" });

    const results = state.questions.map((q, i) => ({
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      userAnswer: state.answers[i] ?? null,
      correctAnswer: q.correctAnswer,
      section: q.section,
      explanation: explanations[q.id] || q.explanation || "",
      timeTaken: 0,
    }));

    await fetch(`/api/exam/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results, timeSpent: 0 }),
    });

    router.push(`/exam/${attemptId}/results`);
  }, [submitting, state, attemptId, dispatch, router]);

  return (
    <div className="flex flex-col h-screen">
      <ExamHeader
        mode="LEARNING"
        currentQuestion={state.currentIndex}
        totalQuestions={state.questions.length}
        onSubmit={() => setShowEndDialog(true)}
      />

      {/* Progress bar */}
      <div className="px-4 pt-2 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-navy-100 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-navy-500 font-medium">{progressPct}%</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-navy-400">
            {state.correctCount} correct out of {answeredCount} answered
          </span>
          <span className="bg-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            Learning Mode
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl mx-auto">
            {/* Question header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-navy-900 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold">
                {state.currentIndex + 1}
              </span>
              <span className="text-sm text-navy-500">
                {SECTION_LABELS[currentQuestion.section]}
              </span>
            </div>

            {/* Question text */}
            <div className="mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-navy-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => (
                <OptionCard
                  key={i}
                  index={i}
                  text={opt}
                  selected={state.answers[state.currentIndex] === i}
                  revealed={isRevealed}
                  isCorrect={i === currentQuestion.correctAnswer}
                  isUserAnswer={state.answers[state.currentIndex] === i}
                  onClick={() =>
                    dispatch({
                      type: "SELECT_ANSWER",
                      questionIndex: state.currentIndex,
                      optionIndex: i,
                    })
                  }
                  disabled={isRevealed}
                />
              ))}
            </div>

            {/* Explanation */}
            {isRevealed && (
              <ExplanationPanel
                explanation={explanations[currentQuestion.id] || currentQuestion.explanation}
                loading={loadingExplanations[currentQuestion.id]}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => dispatch({ type: "PREV" })}
                disabled={state.currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => dispatch({ type: "NEXT" })}
                disabled={state.currentIndex === state.questions.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition disabled:opacity-40"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigator sidebar */}
        <div className="hidden lg:block w-72 border-l border-navy-100 bg-white p-5 overflow-y-auto">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Question Navigator</h3>
          <QuestionNavigator
            total={state.questions.length}
            currentIndex={state.currentIndex}
            answers={state.answers}
            markedForReview={new Set()}
            onGoTo={(i) => dispatch({ type: "GO_TO_QUESTION", index: i })}
          />
          <div className="mt-6 text-xs text-navy-500 space-y-1">
            <p>Answered: {answeredCount}/{state.questions.length}</p>
            <p>Correct: {state.correctCount}/{answeredCount}</p>
          </div>
        </div>
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="text-lg font-bold text-navy-900">End Learning Session?</DialogTitle>
          <DialogDescription className="text-navy-500 text-sm">
            You&apos;ve answered {answeredCount} of {state.questions.length} questions
            ({state.correctCount} correct). End the session and view your results?
          </DialogDescription>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowEndDialog(false)}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition"
            >
              Continue
            </button>
            <button
              onClick={endSession}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition disabled:opacity-50"
            >
              {submitting ? "Ending..." : "End Session"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
