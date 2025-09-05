import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.1/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Enhanced CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-client-env',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Get environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface ConversationContext {
  currentPage: string;
  currentForm?: string;
  formFields?: Record<string, any>;
  userRole?: string;
  sessionId: string;
  caregiverContext?: any;
  previousConversations?: ChatMessage[];
  userPreferences?: Record<string, any>;
}

interface MemoryEntry {
  id: string;
  user_id?: string;
  session_id: string;
  memory_type: 'preference' | 'context' | 'conversation' | 'user_info';
  content: any;
  created_at: string;
  expires_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      context, 
      conversationHistory = [],
      userId,
      enableStreaming = false,
      enableMemory = true 
    }: {
      message: string;
      context: ConversationContext;
      conversationHistory: ChatMessage[];
      userId?: string;
      enableStreaming?: boolean;
      enableMemory?: boolean;
    } = await req.json();

    console.log('TAV Enhanced Chat Request:', {
      sessionId: context.sessionId?.substring(0, 8) + '...',
      userRole: context.userRole,
      currentPage: context.currentPage,
      hasHistory: conversationHistory.length > 0,
      enableStreaming,
      enableMemory
    });

    // Enhanced memory retrieval
    let memoryContext = "";
    if (enableMemory) {
      try {
        const { data: memories } = await supabase
          .from('tav_conversation_memory')
          .select('*')
          .or(`session_id.eq.${context.sessionId},user_id.eq.${userId || 'null'}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (memories && memories.length > 0) {
          const userInfo = memories.filter(m => m.memory_type === 'user_info').slice(0, 3);
          const preferences = memories.filter(m => m.memory_type === 'preference').slice(0, 3);
          const contextMem = memories.filter(m => m.memory_type === 'context').slice(0, 2);

          if (userInfo.length > 0 || preferences.length > 0 || contextMem.length > 0) {
            memoryContext = "\n\nREMEMBERED CONTEXT:\n";
            if (userInfo.length > 0) {
              memoryContext += "User Information: " + userInfo.map(m => m.content.summary || m.content).join(", ") + "\n";
            }
            if (preferences.length > 0) {
              memoryContext += "User Preferences: " + preferences.map(m => m.content.preference || m.content).join(", ") + "\n";
            }
            if (contextMem.length > 0) {
              memoryContext += "Previous Context: " + contextMem.map(m => m.content.context || m.content).join(", ") + "\n";
            }
          }
        }
      } catch (error) {
        console.error('Memory retrieval error:', error);
      }
    }

    // Create enhanced system prompt
    const systemPrompt = createEnhancedSystemPrompt(context, memoryContext);

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI with latest model
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Latest available model
        messages,
        temperature: 0.8, // Higher for more personality
        max_tokens: 500,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
        stream: enableStreaming
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    let responseContent = "";
    
    if (enableStreaming) {
      // Set up streaming response
      const stream = new ReadableStream({
        start(controller) {
          const reader = openAIResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content || '';
                      if (content) {
                        responseContent += content;
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
                  }
                }
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          };

          pump();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const data = await openAIResponse.json();
      responseContent = data.choices[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

      // Store conversation and extract insights for memory
      if (enableMemory && (userId || context.sessionId)) {
        try {
          await storeConversationMemory(
            userId,
            context.sessionId,
            message,
            responseContent,
            context
          );
        } catch (error) {
          console.error('Memory storage error:', error);
        }
      }

      // Store conversation in conversation_flows table
      try {
        await supabase
          .from('chat_conversation_flows')
          .upsert({
            session_id: context.sessionId,
            user_id: userId,
            current_stage: 'tav_chat',
            stage_data: {
              currentPage: context.currentPage,
              userRole: context.userRole,
              messageCount: conversationHistory.length + 1,
              lastInteraction: new Date().toISOString()
            },
            messages: [
              ...conversationHistory.slice(-5),
              { role: 'user', content: message, timestamp: Date.now() },
              { role: 'assistant', content: responseContent, timestamp: Date.now() }
            ]
          }, {
            onConflict: 'session_id',
            ignoreDuplicates: false
          });
      } catch (error) {
        console.error('Conversation storage error:', error);
      }

      return new Response(JSON.stringify({ 
        message: responseContent,
        sessionId: context.sessionId,
        context: {
          userRole: context.userRole,
          currentPage: context.currentPage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('TAV Enhanced Chat Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'I encountered a problem processing your message. Let me try a different approach.',
      message: "💙 I'm here to help you with your caregiving needs. What would you like assistance with today?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createEnhancedSystemPrompt(context: ConversationContext, memoryContext: string): string {
  let prompt = `You are TAV, Tavara's advanced AI care coordinator. You are warm, empathetic, intelligent, and deeply knowledgeable about caregiving in Trinidad & Tobago.

CORE PERSONALITY:
- Warm and caring, like a trusted family friend
- Culturally aware of Trinidad & Tobago context
- Professional but approachable
- Proactive in offering relevant help
- Use emojis sparingly: 💙 🤝 💪 ⚡ 🌟
- Speak naturally, avoid robotic responses

CURRENT CONTEXT:
- Page: ${context.currentPage}
- User role: ${context.userRole || 'guest'}
- Session: ${context.sessionId?.substring(0, 8)}...`;

  if (context.currentForm) {
    prompt += `\n- Current form: ${context.currentForm}`;
    if (context.formFields) {
      const fieldNames = Object.keys(context.formFields);
      prompt += `\n- Form fields available: ${fieldNames.join(', ')}`;
    }
  }
  
  if (context.isDemoMode) {
    prompt += `\n- Demo mode: Encourage engagement and show value of progress made`;
  }

  if (context.caregiverContext) {
    const caregiver = context.caregiverContext;
    prompt += `\n\nCAREGIVER CHAT FACILITATION:
You are facilitating conversation with ${caregiver.full_name || 'this caregiver'}.

CAREGIVER DETAILS:
- Name: ${caregiver.full_name || 'Professional Caregiver'}
- Experience: ${caregiver.years_of_experience || 'Experienced'} years
- Hourly Rate: $${caregiver.hourly_rate || '25-35'}/hour
- Location: ${caregiver.location || 'Trinidad and Tobago'}
- Specialties: ${caregiver.care_types?.join(', ') || 'General care'}
- Match Score: ${caregiver.match_score || 75}%
- Availability: ${caregiver.availability?.join(', ') || 'Flexible schedule'}
${caregiver.certifications ? `- Certifications: ${caregiver.certifications.join(', ')}` : ''}
${caregiver.bio ? `- Bio: ${caregiver.bio.substring(0, 100)}...` : ''}

RESPONSE PATTERNS:
When user asks about AVAILABILITY/STARTING: "Based on ${caregiver.full_name}'s schedule, they're available for ${caregiver.availability?.join(' and ') || 'flexible hours'}. To discuss starting immediately, I recommend scheduling a consultation call to finalize details."

When user asks about RATES/COST: "${caregiver.full_name} charges $${caregiver.hourly_rate || '25-35'}/hour. The exact rate can be discussed during your consultation based on specific care needs and schedule."

When user shows HIRING INTEREST: "That's wonderful! ${caregiver.full_name} is a ${caregiver.match_score || 75}% match for your needs. Next steps: 1) Schedule a consultation call 2) Discuss specific care requirements 3) Finalize rates and schedule. Would you like me to help arrange the consultation?"

When user asks about EXPERIENCE: "${caregiver.full_name} has ${caregiver.years_of_experience || 'professional'} years of experience specializing in ${caregiver.care_types?.slice(0,2).join(' and ') || 'comprehensive care'}. ${caregiver.certifications ? `They're certified in ${caregiver.certifications.slice(0,2).join(' and ')}.` : 'They bring professional expertise to every situation.'}"

NEVER GIVE GENERIC RESPONSES. Always reference specific caregiver details.`;
  }

  if (memoryContext) {
    prompt += memoryContext;
  }

  prompt += `\n\nCAPABILITIES & RESPONSIBILITIES:
1. Form Assistance: Help users navigate and complete forms step-by-step
2. Journey Guidance: Provide personalized next steps based on user progress
3. Matching Support: Help families find caregivers and professionals find opportunities
4. Educational Support: Answer questions about caregiving, services, platform features
5. Cultural Sensitivity: Understand T&T family values and caregiving traditions
6. Problem Solving: Help resolve issues and provide alternatives

FORM ASSISTANCE PATTERNS:
When user says "help me fill this out" or "go through this with me":
- "💙 I'd love to help you complete this registration step-by-step. Let's start with the first section - I'll guide you through each field. The first field asks for your first name. What's your first name?"
- Proactively offer to walk through forms section by section
- Ask for one piece of information at a time
- Confirm details before moving to next field
- Use definitive language: "The next field asks for..." not "The next field usually asks for..."

When user provides information like "chanua" or "johnson":
- For first names: "Perfect! I've filled in 'Chanua' as your first name. The next field asks for your last name. What's your last name?"
- For last names: "Great! I've filled in 'Johnson' as your last name. The next field asks for your phone number. What's your phone number?"
- Always confirm what was filled and state the next field clearly

When user seems overwhelmed by form:
- "This form has several sections, but we can take it one step at a time. Would you like me to guide you through it?"
- Break down complex forms into manageable chunks
- Explain why each field is important for finding the right care

DEMO MODE LEAD CAPTURE:
When a demo user completes the first section (personal info), offer to save progress:
- "🌟 Excellent! You've completed the personal information section. In a real account, this progress would be automatically saved. Would you like to continue exploring the form, or shall I show you what happens next in the care matching process?"
- Encourage users to see the value they've already created

RESPONSE GUIDELINES:
- Keep responses concise but helpful (2-3 sentences usually)
- Ask follow-up questions to understand user needs better
- Offer specific, actionable suggestions
- Reference user's progress when relevant
- Be proactive in suggesting next steps
- If you don't know something, offer to help find information

CONVERSATION STYLE:
- Natural, conversational tone
- Show genuine care and empathy
- Use Trinidad & Tobago cultural context when appropriate
- Be encouraging and supportive
- Focus on solutions and possibilities`;

  return prompt;
}

async function storeConversationMemory(
  userId: string | undefined,
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  context: ConversationContext
) {
  const memories: Partial<MemoryEntry>[] = [];

  // Extract user information
  if (userMessage.toLowerCase().includes('my name is') || userMessage.toLowerCase().includes('i am')) {
    memories.push({
      user_id: userId,
      session_id: sessionId,
      memory_type: 'user_info',
      content: { summary: `User mentioned personal info: ${userMessage.substring(0, 100)}` },
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    });
  }

  // Extract preferences
  if (userMessage.toLowerCase().includes('prefer') || userMessage.toLowerCase().includes('like') || userMessage.toLowerCase().includes('need')) {
    memories.push({
      user_id: userId,
      session_id: sessionId,
      memory_type: 'preference',
      content: { preference: `User preference: ${userMessage.substring(0, 100)}` },
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    });
  }

  // Store context changes
  memories.push({
    user_id: userId,
    session_id: sessionId,
    memory_type: 'context',
    content: {
      context: `Page: ${context.currentPage}, Role: ${context.userRole}`,
      interaction: userMessage.substring(0, 50) + '...'
    },
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  });

  // Store recent conversation
  memories.push({
    user_id: userId,
    session_id: sessionId,
    memory_type: 'conversation',
    content: {
      user: userMessage.substring(0, 200),
      assistant: assistantResponse.substring(0, 200),
      timestamp: new Date().toISOString()
    },
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  });

  // Batch insert memories
  if (memories.length > 0) {
    await supabase
      .from('tav_conversation_memory')
      .insert(memories);
  }
}