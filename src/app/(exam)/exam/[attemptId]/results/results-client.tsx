"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_META, SECTION_LABELS } from "@/lib/constants/exam";
import type { QuestionResult } from "@/types/exam";
import type { Category, ExamMode, Section } from "@prisma/client";
import { Logo } from "@/components/layout/logo";

interface ResultsClientProps {
  attemptId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  timeLimit: number;
  category: Category;
  mode: ExamMode;
  results: QuestionResult[];
  xpEarned: number;
}

type ReviewFilter = "ALL" | "CORRECT" | "WRONG" | "SKIPPED";

export function ResultsClient({
  attemptId,
  score,
  maxScore,
  timeSpent,
  timeLimit,
  category,
  results,
  xpEarned,
}: ResultsClientProps) {
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const correct = results.filter((r) => r.userAnswer === r.correctAnswer).length;
  const wrong = results.filter((r) => r.userAnswer !== null && r.userAnswer !== r.correctAnswer).length;
  const skipped = results.filter((r) => r.userAnswer === null).length;

  // Section breakdowns
  const sectionData = (["VERBAL", "ANALYTICAL", "QUANTITATIVE"] as Section[]).map((section) => {
    const sectionResults = results.filter((r) => r.section === section);
    const sectionCorrect = sectionResults.filter((r) => r.userAnswer === r.correctAnswer).length;
    const sectionTotal = sectionResults.length;
    const sectionPct = sectionTotal > 0 ? Math.round((sectionCorrect / sectionTotal) * 100) : 0;
    const sectionTime = sectionResults.reduce((sum, r) => sum + r.timeTaken, 0);
    return { section, correct: sectionCorrect, total: sectionTotal, pct: sectionPct, time: sectionTime };
  });

  const sectionColors: Record<Section, string> = {
    VERBAL: "bg-teal-500",
    ANALYTICAL: "bg-amber-400",
    QUANTITATIVE: "bg-blue-500",
  };

  const performanceMessage =
    pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort!" : pct >= 40 ? "Keep practicing!" : "Don't give up!";

  const filteredResults = results.filter((r) => {
    if (filter === "CORRECT") return r.userAnswer === r.correctAnswer;
    if (filter === "WRONG") return r.userAnswer !== null && r.userAnswer !== r.correctAnswer;
    if (filter === "SKIPPED") return r.userAnswer === null;
    return true;
  });

  const avgTime = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.timeTaken, 0) / results.length) : 0;

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-white border-b border-navy-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo />
          <Link
            href="/dashboard"
            className="text-sm font-medium text-navy-600 hover:text-navy-900 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 lg:p-8">
        {/* Score Hero */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8 mb-6 text-center">
          {/* Score donut */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#d9e2ec" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={pct >= 60 ? "#319795" : pct >= 40 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={`${(pct / 100) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-navy-900">{pct}%</span>
              <span className="text-xs text-navy-500">Score</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-navy-900 mb-1">{performanceMessage}</h1>
          <p className="text-navy-500 text-sm mb-6">
            {CATEGORY_META[category].label} - {score}/{maxScore} questions correct
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-xs text-navy-500 mb-1">Correct</p>
              <p className="text-xl font-bold text-green-600">{correct}</p>
            </div>
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-xs text-navy-500 mb-1">Wrong</p>
              <p className="text-xl font-bold text-red-500">{wrong}</p>
            </div>
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-xs text-navy-500 mb-1">Skipped</p>
              <p className="text-xl font-bold text-navy-400">{skipped}</p>
            </div>
            <div className="bg-navy-50 rounded-xl p-4">
              <p className="text-xs text-navy-500 mb-1">XP Earned</p>
              <p className="text-xl font-bold text-amber-500">+{xpEarned}</p>
            </div>
          </div>
        </div>

        {/* Section Breakdown + Time Analysis */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
            <h2 className="font-bold text-navy-900 mb-5">Section Breakdown</h2>
            <div className="space-y-5">
              {sectionData.map((s) => (
                <div key={s.section}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${sectionColors[s.section]}`} />
                      <span className="text-sm font-medium text-navy-700">{SECTION_LABELS[s.section]}</span>
                    </div>
                    <span className="text-sm font-bold text-navy-900">
                      {s.correct}/{s.total} ({s.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-navy-100 rounded-full h-3">
                    <div className={`${sectionColors[s.section]} h-3 rounded-full`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
            <h2 className="font-bold text-navy-900 mb-5">Time Analysis</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-navy-600">Total Time Used</span>
                <span className="text-sm font-bold text-navy-900">
                  {formatDuration(timeSpent)} / {formatDuration(timeLimit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-navy-600">Avg. per Question</span>
                <span className="text-sm font-bold text-navy-900">{formatDuration(avgTime)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {sectionData.map((s) => {
                const timePct = timeSpent > 0 ? Math.round((s.time / timeSpent) * 100) : 0;
                return (
                  <div key={s.section} className="flex items-center justify-between">
                    <span className="text-sm text-navy-600">{SECTION_LABELS[s.section].split(" ")[0]}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-navy-100 rounded-full h-2">
                        <div className={`${sectionColors[s.section]} h-2 rounded-full`} style={{ width: `${timePct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-navy-700 w-12 text-right">{formatDuration(s.time)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            href="/exam/setup"
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl text-sm font-semibold transition text-center"
          >
            Take Another Exam
          </Link>
          <Link
            href={`/api/reports/${attemptId}`}
            className="flex-1 border border-navy-200 text-navy-700 py-3 rounded-xl text-sm font-medium hover:bg-navy-50 transition text-center"
          >
            Download PDF Report
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 border border-navy-200 text-navy-700 py-3 rounded-xl text-sm font-medium hover:bg-navy-50 transition text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-navy-900">Answer Review</h2>
            <div className="flex gap-2">
              {(["ALL", "CORRECT", "WRONG", "SKIPPED"] as ReviewFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f ? "bg-teal-50 text-teal-700" : "text-navy-500 hover:bg-navy-50"
                  }`}
                >
                  {f === "ALL" ? `All (${results.length})` : f === "CORRECT" ? `Correct (${correct})` : f === "WRONG" ? `Wrong (${wrong})` : `Skipped (${skipped})`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredResults.map((r, idx) => {
              const isCorrect = r.userAnswer === r.correctAnswer;
              const isSkipped = r.userAnswer === null;
              const expanded = expandedQuestion === idx;
              const originalIndex = results.indexOf(r);

              return (
                <div key={idx} className="border border-navy-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(expanded ? null : idx)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-navy-50/50 transition"
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSkipped ? "bg-navy-100 text-navy-500" : isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {originalIndex + 1}
                    </span>
                    <span className="text-sm text-navy-800 flex-1 truncate">{r.questionText}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      isSkipped ? "bg-navy-100 text-navy-500" : isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
                    </span>
                    <svg className={`w-4 h-4 text-navy-400 transition ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 border-t border-navy-100">
                      <p className="text-sm text-navy-800 mt-3 mb-4">{r.questionText}</p>
                      <div className="space-y-2 mb-4">
                        {r.options.map((opt, oi) => {
                          const isCorrectOpt = oi === r.correctAnswer;
                          const isUserOpt = oi === r.userAnswer;
                          let optClass = "border-navy-100 text-navy-600";
                          if (isCorrectOpt) optClass = "border-green-300 bg-green-50 text-green-800";
                          else if (isUserOpt) optClass = "border-red-300 bg-red-50 text-red-800";

                          return (
                            <div key={oi} className={`flex items-center gap-3 p-3 rounded-lg border ${optClass} text-sm`}>
                              <span className="font-bold">{String.fromCharCode(65 + oi)}.</span>
                              <span>{opt}</span>
                              {isCorrectOpt && <span className="ml-auto text-green-600 text-xs font-medium">Correct</span>}
                              {isUserOpt && !isCorrectOpt && <span className="ml-auto text-red-600 text-xs font-medium">Your answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">&#128161;</span>
                          <div>
                            <p className="text-xs font-semibold text-teal-700 mb-1">Explanation</p>
                            <p className="text-sm text-navy-700">{r.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}
