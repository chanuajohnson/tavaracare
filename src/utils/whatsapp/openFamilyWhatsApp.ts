/**
 * Opens WhatsApp chat to Tavara business number with pre-loaded
 * context so the team knows which family match the caregiver wants.
 */
export const openFamilyWhatsApp = (
  familyName?: string,
  matchScore?: number,
  location?: string
) => {
  const name = familyName || 'a family';
  const text = `Hi Tavara! I'm a caregiver interested in connecting with my matched family: "${name}"${matchScore ? ` (${matchScore}% match` : ''}${location ? `, ${location}` : ''}${matchScore ? ')' : ''}. I'd like to learn more about their care needs.`;
  const url = `https://api.whatsapp.com/send/?phone=18687865357&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
  window.open(url, '_blank');
};
