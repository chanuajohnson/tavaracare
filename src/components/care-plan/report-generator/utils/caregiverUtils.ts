
import { CareTeamMemberWithProfile } from "@/types/careTypes";
import { format } from 'date-fns';

export const getCaregiverName = (caregiverId?: string, careTeamMembers: CareTeamMemberWithProfile[] = []) => {
  if (!caregiverId) return "Unassigned";
  const member = careTeamMembers.find(m => m.caregiverId === caregiverId);
  return member?.professionalDetails?.full_name || "Unknown";
};

export const getCaregiverInitials = (caregiverId?: string, careTeamMembers: CareTeamMemberWithProfile[] = []) => {
  const name = getCaregiverName(caregiverId, careTeamMembers);
  if (name === "Unassigned" || name === "Unknown") return "?";
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const isNightShift = (startTime: string) => {
  try {
    const hour = new Date(startTime).getHours();
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
  
  const colorOptions = [
    [59, 130, 246],   // Blue
    [34, 197, 94],    // Green
    [251, 191, 36],   // Yellow
    [147, 51, 234],   // Purple
    [236, 72, 153],   // Pink
    [249, 115, 22],   // Orange
    [20, 184, 166],   // Teal
    [6, 182, 212],    // Cyan
  ];
  
  return colorOptions[hashCode % colorOptions.length];
};
