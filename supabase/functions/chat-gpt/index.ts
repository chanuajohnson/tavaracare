
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Configure OpenAI
const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
const configuration = new Configuration({
  apiKey: openAIApiKey
});
const openai = new OpenAIApi(configuration);

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Log the request details for troubleshooting
    console.log(`Processing request for session: ${sessionId}`);
    console.log(`User role: ${userRole || 'Not specified'}`);
    console.log(`Message count: ${messages.length}`);

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

    // Return the response
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
  } catch (error) {
    // Log detailed error for troubleshooting
    console.error('Error processing chat request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return error response
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
