
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, Lightbulb } from "lucide-react";

interface JourneyStepTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  tooltipContent: string;
  detailedExplanation: string;
  timeEstimateMinutes: number;
  isOptional: boolean;
  category: string;
  onTooltipView?: () => void;
}

export const JourneyStepTooltip: React.FC<JourneyStepTooltipProps> = ({
  children,
  title,
  description,
  tooltipContent,
  detailedExplanation,
  timeEstimateMinutes,
  isOptional,
  category,
  onTooltipView
}) => {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'foundation': return 'bg-blue-100 text-blue-800';
      case 'scheduling': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      case 'conversion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HoverCard onOpenChange={(open) => open && onTooltipView?.()}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="right" align="start">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm leading-tight">{title}</h4>
            <div className="flex gap-1 flex-shrink-0">
              {isOptional && (
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              )}
              <Badge className={`text-xs ${getCategoryColor(category)}`}>
                {category}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Estimated time: {formatTime(timeEstimateMinutes)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-gray-700">{tooltipContent}</p>
            </div>
            
            <div className="flex items-start gap-2">
              <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
              <p className="text-xs text-gray-600">{detailedExplanation}</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
