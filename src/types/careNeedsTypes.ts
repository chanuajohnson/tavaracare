
/**
 * Type definitions for care needs components
 */

// Common props interface for care needs sections
export interface CareNeedsSectionProps {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

// Specific section props that extend the base props
export interface DailyLivingSectionProps extends CareNeedsSectionProps {}
export interface CognitiveMemorySectionProps extends CareNeedsSectionProps {}
export interface HousekeepingSectionProps extends CareNeedsSectionProps {}
export interface MedicalConditionsSectionProps extends CareNeedsSectionProps {}
export interface EmergencySectionProps extends CareNeedsSectionProps {}
export interface ScheduleInformationCardProps extends CareNeedsSectionProps {}
export interface ShiftPreferencesSectionProps extends CareNeedsSectionProps {}
