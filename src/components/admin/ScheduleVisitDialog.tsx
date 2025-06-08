
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Search } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScheduleVisitDialogProps {
  onVisitScheduled: () => void;
  onClose: () => void;
  preselectedUser?: {
    id: string;
    full_name: string;
    preferred_visit_type: 'virtual' | 'in_person';
  };
}

interface UserSearchResult {
  id: string;
  full_name: string;
}

export const ScheduleVisitDialog: React.FC<ScheduleVisitDialogProps> = ({
  onVisitScheduled,
  onClose,
  preselectedUser
}) => {
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Array<{id: string, start_time: string, end_time: string, current_bookings: number, max_bookings: number}>>([]);
  const [formData, setFormData] = useState({
    userSearch: preselectedUser?.full_name || '',
    selectedUserId: preselectedUser?.id || '',
    userFullName: preselectedUser?.full_name || '',
    bookingDate: undefined as Date | undefined,
    bookingTime: '',
    selectedSlotId: '',
    visitType: preselectedUser?.preferred_visit_type || 'virtual' as 'virtual' | 'in_person',
    familyAddress: '',
    familyPhone: '',
    adminNotes: ''
  });

  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setUserSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setUserSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  const selectUser = (user: UserSearchResult) => {
    setFormData(prev => ({
      ...prev,
      selectedUserId: user.id,
      userFullName: user.full_name,
      userSearch: user.full_name
    }));
    setUserSearchResults([]);
  };

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('admin_availability_slots')
        .select('id, start_time, end_time, current_bookings, max_bookings')
        .eq('date', dateStr)
        .eq('is_available', true)
        .lt('current_bookings', 'max_bookings');

      if (error) throw error;
      console.log('Available slots for date:', dateStr, data);
      setAvailableSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  const findMatchingSlot = (selectedTime: string) => {
    // Convert selected time to compare with slot times
    const selectedTimeObj = selectedTime.substring(0, 5); // Get HH:mm format
    
    return availableSlots.find(slot => {
      const slotStartTime = slot.start_time.substring(0, 5); // Get HH:mm format
      return slotStartTime === selectedTimeObj && slot.current_bookings < slot.max_bookings;
    });
  };

  const createAdminSlot = async (date: Date, time: string) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if a slot already exists for this date and time
      const { data: existingSlots, error: checkError } = await supabase
        .from('admin_availability_slots')
        .select('id, current_bookings, max_bookings')
        .eq('date', dateStr)
        .eq('start_time', time);

      if (checkError) {
        console.error('Error checking existing slots:', checkError);
        throw checkError;
      }

      if (existingSlots && existingSlots.length > 0) {
        const existingSlot = existingSlots[0];
        if (existingSlot.current_bookings < existingSlot.max_bookings) {
          console.log('Using existing slot with available capacity:', existingSlot.id);
          return existingSlot.id;
        } else {
          throw new Error('Selected time slot is fully booked. Please choose a different time.');
        }
      }
      
      // Convert time from HH:mm:ss to calculate end time (2 hours later)
      const [hours, minutes] = time.split(':').map(Number);
      const endHour = hours + 2;
      const endTimeWithSeconds = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      console.log('Creating new admin slot:', {
        date: dateStr,
        start_time: time,
        end_time: endTimeWithSeconds
      });

      const { data, error } = await supabase
        .from('admin_availability_slots')
        .insert({
          date: dateStr,
          start_time: time,
          end_time: endTimeWithSeconds,
          is_available: true,
          max_bookings: 1,
          current_bookings: 0,
          description: 'Admin created slot',
          is_default_slot: false,
          slot_type: 'admin_created'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin slot:', error);
        throw error;
      }
      
      console.log('Admin slot created successfully:', data);
      return data.id;
    } catch (error: any) {
      console.error('Error in createAdminSlot:', error);
      throw error;
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, bookingDate: date, selectedSlotId: '', bookingTime: '' }));
    if (date) {
      fetchAvailableSlots(date);
    }
  };

  const handleSlotSelection = (slotId: string) => {
    const slot = availableSlots.find(s => s.id === slotId);
    if (slot) {
      setFormData(prev => ({
        ...prev,
        selectedSlotId: slotId,
        bookingTime: slot.start_time
      }));
    }
  };

  const handleTimeSelection = (time: string) => {
    // Clear selected slot when manually selecting time
    setFormData(prev => ({
      ...prev,
      bookingTime: time,
      selectedSlotId: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedUserId || !formData.bookingDate || !formData.bookingTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let slotId = formData.selectedSlotId;
      
      // If no existing slot selected, try to find a matching one or create new
      if (!slotId) {
        console.log('No existing slot selected, checking for matching slots...');
        
        // First, try to find a matching available slot
        const matchingSlot = findMatchingSlot(formData.bookingTime);
        if (matchingSlot) {
          console.log('Found matching available slot:', matchingSlot.id);
          slotId = matchingSlot.id;
        } else {
          console.log('No matching slot found, creating new admin slot...');
          slotId = await createAdminSlot(formData.bookingDate, formData.bookingTime);
        }
      }

      console.log('Creating visit booking with slot ID:', slotId);

      // Create the visit booking
      const { error: bookingError } = await supabase
        .from('visit_bookings')
        .insert({
          user_id: formData.selectedUserId,
          availability_slot_id: slotId,
          booking_date: format(formData.bookingDate, 'yyyy-MM-dd'),
          booking_time: formData.bookingTime,
          visit_type: formData.visitType,
          status: 'confirmed',
          payment_status: 'not_required',
          admin_status: 'confirmed',
          family_address: formData.familyAddress || null,
          family_phone: formData.familyPhone || null,
          admin_notes: formData.adminNotes || null,
          confirmation_sent: false,
          user_full_name: formData.userFullName,
        });

      if (bookingError) {
        console.error('Error creating visit booking:', bookingError);
        throw bookingError;
      }

      console.log('Visit booking created successfully');

      // Update the user's profile to reflect the scheduled visit
      const visitDetails = {
        visit_type: formData.visitType,
        visit_date: format(formData.bookingDate, 'yyyy-MM-dd'),
        visit_time: formData.bookingTime,
        scheduled_by: 'admin'
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          visit_scheduling_status: 'scheduled',
          visit_scheduled_date: format(formData.bookingDate, 'yyyy-MM-dd'),
          visit_notes: JSON.stringify(visitDetails),
          ready_for_admin_scheduling: false
        })
        .eq('id', formData.selectedUserId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
      }

      // Update slot booking count only if we used an existing slot
      if (formData.selectedSlotId || findMatchingSlot(formData.bookingTime)) {
        const { data: slotData } = await supabase
          .from('admin_availability_slots')
          .select('current_bookings')
          .eq('id', slotId)
          .single();

        if (slotData) {
          const { error: updateError } = await supabase
            .from('admin_availability_slots')
            .update({ current_bookings: slotData.current_bookings + 1 })
            .eq('id', slotId);

          if (updateError) {
            console.error('Error updating slot count:', updateError);
          }
        }
      }

      toast.success('Visit scheduled successfully');
      onVisitScheduled();
      onClose();
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      toast.error(`Failed to schedule visit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Updated time slots with proper seconds format
  const timeSlots = [
    '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
    '12:00:00', '12:30:00', '13:00:00', '13:30:00', '14:00:00', '14:30:00',
    '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00'
  ];

  // Helper function to display time without seconds for UI
  const displayTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds for display
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Visit for User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preselectedUser && (
            <div className="space-y-2">
              <Label htmlFor="userSearch">Search User *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="userSearch"
                  value={formData.userSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, userSearch: value }));
                    searchUsers(value);
                  }}
                  placeholder="Search by name..."
                  className="pl-9"
                  required
                />
                {userSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {userSearchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{user.full_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {preselectedUser && (
            <div className="space-y-2">
              <Label>Selected User</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{preselectedUser.full_name}</div>
                <div className="text-sm text-gray-500">Preferred: {preselectedUser.preferred_visit_type}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visit Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.bookingDate ? format(formData.bookingDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.bookingDate}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Time Slot *</Label>
              {availableSlots.length > 0 ? (
                <div className="space-y-2">
                  <Select 
                    value={formData.selectedSlotId} 
                    onValueChange={handleSlotSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Available slots (preferred)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {displayTime(slot.start_time)} - {displayTime(slot.end_time)} 
                          ({slot.max_bookings - slot.current_bookings} spots left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-500">Or choose a custom time:</div>
                  <Select 
                    value={formData.bookingTime} 
                    onValueChange={handleTimeSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Custom time (creates new slot)" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{displayTime(time)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Select 
                  value={formData.bookingTime} 
                  onValueChange={handleTimeSelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time (will create new slot)" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{displayTime(time)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Visit Type</Label>
            <Select 
              value={formData.visitType} 
              onValueChange={(value: 'virtual' | 'in_person') => setFormData(prev => ({ ...prev, visitType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.visitType === 'in_person' && (
            <div className="space-y-2">
              <Label htmlFor="familyAddress">Family Address</Label>
              <Input
                id="familyAddress"
                value={formData.familyAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, familyAddress: e.target.value }))}
                placeholder="Enter family address"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="familyPhone">Family Phone</Label>
            <Input
              id="familyPhone"
              value={formData.familyPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, familyPhone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
