import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Lock, 
  Edit, 
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  User
} from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useNurses } from '@/hooks/useNurses';

type AdminStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'locked';

interface VisitBooking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  payment_status: string;
  admin_status: AdminStatus;
  family_address?: string;
  family_phone?: string;
  admin_notes?: string;
  nurse_assigned?: string;
  confirmation_sent: boolean;
  profiles?: {
    full_name: string;
    email?: string;
  } | null;
}

interface AdminBookingActionsProps {
  booking: VisitBooking;
  onBookingUpdate: () => void;
}

export const AdminBookingActions: React.FC<AdminBookingActionsProps> = ({
  booking,
  onBookingUpdate
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '');
  const [adminStatus, setAdminStatus] = useState<AdminStatus>(booking.admin_status);
  const [nurseAssigned, setNurseAssigned] = useState(booking.nurse_assigned || '');
  const [loading, setLoading] = useState(false);
  const { nurses, loading: nursesLoading } = useNurses();

  const handleStatusUpdate = async (newStatus: AdminStatus) => {
    setLoading(true);
    console.log('Updating booking status:', { bookingId: booking.id, currentStatus: booking.admin_status, newStatus });
    
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          admin_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) {
        console.error('Database error updating booking status:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Booking status updated successfully');
      toast.success(`Booking ${newStatus} successfully`);
      onBookingUpdate();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error(`Failed to update booking status: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedUpdate = async () => {
    setLoading(true);
    console.log('Updating booking details:', { 
      bookingId: booking.id, 
      adminStatus, 
      adminNotes, 
      nurseAssigned 
    });
    
    try {
      // Prepare the update data with proper UUID handling
      const updateData = {
        admin_notes: adminNotes.trim() || null,
        admin_status: adminStatus,
        nurse_assigned: nurseAssigned.trim() || null, // Convert empty string to null for UUID field
        updated_at: new Date().toISOString()
      };

      console.log('Prepared update data:', updateData);

      const { error } = await supabase
        .from('visit_bookings')
        .update(updateData)
        .eq('id', booking.id);

      if (error) {
        console.error('Database error updating booking details:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Booking details updated successfully');
      toast.success('Booking updated successfully');
      setEditDialogOpen(false);
      onBookingUpdate();
    } catch (error: any) {
      console.error('Error updating booking details:', error);
      toast.error(`Failed to update booking: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'locked': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Find the currently assigned nurse to display their name
  const assignedNurse = nurses.find(nurse => nurse.id === nurseAssigned);

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1">
          {booking.admin_status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={loading}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
          
          {booking.admin_status === 'confirmed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            <Edit className="h-3 w-3" />
          </Button>

          {booking.admin_status !== 'locked' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusUpdate('locked')}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Lock className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <Badge className={`text-xs ${getStatusColor(booking.admin_status)}`}>
          {booking.admin_status.charAt(0).toUpperCase() + booking.admin_status.slice(1)}
        </Badge>
      </div>

      {/* Detailed Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Details - {booking.profiles?.full_name || 'Unknown'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Booking Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Date:</span>
                  <span>{format(new Date(booking.booking_date), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span>{booking.booking_time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{booking.visit_type.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {booking.profiles?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span className="truncate">{booking.profiles.email}</span>
                  </div>
                )}
                {booking.family_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{booking.family_phone}</span>
                  </div>
                )}
                {booking.family_address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Address:</span>
                    <span className="truncate">{booking.family_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-status">Admin Status</Label>
                <Select value={adminStatus} onValueChange={(value: AdminStatus) => setAdminStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nurse-assigned">Nurse Assigned</Label>
                <Select 
                  value={nurseAssigned} 
                  onValueChange={setNurseAssigned}
                  disabled={nursesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={nursesLoading ? "Loading nurses..." : "Select a nurse"}>
                      {assignedNurse ? assignedNurse.full_name : "Select a nurse"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No nurse assigned</SelectItem>
                    {nurses.map((nurse) => (
                      <SelectItem key={nurse.id} value={nurse.id}>
                        {nurse.full_name}
                        {nurse.email && (
                          <span className="text-muted-foreground text-xs ml-2">
                            ({nurse.email})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin-notes">Internal Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this booking..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDetailedUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
