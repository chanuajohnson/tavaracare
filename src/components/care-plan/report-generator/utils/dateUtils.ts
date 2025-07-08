
import { CareShift } from "@/types/careTypes";
import { format, isWithinInterval, parseISO } from 'date-fns';

export const getFilteredShifts = (
  careShifts: CareShift[], 
  startDate: string, 
  endDate: string
): CareShift[] => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    return careShifts.filter(shift => {
      try {
        const shiftDate = parseISO(shift.startTime);
        return isWithinInterval(shiftDate, { start, end });
      } catch (err) {
        console.error('Error parsing shift date:', shift.startTime, err);
        return false;
      }
    });
  } catch (err) {
    console.error('Error filtering shifts:', err);
    return [];
  }
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  try {
    const start = format(parseISO(startDate), 'MMM d, yyyy');
    const end = format(parseISO(endDate), 'MMM d, yyyy');
    return `${start} - ${end}`;
  } catch (err) {
    console.error('Error formatting date range:', err);
    return 'Invalid date range';
  }
};
