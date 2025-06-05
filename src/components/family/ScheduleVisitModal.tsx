
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoIcon, CalendarDays, Clock, Shield, CheckCircle2, Users, Home } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            🌿 Schedule Your Visit with Tavara
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          {/* Flexible Scheduling & Risk-Free Trial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">💫</div>
                  <div>
                    <h4 className="font-medium text-purple-800">Flexible Scheduling</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Choose to start right away or schedule a trial work day with your matched caregiver.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">💸</div>
                  <div>
                    <h4 className="font-medium text-amber-800">Risk-Free Trial</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Experience a full day of care with no strings attached. Just pay the Tavara day rate—no long-term commitment required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
              {selectedOption ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="flex items-center gap-3 py-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">
                        {selectedOption === 'ready' 
                          ? "Perfect! Status will update to \"Ready to Schedule\" and our team will begin matching you!"
                          : "No worries! We'll save your profile—you can return anytime when you're ready."}
                      </p>
                      <p className="text-sm text-green-700">
                        Your preference has been recorded and our admin team has been notified.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => handleSelection('ready')}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✅ Yes, I'm Ready to Proceed
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSelection('not-yet')}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    ⏳ Not Yet, Maybe Later
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
