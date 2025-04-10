
import { supabase } from '@/lib/supabase';
import { ChatMessage } from '@/types/chatTypes';

// Interface for parameters to the chat completion function
export interface ChatCompletionParams {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  sessionId: string;
  userRole?: string;
  systemPrompt?: string;
  temperature?: number;
}

// Interface for the response from the chat completion function
export interface ChatCompletionResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

// Create a default system prompt based on Trinidad & Tobago cultural context
export const createSystemPrompt = (userRole?: string): string => {
  let roleSpecificPrompt = '';
  
  if (userRole === 'family') {
    roleSpecificPrompt = `
      Focus on understanding the family's caregiving needs:
      - Who are they seeking care for?
      - What type of care is required?
      - What's their timeframe and budget?
      - Any specific requirements or preferences?
      
      Use compassionate, understanding language. Recognize the emotional aspects of finding care for a loved one.
    `;
  } else if (userRole === 'professional') {
    roleSpecificPrompt = `
      Focus on understanding the caregiver's professional background:
      - What type of care do they provide?
      - What's their experience and qualifications?
      - What are their availability and preferences?
      - What skills make them stand out?
      
      Use respectful, professional language that acknowledges their expertise and experience.
    `;
  } else if (userRole === 'community') {
    roleSpecificPrompt = `
      Focus on understanding how they want to contribute:
      - What skills or resources can they offer?
      - How much time can they commit?
      - What community aspect interests them most?
      - What motivated them to get involved?
      
      Use warm, inclusive language that emphasizes community values and collective support.
    `;
  }

  // Return the complete system prompt
  return roleSpecificPrompt;
};

// Main function to get AI chat completion
export const getChatCompletion = async ({
  messages,
  sessionId,
  userRole,
  systemPrompt,
  temperature = 0.7
}: ChatCompletionParams): Promise<ChatCompletionResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-gpt', {
      body: {
        messages,
        sessionId,
        userRole,
        systemPrompt: systemPrompt || createSystemPrompt(userRole),
        temperature
      }
    });

    if (error) {
      console.error('Error calling chat-gpt function:', error);
      return { message: '', error: error.message };
    }

    return data as ChatCompletionResponse;
  } catch (error) {
    console.error('Error in getChatCompletion:', error);
    return { 
      message: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to convert our app's ChatMessage type to OpenAI message format
export const convertToOpenAIMessages = (messages: ChatMessage[]) => {
  return messages.map(msg => ({
    role: msg.isUser ? 'user' : 'assistant' as 'system' | 'user' | 'assistant',
    content: msg.content
  }));
};

// Function to sync chat messages with Supabase
export const syncMessagesToSupabase = async (
  messages: ChatMessage[],
  sessionId: string,
  userRole?: string
) => {
  try {
    // Check if conversation exists
    const { data: conversation } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conversation) {
      // Create a new conversation
      await supabase
        .from('chatbot_conversations')
        .insert({
          session_id: sessionId,
          user_role: userRole,
          conversation_data: messages
        });
    } else {
      // Update the existing conversation data
      await supabase
        .from('chatbot_conversations')
        .update({
          conversation_data: messages,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      // Add any new messages to the messages table
      const { data: existingMessages } = await supabase
        .from('chatbot_messages')
        .select('id')
        .eq('conversation_id', conversation.id)
        .order('timestamp', { ascending: false })
        .limit(1);

      const lastMessageCount = existingMessages?.length || 0;
      const newMessages = messages.slice(lastMessageCount);

      if (newMessages.length > 0) {
        await Promise.all(
          newMessages.map(msg =>
            supabase.from('chatbot_messages').insert({
              conversation_id: conversation.id,
              message: msg.content,
              sender_type: msg.isUser ? 'user' : 'assistant'
            })
          )
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing messages to Supabase:', error);
    return false;
  }
};
