import html2canvas from 'html2canvas';
import { SpotlightCaregiver } from '@/services/spotlightService';

export interface GeneratedCard {
  caregiverId: string;
  caregiverName: string;
  squareUrl: string;
  storyUrl?: string;
}

/**
 * Generate a PNG image from a DOM element
 */
export const generateCardImage = async (
  element: HTMLElement,
  scale: number = 2
): Promise<string> => {
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    removeContainer: true,
  });
  
  return canvas.toDataURL('image/png');
};

/**
 * Download an image from a data URL
 */
export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate a safe filename from caregiver name
 */
export const generateFilename = (
  caregiverName: string,
  format: 'square' | 'story'
): string => {
  const safeName = caregiverName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const suffix = format === 'story' ? 'whatsapp-story' : 'instagram';
  return `tavara-${safeName}-${suffix}.png`;
};

/**
 * Generate WhatsApp message template for sending to caregiver
 */
export const generateWhatsAppMessage = (firstName: string): string => {
  return `Hi ${firstName}! 💙

Here's your personalized availability card from Tavara.care!

📲 Share it on:
• WhatsApp Status
• Facebook
• Instagram

Let families know you're available for care work!

Need changes? Just reply to this message.

– The Tavara Team`;
};

/**
 * Generate WhatsApp URL for sending message to a phone number
 */
export const generateWhatsAppUrl = (
  phoneNumber: string,
  message: string
): string => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};
