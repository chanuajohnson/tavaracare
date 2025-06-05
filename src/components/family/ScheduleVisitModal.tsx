import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, CalendarDays, Clock, Shield, CheckCircle2, Users, Home, Calendar, X, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { GoogleCalendarSchedulingModal } from "./GoogleCalendarSchedulingModal";
import { TrialDayBooking } from "@/components/subscription/TrialDayBooking";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [showTrialBooking, setShowTrialBooking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [visitDate, setVisitDate] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      fetchVisitStatus();
    }
  }, [user, open]);

  const fetchVisitStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('visit_scheduling_status, visit_scheduled_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setVisitStatus(data?.visit_scheduling_status || 'not_started');
      setVisitDate(data?.visit_scheduled_date);
    } catch (error) {
      console.error('Error fetching visit status:', error);
    }
  };

  const handleReadyToSchedule = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'ready_to_schedule',
          visit_notes: `Visit scheduling: ready_to_schedule - ${new Date().toISOString()}`
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_ready_to_schedule',
          feature_name: 'schedule_visit',
          additional_data: { timestamp: new Date().toISOString() }
        });

      setVisitStatus('ready_to_schedule');
      setShowGoogleCalendar(true);
      
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotReady = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_notes: `Visit scheduling: not_ready - ${new Date().toISOString()}`
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_not_ready',
          feature_name: 'schedule_visit',
          additional_data: { timestamp: new Date().toISOString() }
        });

      toast.success("No problem! You can schedule when you're ready.");
      
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error recording choice:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      console.log('Starting visit cancellation for user:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'cancelled',
          visit_scheduled_date: null,
          visit_notes: `Visit cancelled by user - ${new Date().toISOString()}`
        })
        .eq('id', user.id);

      if (error) {
        console.error('Supabase error during visit cancellation:', error);
        throw error;
      }

      console.log('Visit status updated successfully');

      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_cancelled',
          feature_name: 'schedule_visit',
          additional_data: { 
            previous_date: visitDate,
            timestamp: new Date().toISOString() 
          }
        });

      setVisitStatus('cancelled');
      setVisitDate(null);
      toast.success("Your visit has been cancelled. You can reschedule anytime.");
      
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleConfirmed = () => {
    setVisitStatus('scheduled');
    fetchVisitStatus(); // Refresh data
  };

  const handleChangeDate = () => {
    setShowGoogleCalendar(true);
  };

  const handleTryAgain = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'ready_to_schedule',
          visit_notes: `Visit scheduling: ready_to_try_again - ${new Date().toISOString()}`
        })
        .eq('id', user.id);

      if (error) throw error;

      setVisitStatus('ready_to_schedule');
      setShowGoogleCalendar(true);
      
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrialDayClick = () => {
    setShowTrialBooking(true);
  };

  const handleTrialConfirmed = async (trialDetails: {
    date: string;
    type: 'video' | 'in-person';
    paymentId: string;
  }) => {
    // Update user's visit status to reflect trial booking
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'trial_booked',
          visit_scheduled_date: trialDetails.date,
          visit_notes: `Trial booked: ${trialDetails.type} on ${new Date(trialDetails.date).toLocaleDateString()} - Payment ID: ${trialDetails.paymentId}`
        })
        .eq('id', user?.id);

      if (error) throw error;

      setVisitStatus('trial_booked');
      setVisitDate(trialDetails.date);
      
      toast.success(`Trial day booked successfully! ${trialDetails.type === 'video' ? 'Video call' : 'In-person visit'} scheduled.`);
    } catch (error) {
      console.error('Error updating trial status:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const getStatusDisplay = () => {
    switch (visitStatus) {
      case 'scheduled':
        return {
          title: "✅ Visit Scheduled",
          message: visitDate 
            ? `Scheduled for ${new Date(visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at 11:00 AM`
            : "Your visit has been scheduled! We'll send confirmation details soon.",
          showButtons: true
        };
      case 'completed':
        return {
          title: "🎉 Visit Completed",
          message: "Thank you for meeting with our team! We hope it was helpful.",
          buttonText: "Schedule Another Visit",
          buttonAction: handleReadyToSchedule,
          buttonVariant: "default" as const
        };
      case 'cancelled':
        return {
          title: "❌ Visit Cancelled",
          message: "Your visit has been cancelled. You can reschedule anytime using the button below.",
          buttonText: "Ready to Try Scheduling Again",
          buttonAction: handleTryAgain,
          buttonVariant: "default" as const
        };
      case 'ready_to_schedule':
        return {
          title: "📅 Ready to Schedule",
          message: "You're ready to schedule your visit. Click below to try again with the calendar.",
          buttonText: "Ready to Try Scheduling Again",
          buttonAction: handleTryAgain,
          buttonVariant: "default" as const
        };
      case 'trial_booked':
        return {
          title: "📅 Trial Day Booked",
          message: "Your trial day has been booked. You can start your care journey now.",
          buttonText: "Start Your Care Journey",
          buttonAction: handleScheduleConfirmed,
          buttonVariant: "default" as const
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                🌿 Schedule Your Visit with Tavara
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {statusDisplay ? (
              <Card className={`${
                visitStatus === 'scheduled' || visitStatus === 'trial_booked' ? 'bg-green-50 border-green-200' :
                visitStatus === 'cancelled' ? 'bg-red-50 border-red-200' :
                visitStatus === 'completed' ? 'bg-blue-50 border-blue-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className={`h-8 w-8 flex-shrink-0 ${
                      visitStatus === 'scheduled' || visitStatus === 'trial_booked' ? 'text-green-600' :
                      visitStatus === 'cancelled' ? 'text-red-600' :
                      visitStatus === 'completed' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        visitStatus === 'scheduled' || visitStatus === 'trial_booked' ? 'text-green-800' :
                        visitStatus === 'cancelled' ? 'text-red-800' :
                        visitStatus === 'completed' ? 'text-blue-800' :
                        'text-yellow-800'
                      }`}>{statusDisplay.title}</h3>
                      <p className={`${
                        visitStatus === 'scheduled' || visitStatus === 'trial_booked' ? 'text-green-700' :
                        visitStatus === 'cancelled' ? 'text-red-700' :
                        visitStatus === 'completed' ? 'text-blue-700' :
                        'text-yellow-700'
                      }`}>{statusDisplay.message}</p>
                    </div>
                  </div>
                  
                  {statusDisplay.showButtons ? (
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={handleChangeDate}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        Change Date
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            disabled={isUpdating}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Visit
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Your Visit?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your scheduled visit? You can always reschedule later if needed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Visit</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelVisit} className="bg-red-600 hover:bg-red-700">
                              Yes, Cancel Visit
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : statusDisplay.buttonText ? (
                    <Button 
                      variant={statusDisplay.buttonVariant}
                      onClick={statusDisplay.buttonAction}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {statusDisplay.buttonText}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Enhanced Fast Track Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Fast Track: Trial Day
                      </CardTitle>
                      <CardDescription className="text-orange-700">
                        Skip the wait - book a trial day with your matched caregiver now
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-orange-700">
                          <p className="font-medium mb-1">What you get:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Full day with your matched caregiver</li>
                            <li>No long-term commitment</li>
                            <li>Trial fee credited toward subscription</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded border border-orange-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Video: $150 TTD</span>
                            <span className="text-sm text-gray-600">($22.15 USD)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">In-Person: $320 TTD</span>
                            <span className="text-sm text-gray-600">($47.28 USD)</span>
                          </div>
                        </div>
                        <Button 
                          onClick={handleTrialDayClick}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          Book Trial Day
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                        <VideoIcon className="h-5 w-5" />
                        Traditional: Meet First
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Start with an introduction call, then schedule care
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Perfect if you prefer to:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Meet your caregiver first</li>
                            <li>Discuss care needs in detail</li>
                            <li>Plan your care schedule together</li>
                          </ul>
                        </div>
                        <Button 
                          onClick={handleReadyToSchedule}
                          disabled={isUpdating}
                          variant="outline"
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Schedule Introduction
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* How Tavara Visits Work */}
                <div className="text-lg font-semibold mb-4">How Tavara Visits Work</div>
                
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Option 1: In-Person Visit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-green-700 font-medium">Meet your ideal caregiver match face-to-face.</p>
                    <div className="text-sm text-green-700">
                      <p>You can:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Start with a one-time visit (one-time fee applies)</li>
                        <li>Add more in-person visits as needed (additional fee per visit)</li>
                        <li>Meet multiple caregiver matches (each additional match has a fee)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                      <VideoIcon className="h-5 w-5" />
                      Option 2: Remote Video Touchpoints (Preferred by Tavara.care)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700">
                      Connect with your caregiver and a Tavara Coordinator via secure video calls—from the comfort of home.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What Happens Next</CardTitle>
                    <CardDescription>
                      Once you're ready and your caregiver is available:
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</div>
                        <div>
                          <h4 className="font-medium">Meet Your Match</h4>
                          <p className="text-sm text-gray-600">Video intro call with your caregiver & coordinator</p>
                          <p className="text-sm text-gray-500">Or an in-person visit (available with one-time fee plans)</p>
                          <p className="text-xs text-gray-400 italic">(Subscription option coming soon)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</div>
                        <div>
                          <h4 className="font-medium">Discuss Care Needs & Preferences</h4>
                          <p className="text-sm text-gray-600">We'll meet your loved one and understand your care priorities.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</div>
                        <div>
                          <h4 className="font-medium">Schedule Your Trial Day</h4>
                          <p className="text-sm text-gray-600">Or jump straight into regular care if you're ready.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</div>
                        <div>
                          <h4 className="font-medium">Begin Your Personalized Care Journey</h4>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            <li>• Build your care team</li>
                            <li>• Manage meals, meds, shifts, payroll & receipts directly on Tavara.care</li>
                          </ul>
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="font-medium">Choose:</p>
                            <p>• Tavara-managed care</p>
                            <p>• Or self-manage with a subscription package (coming soon)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Next Step</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        onClick={handleReadyToSchedule}
                        disabled={isUpdating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        ✅ Yes, I'm Ready to Schedule
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleNotReady}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        ⏳ Not Yet, Maybe Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GoogleCalendarSchedulingModal 
        open={showGoogleCalendar}
        onOpenChange={setShowGoogleCalendar}
        onScheduleConfirmed={handleScheduleConfirmed}
      />

      <TrialDayBooking
        open={showTrialBooking}
        onOpenChange={setShowTrialBooking}
        onTrialConfirmed={handleTrialConfirmed}
      />
    </>
  );
};
