
import { supabase } from "@/integrations/supabase/client";
import { ChatbotMessage, DbChatbotMessage, SupabaseGenericResponse, CustomTable } from "@/types/chatbot";
import { adaptMessageFromDb, adaptMessageToDb } from "@/adapters/chatbot-adapters";
import { toast } from "@/hooks/use-toast";

/**
 * Service for managing chatbot messages
 */
export const messageService = {
  /**
   * Get all messages for a specific conversation
   */
  async getMessagesByConversationId(conversationId: string): Promise<ChatbotMessage[]> {
    try {
      // Cast as any for the table name since our Database type doesn't know about our custom tables
      const { data, error } = await supabase
        .from("chatbot_messages" as CustomTable)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        return [];
      }

      // Explicitly cast the response to our known type
      return (data as unknown as DbChatbotMessage[]).map(message => adaptMessageFromDb(message));
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
      toast.error("An unexpected error occurred");
      return [];
    }
  },

  /**
   * Create a new message
   */
  async createMessage(message: ChatbotMessage): Promise<ChatbotMessage | null> {
    try {
      // Validate required fields
      if (!message.message || !message.senderType) {
        const errorMsg = "Message and sender type are required";
        console.error(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      // Convert to DB format with adapter
      const dbMessage = adaptMessageToDb(message);

      // Note: Properly wrapped in array for .insert()
      const response = await supabase
        .from("chatbot_messages" as CustomTable)
        .insert([dbMessage])
        .select()
        .single();

      const { data, error } = response as SupabaseGenericResponse<unknown>;

      if (error) {
        console.error("Error creating message:", error);
        toast.error("Failed to send message");
        return null;
      }

      return adaptMessageFromDb(data as DbChatbotMessage);
    } catch (err) {
      console.error("Unexpected error creating message:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  /**
   * Update an existing message
   */
  async updateMessage(message: ChatbotMessage): Promise<ChatbotMessage | null> {
    try {
      if (!message.id) {
        const errorMsg = "Message ID is required for updates";
        console.error(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      // Convert to DB format with adapter
      const dbMessage = adaptMessageToDb(message);

      const response = await supabase
        .from("chatbot_messages" as CustomTable)
        .update(dbMessage)
        .eq("id", message.id)
        .select()
        .single();
        
      const { data, error } = response as SupabaseGenericResponse<unknown>;

      if (error) {
        console.error("Error updating message:", error);
        toast.error("Failed to update message");
        return null;
      }

      return adaptMessageFromDb(data as DbChatbotMessage);
    } catch (err) {
      console.error("Unexpected error updating message:", err);
      toast.error("An unexpected error occurred");
      return null;
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("chatbot_messages" as CustomTable)
        .delete()
        .eq("id", messageId);

      if (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected error deleting message:", err);
      toast.error("An unexpected error occurred");
      return false;
    }
  }
};
