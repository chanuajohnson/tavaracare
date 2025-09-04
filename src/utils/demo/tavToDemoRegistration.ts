import { supabase } from '@/integrations/supabase/client';

// Type definitions for structured conversation data
export interface TAVConversationData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  care_recipient_name?: string;
  relationship?: string;
  care_types?: string[];
  special_needs?: string[];
  budget_preferences?: string;
  caregiver_type?: string;
  additional_notes?: string;
  [key: string]: any;
}

export interface DemoSessionData {
  sessionId: string;
  userId?: string;
  conversationData: TAVConversationData;
  completionLevel: number;
  isReadyForRegistration: boolean;
  lastUpdated: number;
}

/**
 * Converts TAV conversation memory to localStorage format expected by registration forms
 */
export const convertTAVToRegistrationData = async (sessionId: string): Promise<TAVConversationData | null> => {
  try {
    console.log('🔄 Converting TAV data for session:', sessionId);

    // Fetch conversation from Supabase chatbot_conversations
    const { data: conversationData, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching conversation data:', error);
      return null;
    }

    if (!conversationData || conversationData.length === 0) {
      console.log('📝 No conversation data found for session:', sessionId);
      return null;
    }

    const conversation = conversationData[0];
    const extractedData: TAVConversationData = {};

    // Extract data from conversation_data array
    if (Array.isArray(conversation.conversation_data)) {
      const allMessages = conversation.conversation_data.join(' ');
      
      // Use regex patterns to extract structured data from conversation
      const patterns = {
        first_name: /(?:my (?:first )?name is|i'?m|call me)\s+([a-zA-Z]+)/i,
        last_name: /(?:last name|surname|family name)(?:\s+is)?\s+([a-zA-Z]+)/i,
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        phone_number: /(\d{3}[.-]?\d{3}[.-]?\d{4}|\d{10})/,
        address: /(?:address|live at|located at)\s+(.+?)(?:\s|$|\.|,)/i,
        relationship: /(?:(?:she|he) is my|relationship.{0,20})(mother|father|parent|spouse|wife|husband|partner|child|son|daughter|sibling|brother|sister|friend)/i,
        care_recipient_name: /(?:(?:her|his) name is|name.{0,20})\s+([a-zA-Z\s]+?)(?:\s|$|\.)/i,
      };

      for (const [field, pattern] of Object.entries(patterns)) {
        const match = allMessages.match(pattern);
        if (match) {
          extractedData[field] = match[1].trim();
        }
      }
    }

    // Also check care_needs data if available
    if (conversation.care_needs && typeof conversation.care_needs === 'object') {
      const careNeeds = conversation.care_needs as any;
      if (careNeeds.care_types) extractedData.care_types = careNeeds.care_types;
      if (careNeeds.special_needs) extractedData.special_needs = careNeeds.special_needs;
      if (careNeeds.budget_preferences) extractedData.budget_preferences = careNeeds.budget_preferences;
    }

    // Extract data from conversation history using pattern matching
    if (conversation.conversation_data && Array.isArray(conversation.conversation_data)) {
      const summary = conversation.conversation_data.join(' ');
      
      // Use regex patterns to extract structured data from conversation
      const patterns = {
        first_name: /(?:my (?:first )?name is|i'?m|call me)\s+([a-zA-Z]+)/i,
        last_name: /(?:last name|surname|family name)(?:\s+is)?\s+([a-zA-Z]+)/i,
        email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        phone_number: /(\d{3}[.-]?\d{3}[.-]?\d{4}|\d{10})/,
        relationship: /(?:(?:she|he) is my|relationship.{0,20})(mother|father|parent|spouse|wife|husband|partner|child|son|daughter|sibling|brother|sister|friend)/i,
        care_recipient_name: /(?:(?:her|his) name is|name.{0,20})\s+([a-zA-Z\s]+?)(?:\s|$|\.)/i,
      };

      for (const [field, pattern] of Object.entries(patterns)) {
        if (!extractedData[field]) {
          const match = summary.match(pattern);
          if (match) {
            extractedData[field] = match[1].trim();
          }
        }
      }
    }

    console.log('✅ Converted TAV data:', extractedData);
    return extractedData;

  } catch (error) {
    console.error('❌ Error converting TAV data:', error);
    return null;
  }
};

/**
 * Saves TAV conversation data to localStorage in the format expected by registration forms
 */
export const saveTAVDataToLocalStorage = (sessionId: string, data: TAVConversationData): void => {
  try {
    const timestamp = Date.now();
    
    // Save in the format expected by prefillReader.ts
    const prefillData = {
      session_id: sessionId,
      timestamp,
      completed: true,
      responses: data,
      role: 'family',
      ...data // Flatten the data for easier access
    };

    // Save to multiple localStorage keys for compatibility
    localStorage.setItem(`tavara_chat_prefill_${sessionId}`, JSON.stringify(prefillData));
    localStorage.setItem(`tavara_chat_responses_${sessionId}`, JSON.stringify(data));
    localStorage.setItem(`tavara_chat_progress_${sessionId}`, JSON.stringify({
      sessionId,
      role: 'family',
      currentSection: 'completed',
      completionLevel: 100,
      timestamp
    }));

    // Store session ID for easy retrieval
    localStorage.setItem('tavara_chat_session', sessionId);
    
    console.log('💾 Saved TAV data to localStorage:', { sessionId, dataKeys: Object.keys(data) });
    
  } catch (error) {
    console.error('❌ Error saving TAV data to localStorage:', error);
  }
};

/**
 * Checks if TAV conversation has enough data for form completion
 */
export const isReadyForRegistration = (data: TAVConversationData): boolean => {
  const requiredFields = ['first_name', 'last_name', 'email', 'care_recipient_name', 'relationship'];
  const filledFields = requiredFields.filter(field => data[field] && String(data[field]).trim().length > 0);
  
  const completionPercentage = (filledFields.length / requiredFields.length) * 100;
  console.log('📊 Registration readiness:', { 
    filled: filledFields.length, 
    total: requiredFields.length, 
    percentage: completionPercentage 
  });
  
  return completionPercentage >= 60; // 60% completion threshold
};

/**
 * Calculates completion level for progress tracking
 */
export const calculateCompletionLevel = (data: TAVConversationData): number => {
  const allFields = [
    'first_name', 'last_name', 'email', 'phone_number', 'address',
    'care_recipient_name', 'relationship', 'care_types', 'budget_preferences'
  ];
  
  const filledFields = allFields.filter(field => {
    const value = data[field];
    return value && (Array.isArray(value) ? value.length > 0 : String(value).trim().length > 0);
  });
  
  return Math.round((filledFields.length / allFields.length) * 100);
};

/**
 * Main function to process TAV conversation and prepare for registration
 */
export const processTAVForRegistration = async (sessionId: string): Promise<DemoSessionData | null> => {
  try {
    const conversationData = await convertTAVToRegistrationData(sessionId);
    
    if (!conversationData) {
      return null;
    }

    const completionLevel = calculateCompletionLevel(conversationData);
    const isReady = isReadyForRegistration(conversationData);

    const demoSessionData: DemoSessionData = {
      sessionId,
      conversationData,
      completionLevel,
      isReadyForRegistration: isReady,
      lastUpdated: Date.now()
    };

    // Save to localStorage for registration form access
    saveTAVDataToLocalStorage(sessionId, conversationData);

    return demoSessionData;

  } catch (error) {
    console.error('❌ Error processing TAV for registration:', error);
    return null;
  }
};