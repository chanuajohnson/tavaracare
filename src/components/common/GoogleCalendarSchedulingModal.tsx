
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, AlertCircle, Video, MapPin } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { validateChatInput } from "@/services/chat/utils/inputValidation";

interface GoogleCalendarSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  visitType?: 'virtual' | 'in_person' | null;
}

export const GoogleCalendarSchedulingModal = ({ 
  open, 
  onOpenChange, 
  onSuccess,
  visitType 
}: GoogleCalendarSchedulingModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsappNumber: ""
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    whatsappNumber: ""
  });

  const validateField = (fieldName: string, value: string) => {
    let fieldType: 'name' | 'email' | 'phone';
    switch (fieldName) {
      case 'name':
        fieldType = 'name';
        break;
      case 'email':
        fieldType = 'email';
        break;
      case 'whatsappNumber':
        fieldType = 'phone';
        break;
      default:
        return "";
    }

    const validation = validateChatInput(value, fieldType);
    return validation.isValid ? "" : validation.message;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const whatsappError = validateField('whatsappNumber', formData.whatsappNumber);

    setErrors({
      name: nameError,
      email: emailError,
      whatsappNumber: whatsappError
    });

    if (nameError || emailError || whatsappError) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    if (!user) {
      toast.error("Please log in to complete scheduling");
      return;
    }

    try {
      setIsLoading(true);

      // Update user profile with visit scheduling information
      const { error } = await supabase
        .from('profiles')
        .update({
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: new Date().toISOString(),
          visit_type: visitType || 'virtual',
          full_name: formData.name,
          phone_number: formData.whatsappNumber,
          // Store visit details in visit_notes
          visit_notes: JSON.stringify({
            contact_method: 'google_calendar',
            visit_type: visitType,
            scheduled_via: 'calendar_modal',
            contact_info: {
              name: formData.name,
              email: formData.email,
              whatsapp: formData.whatsappNumber
            }
          })
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track the scheduling completion
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          feature_name: 'visit_scheduling',
          action_type: 'visit_scheduled',
          session_id: `session_${Date.now()}`,
          additional_data: {
            visit_type: visitType,
            contact_method: 'google_calendar',
            form_data: formData
          }
        });

      toast.success(`${visitType === 'virtual' ? 'Virtual' : 'In-person'} visit scheduled successfully!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error("Failed to schedule visit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", whatsappNumber: "" });
    setErrors({ name: "", email: "", whatsappNumber: "" });
    onOpenChange(false);
  };

  const isFormValid = formData.name && formData.email && formData.whatsappNumber &&
                    !errors.name && !errors.email && !errors.whatsappNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {visitType === 'virtual' ? (
              <Video className="h-5 w-5 text-green-500" />
            ) : (
              <MapPin className="h-5 w-5 text-green-500" />
            )}
            Confirm Your Visit Details
          </DialogTitle>
          <DialogDescription>
            Please provide your contact information to complete the scheduling process.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Calendar Booking Completed
            </CardTitle>
            <CardDescription>
              You've selected your preferred time in Google Calendar. Now let's collect your contact details.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Phone Number *</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Enter your WhatsApp number"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                className={errors.whatsappNumber ? "border-red-500" : ""}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.whatsappNumber}
                </p>
              )}
              <p className="text-xs text-gray-500">
                We'll use this for visit coordination and reminders
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Confirming..." : "Confirm Visit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need to reschedule? You can update your appointment in Google Calendar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
