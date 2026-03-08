"use client";

import { SECTION_LABELS } from "@/lib/constants/exam";
import type { Section } from "@prisma/client";

interface QuestionDisplayProps {
  index: number;
  questionText: string;
  section: Section;
}

export function QuestionDisplay({ index, questionText, section }: QuestionDisplayProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-navy-100 text-navy-600 px-2.5 py-0.5 rounded text-xs font-medium">
          {SECTION_LABELS[section]}
        </span>
        <span className="text-xs text-navy-400">Question {index + 1}</span>
      </div>
      <p className="text-lg text-navy-900 font-medium leading-relaxed">{questionText}</p>
    </div>
  );
}
