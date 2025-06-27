
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Heart, Phone, Mail, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
  onSkipToCaregiverMatching?: () => void;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  open,
  onOpenChange,
  source = 'journey_progress',
  onSkipToCaregiverMatching
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateTrinidadPhone = (phone: string): boolean => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Check for Trinidad format: 868-xxx-xxxx (10 digits starting with 868)
    if (digits.length === 10 && digits.startsWith('868')) {
      return true;
    }
    
    // Check for format without country code: xxx-xxxx (7 digits)
    if (digits.length === 7) {
      return true;
    }
    
    return false;
  };

  const formatTrinidadPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 7) {
      return `868${digits}`;
    }
    
    return digits;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTrinidadPhone(whatsappNumber)) {
      toast({
        title: "Invalid WhatsApp Number",
        description: "Please enter a valid Trinidad phone number (868-xxx-xxxx or xxx-xxxx)",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = formatTrinidadPhone(whatsappNumber);
      
      // Check if lead already exists
      const { data: existingLead } = await supabase
        .from('feature_interest_tracking')
        .select('id')
        .or(`user_email.eq.${email},additional_info->>whatsapp_number.eq.${formattedPhone}`)
        .single();

      if (existingLead) {
        toast({
          title: "Already Registered",
          description: "This email or phone number is already in our system. Taking you to choose your care plan...",
          variant: "default"
        });
        
        setTimeout(() => {
          navigate('/subscription/features', { 
            state: { 
              email,
              phone: formattedPhone,
              source: 'existing_lead'
            }
          });
        }, 2000);
        return;
      }

      // Store lead in feature_interest_tracking table
      const { error } = await supabase
        .from('feature_interest_tracking')
        .insert({
          feature_name: 'care_journey_teaser',
          action_type: 'lead_capture',
          user_email: email,
          source_page: source,
          additional_info: {
            whatsapp_number: formattedPhone,
            user_status: 'teaser_viewer',
            captured_from: 'journey_progress_modal',
            interest_level: 'high',
            source_component: source
          }
        });

      if (error) throw error;

      setIsSuccess(true);
      
      toast({
        title: "Information Captured! 💙",
        description: "Now choose your care plan to get matched with caregivers.",
        variant: "default"
      });

      // Auto-close and redirect after success
      setTimeout(() => {
        onOpenChange(false);
        navigate('/subscription/features', { 
          state: { 
            email,
            phone: formattedPhone,
            source: 'lead_capture_modal',
            returnPath: '/family/care-journey-progress'
          }
        });
      }, 3000);

    } catch (error) {
      console.error('Error capturing lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipToSubscription = () => {
    onOpenChange(false);
    navigate('/subscription/features');
  };

  // Phase 1B: Handle skip to caregiver matching
  const handleSkipToCaregiverMatching = () => {
    onOpenChange(false);
    if (onSkipToCaregiverMatching) {
      onSkipToCaregiverMatching();
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to Choose Your Care Plan! 💙
            </h3>
            <p className="text-gray-600 mb-4">
              Now select the care plan that's right for your family to get matched with qualified caregivers.
            </p>
            <p className="text-sm text-gray-500">
              Taking you to care plan options...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Heart className="h-5 w-5 text-primary" />
            Start Building Your Care Village
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Get your personalized caregiver match by choosing the right care plan for your family.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="868-xxx-xxxx"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500">
                We'll send you care updates and caregiver matches via WhatsApp
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500">
                For care plans, scheduling, and important updates
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'Saving Info...' : 'Bypass it all to Find Caregiver Matches 💙'}
              </Button>
              
              {onSkipToCaregiverMatching ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkipToCaregiverMatching}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip for now, see your caregiver match
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkipToSubscription}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip for now, view care plans
                </Button>
              )}
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              By continuing, you agree to receive care-related communications from Tavara
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
