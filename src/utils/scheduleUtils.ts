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

/**
 * Parses a schedule string from comma-separated format to an array
 * Example: "morning,evening,weekends" -> ["morning", "evening", "weekends"]
 */
export const parseScheduleString = (scheduleStr: string | null | undefined): string[] => {
  if (!scheduleStr) return [];
  return scheduleStr.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Parses custom schedule text into structured schedule objects
 * Example: "Monday 9am-5pm, Wednesday 10am-3pm" -> [{day: "Monday", time: "9am-5pm"}, {day: "Wednesday", time: "10am-3pm"}]
 */
export const parseCustomScheduleText = (customText: string): Array<{day: string, time: string}> => {
  if (!customText || customText.trim() === '') return [];
  
  const shifts: Array<{day: string, time: string}> = [];
  const entries = customText.split(',').map(entry => entry.trim()).filter(Boolean);
  
  entries.forEach(entry => {
    // Try to match patterns like "Monday 9am-5pm" or "Monday: 9am-5pm"
    const match = entry.match(/([A-Za-z]+)[:\s]+([^\s]+)/);
    if (match) {
      shifts.push({
        day: match[1].trim(),
        time: match[2].trim()
      });
    }
  });
  
  return shifts;
};

/**
 * Determines weekday coverage type from schedule array
 */
export const determineWeekdayCoverage = (scheduleArray: string[]): 'none' | '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' => {
  if (!scheduleArray || scheduleArray.length === 0) return 'none';
  
  const weekdayOptions = ['morning', 'afternoon', 'evening', 'overnight', 'full-day'];
  const hasWeekdayCoverage = scheduleArray.some(item => weekdayOptions.includes(item.toLowerCase()));
  
  if (hasWeekdayCoverage) {
    if (scheduleArray.includes('full-day')) return '6am-6pm';
    if (scheduleArray.includes('morning') && scheduleArray.includes('afternoon')) return '8am-6pm';
    if (scheduleArray.includes('morning')) return '8am-4pm';
    if (scheduleArray.includes('overnight')) return '6pm-8am';
  }
  
  return 'none';
};

/**
 * Determines weekend coverage from schedule array
 */
export const determineWeekendCoverage = (scheduleArray: string[]): 'no' | 'yes' => {
  if (!scheduleArray || scheduleArray.length === 0) return 'no';
  
  const hasWeekends = scheduleArray.some(item => 
    item.toLowerCase() === 'weekends' || 
    item.toLowerCase() === 'weekend' || 
    item.toLowerCase() === 'saturday' || 
    item.toLowerCase() === 'sunday'
  );
  
  return hasWeekends ? 'yes' : 'no';
};

/**
 * Determines weekend schedule type based on the schedule array
 */
export const determineWeekendScheduleType = (scheduleArray: string[]): 'none' | '8am-6pm' | '6am-6pm' => {
  if (!scheduleArray || scheduleArray.length === 0) return 'none';
  
  if (scheduleArray.includes('weekend-full')) return '6am-6pm';
  if (scheduleArray.includes('weekend-morning')) return '8am-6pm';
  
  // Generic weekend coverage
  if (scheduleArray.includes('weekends') || scheduleArray.includes('weekend')) {
    return '8am-6pm';
  }
  
  // Check for specific days
  const hasSaturday = scheduleArray.includes('saturday');
  const hasSunday = scheduleArray.includes('sunday');
  
  if (hasSaturday || hasSunday) return '8am-6pm';
  
  return 'none';
};

/**
 * Converts metadata schedule format to profile care_schedule format
 */
export const convertMetadataToProfileSchedule = (metadata: Record<string, any>): string[] => {
  if (!metadata) return [];
  
  const scheduleArray: string[] = [];
  const weekdayCoverage = metadata.weekdayCoverage || 'none';
  const weekendCoverage = metadata.weekendCoverage || 'no';
  const weekendScheduleType = metadata.weekendScheduleType || 'none';
  
  // Add weekday coverage
  if (weekdayCoverage === 'full-day') {
    scheduleArray.push('full-day');
  } else if (weekdayCoverage === 'partial') {
    // Default to morning if no specific time is provided
    scheduleArray.push('morning');
  }
  
  // Add weekend coverage
  if (weekendCoverage === 'yes') {
    if (weekendScheduleType === 'full-day') {
      scheduleArray.push('weekend-full');
    } else if (weekendScheduleType === 'morning') {
      scheduleArray.push('weekend-morning');
    } else if (weekendScheduleType === 'afternoon') {
      scheduleArray.push('weekend-afternoon');
    } else if (weekendScheduleType === 'evening') {
      scheduleArray.push('weekend-evening');
    } else {
      scheduleArray.push('weekends');
    }
  }
  
  // Add custom flag if custom shifts are present
  if (metadata.customShifts && Array.isArray(metadata.customShifts) && metadata.customShifts.length > 0) {
    scheduleArray.push('custom');
  }
  
  return scheduleArray;
};
