
import { ChatbotMessage } from '@/types/chatbot';
import { v4 as uuidv4 } from 'uuid';

/**
 * Processes user input and generates an appropriate bot response
 */
export const processBotResponse = async (
  userMessage: string, 
  currentLeadScore: number = 0
): Promise<{ 
  botResponse: ChatbotMessage, 
  updatedLeadScore: number 
}> => {
  try {
    let botResponse = '';
    let messageType: 'response' | 'question' = 'response';
    let contextData = {};
    let updatedLeadScore = currentLeadScore;
    
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      botResponse = "Hello! How can I help you today? Are you looking for care services or interested in becoming a caregiver?";
      messageType = 'question';
      contextData = { topic: 'greeting' };
    } 
    else if (lowerCaseMessage.includes('care') || lowerCaseMessage.includes('help') || lowerCaseMessage.includes('service')) {
      botResponse = "We offer a variety of care services for families. What type of care are you looking for? (Elder care, post-surgery recovery, special needs, etc.)";
      messageType = 'question';
      contextData = { topic: 'care_type', leadQualification: true };
      updatedLeadScore += 20;
    }
    else if (lowerCaseMessage.includes('elder') || lowerCaseMessage.includes('senior') || lowerCaseMessage.includes('old')) {
      botResponse = "We have many qualified caregivers specialized in elder care. When do you need this care to start?";
      messageType = 'question';
      contextData = { topic: 'elder_care', careType: 'elder', leadQualification: true };
      updatedLeadScore += 15;
    }
    else if (lowerCaseMessage.includes('caregiver') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
      botResponse = "Great! We're always looking for qualified healthcare professionals. Do you have experience as a caregiver or nurse?";
      messageType = 'question';
      contextData = { topic: 'caregiver_inquiry', userType: 'professional' };
    }
    else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('cost') || lowerCaseMessage.includes('fee')) {
      botResponse = "Our care services are personalized to your specific needs. Pricing depends on the level of care required, frequency, and duration. Would you like to provide some details about your care needs so I can give you a better estimate?";
      messageType = 'question';
      contextData = { topic: 'pricing', leadQualification: true };
      updatedLeadScore += 25;
    }
    else if (lowerCaseMessage.includes('register') || lowerCaseMessage.includes('sign up') || lowerCaseMessage.includes('account')) {
      botResponse = "I'd be happy to help you register! Are you looking to register as a family in need of care services, or as a healthcare professional looking for opportunities?";
      messageType = 'question';
      contextData = { topic: 'registration', leadQualification: true };
      updatedLeadScore += 30;
    }
    else if (lowerCaseMessage.includes('urgent') || lowerCaseMessage.includes('emergency') || lowerCaseMessage.includes('asap')) {
      botResponse = "I understand you need care urgently. We can expedite the matching process. Can I collect your contact information to have our care coordinator reach out to you immediately?";
      messageType = 'question';
      contextData = { topic: 'urgent_care', priority: 'high', leadQualification: true };
      updatedLeadScore += 40;
    }
    else if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('phone') || lowerCaseMessage.includes('call me')) {
      botResponse = "I'd be happy to have someone contact you directly. Could you please provide your name and the best phone number to reach you?";
      messageType = 'question';
      contextData = { topic: 'contact_request', leadQualification: true };
      updatedLeadScore += 35;
    }
    else if (lowerCaseMessage.includes('thank')) {
      botResponse = "You're welcome! Is there anything else I can help you with today?";
      messageType = 'question';
      contextData = { topic: 'gratitude' };
    }
    else {
      botResponse = "Thank you for your message. To better assist you, could you share what type of care services you're interested in, or if you'd like to learn about becoming a caregiver with us?";
      messageType = 'question';
      contextData = { topic: 'general_inquiry' };
    }
    
    // Add delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
    
    return {
      botResponse: {
        id: uuidv4(),
        message: botResponse || "I'm not sure how to respond to that. Can you provide more details about what you need?",
        senderType: 'bot',
        timestamp: new Date().toISOString(),
        messageType,
        contextData
      },
      updatedLeadScore
    };
  } catch (error) {
    console.error('Error processing bot response:', error);
    return {
      botResponse: {
        id: uuidv4(),
        message: "I apologize, but I'm having trouble connecting right now. Please try again or contact our support team for immediate assistance.",
        senderType: 'bot',
        timestamp: new Date().toISOString(),
        messageType: 'response',
        contextData: { error: true }
      },
      updatedLeadScore: currentLeadScore
    };
  }
};

/**
 * Creates a user message object from input text
 */
export const createUserMessage = (messageText: string): ChatbotMessage => {
  return {
    id: uuidv4(),
    message: messageText,
    senderType: 'user',
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a system message
 */
export const createSystemMessage = (messageText: string): ChatbotMessage => {
  return {
    id: uuidv4(),
    message: messageText,
    senderType: 'system',
    timestamp: new Date().toISOString(),
    messageType: 'action',
  };
};

/**
 * Creates a greeting message from the bot
 */
export const createGreetingMessage = (messageText: string): ChatbotMessage => {
  return {
    id: uuidv4(),
    message: messageText,
    senderType: 'bot',
    timestamp: new Date().toISOString(),
    messageType: 'greeting',
  };
};
