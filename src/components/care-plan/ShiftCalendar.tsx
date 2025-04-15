
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Edit, Plus, Trash2 } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";

interface ShiftCalendarProps {
  selectedWeek: Date;
  setSelectedWeek: React.Dispatch<React.SetStateAction<Date>>;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onEditShift: (shift: CareShift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (day: Date) => void;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  selectedWeek,
  setSelectedWeek,
  careShifts,
  careTeamMembers,
  onEditShift,
  onDeleteShift,
  onAddShift,
}) => {
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => {
      return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
    });
  };

  const getWeekDays = () => {
    return DAYS_OF_WEEK.map((_, index) => {
      const day = addDays(selectedWeek, index);
      return day;
    });
  };

  const getShiftsForDay = (day: Date) => {
    return careShifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return isSameDay(shiftDate, day);
    });
  };

  const getCaregiverName = (caregiverId?: string) => {
    if (!caregiverId) return "Unassigned";
    
    const member = careTeamMembers.find(m => m.caregiverId === caregiverId);
    return member?.professionalDetails?.full_name || "Unknown";
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
          Week of {format(selectedWeek, "MMMM d, yyyy")}
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
        {getWeekDays().map((day, index) => {
          const dayShifts = getShiftsForDay(day);
          const isWeekend = index === 0 || index === 6;
          
          return (
            <div 
              key={index} 
              className={`border rounded-md p-2 min-h-[120px] ${
                isWeekend ? 'bg-blue-50/30' : ''
              }`}
            >
              {dayShifts.length > 0 ? (
                <div className="space-y-2">
                  {dayShifts.map(shift => (
                    <div 
                      key={shift.id} 
                      className="text-xs p-1.5 rounded bg-blue-100 border border-blue-200 flex flex-col"
                    >
                      <div className="font-medium truncate">{shift.title}</div>
                      <div className="text-muted-foreground truncate">
                        {getTimeDisplay(shift.startTime)} - {getTimeDisplay(shift.endTime)}
                      </div>
                      <div className={`truncate mt-1 ${
                        shift.caregiverId ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {getCaregiverName(shift.caregiverId)}
                      </div>
                      <div className="flex justify-end gap-1 mt-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6"
                          onClick={() => onEditShift(shift)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteShift(shift.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center h-full cursor-pointer hover:bg-slate-50 transition-colors rounded"
                  onClick={() => onAddShift(day)}
                >
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-muted/30 rounded-md p-4">
        <h3 className="font-medium mb-2">About the Schedule</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Click on an empty day to add a new shift</li>
          <li>• You can assign shifts to care team members</li>
          <li>• Set shifts as recurring for regular schedules</li>
          <li>• Edit or delete shifts using the icons</li>
        </ul>
      </div>
    </div>
  );
};
