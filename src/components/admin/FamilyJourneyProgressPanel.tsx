import { useSharedFamilyJourneyData } from '@/hooks/useSharedFamilyJourneyData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FamilyJourneyProgressPanelProps {
  userId: string;
}

export const FamilyJourneyProgressPanel = ({ userId }: FamilyJourneyProgressPanelProps) => {
  const { steps, completionPercentage, nextStep, loading, journeyStage } = useSharedFamilyJourneyData(userId);

  const getStatusColor = () => {
    if (completionPercentage >= 75) return 'text-green-700';
    if (completionPercentage >= 40) return 'text-blue-700';
    if (completionPercentage >= 10) return 'text-amber-700';
    return 'text-gray-700';
  };

  const getStatusIcon = () => {
    if (completionPercentage >= 75) return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    if (completionPercentage >= 40) return <Clock className="h-6 w-6 text-blue-600" />;
    return <Circle className="h-6 w-6 text-gray-400" />;
  };

  const getProgressLabel = () => {
    if (completionPercentage >= 75) return 'Well Along';
    if (completionPercentage >= 40) return 'Making Progress';
    if (completionPercentage >= 10) return 'Getting Started';
    return 'Just Beginning';
  };

  const getStageLabel = () => {
    switch (journeyStage) {
      case 'foundation': return 'Foundation';
      case 'scheduling': return 'Scheduling';
      case 'trial': return 'Trial';
      case 'conversion': return 'Conversion';
      default: return 'Foundation';
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <div className="text-sm text-gray-500">Loading family journey progress...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Family Journey Progress</CardTitle>
            <Badge variant="outline" className="text-xs">
              Stage: {getStageLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <h3 className={`font-medium ${getStatusColor()}`}>
                      {getProgressLabel()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {steps.filter(s => s?.completed).length} of {steps.length} steps completed
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {completionPercentage}%
                </Badge>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            {/* Step Details */}
            {steps.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Journey Steps</h4>
                <div className="space-y-2">
                  {steps.map((step, index) => {
                    const stepId = step?.id || index;
                    const stepTitle = step?.title || 'Untitled Step';
                    const stepDescription = step?.description || 'No description available';
                    const isCompleted = Boolean(step?.completed);
                    const isAccessible = step?.accessible !== false;
                    const isOptional = Boolean(step?.optional);

                    return (
                      <div key={stepId} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : isAccessible ? (
                            <Circle className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-medium ${isCompleted ? 'text-green-800' : isAccessible ? 'text-gray-900' : 'text-gray-500'}`}>
                            {stepTitle}
                          </h5>
                          <p className="text-sm text-gray-600 truncate">{stepDescription}</p>
                          {isOptional && (
                            <Badge variant="outline" className="mt-1 text-xs">Optional</Badge>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant={isCompleted ? 'default' : isAccessible ? 'secondary' : 'outline'}>
                            {isCompleted ? 'Complete' : isAccessible ? 'Available' : 'Locked'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No journey progress data available for this user.</p>
              </div>
            )}

            {/* Next Step Recommendation */}
            {nextStep && nextStep.title && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Next Recommended Step</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        {nextStep.title}
                      </p>
                      {nextStep.description && (
                        <p className="text-sm text-blue-700 mt-1">
                          {nextStep.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
