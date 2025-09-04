import { supabase } from '@/integrations/supabase/client';

export interface DemoSession {
  id: string;
  sessionId: string;
  browserFingerprint: string;
  conversationState: any;
  formProgress: Record<string, any>;
  leadCaptured: boolean;
  lastActivity: number;
  createdAt: number;
}

/**
 * Generate a simple browser fingerprint for demo session tracking
 */
const generateBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Demo fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Save demo session state to both localStorage and Supabase for persistence
 */
export const saveDemoSession = async (sessionId: string, conversationState: any, formProgress: Record<string, any> = {}): Promise<void> => {
  try {
    const browserFingerprint = generateBrowserFingerprint();
    const now = Date.now();
    
    const demoSession: DemoSession = {
      id: `demo_${sessionId}`,
      sessionId,
      browserFingerprint,
      conversationState,
      formProgress,
      leadCaptured: false,
      lastActivity: now,
      createdAt: now
    };

    // Save to localStorage for immediate access
    localStorage.setItem(`tavara_demo_session_${sessionId}`, JSON.stringify(demoSession));
    localStorage.setItem('tavara_demo_fingerprint', browserFingerprint);
    localStorage.setItem('tavara_current_demo_session', sessionId);

    // Save to Supabase for persistence across sessions using chatbot_conversations
    const { error } = await supabase
      .from('chatbot_conversations')
      .upsert({
        session_id: sessionId,
        user_id: null, // Demo users don't have user IDs
        user_role: 'family',
        conversation_data: [
          {
            type: 'demo_session',
            browser_fingerprint: browserFingerprint,
            form_progress: formProgress,
            conversation_state: conversationState,
            last_activity: now
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      });

    if (error) {
      console.error('❌ Error saving demo session to Supabase:', error);
    } else {
      console.log('💾 Demo session saved successfully:', sessionId);
    }

  } catch (error) {
    console.error('❌ Error saving demo session:', error);
  }
};

/**
 * Load demo session state from localStorage or Supabase
 */
export const loadDemoSession = async (): Promise<DemoSession | null> => {
  try {
    const browserFingerprint = generateBrowserFingerprint();
    const storedFingerprint = localStorage.getItem('tavara_demo_fingerprint');
    const currentSessionId = localStorage.getItem('tavara_current_demo_session');

    // First, try to load from localStorage if fingerprints match
    if (storedFingerprint === browserFingerprint && currentSessionId) {
      const storedSession = localStorage.getItem(`tavara_demo_session_${currentSessionId}`);
      if (storedSession) {
        const session: DemoSession = JSON.parse(storedSession);
        
        // Check if session is recent (within 24 hours)
        if (Date.now() - session.lastActivity < 24 * 60 * 60 * 1000) {
          console.log('📱 Loaded demo session from localStorage:', currentSessionId);
          return session;
        }
      }
    }

    // If localStorage fails, try to load from Supabase using browser fingerprint
    const { data: conversationData, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .contains('conversation_data', [{ browser_fingerprint: browserFingerprint }])
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error loading demo session from Supabase:', error);
      return null;
    }

    if (conversationData && conversationData.length > 0) {
      const conversation = conversationData[0];
      const demoData = Array.isArray(conversation.conversation_data) 
        ? conversation.conversation_data.find((item: any) => item.type === 'demo_session')
        : null;
      
      if (demoData && typeof demoData === 'object') {
        // Check if session is recent (within 24 hours)
        const lastActivity = (demoData as any).last_activity || 0;
        if (Date.now() - lastActivity < 24 * 60 * 60 * 1000) {
          const session: DemoSession = {
            id: `demo_${conversation.session_id}`,
            sessionId: conversation.session_id,
            browserFingerprint,
            conversationState: (demoData as any).conversation_state || {},
            formProgress: (demoData as any).form_progress || {},
            leadCaptured: (demoData as any).lead_captured || false,
            lastActivity,
            createdAt: new Date(conversation.created_at).getTime()
          };

          // Update localStorage with restored session
          localStorage.setItem(`tavara_demo_session_${session.sessionId}`, JSON.stringify(session));
          localStorage.setItem('tavara_demo_fingerprint', browserFingerprint);
          localStorage.setItem('tavara_current_demo_session', session.sessionId);

          console.log('🔄 Restored demo session from Supabase:', session.sessionId);
          return session;
        }
      }
    }

    console.log('🆕 No existing demo session found, will create new one');
    return null;

  } catch (error) {
    console.error('❌ Error loading demo session:', error);
    return null;
  }
};

/**
 * Mark demo session as having lead captured
 */
export const markLeadCaptured = async (sessionId: string): Promise<void> => {
  try {
    // Update localStorage
    const storedSession = localStorage.getItem(`tavara_demo_session_${sessionId}`);
    if (storedSession) {
      const session: DemoSession = JSON.parse(storedSession);
      session.leadCaptured = true;
      session.lastActivity = Date.now();
      localStorage.setItem(`tavara_demo_session_${sessionId}`, JSON.stringify(session));
    }

    // Update Supabase
    const { error } = await supabase
      .from('chatbot_conversations')
      .update({
        conversation_data: [
          {
            type: 'demo_session',
            browser_fingerprint: generateBrowserFingerprint(),
            lead_captured: true,
            last_activity: Date.now()
          }
        ],
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Error marking lead captured:', error);
    } else {
      console.log('✅ Lead captured marked for session:', sessionId);
    }

  } catch (error) {
    console.error('❌ Error marking lead captured:', error);
  }
};

/**
 * Clean up old demo sessions (called on app startup)
 */
export const cleanupOldDemoSessions = (): void => {
  try {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    // Clean up localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tavara_demo_session_')) {
        try {
          const session: DemoSession = JSON.parse(localStorage.getItem(key) || '{}');
          if (session.lastActivity < cutoffTime) {
            localStorage.removeItem(key);
            console.log('🧹 Cleaned up old demo session:', session.sessionId);
          }
        } catch {
          // Invalid session data, remove it
          localStorage.removeItem(key);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error cleaning up demo sessions:', error);
  }
};