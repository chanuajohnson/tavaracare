
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, Video, Home, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { PayPalPaymentModal } from './PayPalPaymentModal';
import { format, addDays } from 'date-fns';

interface InternalSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitScheduled?: () => void;
}

interface AvailableSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

export const InternalSchedulingModal = ({ 
  open, 
  onOpenChange, 
  onVisitScheduled
}: InternalSchedulingModalProps) => {
  const { user } = useAuth();
  const [visitType, setVisitType] = useState<'virtual' | 'in_person'>('virtual');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [visitDetails, setVisitDetails] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAvailableSlots();
    }
  }, [open]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      // Get admin configuration first
      const { data: configData, error: configError } = await supabase
        .from('admin_visit_config')
        .select('*')
        .limit(1)
        .single();

      if (configError) throw configError;

      // Calculate date range (14 days from today as per admin config)
      const today = new Date();
      const maxDate = addDays(today, configData.advance_booking_days);

      // Fetch available slots within the date range
      const { data: slotsData, error: slotsError } = await supabase
        .from('admin_availability_slots')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', maxDate.toISOString().split('T')[0])
        .eq('is_available', true)
        .lt('current_bookings', configData.max_bookings_per_day)
        .order('date', { ascending: true });

      if (slotsError) throw slotsError;

      setAvailableSlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available appointment slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !user) return;

    const details = {
      date: selectedSlot.date,
      time: selectedSlot.start_time,
      type: visitType,
      slotId: selectedSlot.id
    };

    if (visitType === 'in_person') {
      // Show payment modal for in-person visits
      setVisitDetails(details);
      setShowPaymentModal(true);
    } else {
      // Direct booking for virtual visits (free)
      await completeVirtualVisitBooking(details);
    }
  };

  const completeVirtualVisitBooking = async (details: any) => {
    try {
      // Update profile with visit details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: details.date,
          visit_notes: JSON.stringify({
            visit_type: details.type,
            visit_date: details.date,
            visit_time: details.time,
            payment_required: false
          })
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create visit booking record with all required fields
      const { error: bookingError } = await supabase
        .from('visit_bookings')
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          availability_slot_id: details.slotId,
          booking_date: details.date,
          booking_time: details.time,
          visit_type: details.type,
          status: 'scheduled',
          payment_status: 'not_required',
          payment_amount: 0,
          payment_currency: 'TTD',
          admin_status: 'pending'
        });

      if (bookingError) {
        console.warn('Failed to create booking record:', bookingError);
      }

      setIsConfirmed(true);
      toast.success("Virtual visit scheduled successfully!");
      
      // Call the callback to update journey progress
      if (onVisitScheduled) {
        onVisitScheduled();
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setIsConfirmed(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error scheduling virtual visit:', error);
      toast.error("Failed to schedule visit. Please try again.");
    }
  };

  const handlePaymentComplete = () => {
    setIsConfirmed(true);
    setShowPaymentModal(false);
    
    // Call the callback to update journey progress
    if (onVisitScheduled) {
      onVisitScheduled();
    }
    
    // Close modal after a short delay
    setTimeout(() => {
      onOpenChange(false);
      setIsConfirmed(false);
    }, 1500);
  };

  const resetModal = () => {
    setVisitType('virtual');
    setSelectedSlot(null);
    setIsConfirmed(false);
    setShowPaymentModal(false);
    setVisitDetails(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  const formatSlotDisplay = (slot: AvailableSlot) => {
    const date = new Date(slot.date);
    return {
      display: format(date, 'EEE, MMM d'),
      date: slot.date
    };
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
              Visit Scheduled Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your {visitType === 'virtual' ? 'virtual' : 'in-person'} visit is confirmed for {selectedSlot && formatSlotDisplay(selectedSlot).display} at {selectedSlot?.start_time}.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive a confirmation email shortly with all the details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Schedule Your Care Visit</DialogTitle>
            <p className="text-muted-foreground">
              Choose your preferred visit type and schedule a time that works for you.
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Visit Type Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Visit Type</h3>
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

            {/* Visit Benefits */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">What's included in your visit:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Personalized care assessment</li>
                <li>• Access to detailed caregiver profiles</li>
                <li>• Custom care plan recommendations</li>
                <li>• Direct introduction to matched caregivers</li>
                {visitType === 'in_person' && (
                  <li>• Comprehensive home safety evaluation</li>
                )}
              </ul>
            </div>

            {/* Available Slots */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading available appointments...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Available Appointment</h3>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSlots.map((slot) => {
                      const slotDisplay = formatSlotDisplay(slot);
                      return (
                        <Button
                          key={slot.id}
                          variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                          className="p-4 h-auto flex flex-col items-start"
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{slotDisplay.display}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {slot.current_bookings}/{slot.max_bookings} booked
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No available appointment slots found</p>
                    <p className="text-sm">Please check back later or contact support</p>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation */}
            {selectedSlot && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Visit Summary:</h4>
                <div className="text-sm text-green-800">
                  <p><strong>Type:</strong> {visitType === 'virtual' ? 'Virtual Visit' : 'In-Person Home Visit'}</p>
                  <p><strong>Date:</strong> {formatSlotDisplay(selectedSlot).display}</p>
                  <p><strong>Time:</strong> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
                  <p><strong>Cost:</strong> {visitType === 'virtual' ? 'FREE' : '$300 TTD'}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmBooking}
                disabled={!selectedSlot}
                className="flex-1"
              >
                {visitType === 'in_person' ? 'Proceed to Payment' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PayPal Payment Modal */}
      {visitDetails && (
        <PayPalPaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          visitDetails={visitDetails}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};
