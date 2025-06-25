
import { STANDARDIZED_SHIFT_OPTIONS } from "@/data/chatRegistrationFlows";

interface TimeRange {
  start: string;
  end: string;
}

export interface ShiftTimeMapping {
  id: string;
  label: string;
  description: string;
  timeRange: TimeRange;
  isSpecialType?: boolean;
}

/**
 * Maps standardized shift options to time ranges for shift creation
 */
export const getShiftTimeMappings = (): ShiftTimeMapping[] => {
  return STANDARDIZED_SHIFT_OPTIONS.map(option => {
    const mapping: ShiftTimeMapping = {
      id: option.value,
      label: option.label,
      description: getShiftDescription(option.value),
      timeRange: getTimeRangeForShift(option.value),
      isSpecialType: isSpecialShiftType(option.value)
    };
    return mapping;
  });
};

/**
 * Get time range for a specific shift type
 */
const getTimeRangeForShift = (shiftValue: string): TimeRange => {
  switch (shiftValue) {
    // Standard Weekday Shifts
    case "mon_fri_8am_4pm":
      return { start: "08:00", end: "16:00" };
    case "mon_fri_8am_6pm":
      return { start: "08:00", end: "18:00" };
    case "mon_fri_6am_6pm":
      return { start: "06:00", end: "18:00" };
    
    // Weekend Shifts
    case "sat_sun_6am_6pm":
      return { start: "06:00", end: "18:00" };
    case "sat_sun_8am_4pm":
      return { start: "08:00", end: "16:00" };
    
    // Evening & Overnight Shifts (cross-day shifts)
    case "weekday_evening_4pm_6am":
      return { start: "16:00", end: "06:00" };
    case "weekday_evening_4pm_8am":
      return { start: "16:00", end: "08:00" };
    case "weekday_evening_5pm_5am":
      return { start: "17:00", end: "05:00" };
    case "weekday_evening_5pm_8am":
      return { start: "17:00", end: "08:00" };
    case "weekday_evening_6pm_6am":
      return { start: "18:00", end: "06:00" };
    case "weekday_evening_6pm_8am":
      return { start: "18:00", end: "08:00" };
    
    // Weekend Evening Shifts
    case "weekend_evening_4pm_6am":
      return { start: "16:00", end: "06:00" };
    case "weekend_evening_6pm_6am":
      return { start: "18:00", end: "06:00" };
    
    // Special shift types - default to 8-hour day shift
    case "flexible":
    case "live_in_care":
    case "24_7_care":
    case "around_clock_shifts":
    case "other":
    default:
      return { start: "08:00", end: "16:00" };
  }
};

/**
 * Get description for a shift type
 */
const getShiftDescription = (shiftValue: string): string => {
  switch (shiftValue) {
    case "mon_fri_8am_4pm":
      return "Standard daytime coverage during business hours";
    case "mon_fri_8am_6pm":
      return "Extended daytime coverage with longer hours";
    case "mon_fri_6am_6pm":
      return "Extended daytime coverage for more comprehensive care";
    case "sat_sun_6am_6pm":
      return "Daytime weekend coverage with a dedicated caregiver";
    case "sat_sun_8am_4pm":
      return "Standard weekend coverage for family assistance";
    case "weekday_evening_4pm_6am":
    case "weekday_evening_4pm_8am":
    case "weekday_evening_5pm_5am":
    case "weekday_evening_5pm_8am":
    case "weekday_evening_6pm_6am":
    case "weekday_evening_6pm_8am":
      return "Evening care on weekdays after the primary shift ends, or continuous 24-hour coverage";
    case "weekend_evening_4pm_6am":
    case "weekend_evening_6pm_6am":
      return "Evening care on weekends for continuous coverage";
    case "flexible":
      return "Flexible scheduling based on care needs";
    case "live_in_care":
      return "Full-time in-home support with live-in arrangement";
    case "24_7_care":
      return "Round-the-clock care availability";
    case "around_clock_shifts":
      return "Multiple caregivers rotating for continuous coverage";
    case "other":
      return "Custom shift schedule - specify your hours";
    default:
      return "Care shift";
  }
};

/**
 * Check if a shift type requires special handling
 */
const isSpecialShiftType = (shiftValue: string): boolean => {
  const specialTypes = ["flexible", "live_in_care", "24_7_care", "around_clock_shifts", "other"];
  return specialTypes.includes(shiftValue);
};

/**
 * Get a specific shift mapping by ID
 */
export const getShiftMappingById = (shiftId: string): ShiftTimeMapping | undefined => {
  return getShiftTimeMappings().find(mapping => mapping.id === shiftId);
};
