
import { useState } from 'react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CarePlan } from "@/types/carePlan";
import { CareShift } from "@/types/careTypes";

interface ProfessionalScheduleCalendarProps {
  shifts: CareShift[];
  carePlans: CarePlan[];
}

export const ProfessionalScheduleCalendar: React.FC<ProfessionalScheduleCalendarProps> = ({ 
  shifts,
  carePlans
}) => {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => {
      return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
    });
  };

  const getWeekDays = () => {
    return DAYS_OF_WEEK.map((_, index) => {
      const day = addDays(startOfWeek(selectedWeek), index);
      return day;
    });
  };

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return isSameDay(shiftDate, day);
    });
  };

  const getCarePlanColor = (carePlanId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
    ];
    
    // Generate a consistent index based on the care plan ID
    const index = [...carePlanId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  const getCarePlanName = (carePlanId: string) => {
    const plan = carePlans.find(p => p.id === carePlanId);
    return plan?.title || "Unknown Care Plan";
  };
  
  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="ml-1">Previous</span>
        </Button>
        <h3 className="font-medium">
          Week of {format(startOfWeek(selectedWeek), "MMMM d, yyyy")}
        </h3>
        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
          <span className="mr-1">Next</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {getWeekDays().map((day, index) => (
          <div key={index} className="text-center font-medium text-xs">
            {format(day, "EEE")}
            <br />
            {format(day, "d")}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {getWeekDays().map((day, dayIndex) => {
          const shiftsForDay = getShiftsForDay(day);
          const isToday = isSameDay(new Date(), day);
          
          return (
            <div 
              key={dayIndex} 
              className={`min-h-28 border rounded-md p-1 ${isToday ? 'border-primary bg-primary/5' : 'border-muted'}`}
            >
              {shiftsForDay.length > 0 ? (
                <div className="space-y-1">
                  {shiftsForDay.map((shift, shiftIndex) => (
                    <TooltipProvider key={shiftIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`${getCarePlanColor(shift.carePlanId)} px-2 py-1 rounded-sm text-xs cursor-pointer truncate`}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeDisplay(shift.startTime)}</span>
                            </div>
                            <div className="truncate">{shift.title}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1">
                            <div className="font-medium">{shift.title}</div>
                            <div className="text-xs text-muted-foreground">{getCarePlanName(shift.carePlanId)}</div>
                            <div className="text-xs">
                              {getTimeDisplay(shift.startTime)} - {getTimeDisplay(shift.endTime)}
                            </div>
                            {shift.location && (
                              <div className="text-xs">{shift.location}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No shifts</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
