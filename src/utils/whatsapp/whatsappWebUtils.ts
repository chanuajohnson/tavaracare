
/**
 * Utilities for generating WhatsApp web URLs and handling message formatting
 */

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  role?: string;
}

export interface WhatsAppMessage {
  contact: WhatsAppContact;
  message: string;
  url: string;
}

/**
 * Clean and format phone number for WhatsApp
 */
export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add country code (assuming US +1)
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
};

/**
 * Generate WhatsApp web URL with message
 */
export const generateWhatsAppURL = (phone: string, message: string): string => {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp messages for multiple contacts
 */
export const generateWhatsAppMessages = (
  contacts: WhatsAppContact[],
  messageTemplate: string
): WhatsAppMessage[] => {
  return contacts
    .filter(contact => contact.phone) // Only contacts with phone numbers
    .map(contact => ({
      contact,
      message: messageTemplate,
      url: generateWhatsAppURL(contact.phone, messageTemplate)
    }));
};

/**
 * Open WhatsApp URLs with staggered delays to prevent browser blocking
 */
export const openWhatsAppURLsWithDelay = (
  urls: string[],
  delayMs: number = 1000
): Promise<void> => {
  return new Promise((resolve) => {
    urls.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, '_blank');
        if (index === urls.length - 1) {
          resolve();
        }
      }, index * delayMs);
    });
  });
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
