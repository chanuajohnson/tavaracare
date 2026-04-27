
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, Star, CheckCircle } from 'lucide-react';

interface WaitingForCaregiverStateProps {
  caregiverName?: string; // Keep for backwards compatibility but don't use
}

export const WaitingForCaregiverState: React.FC<WaitingForCaregiverStateProps> = ({
  caregiverName // Ignore this prop to protect privacy
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-8 px-4"
    >
      <div className="space-y-6">
        {/* Animated clock icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-full border-4 border-amber-200">
              <Clock className="h-12 w-12 text-amber-600" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full"
            >
              <Heart className="h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main message - anonymized */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-800">
            Your message has been sent!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The professional caregiver has been notified of your interest. 
            They typically respond within a few hours.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 max-w-sm mx-auto">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center justify-center">
            <Star className="h-4 w-4 mr-1" />
            What happens next?
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
              <span>Caregiver reviews your message</span>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 mt-0.5 text-amber-500" />
              <span>They accept or decline the chat request</span>
            </div>
            <div className="flex items-start space-x-2">
              <Heart className="h-4 w-4 mt-0.5 text-red-500" />
              <span>If accepted, you can start asking questions!</span>
            </div>
          </div>
        </div>

        {/* Encouraging message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-sm text-gray-500 italic"
        >
          "Great caregivers are worth the wait! ✨"
        </motion.div>
      </div>
    </motion.div>
  );
};
