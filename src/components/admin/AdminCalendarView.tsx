
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Video, Home, Clock, User } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

interface VisitBooking {
  id: string;
  user_id: string;
  user_full_name: string;
  booking_date: string;
  booking_time: string;
  visit_type: 'virtual' | 'in_person';
  status: string;
  payment_status: string;
  admin_status: string;
}

interface AdminConfig {
  available_days: string[];
  start_time: string;
  end_time: string;
  max_bookings_per_day: number;
}

interface AdminCalendarViewProps {
  bookings: VisitBooking[];
  adminConfig: AdminConfig | null;
  onBookingUpdate: () => void;
}

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  bookings,
  adminConfig,
  onBookingUpdate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.booking_date), date)
    );
  };

  const isAvailableDay = (date: Date) => {
    if (!adminConfig) return false;
    const dayName = format(date, 'EEEE'); // Full day name
    return adminConfig.available_days.includes(dayName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Clock className="h-3 w-3 mr-1" />
            Available Days
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Video className="h-3 w-3 mr-1" />
            Virtual
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Home className="h-3 w-3 mr-1" />
            In-Person
          </Badge>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {monthDays.map(date => {
          const dayBookings = getDayBookings(date);
          const isAvailable = isAvailableDay(date);
          const isPastDate = date < new Date();

          return (
            <div
              key={date.toISOString()}
              className={`
                min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg relative
                ${isToday(date) ? 'ring-2 ring-primary' : ''}
                ${isAvailable ? 'bg-green-50' : 'bg-gray-50'}
                ${isPastDate ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className={`text-sm font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                  {format(date, 'd')}
                </span>
                {isAvailable && (
                  <Clock className="h-3 w-3 text-green-600" />
                )}
              </div>

              <div className="space-y-1">
                {dayBookings.map(booking => (
                  <div
                    key={booking.id}
                    className={`
                      p-1 rounded text-xs cursor-pointer
                      ${booking.visit_type === 'virtual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
                    `}
                    title={`${booking.user_full_name} - ${booking.booking_time} (${booking.admin_status})`}
                  >
                    <div className="flex items-center gap-1">
                      {booking.visit_type === 'virtual' ? (
                        <Video className="h-2 w-2 sm:h-3 sm:w-3" />
                      ) : (
                        <Home className="h-2 w-2 sm:h-3 sm:w-3" />
                      )}
                      <span className="truncate text-xs">
                        {booking.booking_time}
                      </span>
                    </div>
                    <div className="truncate font-medium text-xs">
                      {booking.user_full_name}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(booking.admin_status)}`}
                    >
                      {booking.admin_status}
                    </Badge>
                  </div>
                ))}
              </div>

              {isAvailable && dayBookings.length === 0 && !isPastDate && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-green-600 text-center opacity-70">
                    Available
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Schedule Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Available Days:</strong> {adminConfig?.available_days.join(', ') || 'Not configured'}</p>
            <p><strong>Time Window:</strong> {adminConfig?.start_time} - {adminConfig?.end_time}</p>
          </div>
          <div>
            <p><strong>Max Bookings per Day:</strong> {adminConfig?.max_bookings_per_day || 'Not configured'}</p>
            <p><strong>Total Bookings This Month:</strong> {bookings.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
