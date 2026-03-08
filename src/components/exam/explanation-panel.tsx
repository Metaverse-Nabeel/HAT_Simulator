"use client";

interface ExplanationPanelProps {
  explanation?: string;
  loading?: boolean;
}

export function ExplanationPanel({ explanation, loading }: ExplanationPanelProps) {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mt-6 min-h-[100px] flex items-center">
      {loading ? (
        <div className="flex items-center gap-3 w-full animate-pulse">
          <div className="w-6 h-6 bg-teal-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-teal-100 rounded w-1/4" />
            <div className="h-2 bg-teal-50 rounded w-3/4" />
            <div className="h-2 bg-teal-50 rounded w-1/2" />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <span className="text-xl">&#128161;</span>
          <div>
            <p className="text-xs font-semibold text-teal-700 mb-1.5">Explanation</p>
            <p className="text-sm text-navy-700 leading-relaxed">
              {explanation || "No explanation available for this question."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
