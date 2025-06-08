
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, Home, Calendar, Phone, Mail, MapPin, User, Trash2, Edit } from "lucide-react";
import { format } from 'date-fns';
import { AdminBookingActions } from './AdminBookingActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

type AdminStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'locked';

interface VisitBooking {
  id: string;
  user_id: string;
  user_full_name: string;
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
  availability_slot_id?: string;
}

interface AdminBookingTableProps {
  bookings: VisitBooking[];
  onBookingUpdate: () => void;
}

export const AdminBookingTable: React.FC<AdminBookingTableProps> = ({
  bookings,
  onBookingUpdate
}) => {
  const [sortField, setSortField] = useState<keyof VisitBooking>('booking_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (field: keyof VisitBooking) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingId(bookingId);
    try {
      // Get booking details first to update slot count
      const { data: booking } = await supabase
        .from('visit_bookings')
        .select('availability_slot_id')
        .eq('id', bookingId)
        .single();

      const { error } = await supabase
        .from('visit_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Update slot booking count if there was a slot
      if (booking?.availability_slot_id) {
        await supabase
          .from('admin_availability_slots')
          .update({ current_bookings: supabase.raw('current_bookings - 1') })
          .eq('id', booking.availability_slot_id);
      }
      
      toast.success('Booking deleted successfully');
      onBookingUpdate();
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      toast.error(`Failed to delete booking: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'not_required': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLevel = (booking: VisitBooking) => {
    const bookingDate = new Date(booking.booking_date);
    const today = new Date();
    const daysUntil = Math.ceil((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 1) return 'urgent';
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingSourceBadge = (booking: VisitBooking) => {
    const isAdminScheduled = !booking.availability_slot_id || booking.admin_status === 'confirmed';
    return isAdminScheduled ? (
      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
        Admin
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
        Self
      </Badge>
    );
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-muted-foreground">No bookings match your current filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {sortedBookings.map((booking) => {
          const priority = getPriorityLevel(booking);
          
          return (
            <div key={booking.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{booking.user_full_name}</span>
                </div>
                <div className="flex gap-1">
                  {getBookingSourceBadge(booking)}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingId === booking.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this booking for {booking.user_full_name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{booking.booking_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {booking.visit_type === 'virtual' ? (
                    <Video className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Home className="h-3 w-3 text-purple-500" />
                  )}
                  <span className="capitalize">{booking.visit_type.replace('_', ' ')}</span>
                </div>
                <Badge className={`text-xs ${getPriorityColor(priority)} w-fit`}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Badge>
              </div>
              
              {booking.family_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{booking.family_phone}</span>
                </div>
              )}
              
              {booking.family_address && booking.visit_type === 'in_person' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{booking.family_address}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Badge className={`text-xs ${getPaymentStatusColor(booking.payment_status)}`}>
                  {booking.payment_status.replace('_', ' ')}
                </Badge>
                <AdminBookingActions
                  booking={booking}
                  onBookingUpdate={onBookingUpdate}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('user_full_name')}
                    className="font-semibold text-left p-0 h-auto"
                  >
                    Family Details
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('booking_date')}
                    className="font-semibold text-left p-0 h-auto"
                  >
                    Date & Time
                  </Button>
                </TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Nurse</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBookings.map((booking) => {
                const priority = getPriorityLevel(booking);
                
                return (
                  <TableRow key={booking.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{booking.user_full_name}</span>
                        </div>
                        {booking.family_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{booking.family_phone}</span>
                          </div>
                        )}
                        {booking.family_address && booking.visit_type === 'in_person' && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{booking.family_address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.booking_time}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {booking.visit_type === 'virtual' ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Home className="h-4 w-4 text-purple-500" />
                        )}
                        <span className="capitalize text-sm">
                          {booking.visit_type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getBookingSourceBadge(booking)}
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`text-xs ${getPaymentStatusColor(booking.payment_status)}`}>
                        {booking.payment_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {booking.nurse_assigned ? (
                          <span className="text-green-700 font-medium">
                            {booking.nurse_assigned}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-[200px]">
                        {booking.admin_notes ? (
                          <span className="truncate block">
                            {booking.admin_notes}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            No notes
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        <AdminBookingActions
                          booking={booking}
                          onBookingUpdate={onBookingUpdate}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingId === booking.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this booking for {booking.user_full_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
