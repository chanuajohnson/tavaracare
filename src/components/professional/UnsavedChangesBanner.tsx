import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnsavedChangesBannerProps {
  onSaveNow: () => void;
  saving?: boolean;
  changeCount?: number;
}

/**
 * Sticky amber bar shown at the top of the Daily Checklist whenever
 * there are unsaved local edits. Gives the caregiver a one-tap path
 * to persist their work without scrolling to the bottom Save button.
 */
export const UnsavedChangesBanner: React.FC<UnsavedChangesBannerProps> = ({
  onSaveNow,
  saving = false,
  changeCount,
}) => {
  return (
    <div className="sticky top-0 z-30 -mx-1 px-1">
      <div className="rounded-md border border-amber-300 bg-amber-50 shadow-sm px-3 py-2.5 flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 leading-tight">
            You have unsaved changes
            {typeof changeCount === 'number' && changeCount > 0 && (
              <span className="font-normal text-amber-800"> ({changeCount} item{changeCount === 1 ? '' : 's'} ticked)</span>
            )}
          </p>
          <p className="text-xs text-amber-800/90 leading-tight mt-0.5">
            Tap <strong>Save Now</strong> so Tavara records this shift.
          </p>
        </div>
        <Button
          size="sm"
          onClick={onSaveNow}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save Now'}
        </Button>
      </div>
    </div>
  );
};
