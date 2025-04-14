
import { supabase } from '@/lib/supabase';
import { ChatResponseData } from './types';

/**
 * Saves a chat response to the database
 */
export const saveChatResponse = async (
  sessionId: string,
  role: string,
  section: string,
  questionId: string,
  response: string
): Promise<boolean> => {
  try {
    await supabase.from('chatbot_responses').insert({
      session_id: sessionId,
      role,
      section,
      question_id: questionId,
      response: JSON.stringify({ message: response }),
      created_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving chat response:', error);
    return false;
  }
};

/**
 * Updates the chat progress information in the database
 */
export const updateChatProgress = async (
  sessionId: string,
  role: string,
  section: string,
  sectionStatus: 'not_started' | 'in_progress' | 'completed',
  lastQuestionId?: string,
  formData?: Record<string, any>
): Promise<boolean> => {
  try {
    // Format the formData to ensure it's compatible with Supabase's jsonb column
    const formattedFormData = formData ? formData : {};

    // Check if a progress row already exists for this session
    const { data: existingProgress } = await supabase
      .from('chatbot_progress')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!existingProgress) {
      // Create new progress record
      await supabase.from('chatbot_progress').insert({
        session_id: sessionId,
        role,
        current_section: section,
        section_status: sectionStatus,
        last_question_id: lastQuestionId,
        form_data: formattedFormData
      });
    } else {
      // Update existing progress record
      await supabase
        .from('chatbot_progress')
        .update({
          role,
          current_section: section,
          section_status: sectionStatus,
          last_question_id: lastQuestionId,
          form_data: formattedFormData,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    // Store progress in localStorage as a backup
    try {
      localStorage.setItem(
        `tavara_chat_progress_${sessionId}`,
        JSON.stringify({
          role,
          section,
          sectionStatus,
          lastQuestionId,
          questionIndex: parseInt(lastQuestionId?.split('_').pop() || '0', 10) || 0
        })
      );
    } catch (error) {
      console.error('Error storing progress in localStorage:', error);
    }

    return true;
  } catch (error) {
    console.error('Error updating chat progress:', error);
    return false;
  }
};

/**
 * Retrieves the chat progress for a given session ID
 */
export const getChatProgress = async (sessionId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_progress')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching chat progress:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting chat progress:', error);
    return null;
  }
};

/**
 * Retrieves all responses for a given session ID
 */
export const getSessionResponses = async (sessionId: string): Promise<Record<string, any>> => {
  try {
    const { data, error } = await supabase
      .from('chatbot_responses')
      .select('question_id, response')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error fetching session responses:', error);
      return {};
    }

    const responses: Record<string, any> = {};
    data.forEach(item => {
      try {
        // The response is stored as a JSON string so we need to parse it
        const parsedResponse = typeof item.response === 'string' 
          ? JSON.parse(item.response)
          : item.response;
          
        responses[item.question_id] = parsedResponse.message || parsedResponse;
      } catch (err) {
        // Fallback if parsing fails
        responses[item.question_id] = item.response;
      }
    });

    return responses;
  } catch (error) {
    console.error('Error getting session responses:', error);
    return {};
  }
};

/**
 * Completes a section in the chat progress
 */
export const completeSection = async (sessionId: string, section: string): Promise<boolean> => {
  try {
    await supabase
      .from('chatbot_progress')
      .update({ section_status: 'completed' })
      .eq('session_id', sessionId)
      .eq('current_section', section);
    return true;
  } catch (error) {
    console.error('Error completing section:', error);
    return false;
  }
};

// Define the ChatProgress type
export interface ChatProgress {
  session_id: string;
  role: string;
  current_section: string;
  section_status: 'not_started' | 'in_progress' | 'completed';
  last_question_id: string | null;
  form_data: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}
