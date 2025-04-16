
import { ChatOption } from "@/types/chatTypes";

export interface ChatResponseData {
  message: string;
  options?: ChatOption[];
}

export interface ChatStorageData {
  sessionId: string;
  role: string;
  section: string;
  status: string;
  questionId?: string;
  responses: Record<string, any>;
}
