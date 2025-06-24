
import { CareTeamMemberWithProfile } from "@/types/careTypes";
import { format, getHours, getMinutes } from 'date-fns';

export const getCaregiverName = (caregiverId?: string, careTeamMembers: CareTeamMemberWithProfile[] = []) => {
  if (!caregiverId) return "Unassigned";
  const member = careTeamMembers.find(m => m.caregiverId === caregiverId);
  return member?.professionalDetails?.full_name || "Unknown Professional";
};

export const getCaregiverInitials = (caregiverId?: string, careTeamMembers: CareTeamMemberWithProfile[] = []) => {
  const name = getCaregiverName(caregiverId, careTeamMembers);
  if (name === "Unassigned" || name === "Unknown Professional") return "?";
  
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 3); // Allow up to 3 characters for better readability
};

export const isNightShift = (startTime: string) => {
  try {
    const hour = getHours(new Date(startTime));
    // Night shift: 6 PM (18:00) to 6 AM (06:00)
    return hour >= 18 || hour < 6;
  } catch (err) {
    return false;
  }
};

export const formatTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "h:mm a");
  } catch (err) {
    console.error('Error formatting time:', dateString, err);
    return "Invalid time";
  }
};

export const formatTimeShort = (dateString: string) => {
  try {
    return format(new Date(dateString), "h:mm");
  } catch (err) {
    console.error('Error formatting time:', dateString, err);
    return "Invalid";
  }
};

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (err) {
    console.error('Error formatting date:', dateString, err);
    return "Invalid date";
  }
};

export const getCaregiverColor = (caregiverId?: string) => {
  if (!caregiverId) return [200, 200, 200]; // Gray for unassigned
  
  const hashCode = caregiverId.split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Enhanced color palette for better readability and professional appearance
  const colorOptions = [
    [59, 130, 246],   // Blue
    [34, 197, 94],    // Green  
    [251, 191, 36],   // Amber
    [147, 51, 234],   // Purple
    [236, 72, 153],   // Pink
    [249, 115, 22],   // Orange
    [20, 184, 166],   // Teal
    [6, 182, 212],    // Cyan
    [99, 102, 241],   // Indigo
    [245, 101, 101],  // Red
  ];
  
  return colorOptions[hashCode % colorOptions.length];
};

export const getShiftDuration = (startTime: string, endTime: string): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  } catch (err) {
    return "Unknown duration";
  }
};

export const detectShiftOverlap = (shifts: any[]): boolean => {
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const shift1Start = new Date(shifts[i].startTime);
      const shift1End = new Date(shifts[i].endTime);
      const shift2Start = new Date(shifts[j].startTime);
      const shift2End = new Date(shifts[j].endTime);
      
      // Check for overlap
      if (shift1Start < shift2End && shift2Start < shift1End) {
        return true;
      }
    }
  }
  return false;
};

export const findCoverageGaps = (shifts: any[], dayStart: Date, dayEnd: Date): Array<{start: Date, end: Date}> => {
  if (shifts.length === 0) {
    return [{ start: dayStart, end: dayEnd }];
  }
  
  // Sort shifts by start time
  const sortedShifts = shifts.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  const gaps: Array<{start: Date, end: Date}> = [];
  
  // Check gap before first shift
  const firstShiftStart = new Date(sortedShifts[0].startTime);
  if (dayStart < firstShiftStart) {
    gaps.push({ start: dayStart, end: firstShiftStart });
  }
  
  // Check gaps between shifts
  for (let i = 0; i < sortedShifts.length - 1; i++) {
    const currentEnd = new Date(sortedShifts[i].endTime);
    const nextStart = new Date(sortedShifts[i + 1].startTime);
    
    if (currentEnd < nextStart) {
      gaps.push({ start: currentEnd, end: nextStart });
    }
  }
  
  // Check gap after last shift
  const lastShiftEnd = new Date(sortedShifts[sortedShifts.length - 1].endTime);
  if (lastShiftEnd < dayEnd) {
    gaps.push({ start: lastShiftEnd, end: dayEnd });
  }
  
  return gaps;
};
