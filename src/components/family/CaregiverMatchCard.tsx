
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SplitButton } from "@/components/ui/split-button";
import { MapPin, Star, MessageCircle, Loader2 } from "lucide-react";
import { SubscriptionFeatureLink } from "@/components/subscription/SubscriptionFeatureLink";
import { useChatButtonState } from "@/hooks/useChatButtonState";
import { toast } from "sonner";

interface Caregiver {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  care_types: string[] | null;
  years_of_experience: string | null;
  match_score: number;
  is_premium: boolean;
}

interface CaregiverMatchCardProps {
  caregiver: Caregiver;
  returnPath?: string;
  referringPagePath?: string;
  referringPageLabel?: string;
  showUnlockButton?: boolean;
  onStartChat?: () => void;
}

export const CaregiverMatchCard = ({ 
  caregiver, 
  returnPath = "/family/matching",
  referringPagePath = "/dashboard/family",
  referringPageLabel = "Family Dashboard",
  showUnlockButton = true,
  onStartChat
}: CaregiverMatchCardProps) => {
  const { buttonState, hasActiveChat, cancelChatRequest } = useChatButtonState(caregiver.id);

  console.log(`[CaregiverMatchCard] Rendering for caregiver: ${caregiver.id}`);
  console.log(`[CaregiverMatchCard] Button state:`, buttonState);
  console.log(`[CaregiverMatchCard] Has active chat: ${hasActiveChat}`);

  const handleChatClick = () => {
    console.log(`[CaregiverMatchCard] Chat button clicked for caregiver: ${caregiver.id}`);
    console.log(`[CaregiverMatchCard] Has active chat: ${hasActiveChat}, Button state:`, buttonState);
    
    if (onStartChat && !buttonState.isDisabled) {
      onStartChat();
    }
  };

  const handleCancelRequest = async () => {
    console.log(`[CaregiverMatchCard] Cancel button clicked for caregiver: ${caregiver.id}`);
    
    const result = await cancelChatRequest();
    if (result.success) {
      toast.success('Chat request cancelled successfully');
    } else {
      toast.error(result.error || 'Failed to cancel chat request');
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${caregiver.is_premium ? 'border-amber-300' : 'border-gray-200'} relative`}>
      {caregiver.is_premium && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-amber-500 text-white uppercase font-bold rounded-tl-none rounded-tr-sm rounded-br-none rounded-bl-sm px-2">
            Premium
          </Badge>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col items-center sm:items-start sm:w-1/4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={caregiver.avatar_url || undefined} />
            <AvatarFallback className="bg-primary-100 text-primary-800 text-xl">
              PC
            </AvatarFallback>
          </Avatar>
          
          <div className="mt-2 text-center sm:text-left">
            <h3 className="font-semibold">Professional Caregiver</h3>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>{caregiver.location}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              * Name protected until subscription
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">
              ID: {caregiver.id?.substring(0, 8) || 'N/A'}
            </div>
            <div className="mt-1 bg-primary-50 rounded px-2 py-1 text-center">
              <span className="text-sm font-medium text-primary-700">{caregiver.match_score}% Match</span>
            </div>
          </div>
        </div>
        
        <div className="sm:w-2/4 space-y-2">
          <div className="text-sm">
            <span className="font-medium">Experience:</span> {caregiver.years_of_experience}
          </div>
          
          <div className="text-sm">
            <span className="font-medium block mb-1">Specialties:</span>
            <div className="flex flex-wrap gap-1">
              {caregiver.care_types?.map((type, i) => (
                <Badge key={i} variant="outline" className="bg-gray-50">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sm:w-1/4 flex flex-col justify-center space-y-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star}
                className="h-4 w-4 text-amber-400"
              />
            ))}
          </div>
          
          {showUnlockButton && (
            <>
              {onStartChat ? (
                buttonState.showSplitButton ? (
                  <SplitButton
                    primaryAction={{
                      text: buttonState.splitButtons?.continue.text || 'Continue Chat',
                      variant: buttonState.splitButtons?.continue.variant || 'default',
                      onClick: handleChatClick,
                      disabled: buttonState.isDisabled
                    }}
                    secondaryAction={{
                      text: buttonState.splitButtons?.cancel.text || 'Cancel',
                      variant: buttonState.splitButtons?.cancel.variant || 'outline',
                      onClick: handleCancelRequest
                    }}
                    className="w-full"
                    size="default"
                  />
                ) : (
                  <Button
                    variant={buttonState.variant}
                    className="w-full"
                    onClick={handleChatClick}
                    disabled={buttonState.isDisabled}
                  >
                    {buttonState.showSpinner && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {!buttonState.showSpinner && (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    {buttonState.buttonText}
                  </Button>
                )
              ) : (
                <SubscriptionFeatureLink
                  featureType="Premium Caregiver Chat"
                  returnPath={returnPath}
                  referringPagePath={referringPagePath}
                  referringPageLabel={referringPageLabel}
                  variant="default"
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Match
                </SubscriptionFeatureLink>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
