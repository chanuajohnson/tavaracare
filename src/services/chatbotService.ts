
import { supabase } from "@/integrations/supabase/client";
import { getRegistrationFlowByRole, ChatRegistrationQuestion } from "@/data/chatRegistrationFlows";
import { v4 as uuidv4 } from "uuid";
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

// Save chat response to Supabase
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

// Update chat progress in Supabase
export const updateChatProgress = async (
  sessionId: string,
  role: string,
  currentSection: string,
  sectionStatus: "not_started" | "in_progress" | "completed",
  lastQuestionId?: string,
  formData?: Record<string, any>,
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
    
    // Only add form_data if it exists
    if (formData) {
      updateData.form_data = formData;
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

// Get chat progress from Supabase
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
      formData: data.form_data || {},
    };
  } catch (err) {
    console.error("Exception fetching chat progress:", err);
    return null;
  }
};

// Get responses for a session
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

// Generate a session ID if one doesn't exist
export const getOrCreateSessionId = (): string => {
  const existingSessionId = localStorage.getItem("tavara_chat_session");
  if (existingSessionId) {
    return existingSessionId;
  }
  
  const newSessionId = uuidv4();
  localStorage.setItem("tavara_chat_session", newSessionId);
  return newSessionId;
};

// Mark a section as complete
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

// Generate next question message based on role, section and question index
export const generateNextQuestionMessage = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): { message: string; options?: { id: string; label: string }[] } | null => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (
      sectionIndex < 0 ||
      sectionIndex >= flow.sections.length ||
      questionIndex < 0 ||
      questionIndex >= flow.sections[sectionIndex].questions.length
    ) {
      return null;
    }
    
    const section = flow.sections[sectionIndex];
    const question = section.questions[questionIndex];
    
    // For select/multiselect/checkbox, provide options
    let options;
    if (
      question.type === "select" ||
      question.type === "multiselect" ||
      question.type === "checkbox"
    ) {
      options = question.options?.map(option => ({
        id: option,
        label: option
      }));
    }
    
    // For confirm questions, provide yes/no options
    if (question.type === "confirm") {
      options = [
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" }
      ];
    }
    
    // Add section context to first question in each section
    let message = question.label;
    if (questionIndex === 0) {
      message = `Let's talk about ${section.title.toLowerCase()}.\n\n${question.label}`;
    }
    
    return {
      message,
      options
    };
  } catch (err) {
    console.error("Error generating question message:", err);
    return null;
  }
};

// Check if we've reached the end of the current section
export const isEndOfSection = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): boolean => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex < 0 || sectionIndex >= flow.sections.length) {
    return true;
  }
  
  return questionIndex >= flow.sections[sectionIndex].questions.length - 1;
};

// Check if we've reached the end of all sections
export const isEndOfFlow = (
  role: string,
  sectionIndex: number
): boolean => {
  const flow = getRegistrationFlowByRole(role);
  return sectionIndex >= flow.sections.length - 1;
};

// Get the current question
export const getCurrentQuestion = (
  role: string,
  sectionIndex: number,
  questionIndex: number
): ChatRegistrationQuestion | null => {
  try {
    const flow = getRegistrationFlowByRole(role);
    
    if (
      sectionIndex < 0 ||
      sectionIndex >= flow.sections.length ||
      questionIndex < 0 ||
      questionIndex >= flow.sections[sectionIndex].questions.length
    ) {
      return null;
    }
    
    return flow.sections[sectionIndex].questions[questionIndex];
  } catch (err) {
    console.error("Error getting current question:", err);
    return null;
  }
};

// Generate a summary of the collected data
export const generateDataSummary = (formData: Record<string, any>): string => {
  const entries = Object.entries(formData);
  if (entries.length === 0) {
    return "No information collected yet.";
  }
  
  const lines = entries.map(([key, value]) => {
    let displayValue = value;
    
    // Format arrays
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    }
    
    // Format the key for display
    const displayKey = key
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
      
    return `${displayKey}: ${displayValue}`;
  });
  
  return lines.join("\n");
};

// Export the function to get the section title
export const getSectionTitle = (role: string, sectionIndex: number): string => {
  const flow = getRegistrationFlowByRole(role);
  
  if (sectionIndex >= 0 && sectionIndex < flow.sections.length) {
    return flow.sections[sectionIndex].title;
  }
  
  return "";
};
