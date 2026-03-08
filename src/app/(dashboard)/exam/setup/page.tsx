"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_META, DIFFICULTY_OPTIONS, SECTION_DISTRIBUTION } from "@/lib/constants/exam";
import type { Category, Level, ExamMode, Difficulty, Section } from "@prisma/client";

const categories: Category[] = ["HAT_I", "HAT_II", "HAT_III", "HAT_IV", "HAT_GENERAL"];
const sections: { value: Section; label: string }[] = [
  { value: "VERBAL", label: "Verbal" },
  { value: "ANALYTICAL", label: "Analytical" },
  { value: "QUANTITATIVE", label: "Quantitative" },
];

export default function ExamSetupPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("HAT_I");
  const [level, setLevel] = useState<Level>("MS");
  const [mode, setMode] = useState<ExamMode>("TESTING");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [questionCount, setQuestionCount] = useState(100);
  const [timeLimit, setTimeLimit] = useState(120); // minutes
  const [sectionPractice, setSectionPractice] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(false);

  const dist = SECTION_DISTRIBUTION[category];

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/exam/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          level,
          mode,
          difficulty,
          questionCount,
          timeLimit: timeLimit * 60,
          sectionPractice: sectionPractice ? selectedSection : undefined,
        }),
      });
      const data = await res.json();
      if (data.attemptId) {
        const route = mode === "TESTING" ? "testing" : "learning";
        router.push(`/exam/${data.attemptId}/${route}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Configure Your Exam</h1>
        <p className="text-navy-500 text-sm mt-1">
          Choose your category, level, mode, and customize your test settings.
        </p>
      </div>

      {/* Step 1: Category */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
          <h2 className="font-bold text-navy-900">Select Category</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const selected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-left border-2 rounded-xl p-4 transition ${
                  selected
                    ? "border-teal-500 bg-teal-50/50"
                    : "border-navy-200 hover:border-navy-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${meta.tagColor} text-white text-xs font-bold px-2.5 py-0.5 rounded-full`}>
                    {meta.tag}
                  </span>
                  {selected && (
                    <svg className="w-4 h-4 text-teal-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-semibold text-navy-900">{meta.label}</p>
                <p className="text-xs text-navy-500 mt-1">{meta.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 p-4 bg-navy-50 rounded-xl">
          <p className="text-xs text-navy-500 font-medium mb-2">
            Question Distribution for {CATEGORY_META[category].label}:
          </p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-500" />
              <span className="text-navy-700">Verbal: {dist.VERBAL}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span className="text-navy-700">Analytical: {dist.ANALYTICAL}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-navy-700">Quantitative: {dist.QUANTITATIVE}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Level & Mode */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
          <h2 className="font-bold text-navy-900">Level & Mode</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-3 block">Level</label>
            <div className="flex bg-navy-100 rounded-xl p-1">
              {(["MS", "PHD"] as Level[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                    level === l
                      ? "bg-white shadow-sm font-semibold text-navy-900"
                      : "text-navy-500 hover:text-navy-700"
                  }`}
                >
                  {l === "PHD" ? "PhD" : l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-navy-700 mb-3 block">Mode</label>
            <div className="flex bg-navy-100 rounded-xl p-1">
              {(["TESTING", "LEARNING"] as ExamMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition ${
                    mode === m
                      ? "bg-white shadow-sm font-semibold text-navy-900"
                      : "text-navy-500 hover:text-navy-700"
                  }`}
                >
                  {m === "TESTING" ? "Testing" : "Learning"}
                </button>
              ))}
            </div>
            <p className="text-xs text-navy-400 mt-2">
              {mode === "TESTING"
                ? "Timed exam, results shown at end."
                : "Self-paced with instant feedback."}
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Difficulty */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
          <h2 className="font-bold text-navy-900">Difficulty</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {DIFFICULTY_OPTIONS.map((d) => {
            const selected = difficulty === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value as Difficulty)}
                className={`px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  selected ? d.color : "border-navy-200 text-navy-700 hover:border-navy-300"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 4: Customize */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</div>
          <h2 className="font-bold text-navy-900">Customize (Optional)</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-navy-700 mb-2 block">Number of Questions</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={questionCount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setQuestionCount(v);
                  setTimeLimit(Math.round((v / 100) * 120));
                }}
                className="flex-1 accent-teal-500"
              />
              <span className="text-lg font-bold text-navy-900 w-12 text-right">{questionCount}</span>
            </div>
            <p className="text-xs text-navy-400 mt-1">Min: 10, Max: 100</p>
          </div>

          <div>
            <label className="text-sm font-medium text-navy-700 mb-2 block">Time Limit (minutes)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="flex-1 accent-teal-500"
                disabled={mode === "LEARNING"}
              />
              <span className="text-lg font-bold text-navy-900 w-12 text-right">
                {mode === "LEARNING" ? "--" : timeLimit}
              </span>
            </div>
            <p className="text-xs text-navy-400 mt-1">
              {mode === "LEARNING" ? "No time limit in learning mode" : "Auto-scales with question count"}
            </p>
          </div>
        </div>

        {/* Section Practice */}
        <div className="mt-6 pt-6 border-t border-navy-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-700">Section Practice Mode</p>
              <p className="text-xs text-navy-400 mt-0.5">Focus on a single section instead of a full exam</p>
            </div>
            <button
              onClick={() => {
                setSectionPractice(!sectionPractice);
                if (!sectionPractice) setSelectedSection("VERBAL");
              }}
              className={`relative w-11 h-6 rounded-full transition ${
                sectionPractice ? "bg-teal-500" : "bg-navy-200"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition ${
                  sectionPractice ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className={`mt-4 flex gap-3 ${!sectionPractice ? "opacity-40 pointer-events-none" : ""}`}>
            {sections.map((s) => (
              <button
                key={s.value}
                onClick={() => setSelectedSection(s.value)}
                className={`flex-1 text-center py-3 rounded-xl border-2 text-sm font-medium transition ${
                  selectedSection === s.value && sectionPractice
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-navy-200 text-navy-600 hover:border-navy-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary & Start */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6">
        <h2 className="font-bold text-navy-900 mb-4">Exam Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <SummaryItem label="Category" value={CATEGORY_META[category].label} />
          <SummaryItem label="Level" value={level === "PHD" ? "PhD" : "MS"} />
          <SummaryItem label="Questions" value={String(questionCount)} />
          <SummaryItem label="Time" value={mode === "LEARNING" ? "Unlimited" : `${timeLimit} min`} />
        </div>
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white py-4 rounded-xl text-base font-semibold transition shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            "Preparing exam..."
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Exam
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-navy-50 rounded-xl p-3 text-center">
      <p className="text-xs text-navy-500">{label}</p>
      <p className="text-sm font-bold text-navy-900 mt-1">{value}</p>
    </div>
  );
}
