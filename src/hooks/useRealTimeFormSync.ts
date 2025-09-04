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

export const useRealTimeFormSync = (formSetters: FormSetters) => {
  const lastProcessedMessage = useRef<string>('');

  const extractDataFromMessage = useCallback((message: string): ExtractedData => {
    const extracted: ExtractedData = {};
    const lowerMessage = message.toLowerCase();

    // First name patterns
    const firstNamePatterns = [
      /(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i,
      /(?:first name is|first name:)\s+([a-zA-Z]+)/i,
      /^([a-zA-Z]+)$/  // Single word responses
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

    // Extract first name
    for (const pattern of firstNamePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        extracted.first_name = name;
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
    // Only process user messages and avoid reprocessing
    if (!isUser || message === lastProcessedMessage.current) {
      return;
    }

    lastProcessedMessage.current = message;
    const extractedData = extractDataFromMessage(message);

    console.log('🎯 Real-time form sync - extracted data:', extractedData);

    // Apply extracted data to form fields
    Object.entries(extractedData).forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case 'first_name':
            formSetters.setFirstName(value);
            console.log('✅ Set first name:', value);
            break;
          case 'last_name':
            formSetters.setLastName(value);
            console.log('✅ Set last name:', value);
            break;
          case 'email':
            formSetters.setEmail(value);
            console.log('✅ Set email:', value);
            break;
          case 'phone':
            formSetters.setPhoneNumber(value);
            console.log('✅ Set phone:', value);
            break;
          case 'address':
            formSetters.setAddress(value);
            console.log('✅ Set address:', value);
            break;
          case 'care_recipient_name':
            formSetters.setCareRecipientName(value);
            console.log('✅ Set care recipient name:', value);
            break;
          case 'relationship':
            formSetters.setRelationship(value);
            console.log('✅ Set relationship:', value);
            break;
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