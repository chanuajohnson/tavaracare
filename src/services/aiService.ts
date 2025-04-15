
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
  fieldContext?: {
    currentField?: string;
    fieldType?: string;
    options?: string[];
    previousAnswers?: Record<string, any>;
  };
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
      
      Incorporate warm, friendly Trinidad & Tobago phrases and expressions, but keep it professional and respectful.
      Be conversational but direct - ask one question at a time.
    `;
  } else if (userRole === 'professional') {
    roleSpecificPrompt = `
      Focus on understanding the caregiver's professional background:
      - What type of care do they provide?
      - What's their experience and qualifications?
      - What are their availability and preferences?
      - What skills make them stand out?
      
      Use respectful, professional language that acknowledges their expertise and experience.
      
      Incorporate warm, friendly Trinidad & Tobago phrases and expressions when appropriate.
      Be conversational but direct - ask one question at a time.
    `;
  } else if (userRole === 'community') {
    roleSpecificPrompt = `
      Focus on understanding how they want to contribute:
      - What skills or resources can they offer?
      - How much time can they commit?
      - What community aspect interests them most?
      - What motivated them to get involved?
      
      Use warm, inclusive language that emphasizes community values and collective support.
      
      Incorporate warm, friendly Trinidad & Tobago phrases and expressions when appropriate.
      Be conversational but direct - ask one question at a time.
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
  temperature = 0.7,
  fieldContext
}: ChatCompletionParams): Promise<ChatCompletionResponse> => {
  try {
    console.log("Calling chat-gpt edge function with:", {
      messageCount: messages.length,
      sessionId: sessionId,
      userRole: userRole || 'not specified',
      hasSystemPrompt: !!systemPrompt,
      hasFieldContext: !!fieldContext
    });

    // Log the project details and environment
    const envInfo = {
      projectId: 'cpdfmyemjrefnhddyrck', // Hardcoded for consistency
      env: import.meta.env.VITE_ENV || 'unknown',
      mode: import.meta.env.MODE || 'unknown'
    };
    console.log("Environment info:", envInfo);

    // Add retries for reliability
    const MAX_RETRIES = 3;
    let retries = 0;
    let lastError;

    while (retries <= MAX_RETRIES) {
      try {
        console.log(`Attempt ${retries + 1} to call chat-gpt edge function`);
        
        // Get the complete URL for logging purposes (but don't use it for the call)
        const functionUrl = `https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/chat-gpt`;
        console.log(`Function URL would be: ${functionUrl}`);
        
        // Check for debug parameter in URL to log extra information
        if (window.location.search.includes('debug=true')) {
          console.log('DEBUG MODE: Sending full messages payload:', messages);
          console.table(messages.map(m => ({role: m.role, content: m.content.substring(0, 50) + '...'})));
        }
        
        const { data, error } = await supabase.functions.invoke('chat-gpt', {
          body: {
            messages,
            sessionId,
            userRole,
            systemPrompt: systemPrompt || createSystemPrompt(userRole),
            temperature,
            fieldContext
          }
        });

        if (error) {
          console.error(`Error calling chat-gpt function (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
          console.error(`Error details:`, JSON.stringify(error));
          lastError = error;
          retries++;
          
          if (retries <= MAX_RETRIES) {
            console.log(`Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          return { 
            message: "I seem to be having trouble with my connection. Could we try again?", 
            error: error.message 
          };
        }

        // If we got data but it's empty or doesn't have a message property
        if (!data || !data.message) {
          console.error(`Invalid response from chat-gpt function (attempt ${retries + 1}/${MAX_RETRIES + 1}):`);
          console.error(`Response:`, JSON.stringify(data));
          lastError = new Error("Invalid response from chat-gpt function");
          retries++;
          
          if (retries <= MAX_RETRIES) {
            console.log(`Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          return { 
            message: "I received an invalid response. Let's try a different approach.", 
            error: "Invalid response from chat-gpt function" 
          };
        }

        console.log("Chat-gpt function response:", {
          success: true,
          hasMessage: !!data.message,
          messageLength: data.message?.length || 0,
          hasUsage: !!data.usage
        });

        return data as ChatCompletionResponse;
      } catch (err) {
        console.error(`Unexpected error in getChatCompletion (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, err);
        lastError = err;
        retries++;
        
        if (retries <= MAX_RETRIES) {
          console.log(`Retrying in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        break;
      }
    }
    
    return { 
      message: "Sorry, I'm having trouble connecting right now. Could we try a different approach?", 
      error: lastError instanceof Error ? lastError.message : 'Maximum retries exceeded'
    };
  } catch (error) {
    console.error('Error in getChatCompletion:', error);
    return { 
      message: "I'm experiencing technical difficulties at the moment. Let's try something else.", 
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
): Promise<boolean> => {
  try {
    if (!sessionId) {
      console.error("Cannot sync messages: No session ID provided");
      return false;
    }
    
    // Prevent sync with empty message array
    if (!messages || messages.length === 0) {
      console.log("No messages to sync");
      return true;
    }
    
    console.log(`Syncing ${messages.length} messages for session ${sessionId}`);
    
    // Check if conversation exists
    const { data: conversation } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    // Convert messages to a proper JSON format compatible with Supabase
    const jsonMessages = JSON.stringify(messages);

    if (!conversation) {
      // Create a new conversation
      await supabase
        .from('chatbot_conversations')
        .insert({
          session_id: sessionId,
          user_role: userRole,
          conversation_data: JSON.parse(jsonMessages)
        });
      
      console.log("Created new conversation record");
    } else {
      // Update the existing conversation data
      await supabase
        .from('chatbot_conversations')
        .update({
          conversation_data: JSON.parse(jsonMessages),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
      
      console.log("Updated existing conversation record");

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
        
        console.log(`Added ${newMessages.length} new messages`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing messages to Supabase:', error);
    return false;
  }
};
