
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CareShift } from "@/services/care-plan-service";

interface ProfessionalCalendarProps {
  shifts: CareShift[];
  loading?: boolean;
}

export function ProfessionalCalendar({ shifts, loading = false }: ProfessionalCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  
  // Filter shifts for the selected date
  const getShiftsForDate = (date?: Date) => {
    if (!date || !shifts.length) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    return shifts.filter(shift => {
      const shiftStartDate = new Date(shift.start_time).toISOString().split('T')[0];
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
  
  // Get days with shifts for highlighting in calendar
  const getDaysWithShifts = () => {
    if (!shifts.length) return {};
    
    const daysWithShifts = shifts.reduce((acc: Record<string, { shift: CareShift }>, shift) => {
      const date = new Date(shift.start_time).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { shift };
      }
      return acc;
    }, {});
    
    return daysWithShifts;
  };

  console.log("ProfessionalCalendar: Rendering with shifts:", shifts.length);
  console.log("ProfessionalCalendar: Selected date shifts:", selectedDateShifts.length);

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
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  booked: Object.keys(getDaysWithShifts()).map(date => new Date(date)),
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
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
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
    </Card>
  );
}
