
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, Home, Edit, Trash2, User, Phone, MapPin, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface VisitBooking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  payment_status: string;
  family_address?: string;
  family_phone?: string;
  admin_notes?: string;
  admin_status: string;
  nurse_assigned?: string;
  confirmation_sent: boolean;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface AdminBookingTableProps {
  bookings: VisitBooking[];
  onBookingUpdate: () => void;
}

export const AdminBookingTable: React.FC<AdminBookingTableProps> = ({
  bookings,
  onBookingUpdate
}) => {
  const [editingBooking, setEditingBooking] = useState<VisitBooking | null>(null);
  const [formData, setFormData] = useState({
    admin_status: '',
    admin_notes: '',
    family_address: '',
    family_phone: '',
    nurse_assigned: '',
    confirmation_sent: false
  });

  const handleEditBooking = (booking: VisitBooking) => {
    setEditingBooking(booking);
    setFormData({
      admin_status: booking.admin_status || 'pending',
      admin_notes: booking.admin_notes || '',
      family_address: booking.family_address || '',
      family_phone: booking.family_phone || '',
      nurse_assigned: booking.nurse_assigned || '',
      confirmation_sent: booking.confirmation_sent || false
    });
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          admin_status: formData.admin_status,
          admin_notes: formData.admin_notes,
          family_address: formData.family_address,
          family_phone: formData.family_phone,
          nurse_assigned: formData.nurse_assigned || null,
          confirmation_sent: formData.confirmation_sent
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      toast.success('Booking updated successfully');
      setEditingBooking(null);
      onBookingUpdate();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({
          status: 'cancelled',
          admin_status: 'cancelled'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Booking cancelled successfully');
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
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not_required': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Visit Bookings ({bookings.length})</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Family</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{booking.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{booking.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">{booking.booking_time}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {booking.visit_type === 'virtual' ? (
                      <>
                        <Video className="h-4 w-4 text-blue-600" />
                        <span>Virtual</span>
                      </>
                    ) : (
                      <>
                        <Home className="h-4 w-4 text-purple-600" />
                        <span>In-Person</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.admin_status)}>
                    {booking.admin_status || 'pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPaymentStatusColor(booking.payment_status)}>
                    {booking.payment_status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBooking(booking)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Manage Visit Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Booking Details */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Booking Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Family:</span> {booking.profiles?.full_name}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span> {format(new Date(booking.booking_date), 'MMM d, yyyy')}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Time:</span> {booking.booking_time}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span> {booking.visit_type === 'virtual' ? 'Virtual' : 'In-Person'}
                              </div>
                            </div>
                          </div>

                          {/* Admin Status */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Admin Status</label>
                            <Select
                              value={formData.admin_status}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, admin_status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending Review</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Family Contact Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                Family Phone
                              </label>
                              <Input
                                value={formData.family_phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, family_phone: e.target.value }))}
                                placeholder="Enter phone number"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                Family Address
                              </label>
                              <Input
                                value={formData.family_address}
                                onChange={(e) => setFormData(prev => ({ ...prev, family_address: e.target.value }))}
                                placeholder="Enter address"
                              />
                            </div>
                          </div>

                          {/* Nurse Assignment */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Assigned Nurse
                            </label>
                            <Input
                              value={formData.nurse_assigned}
                              onChange={(e) => setFormData(prev => ({ ...prev, nurse_assigned: e.target.value }))}
                              placeholder="Enter nurse name or ID"
                            />
                          </div>

                          {/* Admin Notes */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Admin Notes</label>
                            <Textarea
                              value={formData.admin_notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                              placeholder="Add notes about this booking..."
                              rows={3}
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between">
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                            <Button onClick={handleUpdateBooking}>
                              Update Booking
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No visit bookings found</p>
        </div>
      )}
    </div>
  );
};
