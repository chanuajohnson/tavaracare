
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCog, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProfessionalJourneyPreviewProps {
  onBack: () => void;
}

export const ProfessionalJourneyPreview: React.FC<ProfessionalJourneyPreviewProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const professionalSteps = [
    "Create your account",
    "Complete your professional profile",
    "Upload certifications & documents", 
    "Set your availability preferences",
    "Complete training modules",
    "Schedule orientation session"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <UserCog className="h-6 w-6 text-green-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold leading-tight">Professional Onboarding</h3>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-50 via-green-50/70 to-transparent rounded-xl p-3 border border-green-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Sparkles className="h-3 w-3 text-green-400 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-green-700 mb-1 leading-tight">
          Ready to make a difference? 🤝
        </p>
        <p className="text-sm text-green-600 leading-relaxed">
          Join families who need your expertise. One step closer to your village of care.
        </p>
      </div>

      {/* Journey Preview */}
      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Your Onboarding Steps</span>
          <span className="text-sm text-green-600 font-semibold">17%</span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2 mb-3">
          <div className="bg-green-600 h-2 rounded-full w-1/6" />
        </div>
        
        <div className="space-y-2">
          {professionalSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                index === 0 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-green-300 bg-white'
              }`}>
                {index === 0 ? (
                  <span className="text-xs text-white font-bold">✓</span>
                ) : (
                  <span className="text-xs text-green-400 font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={`leading-tight ${
                index === 0 ? 'text-green-500 line-through' : 'text-green-700'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3 bg-green-600 hover:bg-green-700"
          onClick={() => navigate('/auth?tab=signup&role=professional')}
        >
          Start Your Professional Journey
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-auto py-2 text-muted-foreground hover:text-green-600"
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Back to options
        </Button>
      </div>
    </motion.div>
  );
};
