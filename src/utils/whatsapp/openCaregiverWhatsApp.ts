/**
 * Opens WhatsApp chat to Tavara business number with pre-loaded
 * caregiver context so the team knows which match the family wants.
 */
export const openCaregiverWhatsApp = (
  professionalType: string,
  matchScore: number,
  location?: string
) => {
  const text = `Hi Tavara! I'm interested in connecting with my matched caregiver: "${professionalType}" (${matchScore}% match${location ? `, ${location}` : ''}). I'd like to learn more about working with them.`;
  const url = `https://api.whatsapp.com/send/?phone=18687865357&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
  window.open(url, '_blank');
};
