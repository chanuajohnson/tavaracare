
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Target, FileCheck, Calendar, Briefcase, Circle } from 'lucide-react';
import { ProfessionalJourneyStage } from '@/hooks/useEnhancedProfessionalProgress';

interface ProfessionalJourneyStageCardProps {
  stage: ProfessionalJourneyStage;
  isActive: boolean;
  index: number;
}

export const ProfessionalJourneyStageCard: React.FC<ProfessionalJourneyStageCardProps> = ({
  stage,
  isActive,
  index
}) => {
  const getStageIcon = (stageId: string) => {
    const iconClass = "h-5 w-5";
    switch (stageId) {
      case 'foundation':
        return <Target className={iconClass} />;
      case 'qualification':
        return <FileCheck className={iconClass} />;
      case 'matching':
        return <Calendar className={iconClass} />;
      case 'active':
        return <Briefcase className={iconClass} />;
      default:
        return <Circle className={iconClass} />;
    }
  };

  const getStageColor = (stage: ProfessionalJourneyStage) => {
    if (stage.isCompleted) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (stage.isActive) {
      return 'text-primary-600 bg-primary-50 border-primary-200';
    } else {
      return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (stage: ProfessionalJourneyStage) => {
    if (stage.isCompleted) return 'bg-green-500';
    if (stage.isActive) return 'bg-primary-500';
    return 'bg-gray-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`border-2 transition-all duration-300 hover:shadow-md ${getStageColor(stage)} ${
        isActive ? 'ring-2 ring-primary-200 shadow-lg' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stage.isCompleted ? 'bg-green-100' : stage.isActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
              {stage.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                getStageIcon(stage.id)
              )}
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${
                stage.isCompleted ? 'text-green-600' : 
                stage.isActive ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {stage.completionPercentage}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold text-sm ${
                stage.isCompleted ? 'text-green-800' : 
                stage.isActive ? 'text-primary-800' : 'text-gray-700'
              }`}>
                {stage.name}
              </h3>
              
              {stage.isCompleted && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                  Complete
                </Badge>
              )}
              {stage.isActive && (
                <Badge variant="outline" className="text-xs bg-primary-100 text-primary-700 border-primary-300">
                  Active
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {stage.description}
            </p>

            <div className="mt-3">
              <Progress 
                value={stage.completionPercentage} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
