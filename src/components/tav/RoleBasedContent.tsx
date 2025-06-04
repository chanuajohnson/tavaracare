
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, UserCog, Users, Globe, Shield, ArrowRight } from 'lucide-react';
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
  const { isReturningUser, lastRole, hasVisitedBefore } = useReturningUser();

  const getRoleDisplayName = (roleType: string) => {
    switch (roleType) {
      case 'family': return 'family member';
      case 'professional': return 'care professional';
      case 'community': return 'community supporter';
      default: return 'user';
    }
  };

  const getWelcomeBackMessage = () => {
    if (lastRole) {
      return `Welcome back! Ready to continue as a ${getRoleDisplayName(lastRole)}?`;
    }
    return "Welcome back! Ready to log in to access your dashboard?";
  };

  if (role === 'guest') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Welcome to Tavara</h3>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          I'm TAV, your virtual care coordinator. I'm here to help you navigate 
          your caregiving journey with warmth and expertise.
        </p>

        {/* Welcome Back Option for Returning Users */}
        {isReturningUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Button 
              variant="default" 
              size="sm" 
              className="w-full justify-between bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-md"
              onClick={() => navigate('/auth')}
            >
              <span className="text-sm font-medium">
                {getWelcomeBackMessage()}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {isReturningUser ? "Or start fresh:" : "How can I help you today?"}
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate('/registration/family')}
          >
            <Users className="h-4 w-4 mr-2" />
            I need care for a loved one
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate('/registration/professional')}
          >
            <UserCog className="h-4 w-4 mr-2" />
            I want to provide care services
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate('/registration/community')}
          >
            <Globe className="h-4 w-4 mr-2" />
            I want to support my community
          </Button>
        </div>
      </div>
    );
  }

  if (role === 'family' && progressContext) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Your Care Journey</h3>
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
        
        <p className="text-sm text-muted-foreground">
          You're doing great! I'm here to guide you through each step of setting up 
          care for your loved one.
        </p>
        
        {progressContext.nextAction && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-2">Next Step:</p>
            <p className="text-sm text-amber-700">{progressContext.nextAction}</p>
          </div>
        )}
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
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
          <UserCog className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold">Professional Dashboard</h3>
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
        
        <p className="text-sm text-muted-foreground">
          Complete your profile to start receiving job opportunities that match your skills.
        </p>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
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
          <Globe className="h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-semibold">Community Impact</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Thank you for being part of our care community. Your involvement makes 
          a real difference in families' lives.
        </p>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
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
          <Shield className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Admin Controls</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          I can help you send targeted nudges to users or review system insights.
        </p>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            Send Manual Nudge
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            View User Progress
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        I'm here to help guide you through your Tavara journey. 
        How can I assist you today?
      </p>
    </div>
  );
};
