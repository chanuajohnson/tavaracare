
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [step, setStep] = useState<'calendar' | 'confirm' | 'date-input'>('calendar');
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');

  const calendarUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0zpjFp9GxbxjVNxZttxh9YdswYlq0Wh8_r5FbOHZ5C_ozMGwMd_I7gd9-XJbI3SjhXLRPGfH0B?gv=true";

  const handleScheduleConfirmation = async () => {
    if (!user || !selectedDate) return;
    
    setIsConfirming(true);
    try {
      // Create a proper date object from the selected date and time
      const scheduledDateTime = new Date(`${selectedDate} ${selectedTime}`);
      
      // Update the user's visit scheduling status to 'scheduled'
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: scheduledDateTime.toISOString(),
          visit_notes: `Visit scheduled via Google Calendar on ${new Date().toLocaleDateString()}`
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
            scheduled_date: scheduledDateTime.toISOString(),
            timestamp: new Date().toISOString() 
          }
        });

      toast.success("Great! Your visit has been scheduled. We'll follow up with confirmation details.");
      
      onScheduleConfirmed();
      onOpenChange(false);
      resetModal();
      
    } catch (error) {
      console.error('Error confirming schedule:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const resetModal = () => {
    setStep('calendar');
    setSelectedDate('');
    setSelectedTime('11:00 AM');
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
  };

  const handleDateInput = () => {
    setStep('date-input');
  };

  const handleDateConfirm = () => {
    if (!selectedDate) {
      toast.error("Please enter the date you selected.");
      return;
    }
    setStep('confirm');
  };

  const handleNotScheduled = () => {
    setStep('calendar');
    toast.info("No problem! Try selecting a different date or time that works better for you.");
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
                onClick={handleDateInput}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                I've Selected My Date
              </Button>
            </div>
          </div>
        )}

        {step === 'date-input' && (
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Confirm Your Selected Date
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Please enter the date you selected from the calendar above.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visit-date">Visit Date</Label>
                    <Input
                      id="visit-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="visit-time">Visit Time</Label>
                    <Input
                      id="visit-time"
                      value={selectedTime}
                      readOnly
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">All visits are scheduled for 11:00 AM - 1:00 PM</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToCalendar}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Calendar
                  </Button>
                  <Button 
                    onClick={handleDateConfirm}
                    disabled={!selectedDate}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Confirm This Date
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Final Confirmation
                </CardTitle>
                <CardDescription className="text-green-700">
                  Please confirm your visit details before we finalize your appointment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Your Visit Details:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Time:</strong> {selectedTime} - 1:00 PM (2-hour visit)</p>
                    <p><strong>Type:</strong> Care Coordination Visit</p>
                  </div>
                </div>

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
                    onClick={() => setStep('date-input')}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Edit Date
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
