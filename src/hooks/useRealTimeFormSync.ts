import { useCallback, useRef } from 'react';
import { conversationContextTracker } from '@/services/conversationContextTracker';

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

  const extractDataFromMessage = useCallback((message: string, expectedFieldType?: string): ExtractedData => {
    console.log('🔍 [Real-time Sync] Starting extraction for message:', message);
    console.log('🎯 [Real-time Sync] Expected field type:', expectedFieldType);
    
    const extracted: ExtractedData = {};
    const lowerMessage = message.toLowerCase();

    // Get context-aware field type if not provided
    const contextFieldType = expectedFieldType || conversationContextTracker.getExpectedFieldType();
    console.log('🔄 [Real-time Sync] Using field type:', contextFieldType);

    // Enhanced patterns for different field types
    const firstNamePatterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i,
      /(?:first name is|first name:)\s+([a-zA-Z]+)/i,
      /(?:it's|its)\s+([a-zA-Z]+)/i, // "it's chanua"
      /([a-zA-Z]+)(?:\s*is\s*my\s*name)/i // "chanua is my name"
    ];

    const lastNamePatterns = [
      /(?:last name is|last name:)\s+([a-zA-Z]+)/i,
      /(?:my surname is|surname:)\s+([a-zA-Z]+)/i,
      /(?:family name is|family name:)\s+([a-zA-Z]+)/i
    ];

    // Context-aware single word pattern (most important change)
    const singleWordPattern = /^([a-zA-Z]{2,})$/;

    // Email patterns
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    // Phone patterns
    const phonePattern = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/;

    // Track if context-aware extraction was successful
    let contextExtractionSucceeded = false;

    // Context-aware extraction logic
    if (contextFieldType) {
      console.log('🎯 [Real-time Sync] Using context-aware extraction for:', contextFieldType);
      
      // Check single word pattern first when we know the context
      const singleWordMatch = message.match(singleWordPattern);
      if (singleWordMatch && singleWordMatch[1]) {
        const value = singleWordMatch[1].charAt(0).toUpperCase() + singleWordMatch[1].slice(1).toLowerCase();
        
        switch (contextFieldType) {
          case 'first_name':
            extracted.first_name = value;
            contextExtractionSucceeded = true;
            console.log('✅ [Real-time Sync] Context-aware first name:', value);
            break;
          case 'last_name':
            extracted.last_name = value;
            contextExtractionSucceeded = true;
            console.log('✅ [Real-time Sync] Context-aware last name:', value);
            break;
        }
      }
    }

    // Only run fallback patterns if context-aware extraction failed
    if (!contextExtractionSucceeded) {
      console.log('🔍 [Real-time Sync] Context extraction failed, trying fallback patterns...');
      
      // Fallback to explicit patterns for first name
      if (!extracted.first_name) {
        console.log('🔍 [Real-time Sync] Testing explicit first name patterns...');
        for (let i = 0; i < firstNamePatterns.length; i++) {
          const pattern = firstNamePatterns[i];
          const match = message.match(pattern);
          if (match && match[1] && match[1].length >= 2) {
            const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            extracted.first_name = name;
            console.log('✅ [Real-time Sync] Found first name via explicit pattern:', name);
            break;
          }
        }
      }

      // Fallback to explicit patterns for last name
      if (!extracted.last_name) {
        console.log('🔍 [Real-time Sync] Testing explicit last name patterns...');
        for (const pattern of lastNamePatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            extracted.last_name = name;
            console.log('✅ [Real-time Sync] Found last name via explicit pattern:', name);
            break;
          }
        }
      }
    } else {
      console.log('✅ [Real-time Sync] Context extraction succeeded, skipping fallback patterns');
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

    // Track bot messages for context, process user messages
    if (!isUser) {
      console.log('🤖 [Real-time Sync] Bot message - updating context:', message.substring(0, 50));
      conversationContextTracker.setExpectedFieldFromBotMessage(message);
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
    
    // Clear context after processing user response
    if (Object.keys(extractedData).length > 0) {
      conversationContextTracker.clearExpectedField();
    }

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