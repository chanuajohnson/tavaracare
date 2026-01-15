import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Package, Phone, Mail, CheckCircle } from "lucide-react";

interface MarketingLeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const MarketingLeadCaptureModal: React.FC<MarketingLeadCaptureModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validateTrinidadPhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    
    // Trinidad format: 868-xxx-xxxx (10 digits) or xxx-xxxx (7 digits)
    if (digits.length === 10 && digits.startsWith('868')) {
      return true;
    }
    
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
      
      // Store lead in feature_interest_tracking table
      const { error } = await supabase
        .from('feature_interest_tracking')
        .insert({
          feature_name: 'marketing_kit_access',
          action_type: 'lead_capture',
          user_email: email,
          source_page: 'marketing_kit',
          additional_info: {
            whatsapp_number: formattedPhone,
            user_type: 'business_marketer',
            access_type: 'marketing_materials',
            interest_level: 'high',
            captured_from: 'marketing_kit_modal'
          }
        });

      if (error) throw error;

      setIsSuccess(true);
      
      toast({
        title: "Access Granted! 📦",
        description: "You can now download all marketing materials.",
        variant: "default"
      });

      // Auto-close and trigger success callback
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        onSuccess();
        // Reset form
        setWhatsappNumber('');
        setEmail('');
      }, 2000);

    } catch (error) {
      console.error('Error capturing marketing lead:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Access Granted! 📦
            </h3>
            <p className="text-muted-foreground mb-4">
              You can now download all marketing materials below.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Package className="h-5 w-5 text-primary" />
            Unlock Marketing Materials
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Get instant access to Tavara.care and Errands promotional assets for business use
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                For partnership updates and marketing resource notifications
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
              <p className="text-xs text-muted-foreground leading-relaxed">
                For new marketing materials and business updates
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Processing...' : 'Get Marketing Kit Access 📦'}
              </Button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to receive marketing-related communications from Tavara
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
