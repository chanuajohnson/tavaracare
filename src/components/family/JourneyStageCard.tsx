
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, ArrowRight, Calendar, Video, Home } from "lucide-react";
import { JourneyStepTooltip } from "./JourneyStepTooltip";
import { SubscriptionTrackingButton } from "@/components/subscription/SubscriptionTrackingButton";
import { useIsMobile, useIsSmallMobile } from "@/hooks/use-mobile";
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
  cancelAction?: () => void;
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
  visitDetails?: {
    date: string;
    time: string;
    type: 'virtual' | 'in_person';
  };
}

export const JourneyStageCard: React.FC<JourneyStageCardProps> = ({
  stageName,
  stageKey,
  stageDescription,
  steps,
  stageColor,
  subscriptionCTA,
  trackStepAction,
  isAnonymous = false,
  visitDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
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
    return IconComponent ? <IconComponent className="mobile-icon-responsive" /> : <Circle className="mobile-icon-responsive" />;
  };

  const getButtonText = (step: JourneyStep) => {
    if (isAnonymous) {
      return "Start Journey";
    }

    if (!step.accessible) {
      if (step.step_number === 4) return "Complete Above Steps";
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
      if (step.completed && visitDetails) {
        return "Cancel Visit";
      } else if (step.completed) {
        return "Visit Scheduled";
      }
      return "Request Scheduling";
    }
    
    return step.completed ? "Edit" : "Complete";
  };

  const getStepStatus = (step: JourneyStep) => {
    if (step.step_number === 7) {
      if (step.completed && visitDetails) {
        return 'Scheduled';
      } else if (step.completed) {
        return 'Admin Scheduling';
      }
    }
    if (step.completed) return 'Completed';
    if (step.accessible) return 'Available';
    return 'Locked';
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
        className="mobile-padding-responsive cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="journey-header-mobile">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                stageStatus === 'completed' 
                  ? 'bg-green-100 text-green-600'
                  : stageStatus === 'in-progress'
                    ? `bg-${stageColor}-100 text-${stageColor}-600`
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {stageStatus === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`font-semibold ${isSmallMobile ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'}`}>
                    {stageName}
                  </span>
                  <Badge variant={
                    stageStatus === 'completed' ? 'default' :
                    stageStatus === 'in-progress' ? 'secondary' : 'outline'
                  } className="text-xs whitespace-nowrap">
                    {stageStatus === 'completed' ? 'Complete' :
                     stageStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 font-normal truncate sm:text-clip">
                  {stageDescription}
                </p>
              </div>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="text-right">
              <div className={`font-bold ${isSmallMobile ? 'text-base' : isMobile ? 'text-lg' : 'text-xl'} ${
                stageStatus === 'completed' ? 'text-green-600' :
                stageStatus === 'in-progress' ? `text-${stageColor}-600` : 'text-gray-400'
              }`}>
                {completionPercentage}%
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {completedSteps} of {totalSteps}
              </div>
            </div>
            
            {/* Enhanced Progress Circle with Better Mobile Sizing */}
            <div className="progress-circle-container">
              <div className={`relative ${isSmallMobile ? 'w-10 h-10' : isMobile ? 'w-12 h-12' : 'w-14 h-14'}`}>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
            </div>
            
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 mobile-padding-responsive">
          {/* Subscription CTA */}
          {subscriptionCTA?.show && (
            <div className={`mb-4 mobile-padding-responsive rounded-lg bg-gradient-to-r from-${stageColor}-50 to-${stageColor}-100 border border-${stageColor}-200`}>
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full bg-${stageColor}-500 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
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
                      className="mobile-button-responsive mobile-touch-target"
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
                      className="mobile-button-responsive mobile-touch-target"
                    >
                      {subscriptionCTA.buttonText}
                    </SubscriptionTrackingButton>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Steps List */}
          <div className="mobile-card-spacing">
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
                <div className={`flex items-start gap-3 mobile-padding-responsive rounded-lg transition-colors cursor-pointer ${
                  (step.accessible || isAnonymous) ? 'hover:bg-gray-50' : 'bg-gray-50'
                }`}>
                  <div className="mt-0.5 flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="mobile-icon-responsive text-green-500" />
                    ) : (
                      <Circle className={`mobile-icon-responsive ${(step.accessible || isAnonymous) ? 'text-gray-300' : 'text-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mobile-flex-responsive items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className={`${(step.accessible || isAnonymous) ? 'text-primary' : 'text-gray-300'} flex-shrink-0`}>
                            {getIcon(step.icon_name)}
                          </div>
                          <p className={`font-medium text-sm ${
                            step.completed 
                              ? 'text-gray-500 line-through' 
                              : (step.accessible || isAnonymous)
                                ? 'text-gray-800' 
                                : 'text-gray-400'
                          } truncate sm:text-clip`}>
                            {step.title}
                          </p>
                          {step.is_optional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">Optional</span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          (step.accessible || isAnonymous) ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                        
                        {/* Show admin scheduling status for Step 7 */}
                        {step.step_number === 7 && step.completed && !visitDetails && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-amber-600" />
                                <span className="text-amber-800 font-medium">Admin Scheduling</span>
                              </div>
                              <span className="text-amber-700 text-xs">
                                Admin will contact you within 24 hours
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Show visit details for Step 7 if scheduled */}
                        {step.step_number === 7 && visitDetails && step.completed && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                              <div className="flex items-center gap-1">
                                {visitDetails.type === 'virtual' ? (
                                  <Video className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <Home className="h-3 w-3 text-blue-600" />
                                )}
                                <span className="text-blue-800 font-medium">
                                  {visitDetails.type === 'virtual' ? 'Virtual Visit' : 'Home Visit'}
                                </span>
                                {visitDetails.type === 'in_person' && (
                                  <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded ml-1">
                                    Payment Pending
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                <span className="text-blue-700 text-xs">
                                  {new Date(visitDetails.date).toLocaleDateString()} at {visitDetails.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!step.completed && (
                          <div className="flex items-center text-xs text-gray-500 gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="whitespace-nowrap">{getStepStatus(step)}</span>
                          </div>
                        )}
                        
                        {/* Simplified Step 7 Button - Only Cancel for completed visits */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`mobile-button-responsive mobile-touch-target ${
                            !(step.accessible || isAnonymous)
                              ? 'text-gray-400 cursor-not-allowed opacity-50'
                              : step.step_number === 7 && step.completed && visitDetails
                                ? 'text-red-600 hover:text-red-700'
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
                          <span>{getButtonText(step)}</span>
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
