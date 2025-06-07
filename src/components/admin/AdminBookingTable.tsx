
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Home, Edit, Trash2, CheckCircle, XCircle, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface VisitBooking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  payment_status: string;
  admin_status: string;
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

interface AdminBookingTableProps {
  bookings: VisitBooking[];
  onBookingUpdate: () => void;
}

export const AdminBookingTable: React.FC<AdminBookingTableProps> = ({
  bookings,
  onBookingUpdate
}) => {
  const [selectedBooking, setSelectedBooking] = useState<VisitBooking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [nurseAssigned, setNurseAssigned] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditBooking = (booking: VisitBooking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || '');
    setAdminStatus(booking.admin_status || 'pending');
    setNurseAssigned(booking.nurse_assigned || '');
    setEditDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          admin_notes: adminNotes,
          admin_status: adminStatus,
          nurse_assigned: nurseAssigned,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast.success('Booking updated successfully');
      setEditDialogOpen(false);
      onBookingUpdate();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          admin_status: 'confirmed',
          confirmation_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking confirmed');
      onBookingUpdate();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          admin_status: 'cancelled',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking cancelled');
      onBookingUpdate();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'not_required': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Family</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Nurse</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">No bookings found</p>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {booking.profiles?.full_name || 'Unknown'}
                      </div>
                      {booking.profiles?.email && (
                        <div className="text-sm text-muted-foreground">
                          {booking.profiles.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{booking.booking_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {booking.visit_type === 'virtual' ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Home className="h-4 w-4 text-purple-500" />
                      )}
                      <span className="capitalize">{booking.visit_type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.admin_status)}>
                      {booking.admin_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.nurse_assigned || 'Not assigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditBooking(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {booking.admin_status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-status">Admin Status</Label>
              <Select value={adminStatus} onValueChange={setAdminStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nurse-assigned">Nurse Assigned</Label>
              <Input
                id="nurse-assigned"
                value={nurseAssigned}
                onChange={(e) => setNurseAssigned(e.target.value)}
                placeholder="Enter nurse name"
              />
            </div>

            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateBooking} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
