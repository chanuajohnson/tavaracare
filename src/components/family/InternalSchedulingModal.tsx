
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, MapPin, Star, Clock, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore, parseISO } from "date-fns";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  description?: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  description: string | null;
  max_bookings: number;
  current_bookings: number;
}

interface ExistingBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  reschedule_count: number;
  availability_slot_id: string;
}

interface InternalSchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiverName?: string;
  onVisitScheduled?: () => void;
  mode?: 'schedule' | 'reschedule';
  existingBooking?: ExistingBooking;
}

export const InternalSchedulingModal = ({ 
  open, 
  onOpenChange, 
  caregiverName = "your matched caregiver",
  onVisitScheduled,
  mode = 'schedule',
  existingBooking
}: InternalSchedulingModalProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('11:00');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'virtual' | 'in_person'>('virtual');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfDay(new Date()));
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Calculate booking limit (14 days from today)
  const maxBookingDate = addDays(new Date(), 14);

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Initialize with existing booking data if in reschedule mode
  useEffect(() => {
    if (mode === 'reschedule' && existingBooking && open) {
      const bookingDate = parseISO(existingBooking.booking_date);
      setSelectedDate(bookingDate);
      setVisitType(existingBooking.visit_type);
      
      // Set the week to show the existing booking date
      const weekStart = startOfDay(addDays(bookingDate, -bookingDate.getDay()));
      setCurrentWeekStart(weekStart);
      
      // Extract time from booking_time (format: HH:MM:SS)
      const timeStr = existingBooking.booking_time.slice(0, 5);
      setSelectedTime(timeStr);
      setSelectedSlotId(existingBooking.availability_slot_id);
    }
  }, [mode, existingBooking, open]);

  // Fetch availability slots
  useEffect(() => {
    if (open) {
      fetchAvailabilitySlots();
    }
  }, [open, currentWeekStart]);

  const fetchAvailabilitySlots = async () => {
    try {
      const weekEnd = addDays(currentWeekStart, 6);
      const { data, error } = await supabase
        .from('admin_availability_slots')
        .select('*')
        .gte('date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .eq('is_available', true)
        .lt('current_bookings', 'max_bookings');

      if (error) throw error;
      setAvailabilitySlots(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error("Failed to load available time slots");
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = addDays(currentWeekStart, direction === 'next' ? 7 : -7);
    // Don't allow going backwards before today
    if (direction === 'prev' && isBefore(newWeekStart, startOfDay(new Date()))) {
      return;
    }
    // Don't allow going beyond booking limit
    if (direction === 'next' && isAfter(newWeekStart, maxBookingDate)) {
      return;
    }
    setCurrentWeekStart(newWeekStart);
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySlots = availabilitySlots.filter(slot => slot.date === dateStr);
    
    return daySlots.map(slot => ({
      id: slot.id,
      time: slot.start_time.slice(0, 5), // Extract HH:MM format
      available: slot.current_bookings < slot.max_bookings,
      description: slot.description || undefined
    }));
  };

  const handleDateSelect = (date: Date) => {
    // Check if date is within booking limit and not in the past
    if (isBefore(date, startOfDay(new Date())) || isAfter(date, maxBookingDate)) {
      return;
    }

    setSelectedDate(date);
    const slots = getSlotsForDate(date);
    
    // Auto-select 11:00 AM if available, otherwise first available slot
    const elevenAMSlot = slots.find(slot => slot.time === '11:00' && slot.available);
    const firstAvailableSlot = slots.find(slot => slot.available);
    
    if (elevenAMSlot) {
      setSelectedTime('11:00');
      setSelectedSlotId(elevenAMSlot.id);
    } else if (firstAvailableSlot) {
      setSelectedTime(firstAvailableSlot.time);
      setSelectedSlotId(firstAvailableSlot.id);
    } else {
      setSelectedTime('');
      setSelectedSlotId(null);
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    setSelectedTime(timeSlot.time);
    setSelectedSlotId(timeSlot.id);
  };

  const handleScheduleConfirm = async () => {
    if (!user || !selectedDate || !selectedSlotId) {
      toast.error("Please select a date and time");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'reschedule' && existingBooking) {
        // Use the reschedule function
        const { error } = await supabase.rpc('reschedule_visit_booking', {
          booking_id: existingBooking.id,
          new_slot_id: selectedSlotId,
          new_date: format(selectedDate, 'yyyy-MM-dd'),
          new_time: selectedTime + ':00',
          reason: rescheduleReason || null
        });

        if (error) throw error;
        toast.success("Visit rescheduled successfully!");
      } else {
        // Create new booking
        const { error } = await supabase
          .from('visit_bookings')
          .insert({
            user_id: user.id,
            availability_slot_id: selectedSlotId,
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            booking_time: selectedTime + ':00',
            visit_type: visitType,
            status: 'confirmed'
          });

        if (error) throw error;
        toast.success("Visit scheduled successfully!");
      }

      setShowConfirmation(false);
      onOpenChange(false);
      
      if (onVisitScheduled) {
        onVisitScheduled();
      }
    } catch (error) {
      console.error('Error booking visit:', error);
      toast.error(`Failed to ${mode === 'reschedule' ? 'reschedule' : 'schedule'} visit. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    if (!user || !existingBooking) {
      toast.error("Unable to cancel visit");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('cancel_visit_booking', {
        booking_id: existingBooking.id,
        reason: rescheduleReason || 'User requested cancellation'
      });

      if (error) throw error;
      
      toast.success("Visit cancelled successfully");
      setShowCancelConfirmation(false);
      onOpenChange(false);
      
      if (onVisitScheduled) {
        onVisitScheduled();
      }
    } catch (error) {
      console.error('Error cancelling visit:', error);
      toast.error("Failed to cancel visit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date())) || isAfter(date, maxBookingDate);
  };

  const isDateAvailable = (date: Date) => {
    const slots = getSlotsForDate(date);
    return slots.some(slot => slot.available);
  };

  // Cancel confirmation dialog
  if (showCancelConfirmation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancel Visit
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your scheduled visit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="w-full p-2 border rounded-md resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirmation(false)}
                className="flex-1"
              >
                Keep Visit
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelVisit}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Visit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation dialog
  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'reschedule' ? 'Confirm Reschedule' : 'Confirm Your Visit'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'reschedule' 
                ? 'Please review your new booking details below.'
                : 'Please review your booking details below.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {mode === 'reschedule' && existingBooking && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Reschedule #{existingBooking.reschedule_count + 1}
                </p>
                <p className="text-xs text-amber-600">
                  Original date: {format(parseISO(existingBooking.booking_date), 'EEEE, MMMM d, yyyy')} at {existingBooking.booking_time.slice(0, 5)}
                </p>
              </div>
            )}

            {mode === 'reschedule' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for reschedule (optional)</label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Let us know why you're rescheduling..."
                  className="w-full p-2 border rounded-md resize-none"
                  rows={2}
                />
              </div>
            )}

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {visitType === 'virtual' ? (
                      <Video className="h-4 w-4 text-green-500" />
                    ) : (
                      <MapPin className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="font-medium">
                      {visitType === 'virtual' ? 'Virtual Visit' : 'In-Person Visit'}
                    </span>
                    <Badge variant="outline" className={
                      visitType === 'virtual' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                    }>
                      {visitType === 'virtual' ? 'FREE' : '$300 TTD'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleScheduleConfirm}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 
                  (mode === 'reschedule' ? 'Rescheduling...' : 'Booking...') : 
                  (mode === 'reschedule' ? 'Confirm Reschedule' : 'Confirm Booking')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'reschedule' ? 'Reschedule Your Visit' : 'Schedule Your Visit'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'reschedule' 
              ? 'Choose a new convenient date and time for your visit with your care coordinator.'
              : 'Choose a convenient date and time to meet with your care coordinator.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Visit Type Selection - only show if not in reschedule mode or allow changing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                visitType === 'virtual' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setVisitType('virtual')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Virtual Visit</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 ml-auto">
                    FREE
                  </Badge>
                </div>
                <CardDescription>1-2 hour video call to discuss care needs</CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                visitType === 'in_person' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setVisitType('in_person')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">In-Person Visit</CardTitle>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 ml-auto">
                    $300 TTD
                  </Badge>
                </div>
                <CardDescription>Home assessment with care coordinator</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Calendar Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Date & Time</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  disabled={isBefore(addDays(currentWeekStart, -7), startOfDay(new Date()))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  disabled={isAfter(addDays(currentWeekStart, 7), maxBookingDate)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => {
                const isDisabled = isDateDisabled(date);
                const hasAvailability = isDateAvailable(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);

                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all h-24 ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                        : isSelected
                        ? 'border-primary bg-primary/10'
                        : hasAvailability 
                        ? 'hover:border-primary/50 hover:bg-primary/5' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                  >
                    <CardContent className="p-2 h-full flex flex-col justify-between">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {format(date, 'EEE')}
                        </div>
                        <div className={`text-sm font-medium ${
                          isSelected ? 'text-primary' : isDisabled ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {format(date, 'd')}
                        </div>
                      </div>
                      {!isDisabled && (
                        <div className="text-center">
                          {hasAvailability ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto"></div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="space-y-3">
                <h4 className="font-medium">Available Times for {format(selectedDate, 'EEEE, MMMM d')}</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {getSlotsForDate(selectedDate).map((timeSlot) => (
                    <Button
                      key={timeSlot.id}
                      variant={selectedTime === timeSlot.time ? "default" : "outline"}
                      size="sm"
                      disabled={!timeSlot.available}
                      onClick={() => handleTimeSelect(timeSlot)}
                      className={`${
                        selectedTime === timeSlot.time 
                          ? 'bg-primary text-white' 
                          : timeSlot.available 
                          ? 'hover:bg-primary/10' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {timeSlot.time}
                    </Button>
                  ))}
                </div>
                {getSlotsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No available time slots for this date
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {selectedDate && selectedTime && selectedSlotId && (
            <div className="flex gap-3">
              {mode === 'reschedule' && (
                <Button 
                  variant="destructive"
                  onClick={() => setShowCancelConfirmation(true)}
                  className="flex-1"
                  size="lg"
                >
                  Cancel Visit
                </Button>
              )}
              <Button 
                onClick={() => setShowConfirmation(true)}
                className="flex-1"
                size="lg"
              >
                {mode === 'reschedule' ? 'Continue to Reschedule' : 'Continue to Confirmation'}
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>You can book visits up to 14 days in advance</p>
            <p>Questions? Contact us at <span className="text-primary font-medium">support@tavara.care</span></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
