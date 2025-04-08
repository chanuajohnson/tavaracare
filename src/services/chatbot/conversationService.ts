
import { supabase } from "@/integrations/supabase/client";
import { ChatbotConversation, DbChatbotConversation, SupabaseGenericResponse } from "@/types/chatbot";
import { adaptConversationFromDb, adaptConversationToDb } from "@/adapters/chatbot-adapters";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for managing chatbot conversations
 */
export const conversationService = {
  /**
   * Get a conversation by ID
   */
  async getConversationById(id: string): Promise<ChatbotConversation | null> {
    try {
      const response = await supabase
        .from("chatbot_conversations" as any)
        .select()
        .eq("id", id)
        .maybeSingle();

      const { data, error } = response as SupabaseGenericResponse<DbChatbotConversation>;

      if (error) {
        console.error("Error fetching conversation:", error);
        toast.error("Failed to load conversation");
        return null;
      }

      if (!data) return null;
      return adaptConversationFromDb(data);
    } catch (err) {
      console.error("Unexpected error fetching conversation:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  /**
   * Get a conversation by session ID
   */
  async getConversationBySessionId(sessionId: string): Promise<ChatbotConversation | null> {
    try {
      const response = await supabase
        .from("chatbot_conversations" as any)
        .select()
        .eq("session_id", sessionId)
        .maybeSingle();

      const { data, error } = response as SupabaseGenericResponse<DbChatbotConversation>;

      if (error) {
        console.error("Error fetching conversation by session ID:", error);
        toast.error("Failed to load conversation");
        return null;
      }

      if (!data) return null;
      return adaptConversationFromDb(data);
    } catch (err) {
      console.error("Unexpected error fetching conversation by session:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  /**
   * Create a new conversation
   */
  async createConversation(conversation: ChatbotConversation): Promise<ChatbotConversation | null> {
    try {
      // Validate required field
      if (!conversation.sessionId) {
        // If sessionId is missing, generate one
        conversation.sessionId = uuidv4();
      }

      // Convert to DB format with adapter
      const dbConversation = adaptConversationToDb(conversation);

      // Note: Properly wrapped in array for .insert()
      const response = await supabase
        .from("chatbot_conversations" as any)
        .insert([dbConversation])
        .select()
        .single();

      const { data, error } = response as SupabaseGenericResponse<DbChatbotConversation>;

      if (error) {
        console.error("Error creating conversation:", error);
        toast.error("Failed to start conversation");
        return null;
      }

      return adaptConversationFromDb(data);
    } catch (err) {
      console.error("Unexpected error creating conversation:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  /**
   * Update an existing conversation
   */
  async updateConversation(conversation: ChatbotConversation): Promise<ChatbotConversation | null> {
    try {
      if (!conversation.id) {
        const errorMsg = "Conversation ID is required for updates";
        console.error(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      // Convert to DB format with adapter
      const dbConversation = adaptConversationToDb(conversation);

      const response = await supabase
        .from("chatbot_conversations" as any)
        .update(dbConversation)
        .eq("id", conversation.id)
        .select()
        .single();

      const { data, error } = response as SupabaseGenericResponse<DbChatbotConversation>;

      if (error) {
        console.error("Error updating conversation:", error);
        toast.error("Failed to update conversation");
        return null;
      }

      return adaptConversationFromDb(data);
    } catch (err) {
      console.error("Unexpected error updating conversation:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  }
};
