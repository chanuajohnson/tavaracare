
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
 * Returns array of strings
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
  
  // Add custom schedule flag if custom shifts are defined
  if (metadata.customShifts && metadata.customShifts.length > 0) {
    scheduleArray.push('custom');
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
        care_schedule: scheduleArray // This is now properly typed as string[]
      })
      .eq('id', userId);
      
    return true;
  } catch (error) {
    console.error("Error syncing profile schedule with care plan:", error);
    return false;
  }
}

/**
 * Parse custom schedule text into structured data
 * Handles formats like "Monday - Friday 9 AM - 5 PM" or similar descriptions
 */
export function parseCustomScheduleText(customText: string): Array<{
  days: string[];
  startTime: string;
  endTime: string;
  title?: string;
}> {
  if (!customText || customText.trim() === '') {
    return [];
  }
  
  try {
    // Split by comma to handle multiple schedule entries
    const scheduleEntries = customText.split(',').map(entry => entry.trim());
    
    return scheduleEntries.map(entry => {
      // Try to extract days and times
      // Common format: "Day - Day, HH:MM AM/PM - HH:MM AM/PM"
      const dayTimeMatch = entry.match(/([A-Za-z\s-]+)(?:\s+)(\d{1,2}(?::\d{2})?\s*[AP]M)\s*-\s*(\d{1,2}(?::\d{2})?\s*[AP]M)/i);
      
      if (dayTimeMatch) {
        // Extract days, parse into array
        const daysText = dayTimeMatch[1].trim();
        const days: string[] = [];
        
        // Handle ranges like "Monday - Friday"
        if (daysText.includes('-')) {
          const [startDay, endDay] = daysText.split('-').map(d => d.trim().toLowerCase());
          const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          
          const startIndex = weekdays.indexOf(startDay);
          const endIndex = weekdays.indexOf(endDay);
          
          if (startIndex >= 0 && endIndex >= 0) {
            // Get the range of days
            const dayRange = weekdays.slice(
              Math.min(startIndex, endIndex),
              Math.max(startIndex, endIndex) + 1
            );
            days.push(...dayRange);
          } else {
            // If we couldn't parse properly, just use the original text
            days.push(startDay, endDay);
          }
        } else {
          // Handle comma-separated days or single day
          daysText.split(/[,&]/).forEach(day => {
            const cleanDay = day.trim().toLowerCase();
            if (cleanDay) days.push(cleanDay);
          });
        }
        
        // Format times consistently
        const startTime = dayTimeMatch[2].trim();
        const endTime = dayTimeMatch[3].trim();
        
        return {
          days,
          startTime,
          endTime,
          title: `Custom schedule: ${entry}`
        };
      } else {
        // If we couldn't parse properly, use the custom text as is
        return {
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: 'Custom',
          endTime: 'Custom',
          title: entry
        };
      }
    });
  } catch (error) {
    console.error("Error parsing custom schedule text:", error);
    return [{
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: 'Custom',
      endTime: 'Custom',
      title: customText
    }];
  }
}
