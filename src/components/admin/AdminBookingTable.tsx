import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, Home, Calendar, Phone, Mail, MapPin, User } from "lucide-react";
import { format } from 'date-fns';
import { AdminBookingActions } from './AdminBookingActions';

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

  const handleSort = (field: keyof VisitBooking) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-muted-foreground">No bookings match your current filters</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[200px]">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('profiles')}
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
                            <span className="font-medium">
                              {booking.profiles?.full_name || 'Unknown'}
                            </span>
                          </div>
                          {booking.profiles?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {booking.profiles.email}
                              </span>
                            </div>
                          )}
                          {booking.family_phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{booking.family_phone}</span>
                            </div>
                          )}
                          {booking.family_address && booking.visit_type === 'in_person' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">
                                {booking.family_address}
                              </span>
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
                        <AdminBookingActions
                          booking={booking}
                          onBookingUpdate={onBookingUpdate}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};
