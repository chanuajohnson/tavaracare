
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CommunityJourneyPreviewProps {
  onBack: () => void;
}

export const CommunityJourneyPreview: React.FC<CommunityJourneyPreviewProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const communitySteps = [
    "Complete your community profile",
    "Choose your support interests", 
    "Join local care circles",
    "Attend community events",
    "Start making a difference"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <Globe className="h-6 w-6 text-amber-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold leading-tight">Community Impact</h3>
      </div>
      
      {/* Welcome Message */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-amber-700 mb-1 leading-tight">
          Thank you for caring! 🌟
        </p>
        <p className="text-sm text-amber-600 leading-relaxed">
          Your support strengthens our entire care community. One step closer to your village of care.
        </p>
      </div>

      {/* Journey Preview */}
      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Your Community Journey</span>
          <span className="text-sm text-amber-600 font-semibold">0%</span>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2 mb-3">
          <div className="bg-amber-600 h-2 rounded-full w-0" />
        </div>
        
        <div className="space-y-2">
          {communitySteps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full border border-amber-300 bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-amber-400 font-semibold">{index + 1}</span>
              </div>
              <span className="text-amber-700 leading-tight">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full h-auto py-3 bg-amber-600 hover:bg-amber-700"
          onClick={() => navigate('/auth?tab=signup&role=community')}
        >
          Join Our Community
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start h-auto py-2 text-muted-foreground hover:text-amber-600"
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3 mr-2" />
          Back to options
        </Button>
      </div>
    </motion.div>
  );
};
