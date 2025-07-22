
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle } from "lucide-react";
import { useStoredJourneyProgress } from "@/hooks/useStoredJourneyProgress";
import type { UserRole } from "@/types/userRoles";

interface MiniJourneyProgressProps {
  userId: string;
  userRole: UserRole;
}

export const MiniJourneyProgress: React.FC<MiniJourneyProgressProps> = ({ userId, userRole }) => {
  const { loading, completionPercentage, nextStep, steps, currentStage } = useStoredJourneyProgress(userId, userRole);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Loading progress...</span>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'foundation': return 'bg-blue-500';
      case 'scheduling': return 'bg-yellow-500';
      case 'trial': return 'bg-orange-500';
      case 'conversion': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'foundation': return 'Foundation';
      case 'scheduling': return 'Scheduling';
      case 'trial': return 'Trial';
      case 'conversion': return 'Active';
      default: return 'Starting';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${getStageColor(currentStage)} text-white`}>
            {getStageLabel(currentStage)}
          </Badge>
          <span className="text-sm text-gray-600">
            {completionPercentage}% Complete
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {completionPercentage > 0 ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Clock className="h-3 w-3 text-gray-400" />
          )}
          {steps.length > 0 ? `${steps.filter(s => s.completed).length}/${steps.length} steps` : 'In Progress'}
        </div>
      </div>
      
      <Progress value={completionPercentage} className="h-2" />
      
      {nextStep && (
        <div className="text-xs text-gray-500">
          Next: {nextStep.title}
        </div>
      )}
      
      {completionPercentage === 0 && (
        <div className="text-xs text-gray-400">
          No progress recorded yet
        </div>
      )}
    </div>
  );
};
