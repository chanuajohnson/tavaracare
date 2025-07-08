
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Heart, Star, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { ProfessionalFamilyChatService } from '@/services/professionalFamilyChatService';

interface ProfessionalFamilyChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    location?: string;
    care_types?: string[];
    special_needs?: string[];
    care_schedule?: string;
    budget_preferences?: string;
    match_score?: number;
  };
}

const INITIAL_MESSAGE_TEMPLATES = [
  "Hi! I'm a professional caregiver and I noticed your care needs align perfectly with my experience. I'd love to learn more about how I can help support your family.",
  "Hello! I have extensive experience in the care areas you've mentioned and I'm interested in discussing how I might be able to assist your family.",
  "Hi there! I'm a certified caregiver with experience in similar situations to yours. I'd be happy to chat about how I can support your family's needs.",
  "Hello! I've been providing care for families like yours for several years and would love to discuss how I can help meet your specific needs.",
];

export const ProfessionalFamilyChatModal = ({ open, onOpenChange, family }: ProfessionalFamilyChatModalProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'template' | 'review' | 'sent'>('template');

  useEffect(() => {
    if (open) {
      setStep('template');
      setSelectedTemplate('');
      setCustomMessage('');
    }
  }, [open]);

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setCustomMessage(template);
  };

  const handleNext = () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setStep('review');
  };

  const handleSendRequest = async () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ProfessionalFamilyChatService.sendChatRequest(
        family.id,
        customMessage.trim()
      );

      if (result.success) {
        setStep('sent');
        toast.success('Chat request sent successfully!');
      } else {
        toast.error(result.error || 'Failed to send chat request');
      }
    } catch (error) {
      console.error('Error sending chat request:', error);
      toast.error('Failed to send chat request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat with Family
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Family Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={family.avatar_url} />
                  <AvatarFallback>F</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Family Member</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {family.location}
                  </div>
                </div>
                <div className="ml-auto">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {family.match_score}% Match
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Care Needs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {family.care_types?.map((type, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              {family.special_needs && family.special_needs.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Special Needs:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {family.special_needs.map((need, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-blue-50">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {family.care_schedule}
                </div>
                <div>Budget: {family.budget_preferences || 'Not specified'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Steps */}
          {step === 'template' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Choose a message template:</h3>
                <div className="space-y-2">
                  {INITIAL_MESSAGE_TEMPLATES.map((template, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer border-2 transition-colors ${
                        selectedTemplate === template
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{template}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Or write your own message:</h3>
                <Textarea
                  placeholder="Write a personalized message to introduce yourself..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleNext} disabled={!customMessage.trim()}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Review your message:</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{customMessage}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Heart className="h-4 w-4 inline mr-1" />
                  Your message will be reviewed by TAV for safety and sent to the family.
                  They'll be able to accept or decline your request.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep('template')}>
                  Back
                </Button>
                <Button onClick={handleSendRequest} disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Request Sent!</h3>
                <p className="text-gray-600 mt-2">
                  Your chat request has been sent to the family. They'll receive a notification
                  and can choose to accept or decline your request.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
