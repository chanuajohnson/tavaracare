
/**
 * Utility functions for handling care schedule data
 * These functions ensure consistent schedule formats across registration, care needs, and care plans
 */

/**
 * Parses a comma-separated schedule string into an array of schedule values
 */
export function parseScheduleString(schedule: string | null | undefined): string[] {
  if (!schedule) return [];
  return typeof schedule === 'string' ? schedule.split(',').map(s => s.trim()) : [];
}

/**
 * Determines the appropriate weekday coverage value from schedule options
 */
export function determineWeekdayCoverage(
  scheduleValues: string[]
): '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' | 'none' {
  // Priority order: give preference to longer hours if multiple are selected
  if (scheduleValues.some(s => s === 'weekday_full' || s === '6am-6pm')) return '6am-6pm';
  if (scheduleValues.some(s => s === 'weekday_extended' || s === '8am-6pm')) return '8am-6pm';
  if (scheduleValues.some(s => s === 'weekday_standard' || s === '8am-4pm')) return '8am-4pm';
  if (scheduleValues.some(s => s === 'weekday_overnight' || s === 'weekday_night' || s === '6pm-8am')) return '6pm-8am';
  return 'none';
}

/**
 * Determines if weekend coverage is enabled from schedule options
 */
export function determineWeekendCoverage(scheduleValues: string[]): 'yes' | 'no' {
  return scheduleValues.some(s => 
    s.includes('weekend_') || 
    s === 'saturday' || 
    s === 'sunday'
  ) ? 'yes' : 'no';
}

/**
 * Determines the weekend schedule type from schedule options
 */
export function determineWeekendScheduleType(
  scheduleValues: string[]
): '8am-6pm' | '6am-6pm' | 'none' {
  // If no weekend coverage, return none
  if (!scheduleValues.some(s => s.includes('weekend_') || s === 'saturday' || s === 'sunday')) {
    return 'none';
  }
  
  // Check for specific weekend schedule types
  if (scheduleValues.some(s => 
    s === 'weekend_standard' || 
    s === 'weekend_8am_6pm'
  )) {
    return '8am-6pm';
  }
  
  if (scheduleValues.some(s => 
    s === 'weekend_day' || 
    s === 'weekend_6am_6pm' || 
    s === 'weekend_full'
  )) {
    return '6am-6pm';
  }
  
  // Default for backward compatibility
  return '6am-6pm';
}
