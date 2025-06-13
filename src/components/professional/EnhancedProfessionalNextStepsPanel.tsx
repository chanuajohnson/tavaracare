
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Clock, Target, TrendingUp, BookOpen, FileCheck, Calendar, Briefcase } from 'lucide-react';
import { useEnhancedProfessionalProgress } from '@/hooks/useEnhancedProfessionalProgress';
import { ProfessionalJourneyStageCard } from './ProfessionalJourneyStageCard';

export const EnhancedProfessionalNextStepsPanel = () => {
  const {
    steps,
    stages,
    currentStage,
    overallProgress,
    nextStep,
    completedSteps,
    totalSteps,
    loading,
    refreshProgress
  } = useEnhancedProfessionalProgress();

  const [showAllSteps, setShowAllSteps] = useState(false);

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'foundation': return <Target className="h-4 w-4" />;
      case 'qualification': return <FileCheck className="h-4 w-4" />;
      case 'matching': return <Calendar className="h-4 w-4" />;
      case 'active': return <Briefcase className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStepIcon = (step: any) => {
    switch (step.category) {
      case 'profile': return <Target className="h-4 w-4" />;
      case 'documents': return <FileCheck className="h-4 w-4" />;
      case 'training': return <BookOpen className="h-4 w-4" />;
      case 'availability': return <Calendar className="h-4 w-4" />;
      case 'assignments': return <Briefcase className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-500">Loading your professional journey...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleSteps = showAllSteps ? steps : steps.slice(0, 4);
  const currentStageData = stages.find(s => s.id === currentStage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with Progress */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Your Professional Journey</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Building your path to caregiving excellence
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {completedSteps} of {totalSteps} steps</span>
              {currentStageData && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStageIcon(currentStage)}
                  {currentStageData.name}
                </Badge>
              )}
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Journey Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, index) => (
          <ProfessionalJourneyStageCard
            key={stage.id}
            stage={stage}
            isActive={stage.id === currentStage}
            index={index}
          />
        ))}
      </div>

      {/* Next Steps */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Your Next Steps
          </CardTitle>
          {nextStep && (
            <p className="text-sm text-gray-600">
              Continue with: <span className="font-medium text-primary">{nextStep.title}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {visibleSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : step.id === nextStep?.id 
                    ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-100' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="relative">
                      {getStepIcon(step)}
                      {step.id === nextStep?.id && (
                        <div className="absolute -inset-1 bg-primary-200 rounded-full animate-pulse opacity-50" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium text-sm ${step.completed ? 'text-green-700' : 'text-gray-900'}`}>
                      {step.title}
                    </h4>
                    {step.isInteractive && (
                      <Badge variant="secondary" className="text-xs">Interactive</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!step.completed && step.id === nextStep?.id && (
                    <div className="flex items-center text-xs text-orange-600 gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Next</span>
                    </div>
                  )}
                  
                  <Button
                    variant={step.completed ? "outline" : "default"}
                    size="sm"
                    onClick={step.action}
                    className={`text-xs px-3 py-1 ${
                      step.id === nextStep?.id ? 'bg-primary hover:bg-primary-600' : ''
                    }`}
                    disabled={step.id === 1 && step.completed}
                  >
                    {step.buttonText}
                    {!step.completed && <ArrowRight className="ml-1 h-3 w-3" />}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {steps.length > 4 && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="text-primary hover:text-primary-600"
              >
                {showAllSteps ? 'Show Less' : `Show All ${steps.length} Steps`}
                <ArrowRight className={`ml-1 h-3 w-3 transition-transform ${showAllSteps ? 'rotate-90' : ''}`} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {nextStep && (
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-800">Ready to continue?</h4>
                <p className="text-sm text-primary-600 mt-1">
                  Complete "{nextStep.title}" to advance your professional journey
                </p>
              </div>
              <Button 
                onClick={nextStep.action}
                className="bg-primary hover:bg-primary-600 text-white"
              >
                Continue Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
