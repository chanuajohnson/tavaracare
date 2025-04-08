
import { supabase } from "@/integrations/supabase/client";
import { ChatbotConversation, DbChatbotConversation, SupabaseGenericResponse, CustomTable } from "@/types/chatbot";
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
      const result = await supabase
        .from("chatbot_conversations" as CustomTable)
        .select()
        .eq("id", id)
        .maybeSingle();

      if (result.error) {
        console.error("Error fetching conversation:", result.error);
        toast.error("Failed to load conversation");
        return null;
      }

      if (!result.data) return null;
      
      // Cast the result to our DB type
      return adaptConversationFromDb(result.data as unknown as DbChatbotConversation);
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
      const result = await supabase
        .from("chatbot_conversations" as CustomTable)
        .select()
        .eq("session_id", sessionId)
        .maybeSingle();

      if (result.error) {
        console.error("Error fetching conversation by session ID:", result.error);
        toast.error("Failed to load conversation");
        return null;
      }

      if (!result.data) return null;
      
      // Cast the result to our DB type
      return adaptConversationFromDb(result.data as unknown as DbChatbotConversation);
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

      // Break up the chained operations
      const insertResult = await supabase
        .from("chatbot_conversations" as CustomTable)
        .insert([dbConversation])
        .select();

      if (insertResult.error) {
        console.error("Error creating conversation:", insertResult.error);
        toast.error("Failed to start conversation");
        return null;
      }

      // Extract first result from the array and cast
      const insertedConversation = insertResult.data?.[0] as unknown as DbChatbotConversation;
      
      if (!insertedConversation) {
        console.error("No conversation returned after insert");
        toast.error("Failed to start conversation");
        return null;
      }

      return adaptConversationFromDb(insertedConversation);
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

      // Break up the chained operations
      const updateResult = await supabase
        .from("chatbot_conversations" as CustomTable)
        .update(dbConversation)
        .eq("id", conversation.id)
        .select();

      if (updateResult.error) {
        console.error("Error updating conversation:", updateResult.error);
        toast.error("Failed to update conversation");
        return null;
      }

      // Extract first result from the array and cast
      const updatedConversation = updateResult.data?.[0] as unknown as DbChatbotConversation;
      
      if (!updatedConversation) {
        console.error("No conversation returned after update");
        toast.error("Failed to update conversation");
        return null;
      }

      return adaptConversationFromDb(updatedConversation);
    } catch (err) {
      console.error("Unexpected error updating conversation:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  }
};
