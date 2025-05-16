
/**
 * Utility functions for working with schedules and care plan metadata
 */

/**
 * Gets a metadata value from a care plan's metadata object with support for legacy/snake_case keys
 * 
 * @param metadata The care plan metadata object
 * @param key The camelCase key to look for
 * @param defaultValue Optional default value if not found
 * @returns The metadata value or default value
 */
export const getMetadata = (
  metadata: Record<string, any> | null | undefined, 
  key: string, 
  defaultValue: any = null
): any => {
  if (!metadata) return defaultValue;
  
  // Try camelCase first (new format)
  if (metadata[key] !== undefined) {
    return metadata[key];
  }
  
  // Try snake_case (legacy format)
  const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (metadata[snakeKey] !== undefined) {
    return metadata[snakeKey]; 
  }
  
  return defaultValue;
};

/**
 * Checks if a date is a weekend
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Formats a time string from 24-hour to 12-hour format
 */
export const formatTimeString = (time: string): string => {
  // Handle HH:MM format
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  
  // Handle known shorthand formats
  const timeMap: Record<string, string> = {
    '6am': '6:00 AM',
    '8am': '8:00 AM',
    '4pm': '4:00 PM',
    '6pm': '6:00 PM',
    '8pm': '8:00 PM'
  };
  
  return timeMap[time.toLowerCase()] || time;
};

/**
 * Parse a schedule time range like "8am-4pm" into an object with start and end times
 */
export const parseScheduleTime = (scheduleTime: string): { start: string, end: string } => {
  const [start, end] = scheduleTime.split('-');
  return { 
    start: formatTimeString(start), 
    end: formatTimeString(end) 
  };
};

/**
 * Format a date range for display
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    options.year = 'numeric';
  }
  
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};

/**
 * Get an array of weekday names
 */
export const getWeekdayNames = (): string[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
};

/**
 * Get an array of weekend day names
 */
export const getWeekendNames = (): string[] => {
  return ['Saturday', 'Sunday'];
};
