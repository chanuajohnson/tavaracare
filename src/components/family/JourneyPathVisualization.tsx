
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, Star, Users } from "lucide-react";

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
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'current': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  const categories = [
    { name: 'Foundation', key: 'foundation', description: 'Set up your profile and care needs' },
    { name: 'Scheduling', key: 'scheduling', description: 'Meet your care team' },
    { name: 'Trial', key: 'trial', description: 'Optional trial experience' },
    { name: 'Decision', key: 'conversion', description: 'Choose your care model' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" />
          Your Care Journey Paths
        </CardTitle>
        <p className="text-sm text-gray-600">
          Follow the path that works best for your family
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stage Progress Visualization */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Journey Stages</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category, index) => {
              const status = getStageStatus(category.key);
              const stepsInCategory = getStepsByCategory(category.key);
              const completedInCategory = stepsInCategory.filter(s => s.completed).length;
              
              return (
                <div key={category.key} className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-center min-w-[120px]">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${getStageColor(status)} text-white`}>
                      <span className="text-sm font-semibold">
                        {completedInCategory}/{stepsInCategory.length}
                      </span>
                    </div>
                    <div className="text-xs font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    {status === 'current' && (
                      <Badge variant="outline" className="mt-1 text-xs">Current</Badge>
                    )}
                  </div>
                  {index < categories.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Path Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Choose Your Path</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {paths.map((path) => (
              <Card key={path.id} className={`border-2 ${path.is_recommended ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: path.path_color }}
                    />
                    <h5 className="font-medium text-sm">{path.path_name}</h5>
                    {path.is_recommended && (
                      <Badge className="text-xs">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{path.path_description}</p>
                  <div className="text-xs text-gray-500">
                    {path.step_ids.length} steps total
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-sm text-purple-900 mb-2">
                Why Choose Tavara Care Village? ($45/hr vs $40/hr Direct)
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>24/7 care coordinator support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Automated payroll & tax handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Advanced medication management</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Meal planning & grocery integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Real-time family updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    <span>Emergency response protocols</span>
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
