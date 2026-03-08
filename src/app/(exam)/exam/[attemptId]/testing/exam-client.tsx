"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamHeader } from "@/components/exam/exam-header";
import { QuestionDisplay } from "@/components/exam/question-display";
import { OptionCard } from "@/components/exam/option-card";
import { QuestionNavigator } from "@/components/exam/question-navigator";
import { SubmitDialog } from "@/components/exam/submit-dialog";
import { TimeWarningDialog } from "@/components/exam/time-warning-dialog";
import { useExamReducer } from "@/hooks/use-exam-reducer";
import type { ExamQuestion } from "@/types/exam";

interface ExamClientProps {
  attemptId: string;
  questions: ExamQuestion[];
  timeLimit: number;
}

export function ExamClient({ attemptId, questions, timeLimit }: ExamClientProps) {
  const router = useRouter();
  const [state, dispatch] = useExamReducer(questions, timeLimit);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeWarningShown, setTimeWarningShown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = state.questions[state.currentIndex];
  const answeredCount = Object.keys(state.answers).length;
  const unansweredCount = state.questions.length - answeredCount;
  const markedCount = state.markedForReview.size;

  // Timer
  useEffect(() => {
    if (state.isSubmitted) return;
    const interval = setInterval(() => {
      dispatch({ type: "TICK_TIMER" });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isSubmitted, dispatch]);

  // 5 minute warning
  useEffect(() => {
    if (state.timeRemaining <= 300 && !timeWarningShown && !state.isSubmitted) {
      setShowTimeWarning(true);
      setTimeWarningShown(true);
    }
  }, [state.timeRemaining, timeWarningShown, state.isSubmitted]);

  // Auto-submit when time runs out
  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    dispatch({ type: "SUBMIT" });

    const results = state.questions.map((q, i) => {
      const prevTimestamp = state.questionTimestamps[i] ?? state.startTime;
      const nextTimestamp = state.questionTimestamps[i + 1] ?? Date.now();
      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        userAnswer: state.answers[i] ?? null,
        correctAnswer: q.correctAnswer,
        section: q.section,
        explanation: q.explanation,
        timeTaken: Math.round((nextTimestamp - prevTimestamp) / 1000),
      };
    });

    await fetch(`/api/exam/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        results,
        timeSpent: timeLimit - state.timeRemaining,
      }),
    });

    router.push(`/exam/${attemptId}/results`);
  }, [submitting, state, attemptId, timeLimit, dispatch, router]);

  useEffect(() => {
    if (state.isSubmitted && state.timeRemaining <= 0 && !submitting) {
      submitExam();
    }
  }, [state.isSubmitted, state.timeRemaining, submitting, submitExam]);

  const timerProgress = timeLimit > 0 ? (state.timeRemaining / timeLimit) * 100 : 100;
  const timerBarColor =
    state.timeRemaining <= 300
      ? "bg-red-500"
      : state.timeRemaining <= 600
      ? "bg-amber-500"
      : "bg-green-500";

  return (
    <div className="flex flex-col h-screen">
      <ExamHeader
        mode="TESTING"
        timeRemaining={state.timeRemaining}
        currentQuestion={state.currentIndex}
        totalQuestions={state.questions.length}
        onSubmit={() => setShowSubmitDialog(true)}
      />

      {/* Timer progress bar */}
      <div className="px-4 pt-2 bg-white">
        <div className="w-full bg-navy-100 rounded-full h-1.5">
          <div
            className={`${timerBarColor} h-1.5 rounded-full transition-all`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-3xl mx-auto">
            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-navy-900 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold">
                  {state.currentIndex + 1}
                </span>
                <QuestionDisplay
                  index={state.currentIndex}
                  questionText=""
                  section={currentQuestion.section}
                />
              </div>
              <button
                onClick={() => dispatch({ type: "TOGGLE_MARK_REVIEW", questionIndex: state.currentIndex })}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition ${
                  state.markedForReview.has(state.currentIndex)
                    ? "text-amber-600 bg-amber-50"
                    : "text-navy-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <svg className="w-4 h-4" fill={state.markedForReview.has(state.currentIndex) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Mark for Review
              </button>
            </div>

            {/* Question text */}
            <div className="mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-navy-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-10">
              {currentQuestion.options.map((opt, i) => (
                <OptionCard
                  key={i}
                  index={i}
                  text={opt}
                  selected={state.answers[state.currentIndex] === i}
                  onClick={() =>
                    dispatch({ type: "SET_ANSWER", questionIndex: state.currentIndex, optionIndex: i })
                  }
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
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
            markedForReview={state.markedForReview}
            onGoTo={(i) => dispatch({ type: "GO_TO_QUESTION", index: i })}
          />
          <div className="mt-6 text-xs text-navy-500 space-y-1">
            <p>Answered: {answeredCount}/{state.questions.length}</p>
            <p>Marked for Review: {markedCount}</p>
            <p>Unanswered: {unansweredCount}</p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SubmitDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onSubmit={submitExam}
        answered={answeredCount}
        unanswered={unansweredCount}
        marked={markedCount}
        submitting={submitting}
      />
      <TimeWarningDialog
        open={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        unanswered={unansweredCount}
        timeRemaining={state.timeRemaining}
      />
    </div>
  );
}
