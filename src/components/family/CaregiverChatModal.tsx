
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, Crown, Lock } from 'lucide-react';
import { useTAVConversation } from '@/components/tav/hooks/useTAVConversation';
import { SubscriptionFeatureLink } from '@/components/subscription/SubscriptionFeatureLink';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

interface Caregiver {
  id: string;
  full_name: string;
  first_name: string;
  avatar_url: string | null;
  location: string | null;
  match_score: number;
  years_of_experience: string | null;
  care_types: string[] | null;
}

interface CaregiverChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: Caregiver;
  returnPath?: string;
  referringPagePath?: string;
  referringPageLabel?: string;
}

export const CaregiverChatModal: React.FC<CaregiverChatModalProps> = ({
  open,
  onOpenChange,
  caregiver,
  returnPath = "/family/matching",
  referringPagePath = "/dashboard/family",
  referringPageLabel = "Family Dashboard"
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);
  const [hasUnlimitedMessaging, setHasUnlimitedMessaging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const conversationContext = {
    currentPage: 'caregiver-chat',
    currentForm: 'caregiver-matching',
    userRole: 'family',
    sessionId: `caregiver-chat-${caregiver.id}-${user?.id}`,
    formFields: {
      caregiverName: caregiver.first_name,
      matchScore: caregiver.match_score,
      caregiverExperience: caregiver.years_of_experience,
      caregiverLocation: caregiver.location,
      caregiverSpecialties: caregiver.care_types
    }
  };

  const { messages, isTyping, sendMessage, clearConversation } = useTAVConversation(conversationContext);

  const dailyMessageLimit = 3;
  const canSendMessage = hasUnlimitedMessaging || messagesUsedToday < dailyMessageLimit;

  useEffect(() => {
    if (open && user) {
      checkDailyMessageUsage();
      checkSubscriptionStatus();
      initializeChat();
    }
  }, [open, user]);

  const checkDailyMessageUsage = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessionId = conversationContext.sessionId;
      
      // Count messages sent today for this specific chat session
      const { data, error } = await supabase
        .from('cta_engagement_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('action_type', 'caregiver_chat_message')
        .eq('session_id', sessionId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (!error && data) {
        setMessagesUsedToday(data.length);
      }
    } catch (error) {
      console.error('Error checking daily message usage:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    // TODO: Implement actual subscription status check
    // For now, assume no unlimited messaging
    setHasUnlimitedMessaging(false);
  };

  const initializeChat = async () => {
    if (messages.length === 0) {
      const welcomeMessage = `Hi! I'm TAV, your care coordinator. I'll help facilitate your conversation with ${caregiver.first_name}, a ${caregiver.years_of_experience} caregiver who's a ${caregiver.match_score}% match for your needs. 

I'm here to keep everyone safe and ensure productive conversations. ${hasUnlimitedMessaging ? 'You have unlimited messaging!' : `You have ${dailyMessageLimit - messagesUsedToday} messages remaining today.`}

What would you like to know about ${caregiver.first_name}'s caregiving experience?`;

      // This won't count against the daily limit since it's a system message
      await sendMessage(welcomeMessage);
    }
  };

  const trackMessageSent = async () => {
    if (!user) return;
    
    try {
      await supabase.from('cta_engagement_tracking').insert({
        user_id: user.id,
        action_type: 'caregiver_chat_message',
        feature_name: 'caregiver_matching',
        session_id: conversationContext.sessionId,
        additional_data: {
          caregiver_id: caregiver.id,
          match_score: caregiver.match_score,
          message_number: messagesUsedToday + 1
        }
      });
    } catch (error) {
      console.error('Error tracking message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !canSendMessage || isTyping) return;

    setIsLoading(true);
    
    try {
      // Check for contact information sharing
      const contactRegex = /(\d{3}[-.]?\d{3}[-.]?\d{4}|\b\d{7,}\b|@\w+\.\w+|whatsapp|telegram|facebook|instagram|email|phone|number|address|location|meet|visit)/i;
      
      if (contactRegex.test(input)) {
        await sendMessage("I notice you're trying to share contact information or arrange meetings. For everyone's safety, please keep conversations focused on caregiving topics. Contact details will be shared after you upgrade to Full Caregiver Access.");
        setInput('');
        setIsLoading(false);
        return;
      }

      await sendMessage(input);
      setInput('');
      
      if (!hasUnlimitedMessaging) {
        await trackMessageSent();
        setMessagesUsedToday(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={caregiver.avatar_url || undefined} />
              <AvatarFallback className="bg-primary-100 text-primary-800">
                {caregiver.first_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Chat with {caregiver.first_name}
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {caregiver.match_score}% Match
                </Badge>
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Moderated by TAV • {caregiver.location} • {caregiver.years_of_experience} experience
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Message Usage Indicator */}
          {!hasUnlimitedMessaging && (
            <div className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {messagesUsedToday}/{dailyMessageLimit} messages used today
                  </span>
                </div>
                {messagesUsedToday >= dailyMessageLimit && (
                  <SubscriptionFeatureLink
                    featureType="Unlimited Messaging"
                    returnPath={returnPath}
                    referringPagePath={referringPagePath}
                    referringPageLabel={referringPageLabel}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade
                  </SubscriptionFeatureLink>
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((message, index) => (
              <div key={message.id || index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-primary text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-800">TAV</span>
                      </div>
                      <span className="text-xs text-gray-500">Care Coordinator</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-800">TAV</span>
                    </div>
                    <span className="text-xs text-gray-500">Care Coordinator</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 mt-4">
            {!canSendMessage ? (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  You've used your daily message limit. Upgrade for unlimited messaging!
                </p>
                <SubscriptionFeatureLink
                  featureType="Unlimited Messaging"
                  returnPath={returnPath}
                  referringPagePath={referringPagePath}
                  referringPageLabel={referringPageLabel}
                  variant="default"
                  className="w-full"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Unlock Unlimited Messaging
                </SubscriptionFeatureLink>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about their experience, availability, or care approach..."
                  disabled={isLoading || isTyping}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || isTyping}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
