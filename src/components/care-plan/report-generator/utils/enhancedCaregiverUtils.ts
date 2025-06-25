
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
    .substring(0, 2); // Limit to 2 characters for better PDF readability
};

export const isNightShift = (startTime: string) => {
  try {
    const hour = getHours(new Date(startTime));
    // Updated: Night shift starts at 5 PM (17:00) through 6 AM (06:00)
    return hour >= 17 || hour < 6;
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
  
  // Enhanced color palette that matches ShiftCalendar.tsx
  const colorOptions = [
    [59, 130, 246],   // Blue (bg-blue-100 border-blue-200)
    [34, 197, 94],    // Green (bg-green-100 border-green-200)
    [251, 191, 36],   // Yellow (bg-yellow-100 border-yellow-200)
    [147, 51, 234],   // Purple (bg-purple-100 border-purple-200)
    [236, 72, 153],   // Pink (bg-pink-100 border-pink-200)
    [249, 115, 22],   // Orange (bg-orange-100 border-orange-200)
    [20, 184, 166],   // Teal (bg-teal-100 border-teal-200)
    [6, 182, 212],    // Cyan (bg-cyan-100 border-cyan-200)
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

// Grid-specific utilities that mirror ShiftCalendar behavior
export const getShiftCardColorClass = (caregiverId?: string) => {
  if (!caregiverId) return "bg-gray-100 border-gray-200";
  
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

export const getInitials = (name: string) => {
  if (!name || name === "Unassigned" || name === "Unknown") return "?";
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase();
};
