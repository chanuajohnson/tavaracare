
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FamilyJourneyPreviewProps {
  onBack: () => void;
}

export const FamilyJourneyPreview: React.FC<FamilyJourneyPreviewProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const familySteps = [
    "Complete your family profile",
    "Care needs assessment", 
    "Tell your loved one's story",
    "Review caregiver matches",
    "Set up medication management",
    "Plan meals and nutrition",
    "Schedule your first visit"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold leading-tight">Your Care Journey</h3>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 via-blue-50/70 to-transparent rounded-xl p-3 border border-blue-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-blue-700 mb-1 leading-tight">
          We're happy you're here! ✨
        </p>
        <p className="text-sm text-blue-600 leading-relaxed">
          Let's create a beautiful care plan for your loved one. One step closer to your village of care.
        </p>
      </div>

      {/* Journey Preview */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Your Journey Ahead</span>
          <span className="text-sm text-blue-600 font-semibold">0%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div className="bg-blue-600 h-2 rounded-full w-0" />
        </div>
        
        <div className="space-y-2">
          {familySteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full border border-blue-300 bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-400 font-semibold">{index + 1}</span>
              </div>
              <span className="text-blue-700 leading-tight">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/auth?tab=signup&role=family')}
        >
          Get Started on Your Journey
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-auto py-2 text-muted-foreground hover:text-blue-600"
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Back to options
        </Button>
      </div>
    </motion.div>
  );
};
