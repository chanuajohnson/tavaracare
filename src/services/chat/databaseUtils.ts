
import { supabase } from "@/integrations/supabase/client";
import { safeToRecord } from "@/utils/json";

/**
 * Interface for ChatProgress
 */
export interface ChatProgress {
  sessionId: string;
  role: string;
  currentSection: number;
  questionIndex: number;
  sectionStatus: "not_started" | "in_progress" | "completed";
  responsesComplete: boolean;
  formData: Record<string, any>;
}

/**
 * Save chat response to Supabase
 */
export const saveChatResponse = async (
  sessionId: string,
  role: string,
  section: string,
  questionId: string,
  response: any,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from("chatbot_responses")
      .insert({
        session_id: sessionId,
        user_id: userId,
        role,
        section,
        question_id: questionId,
        response,
      });

    if (error) {
      console.error("Error saving chat response:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception saving chat response:", err);
    return false;
  }
};

/**
 * Update chat progress in Supabase
 */
export const updateChatProgress = async (
  sessionId: string,
  role: string,
  currentSection: string,
  sectionStatus: "not_started" | "in_progress" | "completed",
  lastQuestionId?: string,
  formData?: Record<string, any> | null,
  userId?: string
) => {
  try {
    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from("chatbot_progress")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    // Explicitly define the type-safe update data object
    const updateData: {
      session_id: string;
      user_id?: string;
      role: string;
      current_section: string;
      section_status: "not_started" | "in_progress" | "completed";
      last_question_id?: string;
      form_data?: Record<string, any>;
    } = {
      session_id: sessionId,
      user_id: userId,
      role,
      current_section: currentSection,
      section_status: sectionStatus,
      last_question_id: lastQuestionId,
    };
    
    // Only add form_data if it exists, ensuring it's a proper object
    if (formData !== undefined && formData !== null) {
      // Convert formData to a proper Record<string, any> using safeToRecord
      updateData.form_data = safeToRecord(formData);
    }

    let result;
    
    if (existingProgress) {
      // Update existing record
      result = await supabase
        .from("chatbot_progress")
        .update(updateData)
        .eq("session_id", sessionId);
    } else {
      // Create new record
      result = await supabase
        .from("chatbot_progress")
        .insert(updateData);
    }

    if (result.error) {
      console.error("Error updating chat progress:", result.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception updating chat progress:", err);
    return false;
  }
};

/**
 * Get chat progress from Supabase
 */
export const getChatProgress = async (sessionId: string): Promise<ChatProgress | null> => {
  try {
    const { data, error } = await supabase
      .from("chatbot_progress")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, not an error for us
        return null;
      }
      console.error("Error fetching chat progress:", error);
      return null;
    }

    if (!data) return null;

    return {
      sessionId: data.session_id,
      role: data.role,
      currentSection: parseInt(data.current_section, 10) || 0,
      questionIndex: 0, // Default to first question in the section
      sectionStatus: data.section_status,
      responsesComplete: data.responses_complete,
      formData: data.form_data ? safeToRecord(data.form_data) : {},
    };
  } catch (err) {
    console.error("Exception fetching chat progress:", err);
    return null;
  }
};

/**
 * Get responses for a session
 */
export const getSessionResponses = async (sessionId: string): Promise<Record<string, any>> => {
  try {
    const { data, error } = await supabase
      .from("chatbot_responses")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error fetching session responses:", error);
      return {};
    }

    // Convert to a map of questionId -> response
    const responseMap: Record<string, any> = {};
    data?.forEach((item) => {
      responseMap[item.question_id] = item.response;
    });

    return responseMap;
  } catch (err) {
    console.error("Exception fetching session responses:", err);
    return {};
  }
};

/**
 * Check if a response already exists for a question
 */
export const hasResponseForQuestion = async (
  sessionId: string,
  questionId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("chatbot_responses")
      .select("id")
      .eq("session_id", sessionId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (error) {
      console.error("Error checking for response:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Exception checking for response:", err);
    return false;
  }
};

/**
 * Get the chat history from Supabase
 */
export const getChatHistory = async (sessionId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("chatbot_conversations")
      .select("conversation_data")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching chat history:", error);
      return [];
    }

    return data.conversation_data || [];
  } catch (err) {
    console.error("Exception fetching chat history:", err);
    return [];
  }
};

/**
 * Mark a section as complete
 */
export const completeSection = async (
  sessionId: string,
  role: string,
  sectionIndex: number,
  formData: Record<string, any>
): Promise<boolean> => {
  try {
    await updateChatProgress(
      sessionId,
      role,
      sectionIndex.toString(),
      "completed",
      undefined,
      formData
    );
    
    return true;
  } catch (err) {
    console.error("Error completing section:", err);
    return false;
  }
};
