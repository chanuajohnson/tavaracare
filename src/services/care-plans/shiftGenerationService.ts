
import { format, addDays, setHours, setMinutes, parse } from 'date-fns';
import { createCareShift } from './careShiftService';
import type { CareShift, CareShiftInput } from '@/types/careTypes';

interface CustomShift {
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
  startTime: string;
  endTime: string;
  title?: string;
}

/**
 * Generate shifts from custom definitions in the care plan metadata
 */
export const generateShiftsFromCustomDefinitions = async (
  carePlanId: string, 
  familyId: string,
  customShifts?: Array<CustomShift>
): Promise<CareShift[]> => {
  if (!customShifts || customShifts.length === 0) {
    return [];
  }
  
  const createdShifts: CareShift[] = [];
  
  for (const customShift of customShifts) {
    const { days, startTime, endTime, title } = customShift;
    
    // Create a title if not provided
    const shiftTitle = title || `Custom: ${days.map(d => capitalize(d)).join(', ')} ${formatTime(startTime)}-${formatTime(endTime)}`;
    
    // Create the recurring pattern - this is a simplified version; in a real app, 
    // you might want to use a more sophisticated pattern like RRule for iCalendar
    const recurringPattern = days.join(',');
    
    // Create a shift for the next occurrence
    const nextOccurrence = getNextOccurrence(days);
    const startDate = setCustomTime(nextOccurrence, startTime);
    const endDate = setCustomTime(nextOccurrence, endTime);
    
    // Make sure end time is after start time
    if (endDate < startDate) {
      // If end time is earlier in the day than start time, it's likely meant for the next day
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const shiftData: CareShiftInput = {
      carePlanId,
      familyId,
      title: shiftTitle,
      description: `Custom shift: ${days.map(d => capitalize(d)).join(', ')} ${formatTime(startTime)}-${formatTime(endTime)}`,
      status: 'open',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      recurringPattern,
    };
    
    try {
      const shift = await createCareShift(shiftData);
      if (shift) {
        createdShifts.push(shift);
      }
    } catch (error) {
      console.error("Error creating custom shift:", error);
    }
  }
  
  return createdShifts;
};

/**
 * Get the next occurrence of a day of the week
 */
const getNextOccurrence = (days: string[]): Date => {
  const dayMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1, 
    'tuesday': 2, 
    'wednesday': 3, 
    'thursday': 4, 
    'friday': 5, 
    'saturday': 6
  };
  
  const today = new Date();
  const currentDayIndex = today.getDay();
  let daysToAdd = 7; // Default to a week from now if no match
  
  // Find the next day in the list
  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDayIndex + i) % 7;
    if (days.some(day => dayMap[day] === checkDay)) {
      daysToAdd = i;
      break;
    }
  }
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

/**
 * Set time on a date from a time string (HH:MM)
 */
const setCustomTime = (date: Date, timeStr: string): Date => {
  const result = new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

/**
 * Format time string for display
 */
export const formatTime = (time: string): string => {
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  // Format to ensure leading zeros for minutes
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Generate time options in 30-minute increments
 */
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hourStr}:${minuteStr}`);
    }
  }
  return options;
};

/**
 * Capitalize the first letter of a string
 */
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
