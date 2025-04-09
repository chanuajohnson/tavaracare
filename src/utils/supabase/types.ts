
/**
 * Simplified Supabase response types to prevent excessive type instantiation
 */

export interface SupabaseResponse<T> {
  data: T[] | null;
  error: Error | null;
}

export interface SupabaseSingleResponse<T> {
  data: T | null;
  error: Error | null;
}

// Common database field types
export interface BaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Flat versions of main database table types
export interface ChatbotConversationRow extends BaseRecord {
  session_id: string;
  user_id?: string;
  status: string;
  handoff_requested?: boolean;
  converted_to_registration?: boolean;
  conversation_data?: any;
  contact_info?: any;
  care_needs?: any;
  lead_score?: number;
  qualification_status?: string;
  user_role?: string;
}

export interface ChatbotMessageRow extends BaseRecord {
  conversation_id?: string;
  sender_type: string;
  message: string;
  message_type?: string;
  timestamp: string;
  context_data?: any;
  options?: any[];
}
