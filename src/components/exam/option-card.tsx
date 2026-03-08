"use client";

interface OptionCardProps {
  index: number;
  text: string;
  selected: boolean;
  revealed?: boolean;
  isCorrect?: boolean;
  isUserAnswer?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function OptionCard({
  index,
  text,
  selected,
  revealed,
  isCorrect,
  isUserAnswer,
  onClick,
  disabled,
}: OptionCardProps) {
  let borderClass = "border-navy-200 hover:border-navy-300";
  let bgClass = "";
  let letterBg = "bg-navy-100 text-navy-600";

  if (revealed) {
    if (isCorrect) {
      borderClass = "border-green-400";
      bgClass = "bg-green-50";
      letterBg = "bg-green-500 text-white";
    } else if (isUserAnswer && !isCorrect) {
      borderClass = "border-red-400";
      bgClass = "bg-red-50";
      letterBg = "bg-red-500 text-white";
    } else {
      borderClass = "border-navy-100";
      bgClass = "opacity-60";
    }
  } else if (selected) {
    borderClass = "border-teal-500";
    bgClass = "bg-teal-50/50";
    letterBg = "bg-teal-500 text-white";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || revealed}
      className={`w-full text-left border-2 rounded-xl p-4 flex items-start gap-4 transition ${borderClass} ${bgClass} ${
        disabled ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${letterBg}`}>
        {OPTION_LETTERS[index]}
      </span>
      <span className="text-sm text-navy-800 pt-1">{text}</span>
    </button>
  );
}
