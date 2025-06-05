
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface GoogleCalendarSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleConfirmed: () => void;
}

export const GoogleCalendarSchedulingModal: React.FC<GoogleCalendarSchedulingModalProps> = ({
  open,
  onOpenChange,
  onScheduleConfirmed
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'calendar' | 'confirm'>('calendar');
  const [isConfirming, setIsConfirming] = useState(false);

  const calendarUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0zpjFp9GxbxjVNxZttxh9YdswYlq0Wh8_r5FbOHZ5C_ozMGwMd_I7gd9-XJbI3SjhXLRPGfH0B?gv=true";

  const handleScheduleConfirmation = async () => {
    if (!user) return;
    
    setIsConfirming(true);
    try {
      // Update the user's visit scheduling status to 'scheduled'
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: new Date().toISOString() // This will be manually updated by admin with actual date
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track the scheduling action
      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_scheduled_via_calendar',
          feature_name: 'schedule_visit',
          additional_data: { 
            calendar_used: true,
            timestamp: new Date().toISOString() 
          }
        });

      toast.success("Great! Your visit has been scheduled. We'll follow up with confirmation details.");
      
      onScheduleConfirmed();
      onOpenChange(false);
      setStep('calendar'); // Reset for next time
      
    } catch (error) {
      console.error('Error confirming schedule:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            Schedule Your Visit with Tavara
          </DialogTitle>
        </DialogHeader>

        {step === 'calendar' && (
          <div className="space-y-4">
            {/* Instructions */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  How to Schedule Your Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <div className="space-y-2">
                  <p>• All appointments are scheduled for <strong>11:00 AM - 1:00 PM</strong> (2-hour slots)</p>
                  <p>• Available dates are within the next <strong>14 days</strong></p>
                  <p>• Select your preferred date from the calendar below</p>
                  <p>• After booking, click "I've Selected My Date" to confirm</p>
                </div>
              </CardContent>
            </Card>

            {/* Google Calendar Iframe */}
            <div className="w-full">
              <iframe
                src={calendarUrl}
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                title="Schedule Your Visit"
                className="rounded-lg shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('confirm')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                I've Selected My Date
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Confirm Your Scheduling
                </CardTitle>
                <CardDescription className="text-green-700">
                  Please confirm that you've successfully selected a date and time in the Google Calendar above.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">What happens next:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• You'll receive a confirmation email within 24 hours</li>
                    <li>• Our team will call you 2 days before your visit to confirm details</li>
                    <li>• If you need to reschedule, we'll help you find a new time</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToCalendar}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Calendar
                  </Button>
                  <Button 
                    onClick={handleScheduleConfirmation}
                    disabled={isConfirming}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isConfirming ? 'Confirming...' : 'Yes, Confirm My Visit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
