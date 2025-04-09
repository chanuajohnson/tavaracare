
// Define shared types for chatbot services to avoid deep inference issues
export type ChatbotConversationRow = {
  id: string;
  session_id: string;
  user_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_role?: string;
  contact_info?: any;
  care_needs?: any;
  conversation_data?: any;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
  lead_score?: number;
  qualification_status?: string;
};
