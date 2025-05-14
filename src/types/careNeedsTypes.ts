
/**
 * Type definitions for care needs components
 */

import { UseFormReturn } from "react-hook-form";

// Common interface for form-based care needs components
export interface FormBasedSectionProps {
  form: UseFormReturn<any>;
}

// Common props interface for care needs sections using direct formData/onChange pattern
export interface CareNeedsSectionProps {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

// Specific section props that extend the base props
export interface DailyLivingSectionProps extends FormBasedSectionProps {}
export interface CognitiveMemorySectionProps extends FormBasedSectionProps {}
export interface HousekeepingSectionProps extends FormBasedSectionProps {}
export interface MedicalConditionsSectionProps extends FormBasedSectionProps {}
export interface EmergencySectionProps extends FormBasedSectionProps {}
export interface ShiftPreferencesSectionProps extends FormBasedSectionProps {}

// For the ScheduleInformationCard component
export interface ScheduleInformationCardProps extends CareNeedsSectionProps {}

// Type for availability in professional profiles
export interface Availability {
  monday: { available: boolean; hours: string[] };
  tuesday: { available: boolean; hours: string[] };
  wednesday: { available: boolean; hours: string[] };
  thursday: { available: boolean; hours: string[] };
  friday: { available: boolean; hours: string[] };
  saturday: { available: boolean; hours: string[] };
  sunday: { available: boolean; hours: string[] };
}
