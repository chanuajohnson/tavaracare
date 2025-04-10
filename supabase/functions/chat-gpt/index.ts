
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId: string;
  userRole?: string;
  systemPrompt?: string;
  temperature?: number;
  stream?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, sessionId, userRole, systemPrompt, temperature = 0.7, stream = false } = await req.json() as ChatRequest;

    // Default system prompt emphasizing Trinidad & Tobago cultural context
    const defaultSystemPrompt = `You are Tavara, a friendly assistant for Tavara.care, a platform connecting families with caregivers in Trinidad & Tobago.
    
    Use warm, conversational language with occasional local phrases and terms from Trinidad & Tobago. Be empathetic, patient, and helpful.
    
    Your goal is to help users register on the platform based on their role:
    
    - For families: Gather information about their caregiving needs
    - For professionals: Understand their caregiving experience and skills
    - For community members: Learn how they want to contribute
    
    Keep your responses concise (1-3 sentences), friendly, and focused on gathering the most relevant information.`;

    // Combine default and custom system prompts if provided
    const finalSystemPrompt = systemPrompt ? `${defaultSystemPrompt}\n\n${systemPrompt}` : defaultSystemPrompt;

    // Add system prompt to the beginning of messages if not already present
    const chatMessages = messages.find(m => m.role === 'system') 
      ? messages 
      : [{ role: 'system', content: finalSystemPrompt }, ...messages];
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        temperature,
        stream,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    // Get the AI response
    const result = await response.json();
    const aiMessage = result.choices[0].message.content;
    
    try {
      // Store the conversation in Supabase
      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from('chatbot_conversations')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();
        
      let conversationId = existingConversation?.id;
      
      // If no conversation exists, create one
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('chatbot_conversations')
          .insert({
            session_id: sessionId,
            user_role: userRole || null,
            conversation_data: messages,
          })
          .select('id')
          .single();
          
        if (convError) console.error('Error creating conversation:', convError);
        conversationId = newConversation?.id;
      }
      
      // Store the user message and AI response
      if (conversationId) {
        // Store user message
        const userMessage = messages[messages.length - 1];
        if (userMessage.role === 'user') {
          await supabase
            .from('chatbot_messages')
            .insert({
              conversation_id: conversationId,
              message: userMessage.content,
              sender_type: 'user',
            });
        }
        
        // Store AI response
        await supabase
          .from('chatbot_messages')
          .insert({
            conversation_id: conversationId,
            message: aiMessage,
            sender_type: 'assistant',
          });
      }
    } catch (dbError) {
      // Log the error but don't fail the request
      console.error('Error storing conversation in Supabase:', dbError);
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        usage: result.usage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
