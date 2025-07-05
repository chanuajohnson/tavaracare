
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, ArrowRight, Calendar, Video, Home, AlertCircle } from "lucide-react";
import { JourneyStepTooltip } from "./JourneyStepTooltip";
import { SubscriptionTrackingButton } from "@/components/subscription/SubscriptionTrackingButton";
import { useIsMobile, useIsSmallMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  onCaregiverModalTrigger?: () => void;
  onAnonymousSubscriptionCTA?: () => void;
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
  visitDetails,
  onCaregiverModalTrigger,
  onAnonymousSubscriptionCTA
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

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return stageColor;
      default: return 'gray';
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Circle className="h-5 w-5" />;
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
      return step.completed ? "Edit Care Assessment" : "Start Assessment";
    }
    
    if (step.step_number === 6) {
      return step.completed ? "Share Your Loved Ones Story" : "Share Your Loved Ones Story";
    }
    
    if (step.step_number === 7) {
      if (step.completed && visitDetails) {
        return "Cancel Visit";
      } else if (step.completed) {
        return "Visit Scheduled";
      }
      return "View Care Giver Matches";
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
      toast.info("🌟 This is just a demo of the Tavara experience! Sign up or sign in to start your real care journey.");
      if (onAnonymousSubscriptionCTA) {
        onAnonymousSubscriptionCTA();
      }
    } else if (subscriptionCTA?.navigateTo) {
      navigate(subscriptionCTA.navigateTo);
    }
  };

  const handleStepAction = (step: JourneyStep) => {
    if (isAnonymous) {
      toast.info("🌟 This is just a demo of the Tavara experience! Sign up or sign in to start your real care journey.");
      
      if (step.step_number === 4 && onCaregiverModalTrigger) {
        onCaregiverModalTrigger();
        return;
      }
    }

    if (step.action) {
      step.action();
    }
  };

  const stageStatus = getStageStatus();
  const currentStageColor = getStageColor(stageStatus);

  return (
    <Card className={`border-l-4 transition-all duration-300 hover:shadow-lg bg-white ${
      stageStatus === 'completed' 
        ? 'border-l-green-500 bg-gradient-to-r from-green-50/30 to-transparent shadow-md' 
        : stageStatus === 'in-progress'
          ? `border-l-${currentStageColor}-500 bg-gradient-to-r from-${currentStageColor}-50/30 to-transparent shadow-md`
          : 'border-l-gray-300 bg-gradient-to-r from-gray-50/30 to-transparent shadow-sm'
    }`}>
      <CardHeader 
        className="pb-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-start gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-colors duration-200 ${
                stageStatus === 'completed' 
                  ? 'bg-green-100 text-green-600 border border-green-200'
                  : stageStatus === 'in-progress'
                    ? `bg-${currentStageColor}-100 text-${currentStageColor}-600 border border-${currentStageColor}-200`
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {stageStatus === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-lg lg:text-xl font-semibold text-gray-900">
                    {stageName}
                  </span>
                  <Badge 
                    variant={stageStatus === 'completed' ? 'default' : stageStatus === 'in-progress' ? 'secondary' : 'outline'} 
                    className={`text-xs font-medium ${
                      stageStatus === 'completed' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : stageStatus === 'in-progress' 
                          ? `bg-${currentStageColor}-100 text-${currentStageColor}-700 border-${currentStageColor}-200` 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {stageStatus === 'completed' ? 'Complete' :
                     stageStatus === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stageDescription}
                </p>
              </div>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className={`text-2xl font-bold mb-1 ${
                stageStatus === 'completed' ? 'text-green-600' :
                stageStatus === 'in-progress' ? `text-${currentStageColor}-600` : 'text-gray-400'
              }`}>
                {completionPercentage}%
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {completedSteps} of {totalSteps} steps
              </div>
            </div>
            
            {/* Enhanced Progress Circle */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-500 ${
                    stageStatus === 'completed' ? 'text-green-500' :
                    stageStatus === 'in-progress' ? `text-${currentStageColor}-500` : 'text-gray-300'
                  }`}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-6">
          {/* Subscription CTA */}
          {subscriptionCTA?.show && (
            <div className={`mb-6 p-4 rounded-lg bg-gradient-to-r from-${currentStageColor}-50 to-${currentStageColor}-100/50 border border-${currentStageColor}-200 shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-${currentStageColor}-500 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {subscriptionCTA.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {subscriptionCTA.description}
                  </p>
                  <Button
                    onClick={handleSubscriptionCTA}
                    variant="default"
                    className="h-9 px-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {subscriptionCTA.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Steps List */}
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
                <Card className={`transition-all duration-200 border ${
                  (step.accessible || isAnonymous) 
                    ? 'hover:shadow-md hover:border-gray-300 cursor-pointer bg-white' 
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className={`h-5 w-5 ${(step.accessible || isAnonymous) ? 'text-gray-300' : 'text-gray-200'}`} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <div className={`${(step.accessible || isAnonymous) ? 'text-primary' : 'text-gray-300'} flex-shrink-0`}>
                                {getIcon(step.icon_name)}
                              </div>
                              <h4 className={`font-medium text-sm ${
                                step.completed 
                                  ? 'text-gray-500 line-through' 
                                  : (step.accessible || isAnonymous)
                                    ? 'text-gray-900' 
                                    : 'text-gray-400'
                              }`}>
                                {step.title}
                              </h4>
                              {step.is_optional && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className={`text-xs leading-relaxed ${
                              (step.accessible || isAnonymous) ? 'text-muted-foreground' : 'text-gray-400'
                            }`}>
                              {step.description}
                            </p>
                            
                            {/* Enhanced Status Indicators */}
                            {step.step_number === 7 && step.completed && !visitDetails && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                  <span className="text-amber-800 font-medium">Admin Scheduling</span>
                                  <span className="text-amber-700 text-xs">
                                    Admin will contact you within 24 hours
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {step.step_number === 7 && visitDetails && step.completed && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-3 text-sm flex-wrap">
                                  <div className="flex items-center gap-2">
                                    {visitDetails.type === 'virtual' ? (
                                      <Video className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <Home className="h-4 w-4 text-blue-600" />
                                    )}
                                    <span className="text-blue-800 font-medium">
                                      {visitDetails.type === 'virtual' ? 'Virtual Visit' : 'Home Visit'}
                                    </span>
                                    {visitDetails.type === 'in_person' && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                        Payment Pending
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-700 text-xs">
                                      {new Date(visitDetails.date).toLocaleDateString()} at {visitDetails.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {!step.completed && (
                              <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="whitespace-nowrap font-medium">{getStepStatus(step)}</span>
                              </div>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-8 px-3 font-medium transition-all duration-200 ${
                                !(step.accessible || isAnonymous)
                                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                                  : step.step_number === 7 && step.completed && visitDetails
                                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                    : step.completed 
                                      ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                                      : 'text-primary hover:text-primary-600 hover:bg-primary/10'
                              }`}
                              disabled={!(step.accessible || isAnonymous)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStepAction(step);
                              }}
                            >
                              <span className="text-xs">{getButtonText(step)}</span>
                              <ArrowRight className="ml-1.5 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </JourneyStepTooltip>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
