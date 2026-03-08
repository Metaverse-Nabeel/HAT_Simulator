"use client";

import { Logo } from "@/components/layout/logo";

interface ExamHeaderProps {
  mode: "TESTING" | "LEARNING";
  timeRemaining?: number;
  currentQuestion: number;
  totalQuestions: number;
  onSubmit: () => void;
}

export function ExamHeader({
  mode,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  onSubmit,
}: ExamHeaderProps) {
  const timerColor =
    timeRemaining !== undefined
      ? timeRemaining <= 300
        ? "text-red-500"
        : timeRemaining <= 600
        ? "text-amber-500"
        : "text-navy-900"
      : "";

  return (
    <header className="bg-white border-b border-navy-100 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo />

        <div className="flex items-center gap-4 sm:gap-6">
          {mode === "TESTING" && timeRemaining !== undefined && (
            <div className={`text-lg sm:text-xl font-mono font-bold ${timerColor}`}>
              {formatTime(timeRemaining)}
            </div>
          )}

          {mode === "LEARNING" && (
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
              Self-Paced
            </span>
          )}

          <span className="text-sm text-navy-500">
            {currentQuestion + 1} / {totalQuestions}
          </span>

          <button
            onClick={onSubmit}
            className="bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            {mode === "TESTING" ? "Submit" : "End Session"}
          </button>
        </div>
      </div>
    </header>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
