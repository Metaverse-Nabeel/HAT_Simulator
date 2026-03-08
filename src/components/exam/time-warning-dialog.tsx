"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TimeWarningDialogProps {
  open: boolean;
  onClose: () => void;
  unanswered: number;
  timeRemaining: number;
}

export function TimeWarningDialog({
  open,
  onClose,
  unanswered,
  timeRemaining,
}: TimeWarningDialogProps) {
  const minutes = Math.floor(timeRemaining / 60);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <DialogTitle className="text-lg font-bold text-navy-900">Time Warning!</DialogTitle>
          <DialogDescription className="text-navy-500 text-sm mt-2">
            Only <span className="font-bold text-amber-600">{minutes} minutes</span> remaining.
            {unanswered > 0 && (
              <> You still have <span className="font-bold">{unanswered}</span> unanswered question{unanswered > 1 ? "s" : ""}.</>
            )}
          </DialogDescription>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-navy-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-navy-800 transition"
          >
            Continue Exam
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
