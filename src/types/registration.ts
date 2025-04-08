
import { UserRole } from './database';

export type RegistrationStatus = 'started' | 'in_progress' | 'completed' | 'abandoned';
export type CareUrgency = 'immediate' | 'within_week' | 'within_month' | 'planning_ahead';

export interface RegistrationProgress {
  id: string;
  userId?: string;
  sessionId: string;
  email?: string;
  currentStep: string;
  registrationData: Record<string, any>;
  status: RegistrationStatus;
  careType?: string[];
  urgency?: CareUrgency;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  completedSteps: Record<string, boolean>;
  totalSteps: number;
  completedStepCount: number;
  referralSource?: string;
  deviceInfo?: Record<string, any>;
}

export interface RegistrationStep {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  estimatedTimeSeconds: number;
  component: React.ComponentType<RegistrationStepProps>;
  condition?: (data: Record<string, any>) => boolean;
  validateStep?: (data: Record<string, any>) => boolean | { valid: boolean; message: string };
}

export interface RegistrationStepProps {
  data: Record<string, any>;
  onUpdate: (newData: Record<string, any>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isSubmitting?: boolean;
  progress: number;
  isCurrentStepValid: boolean;
}

export type RegistrationFlowType = 'family' | 'professional' | 'community';

export interface RegistrationField {
  id: string;
  type: 'text' | 'email' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'textarea' | 'phone' | 'date' | 'number';
  label: string;
  placeholder?: string;
  helperText?: string;
  isRequired?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => boolean | { valid: boolean; message: string };
  condition?: (data: Record<string, any>) => boolean;
  defaultValue?: any;
  maxLength?: number;
}
