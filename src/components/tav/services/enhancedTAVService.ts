import { supabase } from '@/lib/supabase';
import { TAVMessage, TAVConversationContext } from './tavAIService';

export interface EnhancedTAVCapabilities {
  enableStreaming: boolean;
  enableMemory: boolean;
  enableVoice: boolean;
  enableProactiveAssistance: boolean;
  enableMultiModal: boolean;
}

export interface TAVAnalytics {
  conversationCount: number;
  averageResponseTime: number;
  userSatisfactionScore: number;
  mostCommonQueries: string[];
  helpfulnessRating: number;
}

export class EnhancedTAVService {
  private static instance: EnhancedTAVService;
  private capabilities: EnhancedTAVCapabilities;

  constructor() {
    this.capabilities = {
      enableStreaming: true,
      enableMemory: true,
      enableVoice: false,
      enableProactiveAssistance: true,
      enableMultiModal: false
    };
  }

  static getInstance(): EnhancedTAVService {
    if (!EnhancedTAVService.instance) {
      EnhancedTAVService.instance = new EnhancedTAVService();
    }
    return EnhancedTAVService.instance;
  }

  async sendEnhancedMessage(
    message: string,
    context: TAVConversationContext,
    conversationHistory: TAVMessage[] = [],
    userId?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('tav-chat-enhanced', {
        body: {
          message,
          context,
          conversationHistory,
          userId,
          enableStreaming: this.capabilities.enableStreaming,
          enableMemory: this.capabilities.enableMemory
        }
      });

      if (error) {
        console.error('Enhanced TAV Service error:', error);
        return this.getFallbackResponse(context);
      }

      return data.message || this.getFallbackResponse(context);
    } catch (error) {
      console.error('Enhanced TAV Service error:', error);
      return this.getFallbackResponse(context);
    }
  }

  async sendStreamingMessage(
    message: string,
    context: TAVConversationContext,
    conversationHistory: TAVMessage[] = [],
    userId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/tav-chat-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          message,
          context,
          conversationHistory,
          userId,
          enableStreaming: true,
          enableMemory: this.capabilities.enableMemory
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming response failed');
      }

      const reader = response.body.getReader();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
                onChunk?.(data.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullResponse || this.getFallbackResponse(context);
    } catch (error) {
      console.error('Streaming error:', error);
      return this.getFallbackResponse(context);
    }
  }

  async getProactiveInsights(
    userId: string,
    context: TAVConversationContext
  ): Promise<string[]> {
    try {
      // Get user's recent activity and progress
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (!profile) return [];

      const insights: string[] = [];
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Role-specific proactive insights
      if (profile.role === 'family') {
        if (daysSinceCreated === 0) {
          insights.push("💙 Welcome to Tavara! I can help you complete your family profile to start finding caregivers.");
        } else if (daysSinceCreated < 7) {
          insights.push("🌟 Ready to find your perfect caregiver? I can guide you through our matching process.");
        }
      } else if (profile.role === 'professional') {
        if (daysSinceCreated === 0) {
          insights.push("🤝 Welcome! Let me help you set up your professional profile to start connecting with families.");
        } else if (daysSinceCreated < 7) {
          insights.push("💪 Want to see more family matches? I can help optimize your profile and availability.");
        }
      }

      // Context-specific insights
      if (context.currentPage === '/dashboard/family') {
        insights.push("⚡ I see you're on your dashboard. Need help finding caregivers or managing your care arrangements?");
      } else if (context.currentPage === '/dashboard/professional') {
        insights.push("📈 Looking to grow your caregiving business? I can share tips for attracting more families.");
      }

      return insights.slice(0, 2); // Return max 2 insights
    } catch (error) {
      console.error('Error getting proactive insights:', error);
      return [];
    }
  }

  async trackInteraction(
    userId: string | undefined,
    sessionId: string,
    interactionType: 'message' | 'helpful' | 'not_helpful' | 'task_completed',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Store in existing conversation flows table for now
      await supabase
        .from('chat_conversation_flows')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          current_stage: 'tav_analytics',
          stage_data: {
            interaction_type: interactionType,
            metadata,
            timestamp: new Date().toISOString()
          }
        }, {
          onConflict: 'session_id'
        });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  async getAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<TAVAnalytics> {
    try {
      const startDate = new Date();
      if (timeRange === 'day') {
        startDate.setDate(startDate.getDate() - 1);
      } else if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Get analytics from conversation flows for now
      const { data: analytics } = await supabase
        .from('chat_conversation_flows')
        .select('stage_data, created_at')
        .eq('current_stage', 'tav_analytics')
        .gte('created_at', startDate.toISOString());

      if (!analytics) {
        return {
          conversationCount: 0,
          averageResponseTime: 0,
          userSatisfactionScore: 0,
          mostCommonQueries: [],
          helpfulnessRating: 0
        };
      }

      const conversationCount = analytics.filter(a => {
        const stageData = a.stage_data as any;
        return stageData?.interaction_type === 'message';
      }).length;
      const helpfulRatings = analytics.filter(a => {
        const stageData = a.stage_data as any;
        return stageData?.interaction_type === 'helpful';
      }).length;
      const notHelpfulRatings = analytics.filter(a => {
        const stageData = a.stage_data as any;
        return stageData?.interaction_type === 'not_helpful';
      }).length;
      const totalRatings = helpfulRatings + notHelpfulRatings;

      return {
        conversationCount,
        averageResponseTime: 1200, // Mock data - would calculate from real metrics
        userSatisfactionScore: totalRatings > 0 ? (helpfulRatings / totalRatings) * 100 : 0,
        mostCommonQueries: [], // Would analyze message content
        helpfulnessRating: totalRatings > 0 ? (helpfulRatings / totalRatings) * 5 : 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        conversationCount: 0,
        averageResponseTime: 0,
        userSatisfactionScore: 0,
        mostCommonQueries: [],
        helpfulnessRating: 0
      };
    }
  }

  setCapabilities(capabilities: Partial<EnhancedTAVCapabilities>): void {
    this.capabilities = { ...this.capabilities, ...capabilities };
  }

  getCapabilities(): EnhancedTAVCapabilities {
    return { ...this.capabilities };
  }

  private getFallbackResponse(context: TAVConversationContext): string {
    if (context.caregiverContext) {
      return "💙 I'm here to help facilitate your conversation with this caregiver. What would you like to know about their experience?";
    }
    
    if (context.currentForm) {
      return "💙 I'm here to help you with this form. What specific assistance do you need?";
    }
    
    switch (context.currentPage) {
      case '/':
        return "💙 Welcome to Tavara! I'm here to help you navigate our platform and find the perfect care solution.";
      case '/auth':
        return "💙 I can help guide you through the registration process. What type of account would you like to create?";
      case '/dashboard/family':
        return "💙 I can help you find caregivers, manage your profile, or answer questions about care services.";
      case '/dashboard/professional':
        return "💙 I can help you connect with families, optimize your profile, or grow your caregiving practice.";
      default:
        return "💙 I'm TAV, your personal care coordinator. How can I assist you with your caregiving journey today?";
    }
  }
}