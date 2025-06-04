
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, CalendarDays, Clock, Shield, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'ready' | 'not-yet' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelection = async (choice: 'ready' | 'not-yet') => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Record the user's choice using existing profile fields
      const { error } = await supabase
        .from('profiles')
        .update({ 
          additional_notes: `Visit scheduling: ${choice} - ${new Date().toISOString()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track engagement
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_scheduling_choice',
          feature_name: 'schedule_visit',
          additional_data: { choice, timestamp: new Date().toISOString() }
        });

      toast.success(
        choice === 'ready' 
          ? "Great! We'll connect you with a care coordinator soon." 
          : "No problem! You can schedule when you're ready."
      );

      setSelectedOption(choice);
      
      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setSelectedOption(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error recording visit choice:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <VideoIcon className="h-6 w-6 text-primary" />
            Schedule Your Visit with Tavara
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visit Explanation */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">How Tavara Visits Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <VideoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Remote Video Touchpoints</h4>
                  <p className="text-sm text-blue-700">
                    Connect with your matched caregiver and Tavara care coordinator via secure video calls from the comfort of your home.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Flexible Scheduling</h4>
                  <p className="text-sm text-blue-700">
                    Choose to start right away or schedule a trial work day with your matched caregiver.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Risk-Free Trial</h4>
                  <p className="text-sm text-blue-700">
                    Pay Tavara rates for a trial day with no strings attached. Experience the care quality before committing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What Happens Next?</CardTitle>
              <CardDescription>
                Once you're ready to proceed and your caregiver is available:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm">Video introduction with your matched caregiver</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm">Discuss care needs and preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm">Schedule your trial day or start regular care</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span className="text-sm">Begin your personalized care journey</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {selectedOption ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {selectedOption === 'ready' 
                      ? "Perfect! We'll be in touch soon to coordinate your visit."
                      : "No worries! You can schedule when you're ready."}
                  </p>
                  <p className="text-sm text-green-700">
                    Your preference has been recorded and our admin team has been notified.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4">
              <Button 
                onClick={() => handleSelection('ready')}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Yes, I'm Ready to Proceed
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSelection('not-yet')}
                disabled={isSubmitting}
                className="flex-1"
              >
                Not Yet, Maybe Later
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
