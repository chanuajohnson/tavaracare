
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Video, Home, CheckCircle, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverName?: string;
  onVisitScheduled?: () => void;
}

export const ScheduleVisitModal = ({ 
  open, 
  onOpenChange, 
  caregiverName = "your care coordinator",
  onVisitScheduled
}: ScheduleVisitModalProps) => {
  const { user } = useAuth();
  const [visitType, setVisitType] = useState<'virtual' | 'in_person'>('virtual');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestScheduling = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update user profile with scheduling request
      const { error } = await supabase
        .from('profiles')
        .update({
          ready_for_admin_scheduling: true,
          preferred_visit_type: visitType,
          admin_scheduling_requested_at: new Date().toISOString(),
          visit_scheduling_status: 'requested'
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsConfirmed(true);
      toast.success("Scheduling request sent to admin!");
      
      // Call the callback to update journey progress
      if (onVisitScheduled) {
        onVisitScheduled();
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsConfirmed(false);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error requesting admin scheduling:', error);
      toast.error("Failed to send scheduling request. Please try again.");
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setVisitType('virtual');
    setIsConfirmed(false);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  if (isConfirmed) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Scheduling Request Sent!
            </h3>
            <p className="text-gray-600 mb-4">
              Our admin team will schedule your {visitType === 'virtual' ? 'virtual' : 'in-person'} visit and contact you within 24 hours with the details.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive an email confirmation once your visit is scheduled.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Request Visit Scheduling</DialogTitle>
          <p className="text-muted-foreground">
            Choose your preferred visit type and our admin team will schedule you within 24 hours.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visit Type Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Your Preferred Visit Type</h3>
            <RadioGroup value={visitType} onValueChange={(value: 'virtual' | 'in_person') => setVisitType(value)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="virtual" id="virtual" />
                  <Label htmlFor="virtual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Video className="h-6 w-6 text-blue-600" />
                      <div>
                        <div className="font-medium">Virtual Visit</div>
                        <div className="text-sm text-gray-500">30-minute video call consultation</div>
                        <Badge variant="secondary" className="mt-1">FREE</Badge>
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="in_person" id="in_person" />
                  <Label htmlFor="in_person" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Home className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">In-Person Home Visit</div>
                        <div className="text-sm text-gray-500">Comprehensive home assessment</div>
                        <Badge variant="outline" className="mt-1">$300 TTD</Badge>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Standard Scheduling Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Standard Scheduling Information
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span><strong>Time:</strong> 11:00 AM start time</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span><strong>Duration:</strong> 2-hour appointment slot</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span><strong>Available Days:</strong> Tuesday - Friday</span>
              </div>
            </div>
          </div>

          {/* Visit Benefits */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">What's included in your visit:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Personalized care assessment</li>
              <li>• Access to detailed caregiver profiles</li>
              <li>• Custom care plan recommendations</li>
              <li>• Direct introduction to matched caregivers</li>
              {visitType === 'in_person' && (
                <li>• Comprehensive home safety evaluation</li>
              )}
            </ul>
          </div>

          {/* Admin Scheduling Notice */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">📋 Next Steps:</h4>
            <div className="text-sm text-amber-800">
              <p className="mb-2">Once you submit your preference:</p>
              <ul className="space-y-1">
                <li>• Our admin team will be notified of your scheduling request</li>
                <li>• We'll contact you within 24 hours to confirm your appointment</li>
                <li>• You'll receive an email with all visit details and preparation instructions</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRequestScheduling}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Sending Request...' : 'Request Admin Scheduling'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
