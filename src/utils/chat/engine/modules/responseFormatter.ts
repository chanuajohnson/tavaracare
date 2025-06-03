
import { phrasings } from '@/utils/chat/phrasings';
import { formatDialect } from '../styleUtils';

/**
 * Cleans up and formats AI responses
 * @param text Raw response text
 * @param fieldType Optional field type for context-specific formatting
 */
export const cleanupResponse = (text: string, fieldType: string | null = null): string => {
  // Remove "a," at the beginning of sentences
  let cleaned = text.replace(/^a,\s*/i, '');
  cleaned = cleaned.replace(/\.\s+a,\s*/g, '. ');
  
  // Remove "Yuh" phrases
  cleaned = cleaned.replace(/\byuh\b/gi, '');
  
  // Fix any double spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Fix any punctuation issues from removals
  cleaned = cleaned.replace(/\s+\./g, '.');
  cleaned = cleaned.replace(/\s+\?/g, '?');
  cleaned = cleaned.replace(/\s+\!/g, '!');
  cleaned = cleaned.replace(/\s+,/g, ',');
  
  // Apply dialect formatting with field type context
  return formatDialect(cleaned, 'response', fieldType);
};
