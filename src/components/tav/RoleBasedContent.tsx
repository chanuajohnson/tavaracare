
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
  onClose: () => void;
  onMinimize: () => void;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  role,
  nudges,
  onNudgeClick,
  isLoading,
  progressContext,
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
      if (progressContext.completionPercentage < 50) {
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
              {role === 'professional' && (
                <div className="space-y-4">
                  <ProfessionalJourneyWelcomeCard 
                    progressContext={progressContext}
                    onActionClick={handleJourneyAction}
                  />
                  <ProfessionalJourneyPreview onBack={handleBack} />
                </div>
              )}

              {/* Family-specific content */}
              {role === 'family' && (
                <FamilyJourneyPreview onBack={handleBack} />
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
                <p className="text-sm text-gray-700 mb-3">
                  I'm here to help you navigate your caregiving journey. Whether you're a family seeking care, 
                  a professional caregiver, or a community member wanting to help, I'll guide you every step of the way.
                </p>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary-600 text-white"
                  onClick={() => window.location.href = '/auth'}
                >
                  Get Started
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
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
