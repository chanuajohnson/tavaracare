
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, FileCheck, Calendar, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';
import { ProgressContext } from '../types';

interface ProfessionalJourneyWelcomeCardProps {
  progressContext: ProgressContext;
  onActionClick?: () => void;
}

export const ProfessionalJourneyWelcomeCard: React.FC<ProfessionalJourneyWelcomeCardProps> = ({
  progressContext,
  onActionClick
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'foundation': return <Target className="h-4 w-4" />;
      case 'qualification': return <FileCheck className="h-4 w-4" />;
      case 'matching': return <Calendar className="h-4 w-4" />;
      case 'active': return <Briefcase className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'foundation': return 'from-blue-500 to-indigo-500';
      case 'qualification': return 'from-indigo-500 to-purple-500';
      case 'matching': return 'from-purple-500 to-pink-500';
      case 'active': return 'from-green-500 to-emerald-500';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getStageMessage = (stage: string, percentage: number) => {
    if (percentage === 100) {
      return "🌟 Congratulations! You're an active professional ready to make a difference in families' lives.";
    }
    
    switch (stage) {
      case 'foundation':
        return "💙 Building your professional foundation! Let's showcase your expertise and experience.";
      case 'qualification':
        return "📋 Great progress on qualifications! Your credentials build trust with families.";
      case 'matching':
        return "🎯 Almost ready to connect! Let's finalize your availability and preferences.";
      case 'active':
        return "🌟 You're an active professional! Continue growing your caregiving career.";
      default:
        return "🤝 Welcome to your professional journey! Let's build your caregiving career together.";
    }
  };

  const journeyStage = progressContext.journeyStage || 'foundation';
  const completedSteps = progressContext.completedSteps || 0;
  const totalSteps = progressContext.totalSteps || 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
        {/* Magical sparkle effects */}
        <div className="absolute top-2 right-2">
          <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" />
        </div>
        <div className="absolute bottom-2 left-2">
          <Sparkles className="h-3 w-3 text-primary/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <CardContent className="p-4 space-y-4">
          {/* Header with stage and progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getStageColor(journeyStage)} text-white`}>
                {getStageIcon(journeyStage)}
              </div>
              <div>
                <h3 className="font-semibold text-primary text-sm">Professional Journey</h3>
                <p className="text-xs text-gray-600 capitalize">{journeyStage} Stage</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-lg font-bold text-primary">{progressContext.completionPercentage}%</span>
              </div>
              <p className="text-xs text-gray-500">
                {completedSteps} of {totalSteps} steps
              </p>
            </div>
          </div>

          {/* Progress bar with gradient */}
          <div className="space-y-2">
            <Progress 
              value={progressContext.completionPercentage} 
              className="h-3 bg-gray-100"
            />
            <p className="text-xs text-gray-700 leading-relaxed">
              {getStageMessage(journeyStage, progressContext.completionPercentage)}
            </p>
          </div>

          {/* Next step action */}
          {progressContext.currentStep && progressContext.completionPercentage < 100 && (
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-primary text-sm mb-1">Next Step</h4>
                  <p className="text-xs text-gray-700">{progressContext.currentStep}</p>
                  {progressContext.nextAction && (
                    <p className="text-xs text-gray-600 mt-1">{progressContext.nextAction}</p>
                  )}
                </div>
                {onActionClick && (
                  <Button
                    size="sm"
                    onClick={onActionClick}
                    className="bg-primary hover:bg-primary-600 text-white ml-2"
                  >
                    Continue
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Completion celebration */}
          {progressContext.completionPercentage === 100 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <Briefcase className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 text-sm">🎉 Active Professional!</h4>
                  <p className="text-xs text-green-700">Ready to connect with families and grow your career</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
