"use client";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  answers: Record<number, number>;
  markedForReview: Set<number>;
  onGoTo: (index: number) => void;
}

export function QuestionNavigator({
  total,
  currentIndex,
  answers,
  markedForReview,
  onGoTo,
}: QuestionNavigatorProps) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-navy-500">
          <span className="w-3 h-3 rounded bg-teal-500" /> Answered
        </div>
        <div className="flex items-center gap-1.5 text-xs text-navy-500">
          <span className="w-3 h-3 rounded bg-amber-400" /> Review
        </div>
        <div className="flex items-center gap-1.5 text-xs text-navy-500">
          <span className="w-3 h-3 rounded bg-navy-200" /> Unanswered
        </div>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {Array.from({ length: total }, (_, i) => {
          const answered = i in answers;
          const marked = markedForReview.has(i);
          const current = i === currentIndex;

          let bg = "bg-navy-100 text-navy-600";
          if (marked) bg = "bg-amber-100 text-amber-700";
          if (answered) bg = "bg-teal-100 text-teal-700";
          if (current) bg += " ring-2 ring-navy-900";

          return (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition hover:opacity-80 ${bg}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
