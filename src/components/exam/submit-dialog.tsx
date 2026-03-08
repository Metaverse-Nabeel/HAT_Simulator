"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SubmitDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  answered: number;
  unanswered: number;
  marked: number;
  submitting: boolean;
}

export function SubmitDialog({
  open,
  onClose,
  onSubmit,
  answered,
  unanswered,
  marked,
  submitting,
}: SubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-bold text-navy-900">Submit Exam?</DialogTitle>
        <DialogDescription className="text-navy-500 text-sm">
          Please review your progress before submitting.
        </DialogDescription>

        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-teal-700">{answered}</p>
            <p className="text-xs text-teal-600 mt-1">Answered</p>
          </div>
          <div className="bg-navy-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-navy-700">{unanswered}</p>
            <p className="text-xs text-navy-600 mt-1">Unanswered</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{marked}</p>
            <p className="text-xs text-amber-600 mt-1">Marked</p>
          </div>
        </div>

        {unanswered > 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            You have {unanswered} unanswered question{unanswered > 1 ? "s" : ""}. Unanswered questions will be marked as incorrect.
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition"
          >
            Go Back
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
