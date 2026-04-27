
import React from 'react';
import { CheckCircle2, Circle, Clock, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationProgressIndicatorProps {
  currentStage: string;
}

const stages = [
  { key: 'introduction', label: 'Introduction', icon: Circle },
  { key: 'interest_expression', label: 'Express Interest', icon: MessageCircle },
  { key: 'waiting_acceptance', label: 'Waiting for Response', icon: Clock },
  { key: 'guided_qa', label: 'Q&A', icon: CheckCircle2 }
];

export const ConversationProgressIndicator: React.FC<ConversationProgressIndicatorProps> = ({
  currentStage
}) => {
  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.key === currentStage);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = stage.icon;
          
          return (
            <div key={stage.key} className="flex items-center">
              <motion.div
                className={`flex items-center space-x-2 ${
                  isActive 
                    ? 'text-blue-600 font-semibold' 
                    : isCompleted 
                    ? 'text-green-600' 
                    : 'text-gray-400'
                }`}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ 
                  scale: isActive ? 1.05 : 1, 
                  opacity: isActive ? 1 : isCompleted ? 0.8 : 0.5 
                }}
                transition={{ duration: 0.3 }}
              >
                <div className={`p-2 rounded-full ${
                  isActive 
                    ? 'bg-blue-100' 
                    : isCompleted 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm hidden sm:inline">{stage.label}</span>
              </motion.div>
              
              {index < stages.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      {currentStage === 'waiting_acceptance' && (
        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <Clock className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Caregiver typically responds within a few hours</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
