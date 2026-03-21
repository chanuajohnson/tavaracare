import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Calendar as CalendarIcon, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverName?: string;
  onVisitScheduled?: () => void;
}

type CareOption = 'trial_day' | 'direct_hire';

export const ScheduleVisitModal = ({ 
  open, 
  onOpenChange, 
  caregiverName = "your care coordinator",
  onVisitScheduled
}: ScheduleVisitModalProps) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<CareOption>('trial_day');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestScheduling = async () => {
    if (!user) return;
    if (!selectedDate) {
      toast.error("Please select your preferred start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ready_for_admin_scheduling: true,
          preferred_visit_type: selectedOption,
          admin_scheduling_requested_at: new Date().toISOString(),
          visit_scheduling_status: 'ready_to_schedule',
          preferred_start_date: selectedDate.toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsConfirmed(true);
      toast.success("Care request submitted successfully!");
      
      if (onVisitScheduled) onVisitScheduled();
      
      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 2500);
      
    } catch (error) {
      console.error('Error submitting care request:', error);
      toast.error("Failed to submit request. Please try again.");
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedOption('trial_day');
    setSelectedDate(undefined);
    setIsConfirmed(false);
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetModal();
    onOpenChange(open);
  };

  if (isConfirmed) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {selectedOption === 'trial_day' ? 'Trial Day Request Sent!' : 'Hire Request Submitted!'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedOption === 'trial_day'
                ? `Your trial day request for ${format(selectedDate!, 'PPP')} has been submitted. Our team will confirm your matched caregiver within 24 hours.`
                : `Your care start request for ${format(selectedDate!, 'PPP')} has been submitted. We'll set up your recurring care schedule and confirm within 24 hours.`}
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive an email confirmation with all the details.
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
          <DialogTitle className="text-2xl font-bold">Get Started with Care</DialogTitle>
          <p className="text-muted-foreground">
            Choose how you'd like to begin — try a caregiver for a day or start ongoing care right away.
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <RadioGroup value={selectedOption} onValueChange={(v: CareOption) => setSelectedOption(v)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trial Day */}
              <div 
                className={cn(
                  "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  selectedOption === 'trial_day' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedOption('trial_day')}
              >
                <RadioGroupItem value="trial_day" id="trial_day" className="mt-1" />
                <Label htmlFor="trial_day" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Trial Day</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Try a matched caregiver for a full 8-hour day
                  </p>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">$320 TTD ($40/hr)</Badge>
                </Label>
              </div>

              {/* Hire Immediately */}
              <div 
                className={cn(
                  "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  selectedOption === 'direct_hire' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedOption('direct_hire')}
              >
                <RadioGroupItem value="direct_hire" id="direct_hire" className="mt-1" />
                <Label htmlFor="direct_hire" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Hire Immediately</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Start ongoing care with your preferred caregiver
                  </p>
                  <Badge variant="outline">From $40 TTD/hr</Badge>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Date Picker */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Your Preferred Start Date
            </h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const day = date.getDay();
                    return date < today || day === 0 || day === 1; // Disable past, Sun, Mon
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">Available: Tuesday – Saturday</p>
          </div>

          {/* Contextual Info */}
          {selectedOption === 'trial_day' && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Trial Day Details
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full 8-hour day with a matched caregiver (8 AM – 4 PM)</li>
                <li>• Your $320 trial credit applies toward a subscription if you convert</li>
                <li>• Personalized care based on your assessment</li>
                <li>• Admin confirms your caregiver match within 24 hours</li>
              </ul>
            </div>
          )}

          {selectedOption === 'direct_hire' && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Ongoing Care Details
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• We'll match you with the best available caregiver for your needs</li>
                <li>• Recurring care schedule set up by our admin team</li>
                <li>• Flexible scheduling based on your care assessment</li>
                <li>• Change or adjust your care plan anytime</li>
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-medium text-foreground mb-2">📋 What happens next:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. You submit your preference and preferred start date</li>
              <li>2. Our team assigns your best-matched available caregiver</li>
              <li>3. You receive confirmation with caregiver details within 24 hours</li>
              {selectedOption === 'trial_day' && (
                <li>4. After your trial day, choose to hire or subscribe for ongoing care</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleRequestScheduling} disabled={isSubmitting || !selectedDate} className="flex-1">
              {isSubmitting 
                ? 'Submitting...' 
                : selectedOption === 'trial_day' 
                  ? 'Request Trial Day ($320 TTD)' 
                  : 'Request Care Start'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
