
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
      systemPrompt 
    } = requestData;

    // Log the request details for troubleshooting
    console.log(`Processing request for session: ${sessionId}`);
    console.log(`User role: ${requestData.userRole || 'Not specified'}`);
    console.log(`Message count: ${messages.length}`);

    // Ensure system prompt is included if provided
    if (systemPrompt && !messages.some(msg => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: systemPrompt
      });
    }

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // Using a more cost-effective model
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
