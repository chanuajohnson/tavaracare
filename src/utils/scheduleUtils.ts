
/**
 * Utility functions for handling care schedule data
 * These functions ensure consistent schedule formats across registration, care needs, and care plans
 */

/**
 * Parses a comma-separated schedule string into an array of schedule values
 */
export function parseScheduleString(schedule: string | null | undefined): string[] {
  if (!schedule) return [];
  
  // If already an array, return it
  if (Array.isArray(schedule)) return schedule;
  
  return typeof schedule === 'string' ? schedule.split(',').map(s => s.trim()) : [];
}

/**
 * Determines the appropriate weekday coverage value from schedule options
 */
export function determineWeekdayCoverage(
  scheduleValues: string[]
): '8am-4pm' | '8am-6pm' | '6am-6pm' | '6pm-8am' | 'none' {
  // Handle empty or invalid input
  if (!scheduleValues || !Array.isArray(scheduleValues) || scheduleValues.length === 0) {
    return 'none';
  }
  
  // Priority order: give preference to longer hours if multiple are selected
  if (scheduleValues.some(s => s === 'weekday_full' || s === '6am-6pm')) return '6am-6pm';
  if (scheduleValues.some(s => s === 'weekday_extended' || s === '8am-6pm')) return '8am-6pm';
  if (scheduleValues.some(s => s === 'weekday_standard' || s === '8am-4pm')) return '8am-4pm';
  if (scheduleValues.some(s => s === 'weekday_overnight' || s === 'weekday_night' || s === '6pm-8am')) return '6pm-8am';
  
  // Direct matching for values that might come from the care plan metadata
  if (scheduleValues.includes('6am-6pm')) return '6am-6pm';
  if (scheduleValues.includes('8am-6pm')) return '8am-6pm';
  if (scheduleValues.includes('8am-4pm')) return '8am-4pm';
  if (scheduleValues.includes('6pm-8am')) return '6pm-8am';
  
  return 'none';
}

/**
 * Determines if weekend coverage is enabled from schedule options
 */
export function determineWeekendCoverage(scheduleValues: string[]): 'yes' | 'no' {
  // Handle empty or invalid input
  if (!scheduleValues || !Array.isArray(scheduleValues) || scheduleValues.length === 0) {
    return 'no';
  }
  
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
  // Handle empty or invalid input
  if (!scheduleValues || !Array.isArray(scheduleValues) || scheduleValues.length === 0) {
    return 'none';
  }
  
  // If no weekend coverage, return none
  if (!scheduleValues.some(s => s.includes('weekend_') || s === 'saturday' || s === 'sunday')) {
    return 'none';
  }
  
  // Check for specific weekend schedule types
  if (scheduleValues.some(s => 
    s === 'weekend_standard' || 
    s === 'weekend_8am_6pm' ||
    s === '8am-6pm'
  )) {
    return '8am-6pm';
  }
  
  if (scheduleValues.some(s => 
    s === 'weekend_day' || 
    s === 'weekend_6am_6pm' || 
    s === 'weekend_full' ||
    s === '6am-6pm'
  )) {
    return '6am-6pm';
  }
  
  // Direct matching for values that might come from the care plan metadata
  if (scheduleValues.includes('6am-6pm')) return '6am-6pm';
  if (scheduleValues.includes('8am-6pm')) return '8am-6pm';
  
  // Default for backward compatibility
  return '6am-6pm';
}

/**
 * Converts care plan metadata schedule format to profile care_schedule format
 */
export function convertMetadataToProfileSchedule(metadata: any): string[] {
  if (!metadata) return [];
  
  const scheduleArray: string[] = [];
  
  // Add weekday coverage
  if (metadata.weekdayCoverage && metadata.weekdayCoverage !== 'none') {
    scheduleArray.push(metadata.weekdayCoverage);
  }
  
  // Add weekend coverage if enabled
  if (metadata.weekendCoverage === 'yes' && metadata.weekendScheduleType && metadata.weekendScheduleType !== 'none') {
    scheduleArray.push(`weekend_${metadata.weekendScheduleType.replace('-', '_')}`);
  }
  
  return scheduleArray;
}

/**
 * Updates a profile's care_schedule based on care plan metadata
 */
export async function syncProfileScheduleWithCarePlan(userId: string, carePlanMetadata: any) {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    // Convert metadata to schedule array
    const scheduleArray = convertMetadataToProfileSchedule(carePlanMetadata);
    
    // Update profile
    await supabase
      .from('profiles')
      .update({
        care_schedule: scheduleArray
      })
      .eq('id', userId);
      
    return true;
  } catch (error) {
    console.error("Error syncing profile schedule with care plan:", error);
    return false;
  }
}
