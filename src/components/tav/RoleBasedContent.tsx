
import React from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Sparkles, ArrowRight, CheckCircle, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { AssistantNudge, ProgressContext } from './types';
import { ExpandableChatSection } from './components/ExpandableChatSection';
import { FamilyJourneyPreview } from './components/FamilyJourneyPreview';
import { ProfessionalJourneyPreview } from './components/ProfessionalJourneyPreview';
import { ProfessionalJourneyWelcomeCard } from './components/ProfessionalJourneyWelcomeCard';
import { CommunityJourneyPreview } from './components/CommunityJourneyPreview';

interface RoleBasedContentProps {
  role: 'family' | 'professional' | 'community' | 'admin' | 'guest' | null;
  nudges: AssistantNudge[];
  onNudgeClick: (nudge: AssistantNudge) => void;
  isLoading: boolean;
  progressContext: ProgressContext;
  professionalProgress?: any;
  familyJourneyProgress?: any;
  onClose: () => void;
  onMinimize: () => void;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  role,
  nudges,
  onNudgeClick,
  isLoading,
  progressContext,
  professionalProgress,
  familyJourneyProgress,
  onClose,
  onMinimize
}) => {
  const { user } = useAuth();

  const handleJourneyAction = () => {
    // Navigate to appropriate next step based on role and progress
    if (role === 'professional') {
      if (progressContext.completionPercentage < 50) {
        window.location.href = '/registration/professional';
      } else if (progressContext.completionPercentage < 100) {
        window.location.href = '/professional/profile';
      } else {
        window.location.href = '/professional/profile?tab=assignments';
      }
    } else if (role === 'family') {
      // Use direct family progress data for navigation decisions
      const completionPercentage = familyJourneyProgress?.completionPercentage || 0;
      if (completionPercentage < 50) {
        window.location.href = '/registration/family';
      } else {
        window.location.href = '/family/profile';
      }
    }
  };

  const handleBack = () => {
    // Simple back navigation - could be enhanced
    window.history.back();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with sparkles and controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-2 w-2 text-primary/60 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-primary">TAV Assistant</h2>
            <p className="text-xs text-gray-600">Your Care Coordinator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-7 w-7 p-0"
            title="Minimize panel"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
            title="Close panel"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          )}

          {/* Nudges section */}
          {nudges.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" />
                Updates for You
              </h3>
              {nudges.map((nudge) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => onNudgeClick(nudge)}
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-primary/20 rounded-full flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-primary">{nudge.title || 'Update Available'}</h4>
                      <p className="text-xs text-gray-700 mt-1">{nudge.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Role-based content */}
          {user && (
            <>
              {/* Professional-specific enhanced content */}
              {role === 'professional' && professionalProgress && (
                <div className="space-y-4">
                  <ProfessionalJourneyWelcomeCard 
                    progressContext={progressContext}
                    onActionClick={handleJourneyAction}
                  />
                  <ProfessionalJourneyPreview onBack={handleBack} />
                </div>
              )}

              {/* Family-specific content - now using direct hook data */}
              {role === 'family' && familyJourneyProgress && (
                <div className="space-y-4">
                  {/* Family journey progress card using direct hook data */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Your Family Journey</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-700">Overall Progress</span>
                        <span className="text-sm font-bold text-blue-600">{familyJourneyProgress.completionPercentage}%</span>
                      </div>
                      
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${familyJourneyProgress.completionPercentage}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-blue-600">
                        {familyJourneyProgress.steps.filter(s => s.completed).length} of {familyJourneyProgress.steps.length} steps complete
                      </div>
                      
                      {familyJourneyProgress.nextStep && (
                        <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
                          <div className="text-xs font-medium text-blue-700 mb-1">Next Step:</div>
                          <div className="text-xs text-blue-600">{familyJourneyProgress.nextStep.title}</div>
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleJourneyAction}
                      >
                        Continue Journey
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <FamilyJourneyPreview onBack={handleBack} />
                </div>
              )}

              {/* Community-specific content */}
              {role === 'community' && (
                <CommunityJourneyPreview onBack={handleBack} />
              )}
            </>
          )}

          {/* Guest welcome message */}
          {(!user || role === 'guest') && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary/5 to-blue/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-primary">Welcome to Tavara!</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  I'm here to help you navigate your caregiving journey. Whether you're a family seeking care, 
                  a professional caregiver, or a community member wanting to help, I'll guide you every step of the way.
                </p>
                
                {/* Sign In Button */}
                <div className="mb-3">
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary-600 text-white w-full"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                
                {/* Pathway Buttons for First-Time Visitors */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 text-center mb-2">Or explore as a guest:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                      onClick={() => window.location.href = '/dashboard/family'}
                    >
                      Find Care Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                      onClick={() => window.location.href = '/dashboard/professional'}
                    >
                      Get Hired
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 border-primary/20 hover:bg-primary/5"
                      onClick={() => window.location.href = '/dashboard/community'}
                    >
                      Join The Village
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin role content */}
          {role === 'admin' && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Admin Dashboard</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Access administrative tools, user management, and platform analytics.
              </p>
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => window.location.href = '/admin'}
              >
                Access Admin Tools
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Expandable chat section */}
        <ExpandableChatSection role={role as 'family' | 'professional' | 'community' | null} />
      </div>
    </div>
  );
};
