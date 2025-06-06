
import React, { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, Lightbulb } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

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

  const tooltipContentElement = (
    <div className="space-y-3 max-w-xs">
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
  );

  // Mobile: Use Dialog for tap interaction
  if (isMobile) {
    return (
      <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
        <DialogTrigger asChild onClick={() => onTooltipView?.()}>
          <div className="cursor-pointer">
            {children}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tooltipContentElement}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Use HoverCard with improved positioning
  return (
    <HoverCard onOpenChange={(open) => open && onTooltipView?.()}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-4" 
        side="top" 
        align="start"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
      >
        {tooltipContentElement}
      </HoverCardContent>
    </HoverCard>
  );
};
