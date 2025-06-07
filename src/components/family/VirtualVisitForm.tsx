
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Loader2, User, Phone } from 'lucide-react';
import { validateChatInput } from '@/services/chat/utils/inputValidation';

interface VirtualVisitFormProps {
  selectedDate: Date;
  selectedTime: string;
  selectedSlotId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const VirtualVisitForm: React.FC<VirtualVisitFormProps> = ({
  selectedDate,
  selectedTime,
  selectedSlotId,
  onSuccess,
  onBack
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    whatsappNumber: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    whatsappNumber: ''
  });

  const validateForm = () => {
    const newErrors = { name: '', whatsappNumber: '' };
    let isValid = true;

    // Validate name
    const nameValidation = validateChatInput(formData.name, 'name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errorMessage || 'Name is required';
      isValid = false;
    }

    // Validate WhatsApp number
    const phoneValidation = validateChatInput(formData.whatsappNumber, 'phone');
    if (!phoneValidation.isValid) {
      newErrors.whatsappNumber = phoneValidation.errorMessage || 'Valid WhatsApp number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Book the virtual visit
      const { error } = await supabase
        .from('visit_bookings')
        .insert({
          user_id: user?.id,
          availability_slot_id: selectedSlotId,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedTime + ':00',
          visit_type: 'virtual',
          status: 'confirmed',
          contact_info: {
            name: formData.name,
            whatsapp_number: formData.whatsappNumber
          }
        });

      if (error) throw error;

      // Update user profile with visit status
      await supabase
        .from('profiles')
        .update({
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: selectedDate.toISOString().split('T')[0]
        })
        .eq('id', user?.id);

      toast.success('Virtual visit scheduled successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error booking virtual visit:', error);
      toast.error(error.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Complete Your Virtual Visit Booking</h3>
        <p className="text-sm text-gray-600 mb-4">
          Scheduled for {selectedDate.toLocaleDateString()} at {selectedTime}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={errors.name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp" className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4" />
            WhatsApp Number *
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            value={formData.whatsappNumber}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            placeholder="+1 (868) 123-4567"
            className={errors.whatsappNumber ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.whatsappNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.whatsappNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We'll send you the video call link via WhatsApp
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Virtual Visit'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
