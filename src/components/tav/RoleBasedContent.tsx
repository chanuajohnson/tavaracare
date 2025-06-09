
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, UserCog, Users, Globe, Shield, ArrowRight, Sparkles, Clock, CheckCircle2, Circle, X, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReturningUser } from './hooks/useReturningUser';
import { useFamilyProgress } from './hooks/useFamilyProgress';
import { useProfessionalProgress } from './hooks/useProfessionalProgress';
import { motion } from 'framer-motion';
import { FamilyJourneyPreview } from './components/FamilyJourneyPreview';
import { ProfessionalJourneyPreview } from './components/ProfessionalJourneyPreview';
import { CommunityJourneyPreview } from './components/CommunityJourneyPreview';
import { ExpandableChatSection } from './components/ExpandableChatSection';
import { AssistantNudge } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface RoleBasedContentProps {
  role?: 'guest' | 'family' | 'professional' | 'community' | 'admin' | null;
  progressContext?: {
    completionPercentage: number;
    currentStep: string;
    nextAction?: string;
    journeyStage?: string;
    careModel?: string | null;
    trialCompleted?: boolean;
  };
  nudges?: AssistantNudge[];
  onNudgeClick?: (nudge: AssistantNudge) => Promise<void>;
  isLoading?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}

type PreviewState = 'selection' | 'family-preview' | 'professional-preview' | 'community-preview';

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({ 
  role, 
  progressContext,
  nudges = [],
  onNudgeClick,
  isLoading = false,
  onClose,
  onMinimize
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isReturningUser, lastRole, hasVisitedBefore, detectionMethod } = useReturningUser();
  const [previewState, setPreviewState] = useState<PreviewState>('selection');
  
  // Get real progress data for logged-in users
  const familyProgress = useFamilyProgress();
  const professionalProgress = useProfessionalProgress();

  const getRoleDisplayName = (roleType: string) => {
    switch (roleType) {
      case 'family': return 'family member';
      case 'professional': return 'care professional';
      case 'community': return 'community supporter';
      default: return 'user';
    }
  };

  const getContextualWelcomeMessage = () => {
    if (lastRole) {
      return {
        main: "Welcome back! 👋",
        sub: `Ready to continue as a ${getRoleDisplayName(lastRole)}?`,
        detail: "Log in to access your dashboard"
      };
    }
    return {
      main: "Welcome back! 🎉",
      sub: "Ready to log in?",
      detail: "Access your personalized dashboard"
    };
  };

  const handleRolePreview = (roleType: 'family' | 'professional' | 'community') => {
    setPreviewState(`${roleType}-preview` as PreviewState);
  };

  const handleBackToSelection = () => {
    setPreviewState('selection');
  };

  // Panel header with close/minimize controls for ALL users (including guests)
  const renderPanelHeader = () => {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-lg font-semibold">TAV Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Minimize panel"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Main content wrapper with improved scrolling
  const renderContent = () => {
    if (role === 'guest') {
      // Show journey previews when user has selected a role to preview
      if (previewState === 'family-preview') {
        return <FamilyJourneyPreview onBack={handleBackToSelection} />;
      }
      
      if (previewState === 'professional-preview') {
        return <ProfessionalJourneyPreview onBack={handleBackToSelection} />;
      }
      
      if (previewState === 'community-preview') {
        return <CommunityJourneyPreview onBack={handleBackToSelection} />;
      }

      // Default guest view with role selection
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-6 w-6 text-primary flex-shrink-0" />
            <h3 className="text-lg font-semibold leading-tight">Welcome to Tavara</h3>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            I'm TAV, your virtual care coordinator. I'm here to help you navigate 
            your caregiving journey with warmth and expertise.
          </p>

          {/* Enhanced Welcome Back Card for Returning Users */}
          {isReturningUser && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-6"
            >
              <motion.div
                className="p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 shadow-sm cursor-pointer hover:from-primary/15 hover:via-primary/8 hover:shadow-md transition-all duration-200"
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start text-left min-w-0 flex-1 mr-3">
                    <p className="text-xs font-semibold text-primary mb-1 leading-tight flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {getContextualWelcomeMessage().main}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight mb-1">
                      {getContextualWelcomeMessage().sub}
                    </p>
                    <p className="text-xs text-muted-foreground/80 leading-tight">
                      {getContextualWelcomeMessage().detail}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-primary/70 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.div>
              
              {/* Debug info for development */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-muted-foreground mt-2 opacity-70">
                  Detection: {detectionMethod} • Role: {lastRole || 'unknown'}
                </p>
              )}
            </motion.div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {isReturningUser ? "Or explore our other options:" : "How can I help you today?"}
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
              onClick={() => handleRolePreview('family')}
            >
              <Users className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="text-left leading-tight">I need care for a loved one</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
              onClick={() => handleRolePreview('professional')}
            >
              <UserCog className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="text-left leading-tight">I want to provide care services</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-auto py-3 px-4 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200"
              onClick={() => handleRolePreview('community')}
            >
              <Globe className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="text-left leading-tight">I want to support my community</span>
            </Button>
          </div>
        </div>
      );
    }

    if (role === 'family') {
      const { steps, completionPercentage, nextStep, loading } = familyProgress;

      if (loading) {
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold leading-tight">Your Journey Ahead</h3>
            </div>
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading progress...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold leading-tight">Your Journey Ahead</h3>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-blue-600 font-semibold">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're doing great! I'm here to guide you through each step of setting up 
            care for your loved one.
          </p>
          
          {/* Real Journey Steps Section */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-blue-800 mb-2">Journey Steps:</p>
            <div className="space-y-1">
              {steps.map((step, index) => {
                return (
                  <div key={step.id} className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {step.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`truncate ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {index + 1}. {step.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-5 px-2 text-xs ${
                        (!step.accessible)
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                      disabled={!step.accessible}
                      onClick={() => {
                        if (step.action && step.accessible) {
                          step.action();
                        }
                      }}
                    >
                      {step.buttonText || (step.completed ? "View" : "Continue")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          
          {nextStep && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">Next Step:</p>
              </div>
              <p className="text-sm text-amber-700 leading-relaxed mb-2">{nextStep.title}</p>
              <p className="text-xs text-amber-600 leading-relaxed">{nextStep.description}</p>
            </div>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            className="w-full h-auto py-3"
            onClick={() => {
              if (nextStep && nextStep.action) {
                nextStep.action();
              } else {
                navigate('/dashboard/family');
              }
            }}
          >
            {nextStep ? `Continue: ${nextStep.title}` : 'View Dashboard'}
          </Button>

          {/* Add Expandable Chat Section */}
          <ExpandableChatSection role="family" />
        </div>
      );
    }

    if (role === 'professional') {
      const { steps, completionPercentage, nextStep, loading } = professionalProgress;

      if (loading) {
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3 mb-4">
              <UserCog className="h-6 w-6 text-green-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold leading-tight">Next Steps</h3>
            </div>
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading progress...</p>
            </div>
          </div>
        );
      }

      // Add action and buttonText properties to steps for this component
      const enhancedSteps = steps.map(step => ({
        ...step,
        action: () => {
          navigate('/dashboard/professional');
        },
        buttonText: step.completed ? "View" : "Continue"
      }));

      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="h-6 w-6 text-green-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold leading-tight">Next Steps</h3>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-green-600 font-semibold">
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete your profile to start receiving job opportunities that match your skills.
          </p>
          
          {/* Granular Steps Section */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-800 mb-2">Setup Steps:</p>
            <div className="space-y-1">
              {enhancedSteps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`truncate ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                      {index + 1}. {step.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-xs text-green-600 hover:text-green-700"
                    onClick={() => {
                      if (step.action) {
                        step.action();
                      }
                    }}
                  >
                    {step.buttonText}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {nextStep && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">Next Step:</p>
              </div>
              <p className="text-sm text-amber-700 leading-relaxed mb-2">{nextStep.title}</p>
              <p className="text-xs text-amber-600 leading-relaxed">{nextStep.description}</p>
            </div>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            className="w-full h-auto py-3"
            onClick={() => {
              const enhancedNextStep = enhancedSteps.find(s => s.id === nextStep?.id);
              if (enhancedNextStep?.action) {
                enhancedNextStep.action();
              } else {
                navigate('/dashboard/professional');
              }
            }}
          >
            {nextStep ? `Continue: ${nextStep.title}` : 'View Dashboard'}
          </Button>

          {/* Add Expandable Chat Section */}
          <ExpandableChatSection role="professional" />
        </div>
      );
    }

    if (role === 'community') {
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold leading-tight">Community Impact</h3>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for being part of our care community. Your involvement makes 
            a real difference in families' lives.
          </p>
          
          <Button 
            variant="default" 
            size="sm" 
            className="w-full h-auto py-3"
            onClick={() => navigate('/dashboard/community')}
          >
            View Community Dashboard
          </Button>

          {/* Add Expandable Chat Section */}
          <ExpandableChatSection role="community" />
        </div>
      );
    }

    if (role === 'admin') {
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <h3 className="text-lg font-semibold leading-tight">Admin Controls</h3>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            I can help you send targeted nudges to users or review system insights.
          </p>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-auto py-3"
            >
              Send Manual Nudge
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start h-auto py-3"
            >
              View User Progress
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          I'm here to help guide you through your Tavara journey. 
          How can I assist you today?
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {renderPanelHeader()}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};
