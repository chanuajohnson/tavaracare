
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SaveRatesButtonsProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const SaveRatesButtons: React.FC<SaveRatesButtonsProps> = ({
  isSaving,
  onSave,
  onCancel,
  showCancel
}) => {
  return (
    <div className="flex justify-end">
      {showCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="mr-2"
          disabled={isSaving}
        >
          Cancel
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-1"
      >
        {isSaving ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-1"></span>
            Saving...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" /> Save
          </>
        )}
      </Button>
    </div>
  );
};
