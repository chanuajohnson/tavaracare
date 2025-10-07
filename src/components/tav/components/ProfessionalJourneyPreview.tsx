
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCog, ArrowLeft, Sparkles, CheckCircle, Target, FileCheck, Calendar, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEnhancedProfessionalProgress } from '@/hooks/useEnhancedProfessionalProgress';
import { Progress } from '@/components/ui/progress';

interface ProfessionalJourneyPreviewProps {
  onBack: () => void;
}

export const ProfessionalJourneyPreview: React.FC<ProfessionalJourneyPreviewProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { steps, stages, currentStage, overallProgress, nextStep, completedSteps, totalSteps, loading } = useEnhancedProfessionalProgress();

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

  const getCurrentStageData = () => {
    return stages.find(stage => stage.id === currentStage) || stages[0];
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <UserCog className="h-6 w-6 text-primary flex-shrink-0" />
          <h3 className="text-lg font-semibold leading-tight">Professional Journey</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const stageData = getCurrentStageData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <UserCog className="h-6 w-6 text-primary flex-shrink-0" />
        <h3 className="text-lg font-semibold leading-tight">Professional Journey</h3>
      </div>
      
      {/* Current Stage Progress */}
      <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getStageColor(currentStage)} text-white`}>
              {getStageIcon(currentStage)}
            </div>
            <div>
              <h4 className="font-semibold text-primary text-sm">{stageData.name}</h4>
              <p className="text-xs text-gray-600 capitalize">{currentStage} Stage</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-lg font-bold text-primary">{overallProgress}%</span>
            </div>
            <p className="text-xs text-gray-500">
              {completedSteps} of {totalSteps} steps
            </p>
          </div>
        </div>

        <Progress value={overallProgress} className="h-2 bg-gray-100 mb-2" />
        <p className="text-xs text-gray-700 leading-relaxed">
          {stageData.description}
        </p>
      </div>

      {/* Journey Steps - showing only first 4 for compact view */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Journey Steps</span>
          <span className="text-sm text-primary font-semibold">{overallProgress}%</span>
        </div>
        
        <div className="space-y-2">
          {steps.slice(0, 4).map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                step.completed 
                  ? 'border-primary bg-primary' 
                  : 'border-gray-300 bg-white'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-2 w-2 text-white" />
                ) : (
                  <span className="text-xs text-gray-400 font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={`leading-tight ${
                step.completed ? 'text-primary' : 'text-gray-700'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
          {steps.length > 4 && (
            <div className="text-xs text-gray-500 ml-6">
              +{steps.length - 4} more steps...
            </div>
          )}
        </div>
      </div>

      {/* Next Step Action */}
      {nextStep && (
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-primary text-sm mb-1">Next Step</h4>
              <p className="text-xs text-gray-700">{nextStep.title}</p>
              {nextStep.description && (
                <p className="text-xs text-gray-600 mt-1">{nextStep.description}</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => nextStep.action()}
              className="bg-primary hover:bg-primary-600 text-white ml-2"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Completion celebration */}
      {overallProgress === 100 && (
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

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3 bg-primary hover:bg-primary-600"
          onClick={() => navigate('/professional/profile')}
        >
          View Full Professional Dashboard
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-auto py-2 text-muted-foreground hover:text-primary"
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Back to options
        </Button>
      </div>
    </motion.div>
  );
};
