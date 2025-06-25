
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
    // Updated: Night shift starts at 5 PM (17:00) through 5 AM (05:00)
    return hour >= 17 || hour < 5;
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
  
  // Updated color palette to match exact Tailwind hex-to-RGB values
  const colorOptions = [
    [254, 243, 199],  // bg-yellow-100 (Yellow)
    [255, 237, 213],  // bg-orange-100 (Orange)
    [219, 234, 254],  // bg-blue-100 (Blue)
    [220, 252, 231],  // bg-green-100 (Green)
    [233, 213, 255],  // bg-purple-100 (Purple)
    [252, 231, 243],  // bg-pink-100 (Pink)
    [204, 251, 241],  // bg-teal-100 (Teal)
    [207, 250, 254],  // bg-cyan-100 (Cyan)
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
    "bg-yellow-100 border-yellow-200", // Updated to match new color order
    "bg-orange-100 border-orange-200",
    "bg-blue-100 border-blue-200", 
    "bg-green-100 border-green-200",
    "bg-purple-100 border-purple-200",
    "bg-pink-100 border-pink-200",
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

// Helper function to format shift title like UI
export const formatShiftTitle = (shift: any): string => {
  if (shift.title && shift.title !== 'Shift') {
    return shift.title;
  }
  
  try {
    const startDate = new Date(shift.startTime);
    const endDate = new Date(shift.endTime);
    const startDay = format(startDate, 'EEEE');
    const endDay = format(endDate, 'EEEE');
    const timeDisplay = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;
    
    if (startDay === endDay) {
      return `${startDay}, ${timeDisplay}`;
    }
    return `${startDay} - ${endDay}, ${timeDisplay}`;
  } catch (err) {
    return shift.title || 'Shift';
  }
};
