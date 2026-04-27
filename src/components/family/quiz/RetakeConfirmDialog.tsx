import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type RetakeConfirmMode = "reset" | "retake-now";

interface RetakeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /**
   * "reset"     → from the dashboard quick-access card. Wipes saved stage
   *               so the dashboard reverts to the quiz invitation banner.
   * "retake-now" → from the result page. Wipes saved stage and starts a
   *                 fresh quiz at Q1 immediately.
   * Defaults to "retake-now" for backward compatibility.
   */
  mode?: RetakeConfirmMode;
}

const COPY: Record<
  RetakeConfirmMode,
  { title: string; description: string; confirm: string }
> = {
  reset: {
    title: "Reset your readiness check?",
    description:
      "This clears your current result so your dashboard goes back to the quiz invitation. You can take the check again anytime — no answers are kept.",
    confirm: "Yes, reset",
  },
  "retake-now": {
    title: "Retake your readiness check now?",
    description:
      "Your current result will be cleared so we can capture where you are today. You'll start at question 1.",
    confirm: "Yes, retake",
  },
};

export const RetakeConfirmDialog: React.FC<RetakeConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  mode = "retake-now",
}) => {
  const copy = COPY[mode];
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
