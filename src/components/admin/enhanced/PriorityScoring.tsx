import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Heart, Shield } from 'lucide-react';

interface PriorityScoringProps {
  score: number;
  showDetails?: boolean;
}

export const PriorityScoring: React.FC<PriorityScoringProps> = ({ 
  score, 
  showDetails = false 
}) => {
  const getPriorityLevel = (score: number) => {
    if (score >= 85) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 55) return 'medium';
    return 'standard';
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getPriorityIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Heart className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const getPriorityDescription = (level: string) => {
    switch (level) {
      case 'critical': return 'Immediate attention required';
      case 'high': return 'High priority assignment';
      case 'medium': return 'Medium priority assignment';
      default: return 'Standard priority assignment';
    }
  };

  const level = getPriorityLevel(score);
  const color = getPriorityColor(level);
  const icon = getPriorityIcon(level);
  const description = getPriorityDescription(level);

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${color} flex items-center gap-1`}>
        {icon}
        {level.toUpperCase()}
      </Badge>
      
      {showDetails && (
        <div className="text-sm">
          <span className="font-medium">Score: {score}</span>
          <span className="text-gray-500 ml-2">{description}</span>
        </div>
      )}
    </div>
  );
};