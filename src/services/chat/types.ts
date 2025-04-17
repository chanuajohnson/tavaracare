
import { Json } from "@/utils/supabaseTypes";

export interface ChatProgress {
  sessionId: string;
  role: string;
  currentSection: number;
  questionIndex: number;
  sectionStatus: "not_started" | "in_progress" | "completed";
  responsesComplete: boolean;
  formData: Record<string, any>;
}

export interface ChatResponseData {
  message: string;
  options?: { id: string; label: string }[];
}
