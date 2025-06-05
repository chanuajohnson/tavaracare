import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, CalendarDays, Clock, Shield, CheckCircle2, Users, Home, Calendar } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { GoogleCalendarSchedulingModal } from "./GoogleCalendarSchedulingModal";

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
          additional_notes: `Visit scheduling: ready_to_schedule - ${new Date().toISOString()}`
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
          additional_notes: `Visit scheduling: not_ready - ${new Date().toISOString()}`
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

  const handleScheduleConfirmed = () => {
    setVisitStatus('scheduled');
    fetchVisitStatus(); // Refresh data
  };

  const handleChangeDate = () => {
    setShowGoogleCalendar(true);
  };

  const getStatusDisplay = () => {
    switch (visitStatus) {
      case 'scheduled':
        return {
          title: "✅ Visit Scheduled",
          message: "Your visit has been scheduled! We'll send confirmation details soon.",
          buttonText: "Change Date",
          buttonAction: handleChangeDate,
          buttonVariant: "outline" as const
        };
      case 'completed':
        return {
          title: "🎉 Visit Completed",
          message: "Thank you for meeting with our team! We hope it was helpful.",
          buttonText: "Schedule Another Visit",
          buttonAction: handleReadyToSchedule,
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
            <DialogTitle className="flex items-center gap-2 text-xl">
              🌿 Schedule Your Visit with Tavara
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {statusDisplay ? (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="flex items-center gap-3 py-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">{statusDisplay.title}</h3>
                    <p className="text-green-700">{statusDisplay.message}</p>
                    {visitDate && (
                      <p className="text-sm text-green-600 mt-1">
                        Scheduled: {new Date(visitDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant={statusDisplay.buttonVariant}
                    onClick={statusDisplay.buttonAction}
                    disabled={isUpdating}
                  >
                    {statusDisplay.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* How Tavara Visits Work */}
                <div className="text-lg font-semibold mb-4">How Tavara Visits Work</div>
                
                {/* Option 1: In-Person Visit */}
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

                {/* Option 2: Remote Video Touchpoints */}
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

                {/* What Happens Next */}
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

                {/* Your Next Step */}
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
    </>
  );
};
