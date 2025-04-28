
import React from 'react';
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface RateDisplayProps {
  baseRate: number | null;
  rateMultiplier: number | null;
  onEdit: () => void;
}

export const RateDisplay: React.FC<RateDisplayProps> = ({
  baseRate,
  rateMultiplier,
  onEdit
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm">
        <span className="font-medium">${baseRate}/hr</span>
        <span className="text-muted-foreground"> × {rateMultiplier}x</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-6 w-6 p-0" 
        onClick={onEdit} 
        title="Edit rates"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
