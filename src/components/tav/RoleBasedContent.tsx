import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, UserCog, Users, Globe, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReturningUser } from './hooks/useReturningUser';
import { motion } from 'framer-motion';

interface RoleBasedContentProps {
  role: 'guest' | 'family' | 'professional' | 'community' | 'admin' | null;
  progressContext?: {
    completionPercentage: number;
    currentStep: string;
    nextAction?: string;
  };
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({ 
  role, 
  progressContext 
}) => {
  const navigate = useNavigate();
  const { isReturningUser, lastRole, hasVisitedBefore, detectionMethod } = useReturningUser();

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

  if (role === 'guest') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-6 w-6 text-primary flex-shrink-0" />
          <h3 className="text-lg font-semibold leading-tight">Welcome to Tavara</h3>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          I'm TAV, your virtual care coordinator. I'm here to help you navigate 
          your caregiving journey with warmth and expertise.
        </p>

        {/* Enhanced Welcome Back Option for Returning Users */}
        {isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-6"
          >
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 text-primary border-2 border-primary/20 hover:border-primary/30 min-h-[4rem] h-auto py-4 px-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/auth')}
            >
              {/* Subtle sparkle effect for VIP treatment */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                <Sparkles className="h-3 w-3 absolute top-2 right-3 text-primary/60 animate-pulse" />
                <Sparkles className="h-2 w-2 absolute bottom-2 left-3 text-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="flex items-center justify-between w-full min-w-0 relative z-10">
                <div className="flex flex-col items-start text-left min-w-0 flex-1 mr-3">
                  <span className="text-base font-semibold leading-tight mb-1">
                    {getContextualWelcomeMessage().main}
                  </span>
                  <span className="text-sm opacity-95 leading-tight mb-1 break-words">
                    {getContextualWelcomeMessage().sub}
                  </span>
                  <span className="text-xs opacity-80 leading-tight break-words">
                    {getContextualWelcomeMessage().detail}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Button>
            
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
            {isReturningUser ? "Or explore other options:" : "How can I help you today?"}
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
            onClick={() => navigate('/registration/family')}
          >
            <Users className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-left leading-tight">I need care for a loved one</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-auto py-3 px-4 hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
            onClick={() => navigate('/registration/professional')}
          >
            <UserCog className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-left leading-tight">I want to provide care services</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-auto py-3 px-4 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200"
            onClick={() => navigate('/registration/community')}
          >
            <Globe className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="text-left leading-tight">I want to support my community</span>
          </Button>
        </div>
      </div>
    );
  }

  if (role === 'family' && progressContext) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold leading-tight">Your Care Journey</h3>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-blue-600 font-semibold">
              {progressContext.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressContext.completionPercentage}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          You're doing great! I'm here to guide you through each step of setting up 
          care for your loved one.
        </p>
        
        {progressContext.nextAction && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-2">Next Step:</p>
            <p className="text-sm text-amber-700 leading-relaxed">{progressContext.nextAction}</p>
          </div>
        )}
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3"
          onClick={() => navigate('/dashboard/family')}
        >
          Continue Your Journey
        </Button>
      </div>
    );
  }

  if (role === 'professional' && progressContext) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCog className="h-6 w-6 text-green-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold leading-tight">Professional Dashboard</h3>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-green-600 font-semibold">
              {progressContext.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressContext.completionPercentage}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          Complete your profile to start receiving job opportunities that match your skills.
        </p>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3"
          onClick={() => navigate('/dashboard/professional')}
        >
          Complete Profile
        </Button>
      </div>
    );
  }

  if (role === 'community') {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className="space-y-4">
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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        I'm here to help guide you through your Tavara journey. 
        How can I assist you today?
      </p>
    </div>
  );
};
