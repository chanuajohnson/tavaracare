import { useCallback, useRef } from 'react';

interface FormSetters {
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setAddress: (value: string) => void;
  setCareRecipientName: (value: string) => void;
  setRelationship: (value: string) => void;
}

interface ExtractedData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  care_recipient_name?: string;
  relationship?: string;
}

export const useRealTimeFormSync = (formSetters: FormSetters | null) => {
  const lastProcessedMessage = useRef<string>('');

  const extractDataFromMessage = useCallback((message: string): ExtractedData => {
    console.log('🔍 [Real-time Sync] Starting extraction for message:', message);
    const extracted: ExtractedData = {};
    const lowerMessage = message.toLowerCase();

    // Enhanced first name patterns - more flexible matching
    const firstNamePatterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i,
      /(?:first name is|first name:)\s+([a-zA-Z]+)/i,
      /^([a-zA-Z]+)$/,  // Single word responses
      /\b([a-zA-Z]{2,})\b/i, // Any word with 2+ letters (fallback)
      /(?:it's|its)\s+([a-zA-Z]+)/i, // "it's chanua"
      /([a-zA-Z]+)(?:\s*is\s*my\s*name)/i // "chanua is my name"
    ];

    // Last name patterns  
    const lastNamePatterns = [
      /(?:last name is|last name:)\s+([a-zA-Z]+)/i,
      /(?:my surname is|surname:)\s+([a-zA-Z]+)/i,
      /(?:family name is|family name:)\s+([a-zA-Z]+)/i
    ];

    // Email patterns
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    // Phone patterns
    const phonePattern = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/;

    // Extract first name with enhanced debugging
    console.log('🔍 [Real-time Sync] Testing first name patterns...');
    for (let i = 0; i < firstNamePatterns.length; i++) {
      const pattern = firstNamePatterns[i];
      const match = message.match(pattern);
      console.log(`🔍 Pattern ${i + 1}:`, pattern, 'Match:', match);
      if (match && match[1] && match[1].length >= 2) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        extracted.first_name = name;
        console.log('✅ [Real-time Sync] Found first name:', name);
        break;
      }
    }

    // Extract last name
    for (const pattern of lastNamePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        extracted.last_name = name;
        break;
      }
    }

    // Extract email
    const emailMatch = message.match(emailPattern);
    if (emailMatch) {
      extracted.email = emailMatch[1];
    }

    // Extract phone
    const phoneMatch = message.match(phonePattern);
    if (phoneMatch) {
      extracted.phone = phoneMatch[1].replace(/[^\d+]/g, '');
    }

    // Care recipient name patterns
    const careRecipientPatterns = [
      /(?:caring for|taking care of|my (?:mom|dad|mother|father|husband|wife|spouse|partner))\s+(?:is\s+)?([a-zA-Z\s]+)/i,
      /(?:his|her|their) name is\s+([a-zA-Z\s]+)/i
    ];

    for (const pattern of careRecipientPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim().replace(/\s+/g, ' ');
        extracted.care_recipient_name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        break;
      }
    }

    // Relationship patterns
    const relationshipPatterns = [
      /(?:my|for my|caring for my)\s+(mom|mother|dad|father|husband|wife|spouse|partner|son|daughter|child|parent)/i,
      /(?:he is my|she is my|they are my)\s+(mom|mother|dad|father|husband|wife|spouse|partner|son|daughter|child|parent)/i
    ];

    for (const pattern of relationshipPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const relationship = match[1].toLowerCase();
        // Normalize relationship terms
        const normalized = relationship
          .replace(/mom|mother/, 'parent')
          .replace(/dad|father/, 'parent')
          .replace(/husband|wife|spouse|partner/, 'spouse');
        extracted.relationship = normalized;
        break;
      }
    }

    return extracted;
  }, []);

  const processMessage = useCallback((message: string, isUser: boolean) => {
    console.log('🚀 [Real-time Sync] processMessage called:', {
      message,
      isUser,
      hasFormSetters: !!formSetters,
      lastProcessed: lastProcessedMessage.current
    });

    // Only process user messages and avoid reprocessing
    if (!isUser) {
      console.log('⏭️ [Real-time Sync] Skipping: not user message');
      return;
    }
    if (message === lastProcessedMessage.current) {
      console.log('⏭️ [Real-time Sync] Skipping: already processed this message');
      return;
    }
    if (!formSetters) {
      console.log('⚠️ [Real-time Sync] Skipping: form setters not available yet');
      return;
    }

    lastProcessedMessage.current = message;
    console.log('🔄 [Real-time Sync] Processing message:', message);
    const extractedData = extractDataFromMessage(message);

    console.log('🎯 [Real-time Sync] Extracted data:', extractedData);

    // Apply extracted data to form fields with enhanced logging
    if (Object.keys(extractedData).length === 0) {
      console.log('⚠️ [Real-time Sync] No data extracted from message');
    }

    Object.entries(extractedData).forEach(([key, value]) => {
      if (value) {
        console.log(`🔧 [Real-time Sync] Applying ${key}:`, value);
        try {
          switch (key) {
            case 'first_name':
              formSetters.setFirstName(value);
              console.log('✅ [Real-time Sync] Successfully set first name:', value);
              // Add visual feedback
              if (typeof window !== 'undefined') {
                setTimeout(() => {
                  const input = document.querySelector('#firstName') as HTMLInputElement;
                  if (input) {
                    input.style.background = 'rgba(34, 197, 94, 0.1)';
                    input.style.transition = 'background 0.3s ease';
                    setTimeout(() => {
                      input.style.background = '';
                    }, 2000);
                  }
                }, 100);
              }
              break;
            case 'last_name':
              formSetters.setLastName(value);
              console.log('✅ [Real-time Sync] Successfully set last name:', value);
              break;
            case 'email':
              formSetters.setEmail(value);
              console.log('✅ [Real-time Sync] Successfully set email:', value);
              break;
            case 'phone':
              formSetters.setPhoneNumber(value);
              console.log('✅ [Real-time Sync] Successfully set phone:', value);
              break;
            case 'address':
              formSetters.setAddress(value);
              console.log('✅ [Real-time Sync] Successfully set address:', value);
              break;
            case 'care_recipient_name':
              formSetters.setCareRecipientName(value);
              console.log('✅ [Real-time Sync] Successfully set care recipient name:', value);
              break;
            case 'relationship':
              formSetters.setRelationship(value);
              console.log('✅ [Real-time Sync] Successfully set relationship:', value);
              break;
          }
        } catch (error) {
          console.error(`❌ [Real-time Sync] Error setting ${key}:`, error);
        }

        // Store in localStorage for persistence
        const sessionId = new URLSearchParams(window.location.search).get('session') || 'default';
        const storageKey = `tavara_extracted_${sessionId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
        existing[key] = value;
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
    });
  }, [extractDataFromMessage, formSetters]);

  return {
    processMessage,
    extractDataFromMessage
  };
};