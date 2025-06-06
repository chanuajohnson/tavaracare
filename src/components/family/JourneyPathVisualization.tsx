
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Users, CheckCircle2 } from "lucide-react";

interface JourneyPath {
  id: string;
  path_name: string;
  path_description: string;
  step_ids: number[];
  path_color: string;
  is_recommended: boolean;
}

interface JourneyStep {
  step_number: number;
  title: string;
  category: string;
  completed: boolean;
  accessible: boolean;
}

interface JourneyPathVisualizationProps {
  paths: JourneyPath[];
  steps: JourneyStep[];
  currentStage: string;
}

export const JourneyPathVisualization: React.FC<JourneyPathVisualizationProps> = ({
  paths,
  steps,
  currentStage
}) => {
  const getStepsByCategory = (category: string) => {
    return steps.filter(step => step.category === category);
  };

  const getStageStatus = (category: string) => {
    const categorySteps = getStepsByCategory(category);
    const completedSteps = categorySteps.filter(step => step.completed);
    
    if (completedSteps.length === categorySteps.length) return 'completed';
    if (completedSteps.length > 0) return 'in-progress';
    if (category === currentStage) return 'current';
    return 'upcoming';
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in-progress': return 'text-primary';
      case 'current': return 'text-orange-500';
      default: return 'text-gray-300';
    }
  };

  const categories = [
    { name: 'Foundation', key: 'foundation', description: 'Set up your profile and care needs' },
    { name: 'Scheduling', key: 'scheduling', description: 'Meet your care team' },
    { name: 'Trial', key: 'trial', description: 'Optional trial experience' },
    { name: 'Decision', key: 'conversion', description: 'Choose your care model' }
  ];

  return (
    <Card className="border-l-4 border-l-primary mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span className="text-sm sm:text-base">🛣️ Your Care Journey Paths</span>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          Follow the path that works best for your family
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Stage Progress Visualization */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-medium text-sm text-gray-800">Journey Stages</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {categories.map((category, index) => {
              const status = getStageStatus(category.key);
              const stepsInCategory = getStepsByCategory(category.key);
              const completedInCategory = stepsInCategory.filter(s => s.completed).length;
              const totalInCategory = stepsInCategory.length;
              const completionPercentage = totalInCategory > 0 ? Math.round((completedInCategory / totalInCategory) * 100) : 0;
              
              return (
                <div key={category.key} className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-center min-w-[100px] sm:min-w-[120px]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 relative mx-auto mb-2">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={getStageColor(status)}
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={`${completionPercentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-700">
                          {completedInCategory}/{totalInCategory}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-800">{category.name}</div>
                    <div className="text-xs text-gray-500 mt-1 px-1 leading-tight">{category.description}</div>
                    {status === 'current' && (
                      <Badge variant="outline" className="mt-1 text-xs border-primary text-primary">Current</Badge>
                    )}
                  </div>
                  {index < categories.length - 1 && (
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Path Options */}
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-medium text-sm text-gray-800">Choose Your Path</h4>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {paths.map((path) => (
              <Card key={path.id} className={`border-2 transition-colors ${
                path.is_recommended 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: path.path_color }}
                    />
                    <h5 className="font-medium text-sm text-gray-800">{path.path_name}</h5>
                    {path.is_recommended && (
                      <Badge className="text-xs bg-primary text-white ml-auto">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{path.path_description}</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">{path.step_ids.length}</span> steps total
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Benefits */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-3 sm:p-4 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-800 mb-2">
                Why Choose Tavara Care Village? ($45/hr vs $40/hr Direct)
              </h4>
              <div className="grid gap-2 sm:gap-3 text-xs sm:grid-cols-2">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">24/7 care coordinator support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Automated payroll & tax handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Advanced medication management</span>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Meal planning & grocery integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Real-time family updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Emergency response protocols</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
