import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, X } from 'lucide-react';

interface StaleDraftRecoveryCardProps {
  draftDate: string;
  tickedCount: number;
  onOpen: () => void;
  onDiscard: () => void;
}

const formatPrettyDate = (iso: string) => {
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

/**
 * Surfaces an unsaved draft from a previous date so the caregiver
 * doesn't silently lose work. Either restore + save now, or discard.
 */
export const StaleDraftRecoveryCard: React.FC<StaleDraftRecoveryCardProps> = ({
  draftDate,
  tickedCount,
  onOpen,
  onDiscard,
}) => {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-50/70 relative">
      <button
        type="button"
        onClick={onDiscard}
        className="absolute right-3 top-3 p-1 rounded-md text-amber-700/70 hover:text-amber-900 hover:bg-amber-100 transition-colors"
        aria-label="Discard draft"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="pt-4 pb-4 flex items-start gap-3 pr-10">
        <History className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
        <div className="space-y-2 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Unsaved draft from {formatPrettyDate(draftDate)}
          </p>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            We found {tickedCount} ticked item{tickedCount === 1 ? '' : 's'} from that
            shift that was never saved. Open it now to record the shift, or discard it.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              onClick={onOpen}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Open it
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDiscard}
              className="border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              Discard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
