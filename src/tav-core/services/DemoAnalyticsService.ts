import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { DemoSession, DemoConfiguration } from '../types/core';

export class DemoAnalyticsService {
  private static instance: DemoAnalyticsService;
  private sessionToken: string;
  private sessionStartTime: number;

  constructor() {
    this.sessionToken = uuidv4();
    this.sessionStartTime = Date.now();
  }
  
  static getInstance(): DemoAnalyticsService {
    if (!DemoAnalyticsService.instance) {
      DemoAnalyticsService.instance = new DemoAnalyticsService();
    }
    return DemoAnalyticsService.instance;
  }

  getSessionToken(): string {
    return this.sessionToken;
  }

  async initializeDemoSession(demoConfig: DemoConfiguration): Promise<string> {
    try {
      const visitorLocation = await this.getVisitorLocation();
      
      const { data, error } = await supabase
        .from('tav_demo_sessions')
        .insert({
          demo_type: demoConfig.type,
          session_token: this.sessionToken,
          visitor_ip: 'demo_user', // Would be actual IP in production
          visitor_location: visitorLocation,
          use_case_selected: demoConfig.useCase,
          customization_preferences: demoConfig.customization || {},
          conversation_data: [],
          form_interactions: 0,
          messages_sent: 0,
          demo_duration_seconds: 0,
          lead_captured: false,
          conversion_stage: 'demo'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating demo session:', error);
        return this.sessionToken; // Return token anyway for local tracking
      }

      console.log('✅ Demo session initialized:', data.id);
      return this.sessionToken;
    } catch (error) {
      console.error('Error initializing demo session:', error);
      return this.sessionToken;
    }
  }

  async trackMessage(message: string, isUser: boolean): Promise<void> {
    try {
      // Get current session data first
      const { data: currentSession } = await supabase
        .from('tav_demo_sessions')
        .select('conversation_data, messages_sent')
        .eq('session_token', this.sessionToken)
        .single();

      if (currentSession) {
        const newConversationData = [
          ...(currentSession.conversation_data as any[] || []),
          {
            id: uuidv4(),
            content: message,
            isUser,
            timestamp: Date.now()
          }
        ];

        // Update conversation data
        await supabase
          .from('tav_demo_sessions')
          .update({
            conversation_data: newConversationData,
            messages_sent: (currentSession.messages_sent || 0) + 1
          })
          .eq('session_token', this.sessionToken);
      }

      // Track analytics event
      await this.trackAnalyticsEvent('message_sent', 1, {
        isUser,
        messageLength: message.length
      });
    } catch (error) {
      console.error('Error tracking message:', error);
    }
  }

  async trackFormInteraction(formId: string, fieldName: string): Promise<void> {
    try {
      // Get current form interactions count
      const { data: currentSession } = await supabase
        .from('tav_demo_sessions')
        .select('form_interactions')
        .eq('session_token', this.sessionToken)
        .single();

      if (currentSession) {
        await supabase
          .from('tav_demo_sessions')
          .update({
            form_interactions: (currentSession.form_interactions || 0) + 1
          })
          .eq('session_token', this.sessionToken);
      }

      await this.trackAnalyticsEvent('form_interaction', 1, {
        formId,
        fieldName
      });
    } catch (error) {
      console.error('Error tracking form interaction:', error);
    }
  }

  async trackLeadCapture(email: string, companyName?: string): Promise<void> {
    try {
      // Update demo session
      await supabase
        .from('tav_demo_sessions')
        .update({
          lead_captured: true,
          email_captured: email,
          company_name: companyName,
          conversion_stage: 'lead'
        })
        .eq('session_token', this.sessionToken);

      // Create lead record
      const sessionId = await this.getSessionId();
      if (sessionId) {
        await supabase
          .from('tav_leads')
          .insert({
            demo_session_id: sessionId,
            email,
            company_name: companyName,
            use_case: 'demo_generated',
            lead_score: this.calculateLeadScore(),
            qualification_status: 'new'
          });
      }

      await this.trackAnalyticsEvent('lead_captured', 1, {
        email,
        companyName
      });
    } catch (error) {
      console.error('Error tracking lead capture:', error);
    }
  }

  async completeDemoSession(): Promise<void> {
    try {
      const durationSeconds = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      
      await supabase
        .from('tav_demo_sessions')
        .update({
          demo_duration_seconds: durationSeconds
        })
        .eq('session_token', this.sessionToken);

      await this.trackAnalyticsEvent('demo_completed', 1, {
        durationSeconds
      });
    } catch (error) {
      console.error('Error completing demo session:', error);
    }
  }

  private async trackAnalyticsEvent(
    metricType: string, 
    value: number = 1, 
    metadata: any = {}
  ): Promise<void> {
    try {
      const sessionId = await this.getSessionId();
      if (!sessionId) return;

      await supabase
        .from('tav_analytics')
        .insert({
          session_id: sessionId,
          metric_type: metricType,
          metric_value: value,
          metadata
        });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  private async getSessionId(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('tav_demo_sessions')
        .select('id')
        .eq('session_token', this.sessionToken)
        .single();

      if (error || !data) return null;
      return data.id;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  }

  private async getVisitorLocation(): Promise<any> {
    try {
      // In a real implementation, you'd use a geolocation service
      // For demo purposes, return mock data
      return {
        country: 'Demo Country',
        region: 'Demo Region',
        city: 'Demo City'
      };
    } catch (error) {
      return {};
    }
  }

  private calculateLeadScore(): number {
    // Simple lead scoring based on engagement
    const baseScore = 50;
    // Add scoring logic based on demo interaction data
    return baseScore;
  }
}