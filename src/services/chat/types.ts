
import { Json } from "@/utils/supabaseTypes";

export interface ChatProgress {
  sessionId: string;
  role: string;
  currentSection: number;
  questionIndex: number;
  sectionStatus: "not_started" | "in_progress" | "completed";
  responsesComplete: boolean;
  formData: Record<string, any>;
  lastActiveTimestamp?: number;
}

export interface ChatResponseData {
  message: string;
  options?: { id: string; label: string; subtext?: string }[];
  validationNeeded?: string;
  sectionTransition?: boolean;
}

export interface StoredChatResponse {
  response: string | string[];
  role: string;
  sectionIndex: string;
  timestamp: number;
  fieldType?: string;
}

export interface MultiSelectionState {
  active: boolean;
  selections: string[];
}

export type FieldValidationType = 
  | "email" 
  | "phone" 
  | "name" 
  | "budget"
  | "address"
  | "zipcode" 
  | "date"
  | "text";

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}
