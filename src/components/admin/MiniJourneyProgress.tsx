
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { useUserSpecificProgress } from "@/hooks/useUserSpecificProgress";
import { useSharedFamilyJourneyData } from "@/hooks/useSharedFamilyJourneyData";
import type { UserRole } from "@/types/userRoles";

interface MiniJourneyProgressProps {
  userId: string;
  userRole: UserRole;
}

export const MiniJourneyProgress: React.FC<MiniJourneyProgressProps> = ({ userId, userRole }) => {
  // Use shared family data for family users, otherwise use the existing hook
  const familyProgress = useSharedFamilyJourneyData(userRole === 'family' ? userId : '');
  const otherProgress = useUserSpecificProgress(userRole !== 'family' ? userId : '', userRole);

  // Choose the appropriate progress data based on user role
  const { loading, completionPercentage, nextStep, steps } = userRole === 'family' 
    ? familyProgress 
    : otherProgress;

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Loading progress...</span>
        </div>
        <Progress value={0} className="h-2" />
      </div>
    );
  }

  const getStatusColor = () => {
    if (completionPercentage >= 100) return 'text-green-600';
    if (completionPercentage >= 50) return 'text-blue-600';
    if (completionPercentage > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (completionPercentage >= 100) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (completionPercentage >= 50) return <Clock className="h-4 w-4 text-blue-600" />;
    return <Circle className="h-4 w-4 text-yellow-600" />;
  };

  const getProgressLabel = () => {
    if (completionPercentage >= 100) return "Journey Complete";
    if (nextStep) return nextStep.title;
    return "Getting Started";
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>
            {getProgressLabel()}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {completedSteps}/{totalSteps}
        </Badge>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{completionPercentage}% complete</span>
        <span className="capitalize">{userRole} Journey</span>
      </div>
    </div>
  );
};
