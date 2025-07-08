
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCarePlanShifts } from "@/hooks/useCarePlanShifts";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";

interface ProfessionalCalendarProps {
  carePlanId?: string;
  loading?: boolean;
}

export function ProfessionalCalendar({ carePlanId, loading = false }: ProfessionalCalendarProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [selectedDateDetails, setSelectedDateDetails] = useState<{date: Date, shifts: any[]} | null>(null);
  
  // Use the new hook to get all shifts for the care plan
  const { 
    shifts, 
    loading: shiftsLoading 
  } = useCarePlanShifts({ 
    carePlanId,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), // Get shifts from last month
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0) // To next month end
  });
  
  console.log("ProfessionalCalendar: Rendering with care plan:", carePlanId);
  console.log("ProfessionalCalendar: All shifts for care plan:", shifts.length);
  console.log("ProfessionalCalendar: Current user ID:", user?.id);
  
  // Filter shifts for the selected date
  const getShiftsForDate = (date?: Date) => {
    if (!date || !shifts.length) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    return shifts.filter(shift => {
      if (!shift.startTime) return false;
      const shiftStartDate = new Date(shift.startTime).toISOString().split('T')[0];
      return shiftStartDate === dateString;
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
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Get days with shifts for highlighting in calendar
  const getDaysWithShifts = () => {
    if (!shifts.length) return {};
    
    const daysWithShifts: Record<string, { 
      hasUserShift: boolean; 
      hasOtherShifts: boolean; 
      allShifts: any[] 
    }> = {};
    
    shifts.forEach(shift => {
      if (!shift.startTime) return;
      
      const dateStr = new Date(shift.startTime).toISOString().split('T')[0];
      if (!daysWithShifts[dateStr]) {
        daysWithShifts[dateStr] = { 
          hasUserShift: false, 
          hasOtherShifts: false, 
          allShifts: [] 
        };
      }
      
      daysWithShifts[dateStr].allShifts.push(shift);
      
      // Check if this shift belongs to the current user
      if (shift.caregiverId === user?.id && shift.status === 'confirmed') {
        daysWithShifts[dateStr].hasUserShift = true;
      } else {
        daysWithShifts[dateStr].hasOtherShifts = true;
      }
    });
    
    console.log("Days with shifts breakdown:", daysWithShifts);
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

  const daysWithShiftsData = getDaysWithShifts();
  
  // Create arrays for different types of highlighting
  const userShiftDays = Object.keys(daysWithShiftsData)
    .filter(date => daysWithShiftsData[date].hasUserShift)
    .map(date => new Date(date));
  
  const otherShiftDays = Object.keys(daysWithShiftsData)
    .filter(date => daysWithShiftsData[date].hasOtherShifts && !daysWithShiftsData[date].hasUserShift)
    .map(date => new Date(date));
  
  const mixedShiftDays = Object.keys(daysWithShiftsData)
    .filter(date => daysWithShiftsData[date].hasUserShift && daysWithShiftsData[date].hasOtherShifts)
    .map(date => new Date(date));

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Care Plan Schedule
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
          View all shifts for this care plan. Your shifts are highlighted in blue, others in gray.
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
                  userShift: userShiftDays,
                  otherShift: otherShiftDays,
                  mixedShift: mixedShiftDays,
                  today: (date) => isToday(date)
                }}
                modifiersStyles={{
                  userShift: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '0',
                    color: 'rgb(59, 130, 246)'
                  },
                  otherShift: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                    borderRadius: '0',
                    color: 'rgb(75, 85, 99)'
                  },
                  mixedShift: { 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(147, 51, 234, 0.2)',
                    borderRadius: '0',
                    color: 'rgb(147, 51, 234)'
                  },
                  today: {
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    border: '2px solid rgb(34, 197, 94)',
                    borderRadius: '4px'
                  }
                }}
                disabled={{ before: new Date(new Date().setDate(new Date().getDate() - 30)) }}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Your shifts</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Other caregivers</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-200 rounded"></div>
                <span>Mixed shifts</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-200 border-2 border-green-500 rounded"></div>
                <span>Today</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">
                {date ? (
                  <>Shifts for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</>
                ) : (
                  <>Select a date</>
                )}
              </h3>
              
              {loading || shiftsLoading ? (
                <div className="py-4 text-center">
                  <div className="animate-pulse h-16 bg-gray-100 rounded-md"></div>
                </div>
              ) : selectedDateShifts.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateShifts.map((shift) => {
                    const isUserShift = shift.caregiverId === user?.id;
                    return (
                      <div 
                        key={shift.id} 
                        className={`flex items-start gap-3 p-3 rounded-md border ${
                          isUserShift ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`rounded-full p-1.5 text-white self-center ${
                          isUserShift ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{shift.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={shift.caregiverDetails?.avatar_url || ''} />
                                  <AvatarFallback className="bg-primary text-white text-xs">
                                    {getInitials(shift.caregiverDetails?.full_name || 'U')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600">
                                  {isUserShift ? 'You' : shift.caregiverDetails?.full_name || 'Unassigned'}
                                </span>
                                {isUserShift && (
                                  <Badge variant="secondary" className="text-xs">Your shift</Badge>
                                )}
                              </div>
                            </div>
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
                    );
                  })}
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
            {selectedDateDetails?.shifts.map((shift) => {
              const isUserShift = shift.caregiverId === user?.id;
              return (
                <div 
                  key={shift.id} 
                  className={`p-3 border rounded-md ${
                    isUserShift ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{shift.title}</h4>
                    <Badge 
                      className={
                        shift.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        shift.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {shift.status}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={shift.caregiverDetails?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {getInitials(shift.caregiverDetails?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {isUserShift ? 'You are assigned' : `${shift.caregiverDetails?.full_name || 'Unassigned'}`}
                      </span>
                      {isUserShift && (
                        <Badge variant="secondary" className="text-xs">Your shift</Badge>
                      )}
                    </div>
                    {shift.description && (
                      <p className="text-sm text-muted-foreground">{shift.description}</p>
                    )}
                    {shift.location && (
                      <p className="text-xs text-muted-foreground">Location: {shift.location}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
