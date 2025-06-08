
import React, { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, CheckCircle2, Users, Star, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface JourneyStageTooltipProps {
  children: React.ReactNode;
  stageName: string;
  stageKey: string;
  description: string;
  completedSteps: number;
  totalSteps: number;
  isCurrent: boolean;
  onInfoView?: () => void;
}

const getStageInfo = (stageKey: string) => {
  switch (stageKey) {
    case 'foundation':
      return {
        icon: <Star className="h-4 w-4 text-blue-500" />,
        timeEstimate: "30-45 minutes",
        benefits: [
          "Get personalized caregiver matches",
          "Set up essential care preferences",
          "Create your loved one's care profile"
        ],
        requirements: "Complete your profile and care assessment"
      };
    case 'scheduling':
      return {
        icon: <Users className="h-4 w-4 text-green-500" />,
        timeEstimate: "1-2 hours",
        benefits: [
          "Meet your dedicated care coordinator",
          "Discuss your specific needs",
          "Plan your care approach"
        ],
        requirements: "Complete foundation steps first"
      };
    case 'trial':
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
        timeEstimate: "8 hours (optional)",
        benefits: [
          "Experience our care firsthand",
          "Test compatibility with caregiver",
          "Risk-free trial period"
        ],
        requirements: "Schedule and complete your visit"
      };
    case 'conversion':
      return {
        icon: <Target className="h-4 w-4 text-orange-500" />,
        timeEstimate: "15-20 minutes",
        benefits: [
          "Choose your ideal care model",
          "Lock in your preferred pricing",
          "Begin regular care services"
        ],
        requirements: "Complete visit or trial"
      };
    default:
      return {
        icon: <Info className="h-4 w-4 text-gray-500" />,
        timeEstimate: "Variable",
        benefits: ["Complete this stage to unlock benefits"],
        requirements: "Follow the journey steps"
      };
  }
};

export const JourneyStageTooltip: React.FC<JourneyStageTooltipProps> = ({
  children,
  stageName,
  stageKey,
  description,
  completedSteps,
  totalSteps,
  isCurrent,
  onInfoView
}) => {
  const isMobile = useIsMobile();
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const stageInfo = getStageInfo(stageKey);

  const tooltipContent = (
    <div className="space-y-3 max-w-xs">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm leading-tight flex items-center gap-2">
          {stageInfo.icon}
          {stageName}
        </h4>
        <div className="flex gap-1 flex-shrink-0">
          {isCurrent && (
            <Badge variant="secondary" className="text-xs">Current</Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Clock className="h-3 w-3" />
        <span>Estimated time: {stageInfo.timeEstimate}</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-700">{description}</p>
        
        <div>
          <p className="text-xs font-medium text-gray-800 mb-1">What you'll get:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {stageInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-primary mt-0.5">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-800 mb-1">Requirements:</p>
          <p className="text-xs text-gray-600">{stageInfo.requirements}</p>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Progress:</span>
            <span className="font-medium">{completedSteps}/{totalSteps} steps</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile: Use Dialog for tap interaction
  if (isMobile) {
    return (
      <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
        <DialogTrigger asChild onClick={() => onInfoView?.()}>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {stageInfo.icon}
              {stageName} Stage
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tooltipContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop: Use HoverCard with improved positioning
  return (
    <HoverCard onOpenChange={(open) => open && onInfoView?.()}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-4" 
        side="top" 
        align="center"
        sideOffset={8}
        collisionPadding={16}
        avoidCollisions={true}
      >
        {tooltipContent}
      </HoverCardContent>
    </HoverCard>
  );
};
