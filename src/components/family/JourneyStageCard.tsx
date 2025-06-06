
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, Calendar, Users, MapPin, CreditCard, Star, FileText, Zap } from 'lucide-react';

export interface JourneyStep {
  id: number;
  title: string;
  description: string;
  status: string;
  buttonText: string;
  completed: boolean;
  icon?: string;
  estimatedTime?: string;
  action?: () => void;
  clickable?: boolean;
}

interface JourneyStageCardProps {
  step: JourneyStep;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}

const getStepIcon = (stepId: number, completed: boolean) => {
  const iconProps = { className: `h-6 w-6 ${completed ? 'text-green-600' : 'text-gray-400'}` };
  
  switch (stepId) {
    case 1: return <Users {...iconProps} />;
    case 2: return <FileText {...iconProps} />;
    case 3: return <Users {...iconProps} />;
    case 4: return <Star {...iconProps} />;
    case 5: return <Zap {...iconProps} />;
    case 6: return <Calendar {...iconProps} />;
    case 7: return <MapPin {...iconProps} />;
    case 8: return <Calendar {...iconProps} />;
    case 9: return <CreditCard {...iconProps} />;
    default: return <Clock {...iconProps} />;
  }
};

const getStatusColor = (status: string, completed: boolean) => {
  if (completed) return 'bg-green-100 text-green-800 border-green-300';
  
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'scheduled':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'complete':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const JourneyStageCard: React.FC<JourneyStageCardProps> = ({
  step,
  isActive,
  isCompleted,
  stepNumber
}) => {
  const handleAction = () => {
    if (step.clickable !== false && step.action) {
      step.action();
    }
  };

  // Determine if the button should be disabled
  const isButtonDisabled = step.clickable === false || (!step.action && !isCompleted);

  return (
    <Card className={`transition-all duration-200 ${
      isActive 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : isCompleted 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Step Number and Icon */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-600 text-white' 
                : isActive 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <span className="text-sm font-bold">{stepNumber}</span>
              )}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Status Badge */}
              <Badge 
                variant="outline" 
                className={`ml-4 flex-shrink-0 ${getStatusColor(step.status, isCompleted)}`}
              >
                {isCompleted ? 'Complete' : step.status}
              </Badge>
            </div>

            {/* Estimated Time */}
            {step.estimatedTime && (
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">{step.estimatedTime}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStepIcon(step.id, isCompleted)}
              </div>
              
              {/* Show button based on step state and clickable property */}
              {step.clickable !== false ? (
                <Button
                  onClick={handleAction}
                  disabled={isButtonDisabled}
                  variant={isCompleted ? 'outline' : isActive ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    isCompleted 
                      ? 'border-green-600 text-green-600 hover:bg-green-50' 
                      : isActive 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : ''
                  }`}
                >
                  {step.buttonText}
                </Button>
              ) : (
                // Non-clickable status indicator
                <div className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(step.status, isCompleted)}`}>
                  {step.status}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
