import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompleteRegistrationButtonProps {
  onComplete: () => void;
  isFormReady: boolean;
}

export const CompleteRegistrationButton: React.FC<CompleteRegistrationButtonProps> = ({
  onComplete,
  isFormReady
}) => {
  if (!isFormReady) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              Personal & Contact Information Complete
            </span>
          </div>
          
          <Button 
            onClick={onComplete}
            className="bg-primary hover:bg-primary/90 text-white"
            size="sm"
          >
            Complete Registration
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          🎯 Continue to lead capture and unlock full access
        </p>
      </div>
    </motion.div>
  );
};