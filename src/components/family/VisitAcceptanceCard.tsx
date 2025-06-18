import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Home, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface VisitDetails {
  date: string;
  time: string;
  type: 'virtual' | 'in_person';
  status?: string;
  admin_status?: string;
  id?: string;
  is_admin_scheduled?: boolean;
}

interface VisitAcceptanceCardProps {
  visitDetails: VisitDetails;
  onAcceptance: () => void;
}

export const VisitAcceptanceCard: React.FC<VisitAcceptanceCardProps> = ({
  visitDetails,
  onAcceptance
}) => {
  const { user } = useAuth();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleAcceptVisit = async () => {
    if (!user) return;
    
    setIsAccepting(true);
    try {
      // Update visit booking with user acceptance
      if (visitDetails.id) {
        await supabase
          .from('visit_bookings')
          .update({
            user_accepted: true,
            user_accepted_at: new Date().toISOString(),
            status: 'confirmed'
          })
          .eq('id', visitDetails.id);
      }

      // Update profile to track acceptance
      await supabase
        .from('profiles')
        .update({
          visit_acceptance_status: 'accepted',
          visit_accepted_at: new Date().toISOString()
        })
        .eq('id', user.id);

      toast.success("Visit confirmed! We'll send you a confirmation email with details.");
      onAcceptance();
    } catch (error) {
      console.error('Error accepting visit:', error);
      toast.error("Failed to confirm visit. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRequestReschedule = async () => {
    if (!user) return;
    
    setIsRescheduling(true);
    try {
      // Create reschedule request
      await supabase
        .from('admin_communications')
        .insert({
          admin_id: 'system',
          target_user_id: user.id,
          message_type: 'reschedule_request',
          custom_message: `User requested to reschedule visit scheduled for ${new Date(visitDetails.date).toLocaleDateString()} at ${visitDetails.time}`,
          delivery_status: 'pending'
        });

      toast.success("Reschedule request sent! Admin will contact you within 24 hours.");
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      toast.error("Failed to send reschedule request. Please try again.");
    } finally {
      setIsRescheduling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isInPerson = visitDetails.type === 'in_person';

  return (
    <Card 
      className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg"
      data-testid="visit-acceptance-card"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900 mb-1">
                Visit Scheduled!
              </CardTitle>
              <p className="text-blue-700 text-sm">
                Your care coordinator has scheduled your visit
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Admin Scheduled
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visit Details */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-sm text-gray-600">{formatDate(visitDetails.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time</p>
                <p className="text-sm text-gray-600">{visitDetails.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isInPerson ? (
                <Home className="h-5 w-5 text-blue-600 flex-shrink-0" />
              ) : (
                <Video className="h-5 w-5 text-blue-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">Visit Type</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">
                    {isInPerson ? 'In-Person Home Visit' : 'Virtual Meeting'}
                  </p>
                  {isInPerson && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      $300 TTD
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {!isInPerson && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cost</p>
                  <p className="text-sm text-green-600 font-medium">Free</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Notice for In-Person Visits */}
        {isInPerson && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Payment Required</p>
                <p className="text-amber-700 mt-1">
                  In-person visits require $300 TTD payment. You'll receive payment instructions after confirming.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={handleAcceptVisit}
            disabled={isAccepting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAccepting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Visit
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRequestReschedule}
            disabled={isRescheduling}
            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isRescheduling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Requesting...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Request Reschedule
              </>
            )}
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center pt-2 border-t border-blue-100">
          <p className="text-xs text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:support@tavara.care" className="text-blue-600 hover:underline">
              support@tavara.care
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
