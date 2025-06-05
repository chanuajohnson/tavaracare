import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, CalendarDays, Clock, Shield, CheckCircle2, Users, Home, Calendar, X, Heart, Star } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { GoogleCalendarSchedulingModal } from "./GoogleCalendarSchedulingModal";
import { PayPalSubscribeButton } from "@/components/subscription/PayPalSubscribeButton";

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CareModel = 'direct_hire' | 'tavara_subscribed' | null;
type VisitType = 'video' | 'in_person' | 'trial_day' | null;

export const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [visitStatus, setVisitStatus] = useState<string>('not_started');
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType>(null);
  const [selectedCareModel, setSelectedCareModel] = useState<CareModel>(null);
  const [step, setStep] = useState<'visit_selection' | 'care_model' | 'payment' | 'confirmation'>('visit_selection');

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

  const handleCancelVisit = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'cancelled',
          visit_scheduled_date: null,
          visit_notes: JSON.stringify({
            cancelled_at: new Date().toISOString(),
            previous_status: visitStatus
          })
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: 'visit_cancelled',
          feature_name: 'schedule_visit',
          additional_data: { 
            previous_status: visitStatus,
            cancelled_at: new Date().toISOString()
          }
        });

      setVisitStatus('cancelled');
      setVisitDate(null);
      toast.success("Visit cancelled successfully");
      
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast.error("Failed to cancel visit. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRescheduleVisit = () => {
    setVisitStatus('not_started');
    setStep('visit_selection');
    setSelectedVisitType(null);
    setSelectedCareModel(null);
  };

  const handleVisitTypeSelection = (type: VisitType) => {
    setSelectedVisitType(type);
    if (type === 'video') {
      setShowGoogleCalendar(true);
    } else if (type === 'in_person' || type === 'trial_day') {
      setStep('care_model');
    }
  };

  const handleCareModelSelection = (model: CareModel) => {
    setSelectedCareModel(model);
    setStep('payment');
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!user || !selectedVisitType || !selectedCareModel) return;
    
    setIsUpdating(true);
    try {
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: selectedVisitType === 'trial_day' ? 320 : 300,
          currency: 'TTD',
          transaction_type: selectedVisitType,
          status: 'completed',
          provider_transaction_id: transactionId,
          metadata: {
            visit_type: selectedVisitType,
            care_model_preference: selectedCareModel,
            scheduled_date: new Date().toISOString(),
            trial_eligible_for_conversion: selectedVisitType === 'trial_day'
          }
        });

      if (paymentError) throw paymentError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'scheduled',
          visit_notes: JSON.stringify({
            visit_type: selectedVisitType,
            care_model_preference: selectedCareModel,
            payment_completed: true,
            scheduled_at: new Date().toISOString(),
            trial_amount: selectedVisitType === 'trial_day' ? 320 : 300
          })
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      await supabase
        .from('cta_engagement_tracking')
        .insert({
          user_id: user.id,
          action_type: `${selectedVisitType}_payment_completed`,
          feature_name: 'schedule_visit',
          additional_data: { 
            care_model: selectedCareModel,
            amount: selectedVisitType === 'trial_day' ? 320 : 300,
            transaction_id: transactionId,
            trial_conversion_eligible: selectedVisitType === 'trial_day'
          }
        });

      setVisitStatus('scheduled');
      setStep('confirmation');
      toast.success(`Your ${selectedVisitType === 'trial_day' ? 'trial day' : 'visit'} has been booked and paid!`);
      
    } catch (error) {
      console.error('Error processing payment:', error);
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
          visit_notes: JSON.stringify({
            not_ready_timestamp: new Date().toISOString()
          })
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

  const resetModal = () => {
    setStep('visit_selection');
    setSelectedVisitType(null);
    setSelectedCareModel(null);
  };

  const getStatusDisplay = () => {
    switch (visitStatus) {
      case 'scheduled':
        return {
          title: "✅ Visit Scheduled",
          message: visitDate 
            ? `Scheduled for ${new Date(visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at 11:00 AM`
            : "Your visit has been scheduled! We'll send confirmation details soon.",
          showButtons: true,
          actions: [
            {
              text: "Cancel Visit",
              action: handleCancelVisit,
              variant: "destructive" as const,
              disabled: isUpdating
            },
            {
              text: "Reschedule Visit",
              action: handleRescheduleVisit,
              variant: "outline" as const,
              disabled: isUpdating
            }
          ]
        };
      case 'completed':
        return {
          title: "🎉 Visit Completed",
          message: "Thank you for meeting with our team! We hope it was helpful.",
          buttonText: "Schedule Another Visit",
          buttonAction: () => resetModal(),
          buttonVariant: "default" as const
        };
      case 'cancelled':
        return {
          title: "❌ Visit Cancelled",
          message: "Your visit has been cancelled. You can reschedule anytime using the button below.",
          buttonText: "Ready to Try Scheduling Again",
          buttonAction: () => resetModal(),
          buttonVariant: "default" as const
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  if (statusDisplay) {
    return (
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

          <Card className={`${
            visitStatus === 'scheduled' ? 'bg-green-50 border-green-200' :
            visitStatus === 'cancelled' ? 'bg-red-50 border-red-200' :
            visitStatus === 'completed' ? 'bg-blue-50 border-blue-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <CardContent className="py-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className={`h-8 w-8 flex-shrink-0 ${
                  visitStatus === 'scheduled' ? 'text-green-600' :
                  visitStatus === 'cancelled' ? 'text-red-600' :
                  visitStatus === 'completed' ? 'text-blue-600' :
                  'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    visitStatus === 'scheduled' ? 'text-green-800' :
                    visitStatus === 'cancelled' ? 'text-red-800' :
                    visitStatus === 'completed' ? 'text-blue-800' :
                    'text-yellow-800'
                  }`}>{statusDisplay.title}</h3>
                  <p className={`${
                    visitStatus === 'scheduled' ? 'text-green-700' :
                    visitStatus === 'cancelled' ? 'text-red-700' :
                    visitStatus === 'completed' ? 'text-blue-700' :
                    'text-yellow-700'
                  }`}>{statusDisplay.message}</p>
                </div>
              </div>
              
              {statusDisplay.actions && (
                <div className="flex gap-2">
                  {statusDisplay.actions.map((action, index) => (
                    <AlertDialog key={index}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant={action.variant}
                          disabled={action.disabled}
                          className="flex-1"
                        >
                          {action.text}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {action.variant === 'destructive' ? 'Cancel Visit' : 'Reschedule Visit'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {action.variant === 'destructive' 
                              ? 'Are you sure you want to cancel your scheduled visit? This action cannot be undone.'
                              : 'Are you sure you want to reschedule your visit? This will reset your current selection.'
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={action.action}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ))}
                </div>
              )}

              {statusDisplay.buttonText && (
                <Button 
                  variant={statusDisplay.buttonVariant}
                  onClick={statusDisplay.buttonAction}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {statusDisplay.buttonText}
                </Button>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

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
            {step === 'visit_selection' && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Choose Your Visit Type</h3>
                  <p className="text-gray-600">Select the option that works best for you and your family</p>
                </div>

                <div className="grid gap-4">
                  {/* Free Video Call */}
                  <Card className="border-2 border-blue-200 hover:border-blue-300 cursor-pointer transition-colors" 
                        onClick={() => handleVisitTypeSelection('video')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <VideoIcon className="h-5 w-5" />
                        Free Video Introduction (15 min)
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Quick video call to meet your coordinator and discuss your needs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">FREE</span>
                        <Button variant="outline" className="border-blue-500 text-blue-600">
                          Schedule Video Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* In-Person Visit */}
                  <Card className="border-2 border-green-200 hover:border-green-300 cursor-pointer transition-colors"
                        onClick={() => handleVisitTypeSelection('in_person')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Home className="h-5 w-5" />
                        In-Person Visit (2 hours)
                      </CardTitle>
                      <CardDescription className="text-green-700">
                        Meet your coordinator in person to discuss care needs and meet potential caregivers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">$300 TTD</span>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Book In-Person Visit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trial Day */}
                  <Card className="border-2 border-purple-200 hover:border-purple-300 cursor-pointer transition-colors relative"
                        onClick={() => handleVisitTypeSelection('trial_day')}>
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Star className="h-5 w-5" />
                        Trial Day (8 hours)
                      </CardTitle>
                      <CardDescription className="text-purple-700">
                        Full day trial with your matched caregiver. Perfect way to test compatibility before committing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-purple-600">$320 TTD</span>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            Book Trial Day
                          </Button>
                        </div>
                        <div className="text-sm text-purple-600 font-medium">
                          💡 Trial fee can be applied as credit toward your subscription!
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={handleNotReady} disabled={isUpdating}>
                    ⏳ Not Ready Yet, Maybe Later
                  </Button>
                </div>
              </>
            )}

            {step === 'care_model' && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Choose Your Care Model</h3>
                  <p className="text-gray-600">How would you like to manage your care after the {selectedVisitType === 'trial_day' ? 'trial' : 'visit'}?</p>
                </div>

                <div className="grid gap-4">
                  {/* Direct Hire */}
                  <Card className="border-2 border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => handleCareModelSelection('direct_hire')}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Users className="h-5 w-5" />
                        Direct Hire Model
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Hire your caregiver directly. You handle scheduling, payroll, and coordination.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-600">$40/hour</div>
                        <div className="text-sm text-blue-600">
                          • You manage everything
                          • Basic Tavara tools access
                          • Direct relationship with caregiver
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tavara Subscription */}
                  <Card className="border-2 border-gold-200 hover:border-gold-300 cursor-pointer transition-colors relative"
                        onClick={() => handleCareModelSelection('tavara_subscribed')}>
                    <div className="absolute -top-2 -right-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Recommended
                    </div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <Heart className="h-5 w-5" />
                        Tavara Care Village
                      </CardTitle>
                      <CardDescription className="text-yellow-700">
                        Full-service care management. We handle everything so you can focus on your family.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-yellow-600">$45/hour</div>
                        <div className="text-sm text-yellow-600">
                          • Full Tavara dashboard access
                          • Payroll & admin handled
                          • Medication & meal management
                          • 24/7 coordinator support
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setStep('visit_selection')}>
                    ← Back to Visit Selection
                  </Button>
                </div>
              </>
            )}

            {step === 'payment' && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Complete Your Booking</h3>
                  <p className="text-gray-600">
                    {selectedVisitType === 'trial_day' ? 'Trial Day' : 'In-Person Visit'} • 
                    {selectedCareModel === 'direct_hire' ? ' Direct Hire Model' : ' Tavara Care Village'}
                  </p>
                </div>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>{selectedVisitType === 'trial_day' ? 'Trial Day (8 hours)' : 'In-Person Visit (2 hours)'}</span>
                      <span className="font-bold">${selectedVisitType === 'trial_day' ? '320' : '300'} TTD</span>
                    </div>
                    
                    {selectedVisitType === 'trial_day' && (
                      <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                        💰 This trial fee can be applied as credit toward your future subscription!
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <PayPalSubscribeButton
                        planId="trial_day_payment"
                        planName={selectedVisitType === 'trial_day' ? 'Trial Day' : 'In-Person Visit'}
                        price={`$${selectedVisitType === 'trial_day' ? '320' : '300'} TTD`}
                        onSuccess={handlePaymentSuccess}
                        className="w-full"
                        isComingSoon={false}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button variant="outline" onClick={() => setStep('care_model')}>
                    ← Back to Care Model
                  </Button>
                </div>
              </>
            )}

            {step === 'confirmation' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="py-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    🎉 Booking Confirmed!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your {selectedVisitType === 'trial_day' ? 'trial day' : 'visit'} has been successfully booked and paid.
                  </p>
                  <div className="space-y-2 text-sm text-green-600">
                    <p>✅ Payment processed: ${selectedVisitType === 'trial_day' ? '320' : '300'} TTD</p>
                    <p>✅ Care model: {selectedCareModel === 'direct_hire' ? 'Direct Hire' : 'Tavara Care Village'}</p>
                    <p>📅 Our team will contact you within 24 hours to schedule</p>
                    {selectedVisitType === 'trial_day' && (
                      <p className="font-semibold text-green-700 bg-green-100 p-2 rounded mt-3">
                        💰 After your trial, you'll have options to continue with your preferred care model!
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => onOpenChange(false)}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <GoogleCalendarSchedulingModal 
        open={showGoogleCalendar}
        onOpenChange={setShowGoogleCalendar}
        onScheduleConfirmed={() => {
          setVisitStatus('scheduled');
          onOpenChange(false);
        }}
      />
    </>
  );
};
