"use client";

interface ExplanationPanelProps {
  explanation: string;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mt-6">
      <div className="flex items-start gap-3">
        <span className="text-xl">&#128161;</span>
        <div>
          <p className="text-xs font-semibold text-teal-700 mb-1.5">Explanation</p>
          <p className="text-sm text-navy-700 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
