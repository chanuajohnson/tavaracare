
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Configure OpenAI
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const configuration = new Configuration({
  apiKey: openAIApiKey
});
const openai = new OpenAIApi(configuration);

// Enhanced CORS headers - more permissive
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*', // More permissive
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET', // Added GET
  'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
};

// Types
interface RequestBody {
  messages: ChatCompletionRequestMessage[];
  sessionId: string;
  userRole?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  fieldContext?: {
    currentField?: string;
    fieldType?: string;
    options?: string[];
    previousAnswers?: Record<string, any>;
  };
}

serve(async (req) => {
  // Enhanced logging for every request
  console.log(`[${new Date().toISOString()}] Chat-GPT function received ${req.method} request`);
  console.log(`Request headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests - enhanced with more detailed logging
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request - returning all CORS headers");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Verify OpenAI API key at the start
    if (!openAIApiKey) {
      console.error("OpenAI API key not configured in environment");
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured",
          message: "The server is missing API configuration. Please contact support." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData: RequestBody = await req.json();
    const { 
      messages, 
      sessionId, 
      temperature = 0.7, 
      maxTokens = 300,
      systemPrompt,
      fieldContext,
      userRole
    } = requestData;

    // Enhanced logging
    console.log(`Processing request for session: ${sessionId}`);
    console.log(`User role: ${userRole || 'Not specified'}`);
    console.log(`Message count: ${messages.length}`);
    console.log(`Field context: ${fieldContext?.currentField || 'None'}`);
    console.log(`System prompt length: ${systemPrompt?.length || 0}`);

    // Create customized system prompt based on role and field context
    let effectiveSystemPrompt = systemPrompt || '';
    
    if (fieldContext && userRole) {
      // Add field-specific context to enhance AI responses
      effectiveSystemPrompt += `\n\nThe current field being requested is: ${fieldContext.currentField || 'unknown'}.`;
      
      if (fieldContext.fieldType) {
        effectiveSystemPrompt += ` This is a ${fieldContext.fieldType} field.`;
      }
      
      if (fieldContext.options && fieldContext.options.length > 0) {
        effectiveSystemPrompt += ` The available options are: ${fieldContext.options.join(', ')}.`;
      }
      
      // Add context from previous answers
      if (fieldContext.previousAnswers && Object.keys(fieldContext.previousAnswers).length > 0) {
        effectiveSystemPrompt += `\n\nThe user has already provided the following information:`;
        
        Object.entries(fieldContext.previousAnswers).forEach(([key, value]) => {
          // Format key for readability
          const readableKey = key.replace(/_/g, ' ').toLowerCase();
          effectiveSystemPrompt += `\n- ${readableKey}: ${value}`;
        });
      }
      
      // IMPORTANT: Instruct the AI to be conversational, not form-like
      effectiveSystemPrompt += `\n\nIMPORTANT: Your responses should be warm and conversational, not like form field labels. 
      DO NOT say things like "First Name" or "Email Address". Instead, ask naturally like "What's your name?" or "What's your email?".
      
      Use a warm, friendly Trinidad & Tobago style in your conversation. Make sure to sound like a real person having a conversation, not a form processor.
      
      When asking for data that requires validation:
      - For email addresses: Say something like "What's the best email to reach you at?" or "What email should I use to contact you?"
      - For phone numbers: Ask "What's your phone number?" or "What's a good number to reach you at?"
      - For names: Just ask "What's your name?" or "What should I call you?" in a friendly way.
      
      Do not tell users about validation requirements directly, but make sure your questions are clear about what information you're seeking.`;
      
      // Role-specific guidance for AI
      if (userRole === 'family') {
        effectiveSystemPrompt += `\n\nYou are helping a family member who needs care for a loved one. Be compassionate and understanding.`;
      } else if (userRole === 'professional') {
        effectiveSystemPrompt += `\n\nYou are helping a care professional register their services. Be respectful of their expertise.`;
      } else if (userRole === 'community') {
        effectiveSystemPrompt += `\n\nYou are helping someone who wants to support the caregiving community. Be appreciative of their interest.`;
      }
    }

    // Ensure system prompt is included if provided
    if (effectiveSystemPrompt && !messages.some(msg => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: effectiveSystemPrompt
      });
    }

    console.log("Calling OpenAI API with model: gpt-4o-mini");

    try {
      // Use gpt-4o-mini for a good balance of performance and cost
      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini", 
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const responseMessage = completion.data.choices[0].message?.content || "I'm sorry, I couldn't generate a response.";
      
      // Log token usage for monitoring costs
      console.log('Token usage:', completion.data.usage);

      // Return the response with CORS headers
      return new Response(
        JSON.stringify({ 
          message: responseMessage, 
          usage: completion.data.usage 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (openAiError: any) {
      // Enhanced error logging for OpenAI API errors
      console.error("OpenAI API error:", openAiError);
      console.error("Error details:", openAiError.response?.data || openAiError.message || "Unknown error");
      
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API error",
          details: openAiError.response?.data || openAiError.message || "Unknown OpenAI error",
          message: "I'm having trouble connecting to my brain right now. Let's try again in a moment."
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error: any) {
    // Comprehensive error logging
    console.error('Error processing chat request:', error);
    console.error('Error stack:', error.stack);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "I'm sorry, I'm having trouble connecting to my brain right now. Let's try a different approach." 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
