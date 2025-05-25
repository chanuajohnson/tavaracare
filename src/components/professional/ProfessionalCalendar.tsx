
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CareShift } from "@/types/careTypes";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/providers/AuthProvider";

interface ProfessionalCalendarProps {
  shifts: CareShift[];
  loading?: boolean;
}

export function ProfessionalCalendar({ shifts, loading = false }: ProfessionalCalendarProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [selectedDateDetails, setSelectedDateDetails] = useState<{date: Date, shifts: CareShift[]} | null>(null);
  
  // Filter shifts for the selected date - only for the current user
  const getShiftsForDate = (date?: Date) => {
    if (!date || !shifts.length || !user) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    return shifts.filter(shift => {
      if (!shift.startTime || !shift.caregiverId) return false;
      
      // CRITICAL: Only include shifts assigned to the current user with 'assigned' status
      const isAssignedToCurrentUser = shift.caregiverId === user.id;
      const isAssignedStatus = shift.status === 'assigned';
      const shiftStartDate = new Date(shift.startTime).toISOString().split('T')[0];
      const isCorrectDate = shiftStartDate === dateString;
      
      console.log("Checking shift for date filtering:", {
        shiftId: shift.id,
        shiftTitle: shift.title,
        shiftStartDate,
        targetDate: dateString,
        caregiverId: shift.caregiverId,
        currentUserId: user.id,
        status: shift.status,
        isAssignedToCurrentUser,
        isAssignedStatus,
        isCorrectDate,
        shouldInclude: isAssignedToCurrentUser && isAssignedStatus && isCorrectDate
      });
      
      return isAssignedToCurrentUser && isAssignedStatus && isCorrectDate;
    });
  };
  
  const selectedDateShifts = getShiftsForDate(date);
  
  // Format time from ISO string
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get days with shifts for highlighting in calendar - ONLY for current user's ASSIGNED shifts
  const getDaysWithShifts = () => {
    if (!shifts.length || !user) return {};
    
    const daysWithShifts: Record<string, { shift: CareShift }> = {};
    
    shifts.forEach(shift => {
      if (!shift.startTime || !shift.caregiverId) return;
      
      // CRITICAL FIX: Only include shifts that are both assigned to current user AND have 'assigned' status
      const isAssignedToCurrentUser = shift.caregiverId === user.id;
      const isAssignedStatus = shift.status === 'assigned';
      
      console.log("Evaluating shift for calendar highlighting:", {
        shiftId: shift.id,
        shiftTitle: shift.title,
        assignedTo: shift.caregiverId,
        currentUser: user.id,
        status: shift.status,
        isAssignedToCurrentUser,
        isAssignedStatus,
        shouldHighlight: isAssignedToCurrentUser && isAssignedStatus
      });
      
      if (!isAssignedToCurrentUser || !isAssignedStatus) {
        console.log("Skipping shift - not assigned to current user or not assigned status:", {
          shiftId: shift.id,
          shiftTitle: shift.title,
          assignedTo: shift.caregiverId,
          currentUser: user.id,
          status: shift.status,
          reason: !isAssignedToCurrentUser ? 'wrong user' : 'wrong status'
        });
        return;
      }
      
      const dateStr = new Date(shift.startTime).toISOString().split('T')[0];
      if (!daysWithShifts[dateStr]) {
        daysWithShifts[dateStr] = { shift };
        console.log("Adding day to highlight - user has assigned shift:", {
          date: dateStr,
          shiftTitle: shift.title,
          shiftId: shift.id,
          status: shift.status,
          caregiverId: shift.caregiverId
        });
      }
    });
    
    console.log("Final days with assigned shifts for current user:", Object.keys(daysWithShifts));
    return daysWithShifts;
  };

  const handleDateClick = (date: Date) => {
    const dateShifts = getShiftsForDate(date);
    if (dateShifts.length > 0) {
      setSelectedDateDetails({
        date,
        shifts: dateShifts
      });
    }
  };

  console.log("ProfessionalCalendar: Current user ID:", user?.id);
  console.log("ProfessionalCalendar: Total shifts received:", shifts.length);
  console.log("ProfessionalCalendar: Shifts assigned to current user:", 
    shifts.filter(s => s.caregiverId === user?.id && s.status === 'assigned').length
  );
  console.log("ProfessionalCalendar: All shifts statuses for current user:", 
    shifts.filter(s => s.caregiverId === user?.id).map(s => ({ id: s.id, status: s.status, title: s.title }))
  );
  console.log("ProfessionalCalendar: Selected date shifts:", selectedDateShifts.length);

  // Days that should be highlighted in the calendar - ONLY user's assigned shifts
  const bookedDays = Object.keys(getDaysWithShifts()).map(date => new Date(date));

  console.log("Calendar will highlight these dates:", bookedDays.map(d => d.toISOString().split('T')[0]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Upcoming Care Shifts
          </CardTitle>
          <Collapsible open={isCalendarExpanded} onOpenChange={setIsCalendarExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isCalendarExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <CardDescription>
          View and manage your upcoming care shifts
        </CardDescription>
      </CardHeader>
      
      <Collapsible open={isCalendarExpanded}>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate) {
                    handleDateClick(newDate);
                  }
                }}
                className="rounded-md border"
                modifiers={{
                  booked: bookedDays,
                }}
                modifiersStyles={{
                  booked: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderRadius: '0',
                    color: 'var(--primary)'
                  }
                }}
                disabled={{ before: new Date() }}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">
                {date ? (
                  <>Shifts for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</>
                ) : (
                  <>Select a date</>
                )}
              </h3>
              
              {loading ? (
                <div className="py-4 text-center">
                  <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>
                </div>
              ) : selectedDateShifts.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateShifts.map((shift) => (
                    <div 
                      key={shift.id} 
                      className="flex items-start gap-3 p-3 rounded-md border bg-blue-50"
                    >
                      <div className="rounded-full bg-primary p-1.5 text-white self-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{shift.title}</h4>
                          <Badge variant="outline" className="bg-white">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </Badge>
                        </div>
                        {shift.description && (
                          <p className="text-sm text-gray-600 mt-1">{shift.description}</p>
                        )}
                        {shift.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            Location: {shift.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No shifts scheduled for this date</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <Dialog 
        open={selectedDateDetails !== null} 
        onOpenChange={(open) => !open && setSelectedDateDetails(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDateDetails?.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {selectedDateDetails?.shifts.map((shift) => (
              <div 
                key={shift.id} 
                className="p-3 border rounded-md bg-muted/20"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{shift.title}</h4>
                  <Badge 
                    className={
                      shift.status === 'assigned' ? 'bg-green-100 text-green-700' :
                      shift.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }
                  >
                    {shift.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                  </div>
                  {shift.description && (
                    <p className="mt-1 text-muted-foreground">{shift.description}</p>
                  )}
                  {shift.location && (
                    <p className="text-xs mt-1 text-muted-foreground">Location: {shift.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
