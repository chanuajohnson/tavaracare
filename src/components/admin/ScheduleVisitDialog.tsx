
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Search } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScheduleVisitDialogProps {
  onVisitScheduled: () => void;
  preselectedUser?: {
    id: string;
    full_name: string;
    email: string;
    preferred_visit_type: 'virtual' | 'in_person';
  };
}

interface UserSearchResult {
  id: string;
  full_name: string;
}

export const ScheduleVisitDialog: React.FC<ScheduleVisitDialogProps> = ({
  onVisitScheduled,
  preselectedUser
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Array<{id: string, start_time: string, end_time: string}>>([]);
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

  // Reset form when preselectedUser changes
  React.useEffect(() => {
    if (preselectedUser) {
      setFormData(prev => ({
        ...prev,
        userSearch: preselectedUser.full_name,
        selectedUserId: preselectedUser.id,
        userFullName: preselectedUser.full_name,
        visitType: preselectedUser.preferred_visit_type
      }));
    }
  }, [preselectedUser]);

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
      setAvailableSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  const createAdminSlot = async (date: Date, time: string) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('admin_availability_slots')
        .insert({
          date: dateStr,
          start_time: time,
          end_time: time,
          is_available: true,
          max_bookings: 1,
          current_bookings: 0,
          description: 'Admin created slot',
          is_default_slot: false,
          slot_type: 'admin_created'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating admin slot:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.selectedUserId || !formData.bookingDate || !formData.bookingTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let slotId = formData.selectedSlotId;
      
      // If no existing slot selected, create a new admin slot
      if (!slotId) {
        slotId = await createAdminSlot(formData.bookingDate, formData.bookingTime);
      }

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

      if (bookingError) throw bookingError;

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
          visit_notes: JSON.stringify(visitDetails)
        })
        .eq('id', formData.selectedUserId);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        // Don't throw error here as booking was successful
      }

      // Update slot booking count
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

        if (updateError) console.error('Error updating slot count:', updateError);
      }

      toast.success('Visit scheduled successfully');
      setOpen(false);
      setFormData({
        userSearch: '',
        selectedUserId: '',
        userFullName: '',
        bookingDate: undefined,
        bookingTime: '',
        selectedSlotId: '',
        visitType: 'virtual',
        familyAddress: '',
        familyPhone: '',
        adminNotes: ''
      });
      setAvailableSlots([]);
      onVisitScheduled();
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      toast.error(`Failed to schedule visit: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Visit for User
        </Button>
      </DialogTrigger>
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
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Available Time Slots *</Label>
              {availableSlots.length > 0 ? (
                <Select 
                  value={formData.selectedSlotId} 
                  onValueChange={handleSlotSelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select available slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start_time} - {slot.end_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select 
                  value={formData.bookingTime} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bookingTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time (will create new slot)" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
