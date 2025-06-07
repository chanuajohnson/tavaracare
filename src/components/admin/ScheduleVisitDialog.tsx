
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScheduleVisitDialogProps {
  onVisitScheduled: () => void;
}

export const ScheduleVisitDialog: React.FC<ScheduleVisitDialogProps> = ({
  onVisitScheduled
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    userFullName: '',
    bookingDate: undefined as Date | undefined,
    bookingTime: '',
    visitType: 'virtual' as 'virtual' | 'in_person',
    familyAddress: '',
    familyPhone: '',
    adminNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.userFullName || !formData.bookingDate || !formData.bookingTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Create a default availability slot first or use null
      const { error } = await supabase
        .from('visit_bookings')
        .insert({
          availability_slot_id: null, // Set to null since admin is manually scheduling
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
          // Note: We're not including user_id as it might not be a valid field in the schema
          // If user_id is needed, we would need to look up the user first
        });

      if (error) throw error;

      toast.success('Visit scheduled successfully');
      setOpen(false);
      setFormData({
        userId: '',
        userFullName: '',
        bookingDate: undefined,
        bookingTime: '',
        visitType: 'virtual',
        familyAddress: '',
        familyPhone: '',
        adminNotes: ''
      });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                placeholder="Enter user ID"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userFullName">Full Name *</Label>
              <Input
                id="userFullName"
                value={formData.userFullName}
                onChange={(e) => setFormData(prev => ({ ...prev, userFullName: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

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
                    onSelect={(date) => setFormData(prev => ({ ...prev, bookingDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Visit Time *</Label>
              <Select 
                value={formData.bookingTime} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bookingTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
