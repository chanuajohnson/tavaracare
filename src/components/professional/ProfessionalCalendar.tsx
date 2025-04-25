
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO, isWithinInterval } from 'date-fns';

interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  care_plan_title?: string;
  care_recipient_name?: string;
}

interface ProfessionalCalendarProps {
  shifts: Shift[];
}

export const ProfessionalCalendar: React.FC<ProfessionalCalendarProps> = ({ shifts }) => {
  // Generate a week view of the current week
  const today = new Date();
  const currentWeek = [];
  
  // Start from Monday of current week
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  
  // Generate 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    currentWeek.push(currentDay);
  }
  
  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftStart = parseISO(shift.start_time);
      const shiftEnd = parseISO(shift.end_time);
      
      // Check if the shift falls on this day
      return isWithinInterval(date, {
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      }) || 
      isWithinInterval(shiftStart, {
        start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
      });
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {currentWeek.map((day, i) => (
          <div 
            key={i} 
            className={`border rounded-md p-2 ${
              format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') 
                ? 'bg-primary/10 border-primary' 
                : 'bg-card'
            }`}
          >
            <div className="text-center font-medium mb-2">
              <div className="text-sm text-muted-foreground">
                {format(day, 'EEE')}
              </div>
              <div>
                {format(day, 'd MMM')}
              </div>
            </div>
            
            <div className="space-y-2">
              {getShiftsForDay(day).length > 0 ? (
                getShiftsForDay(day).map(shift => (
                  <Card key={shift.id} className="bg-primary/5 border-none">
                    <CardContent className="p-2 text-xs">
                      <div className="font-medium">{shift.title}</div>
                      <div className="text-muted-foreground">
                        {format(parseISO(shift.start_time), 'h:mm a')} - {format(parseISO(shift.end_time), 'h:mm a')}
                      </div>
                      <div className="mt-1 text-xs text-primary">
                        {shift.care_plan_title}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-xs text-muted-foreground py-2">
                  No shifts
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {shifts.length === 0 && (
        <div className="text-center py-4">
          <p>No shifts scheduled in the selected date range.</p>
        </div>
      )}
    </div>
  );
};
