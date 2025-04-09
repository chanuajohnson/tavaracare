
import { ChatMessage, PrefillData } from "@/types/chatTypes";

/**
 * Extracts user responses from message history
 * @param messages - Array of chat messages
 * @param questionIndex - Index of the question to match
 * @returns The user's answer or undefined if not found
 */
const extractUserResponse = (
  messages: ChatMessage[], 
  questionText: string
): string | undefined => {
  // Find the question message
  const questionIndex = messages.findIndex(
    msg => !msg.isUser && msg.content.includes(questionText)
  );
  
  if (questionIndex === -1 || questionIndex >= messages.length - 1) {
    return undefined;
  }
  
  // Get the next user message after the question
  const userResponse = messages
    .slice(questionIndex + 1)
    .find(msg => msg.isUser);
  
  return userResponse?.content;
};

/**
 * Generates prefill JSON data for family registration
 * @param messages - Array of chat messages
 * @returns PrefillData object
 */
const generateFamilyPrefill = (messages: ChatMessage[]): PrefillData => {
  // Extract user responses to specific questions
  const nameResponse = extractUserResponse(messages, "What's your name?") || "";
  const careRecipientResponse = extractUserResponse(
    messages, 
    "Who do you need care for?"
  ) || "";
  const careTypeResponse = extractUserResponse(
    messages,
    "What kind of care do they need?"
  ) || "";
  const scheduleResponse = extractUserResponse(
    messages,
    "How often do you need care?"
  ) || "";

  // Process name into first and last name
  const nameParts = nameResponse.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Extract recipient name and relationship
  const recipientInfo = careRecipientResponse.split(/and|,|\(/);
  const recipientName = recipientInfo[0]?.trim() || "";
  
  // Try to extract relationship from the response
  let relationship = "";
  if (recipientInfo.length > 1) {
    const relationshipMatch = careRecipientResponse.match(/\b(mother|father|spouse|partner|child|son|daughter|parent|grandparent|relative|friend)\b/i);
    if (relationshipMatch) {
      relationship = relationshipMatch[0].toLowerCase();
    }
  }

  // Process care types into array
  const careTypes = careTypeResponse
    .split(/,|and/)
    .map(type => type.trim())
    .filter(Boolean);

  // Process schedule into array
  const scheduleItems = scheduleResponse
    .split(/,|and/)
    .map(item => item.trim())
    .filter(Boolean);

  return {
    first_name: firstName,
    last_name: lastName,
    phone_number: "", // We didn't collect this in chat
    care_recipient_name: recipientName,
    relationship,
    care_types: careTypes,
    care_schedule: scheduleItems
  };
};

/**
 * Generates prefill JSON data for professional registration
 * @param messages - Array of chat messages
 * @returns PrefillData object
 */
const generateProfessionalPrefill = (messages: ChatMessage[]): PrefillData => {
  // Extract user responses
  const nameResponse = extractUserResponse(messages, "What's your name?") || "";
  const professionResponse = extractUserResponse(
    messages,
    "What kind of professional are you?"
  ) || "";
  const experienceResponse = extractUserResponse(
    messages,
    "How many years experience do you have?"
  ) || "";
  const locationResponse = extractUserResponse(
    messages,
    "Where are you located?"
  ) || "";
  const contactResponse = extractUserResponse(
    messages,
    "What's your contact info?"
  ) || "";

  // Process name into first and last name
  const nameParts = nameResponse.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Extract years of experience as a number if possible
  let yearsOfExperience: number | string = 0;
  const yearsMatch = experienceResponse.match(/\d+/);
  if (yearsMatch) {
    yearsOfExperience = parseInt(yearsMatch[0], 10);
  }

  // Extract potential phone number from contact info
  let phone = "";
  const phoneMatch = contactResponse.match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/);
  if (phoneMatch) {
    phone = phoneMatch[0];
  }

  return {
    first_name: firstName,
    last_name: lastName,
    professional_type: professionResponse,
    years_of_experience: yearsOfExperience,
    location: locationResponse,
    phone,
    terms_accepted: false // Default value, can't be prefilled for legal reasons
  };
};

/**
 * Generates prefill JSON data for community registration
 * @param messages - Array of chat messages
 * @returns PrefillData object
 */
const generateCommunityPrefill = (messages: ChatMessage[]): PrefillData => {
  // Extract user responses
  const nameResponse = extractUserResponse(messages, "What's your name?") || "";
  const rolesResponse = extractUserResponse(
    messages,
    "What kind of roles are you interested in?"
  ) || "";
  const contributionResponse = extractUserResponse(
    messages,
    "What are your contribution areas?"
  ) || "";
  const interestsResponse = extractUserResponse(
    messages,
    "Are you interested in tech, caregiving, education"
  ) || "";

  // Process name (community form uses fullName)
  const fullName = nameResponse.trim();

  // Process roles into array
  const communityRoles = rolesResponse
    .split(/,|and/)
    .map(role => role.trim())
    .filter(Boolean);

  // Process contribution areas into array
  const contributionInterests = contributionResponse
    .split(/,|and/)
    .map(area => area.trim())
    .filter(Boolean);

  // Process tech interests from the response
  const techInterests: string[] = [];
  if (interestsResponse.match(/tech/i)) techInterests.push("technology");
  if (interestsResponse.match(/caregiving|care/i)) techInterests.push("caregiving");
  if (interestsResponse.match(/education|teaching|learn/i)) techInterests.push("education");

  return {
    fullName,
    location: "", // We didn't collect this in chat
    phoneNumber: "", // We didn't collect this in chat
    email: "", // We didn't collect this in chat
    communityRoles,
    contributionInterests,
    techInterests
  };
};

/**
 * Generates prefill JSON data based on user role and chat history
 * @param role - Selected user role (family, professional, community)
 * @param messages - Array of chat messages
 * @returns PrefillData object for the corresponding registration form
 */
export const generatePrefillJson = (
  role: string, 
  messages: ChatMessage[]
): PrefillData => {
  switch (role) {
    case "family":
      return generateFamilyPrefill(messages);
    
    case "professional":
      return generateProfessionalPrefill(messages);
    
    case "community":
      return generateCommunityPrefill(messages);
    
    default:
      return {};
  }
};
