
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { JourneyStepTooltip } from "./JourneyStepTooltip";
import { SubscriptionTrackingButton } from "@/components/subscription/SubscriptionTrackingButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  accessible: boolean;
  icon_name: string;
  tooltip_content: string;
  detailed_explanation: string;
  time_estimate_minutes: number;
  is_optional: boolean;
  action?: () => void;
  buttonText?: string;
}

interface JourneyStageCardProps {
  stageName: string;
  stageKey: string;
  stageDescription: string;
  steps: JourneyStep[];
  stageColor: string;
  subscriptionCTA?: {
    show: boolean;
    title: string;
    description: string;
    buttonText: string;
    action: string;
    featureType: string;
    planId?: string;
    navigateTo: string;
  };
  trackStepAction: (stepId: string, action: string) => void;
  isAnonymous?: boolean;
}

export const JourneyStageCard: React.FC<JourneyStageCardProps> = ({
  stageName,
  stageKey,
  stageDescription,
  steps,
  stageColor,
  subscriptionCTA,
  trackStepAction,
  isAnonymous = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  const getStageStatus = () => {
    if (completedSteps === totalSteps) return 'completed';
    if (completedSteps > 0) return 'in-progress';
    return 'not-started';
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" /> : <Circle className="h-4 w-4 sm:h-5 sm:w-5" />;
  };

  const getButtonText = (step: JourneyStep) => {
    if (isAnonymous) {
      return "Start Journey";
    }

    if (!step.accessible) {
      if (step.step_number === 4) return "Complete Above Steps";
      if (step.step_number === 8) return "Schedule Visit First";
      return "Not Available";
    }
    
    if (step.step_number === 4) {
      return step.completed ? "View Matches" : "View Matches";
    }
    
    if (step.step_number === 5) {
      return step.completed ? "Edit Medications" : "Start Setup";
    }
    
    if (step.step_number === 6) {
      return step.completed ? "Edit Meal Plans" : "Start Planning";
    }
    
    if (step.step_number === 7) {
      return step.completed ? "Modify Visit" : "Schedule Visit";
    }
    
    return step.completed ? "Edit" : "Complete";
  };

  const handleSubscriptionCTA = () => {
    if (isAnonymous) {
      navigate('/auth');
    } else if (subscriptionCTA?.navigateTo) {
      navigate(subscriptionCTA.navigateTo);
    }
  };

  const stageStatus = getStageStatus();

  return (
    <Card className={`border-l-4 mb-4 transition-all duration-200 ${
      stageStatus === 'completed' 
        ? 'border-l-green-500 bg-green-50/50' 
        : stageStatus === 'in-progress'
          ? `border-l-${stageColor}-500 bg-${stageColor}-50/50`
          : 'border-l-gray-300 bg-gray-50/50'
    }`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className={`flex items-center gap-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stageStatus === 'completed' 
                  ? 'bg-green-100 text-green-600'
                  : stageStatus === 'in-progress'
                    ? `bg-${stageColor}-100 text-${stageColor}-600`
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {stageStatus === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{stageName}</span>
                  <Badge variant={
                    stageStatus === 'completed' ? 'default' :
                    stageStatus === 'in-progress' ? 'secondary' : 'outline'
                  } className="text-xs">
                    {stageStatus === 'completed' ? 'Complete' :
                     stageStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 font-normal">{stageDescription}</p>
              </div>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${
                stageStatus === 'completed' ? 'text-green-600' :
                stageStatus === 'in-progress' ? `text-${stageColor}-600` : 'text-gray-400'
              }`}>
                {completionPercentage}%
              </div>
              <div className="text-xs text-gray-500">
                {completedSteps} of {totalSteps}
              </div>
            </div>
            
            <div className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} relative`}>
              <svg className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} transform -rotate-90`} viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    stageStatus === 'completed' ? 'text-green-500' :
                    stageStatus === 'in-progress' ? `text-${stageColor}-500` : 'text-gray-300'
                  }
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={`${completionPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Subscription CTA */}
          {subscriptionCTA?.show && (
            <div className={`mb-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-${stageColor}-50 to-${stageColor}-100 border border-${stageColor}-200`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full bg-${stageColor}-500 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-800 mb-1">
                    {subscriptionCTA.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">
                    {subscriptionCTA.description}
                  </p>
                  {isAnonymous ? (
                    <Button
                      onClick={handleSubscriptionCTA}
                      variant="default"
                      className="text-xs px-3 py-2 h-auto"
                    >
                      {subscriptionCTA.buttonText}
                    </Button>
                  ) : (
                    <SubscriptionTrackingButton
                      action={subscriptionCTA.action as any}
                      featureType={subscriptionCTA.featureType}
                      planId={subscriptionCTA.planId}
                      navigateTo={subscriptionCTA.navigateTo}
                      variant="default"
                      className="text-xs px-3 py-2 h-auto"
                    >
                      {subscriptionCTA.buttonText}
                    </SubscriptionTrackingButton>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step) => (
              <JourneyStepTooltip
                key={step.id}
                title={step.title}
                description={step.description}
                tooltipContent={step.tooltip_content}
                detailedExplanation={step.detailed_explanation}
                timeEstimateMinutes={step.time_estimate_minutes}
                isOptional={step.is_optional}
                category={step.category}
                onTooltipView={() => trackStepAction(step.id, 'tooltip_viewed')}
              >
                <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                  (step.accessible || isAnonymous) ? 'hover:bg-gray-50' : 'bg-gray-50'
                }`}>
                  <div className="mt-0.5 flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <Circle className={`h-4 w-4 sm:h-5 sm:w-5 ${(step.accessible || isAnonymous) ? 'text-gray-300' : 'text-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`${isMobile ? 'flex-col space-y-2' : 'flex items-start justify-between gap-4'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`${(step.accessible || isAnonymous) ? 'text-primary' : 'text-gray-300'} flex-shrink-0`}>
                            {getIcon(step.icon_name)}
                          </div>
                          <p className={`font-medium text-sm ${
                            step.completed 
                              ? 'text-gray-500 line-through' 
                              : (step.accessible || isAnonymous)
                                ? 'text-gray-800' 
                                : 'text-gray-400'
                          }`}>
                            {step.title}
                          </p>
                          {step.is_optional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Optional</span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          (step.accessible || isAnonymous) ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-2'} flex-shrink-0`}>
                        {!step.completed && (
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{(step.accessible || isAnonymous) ? 'Pending' : 'Locked'}</span>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs px-2 py-1 h-auto min-h-[44px] ${isMobile ? 'min-w-[44px]' : ''} ${
                            !(step.accessible || isAnonymous)
                              ? 'text-gray-400 cursor-not-allowed opacity-50'
                              : step.completed 
                                ? 'text-blue-600 hover:text-blue-700' 
                                : 'text-primary hover:text-primary-600'
                          }`}
                          disabled={!(step.accessible || isAnonymous)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (step.action) {
                              step.action();
                            }
                          }}
                        >
                          <span className={isMobile ? 'text-xs' : ''}>{getButtonText(step)}</span>
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </JourneyStepTooltip>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
