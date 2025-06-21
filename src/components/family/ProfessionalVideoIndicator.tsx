
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Crown } from 'lucide-react';
import { SubscriptionFeatureLink } from '@/components/subscription/SubscriptionFeatureLink';

interface ProfessionalVideoIndicatorProps {
  professionalId: string;
  professionalName: string;
  videoAvailable: boolean;
  userHasSubscription?: boolean;
}

export const ProfessionalVideoIndicator: React.FC<ProfessionalVideoIndicatorProps> = ({
  professionalId,
  professionalName,
  videoAvailable,
  userHasSubscription = false
}) => {
  if (!videoAvailable) {
    return null;
  }

  if (userHasSubscription) {
    // Premium users can directly start video calls
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
          <Video className="w-3 h-3" />
          Video Available
        </Badge>
        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
          <Video className="w-4 h-4 mr-1" />
          Start Video Call
        </Button>
      </div>
    );
  }

  // Non-subscribers see video indicator but need to upgrade
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-200">
        <Video className="w-3 h-3" />
        Video Available
      </Badge>
      
      <SubscriptionFeatureLink
        featureName="video_calls"
        className="text-xs"
        trackingData={{
          professional_id: professionalId,
          professional_name: professionalName,
          feature_type: 'video_call'
        }}
      >
        <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">
          <Crown className="w-4 h-4 mr-1" />
          Upgrade for Video
        </Button>
      </SubscriptionFeatureLink>
    </div>
  );
};
