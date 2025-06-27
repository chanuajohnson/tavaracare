
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Edit, Plus, Trash2, Clock, User, Receipt, Calendar } from "lucide-react";
import { format, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { CareShift, CareTeamMemberWithProfile } from "@/types/careTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ShiftCalendarProps {
  selectedWeek: Date;
  setSelectedWeek: React.Dispatch<React.SetStateAction<Date>>;
  careShifts: CareShift[];
  careTeamMembers: CareTeamMemberWithProfile[];
  onEditShift: (shift: CareShift) => void;
  onDeleteShift: (shiftId: string) => void;
  onAddShift: (day: Date) => void;
  onLogHours: (shift: CareShift) => void;
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  selectedWeek,
  setSelectedWeek,
  careShifts,
  careTeamMembers,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onLogHours,
}) => {
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateShifts, setSelectedDateShifts] = useState<CareShift[]>([]);
  const [filterByCaregiver, setFilterByCaregiver] = useState<string | 'all'>('all');

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
      if (!shift.startTime) return false;
      const shiftDate = new Date(shift.startTime);
      const matches = isSameDay(shiftDate, day);
      
      if (filterByCaregiver && filterByCaregiver !== 'all') {
        return matches && shift.caregiverId === filterByCaregiver;
      }
      
      return matches;
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

  const handleDayClick = (day: Date) => {
    const shiftsForDay = getShiftsForDay(day);
    if (shiftsForDay.length > 0) {
      setSelectedDate(day);
      setSelectedDateShifts(shiftsForDay);
    } else {
      onAddShift(day);
    }
  };

  // Generate a consistent color for each caregiver
  const getCaregiverColor = (caregiverId?: string) => {
    if (!caregiverId) return "bg-gray-100 border-gray-200";
    
    // Simple hash function for the caregiver ID
    const hashCode = caregiverId.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const colorOptions = [
      "bg-blue-100 border-blue-200",
      "bg-green-100 border-green-200",
      "bg-yellow-100 border-yellow-200", 
      "bg-purple-100 border-purple-200",
      "bg-pink-100 border-pink-200",
      "bg-orange-100 border-orange-200",
      "bg-teal-100 border-teal-200",
      "bg-cyan-100 border-cyan-200"
    ];
    
    return colorOptions[hashCode % colorOptions.length];
  };

  const getInitials = (name: string) => {
    if (!name || name === "Unassigned" || name === "Unknown") return "?";
    return name.split(' ')
      .filter(part => part.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleViewReceipt = (shift: CareShift) => {
    // For this implementation, we'll just show a toast
    // In a real app, this would navigate to a receipt view
    if (shift.status === 'completed') {
      toast.success(`Viewing receipt for shift on ${format(new Date(shift.startTime), "MMM d, yyyy")}`);
    } else {
      toast.info("No receipt available for this shift yet.");
    }
  };
  
  const handleDownloadReceipt = (shift: CareShift) => {
    // For this implementation, we'll just show a toast
    // In a real app, this would download a receipt PDF
    if (shift.status === 'completed') {
      toast.success(`Downloading receipt for shift on ${format(new Date(shift.startTime), "MMM d, yyyy")}`);
    } else {
      toast.info("No receipt available for this shift yet.");
    }
  };

  // Count shifts by caregiver
  const shiftsByCaregiver = careTeamMembers.map(member => {
    const count = careShifts.filter(s => s.caregiverId === member.caregiverId).length;
    return {
      caregiverId: member.caregiverId,
      name: member.professionalDetails?.full_name || "Unknown",
      count
    };
  }).filter(item => item.count > 0);

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
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {shiftsByCaregiver.map((item, index) => (
            <span key={item.caregiverId} className="mr-2">
              {item.name}: {item.count} shifts
              {index < shiftsByCaregiver.length - 1 ? ' • ' : ''}
            </span>
          ))}
        </div>
        <Select
          value={filterByCaregiver}
          onValueChange={(value) => setFilterByCaregiver(value as 'all' | string)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by caregiver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Caregivers</SelectItem>
            {careTeamMembers.map((member) => (
              <SelectItem key={member.caregiverId} value={member.caregiverId}>
                {member.professionalDetails?.full_name || "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          const hasShifts = dayShifts.length > 0;
          
          return (
            <div 
              key={index} 
              className={`border rounded-md p-2 min-h-[120px] ${
                isWeekend ? 'bg-blue-50/30' : ''
              } ${hasShifts ? 'cursor-pointer hover:border-primary' : ''}`}
              onClick={() => hasShifts ? handleDayClick(day) : onAddShift(day)}
            >
              {hasShifts ? (
                <div className="space-y-2">
                  {dayShifts.slice(0, 3).map(shift => {
                    const caregiverColorClass = getCaregiverColor(shift.caregiverId);
                    return (
                      <div 
                        key={shift.id} 
                        className={`text-xs p-1.5 rounded ${caregiverColorClass} border flex flex-col`}
                      >
                        <div className="font-medium truncate">{shift.title}</div>
                        <div className="text-muted-foreground truncate">
                          {getTimeDisplay(shift.startTime)} - {getTimeDisplay(shift.endTime)}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              {getInitials(getCaregiverName(shift.caregiverId))}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`truncate ${
                            shift.caregiverId ? 'text-green-700' : 'text-orange-700'
                          }`}>
                            {getCaregiverName(shift.caregiverId)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayShifts.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayShifts.length - 3} more
                    </div>
                  )}
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
          <li>• Click on a day with shifts to view all shifts for that day</li>
          <li>• Filter by caregiver to view specific assignments</li>
          <li>• Different colors represent different caregivers</li>
          <li>• Completed shifts have payment receipts available</li>
        </ul>
      </div>

      {/* Dialog for showing shifts for a specific day */}
      <Dialog 
        open={selectedDate !== null} 
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {selectedDateShifts.map(shift => (
              <div 
                key={shift.id} 
                className={`p-3 border rounded-md ${getCaregiverColor(shift.caregiverId)}`}
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
                    <span>{getTimeDisplay(shift.startTime)} - {getTimeDisplay(shift.endTime)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{getCaregiverName(shift.caregiverId)}</span>
                  </div>
                  
                  {shift.description && (
                    <p className="mt-1 text-muted-foreground">{shift.description}</p>
                  )}
                  
                  {shift.location && (
                    <p className="text-xs mt-1 text-muted-foreground">Location: {shift.location}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-end gap-1 mt-3">
                  {shift.status === 'completed' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2"
                        onClick={() => handleViewReceipt(shift)}
                      >
                        <Receipt className="h-3.5 w-3.5 mr-1" />
                        View Receipt
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2"
                        onClick={() => handleDownloadReceipt(shift)}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Add to Calendar
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2"
                    onClick={() => onLogHours(shift)}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Log Hours
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2"
                    onClick={() => {
                      onEditShift(shift);
                      setSelectedDate(null);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      onDeleteShift(shift.id);
                      setSelectedDate(null);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
