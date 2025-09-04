// Service to track conversation context and expected field types
class ConversationContextTracker {
  private static instance: ConversationContextTracker;
  private expectedFieldType: string | null = null;
  private lastBotMessage: string = '';

  static getInstance(): ConversationContextTracker {
    if (!ConversationContextTracker.instance) {
      ConversationContextTracker.instance = new ConversationContextTracker();
    }
    return ConversationContextTracker.instance;
  }

  // Analyze bot message to determine what field is being asked for
  setExpectedFieldFromBotMessage(botMessage: string) {
    this.lastBotMessage = botMessage;
    this.expectedFieldType = this.detectFieldTypeFromMessage(botMessage);
    console.log('🤖 [Context Tracker] Bot asked for field:', this.expectedFieldType, 'from message:', botMessage.substring(0, 50));
  }

  getExpectedFieldType(): string | null {
    return this.expectedFieldType;
  }

  clearExpectedField() {
    this.expectedFieldType = null;
    console.log('🧹 [Context Tracker] Cleared expected field');
  }

  private detectFieldTypeFromMessage(message: string): string | null {
    const lowerMessage = message.toLowerCase();

    // First name patterns
    if (lowerMessage.includes('first name') || 
        lowerMessage.includes('what\'s your name') ||
        lowerMessage.includes('what is your name') ||
        lowerMessage.includes('tell me your name') ||
        (lowerMessage.includes('name') && lowerMessage.includes('please'))) {
      return 'first_name';
    }

    // Last name patterns
    if (lowerMessage.includes('last name') || 
        lowerMessage.includes('surname') ||
        lowerMessage.includes('family name')) {
      return 'last_name';
    }

    // Email patterns
    if (lowerMessage.includes('email') || 
        lowerMessage.includes('e-mail')) {
      return 'email';
    }

    // Phone patterns
    if (lowerMessage.includes('phone') || 
        lowerMessage.includes('telephone') ||
        lowerMessage.includes('contact number') ||
        lowerMessage.includes('mobile')) {
      return 'phone';
    }

    // Address patterns
    if (lowerMessage.includes('address') || 
        lowerMessage.includes('location') ||
        lowerMessage.includes('where do you live')) {
      return 'address';
    }

    // Care recipient patterns
    if (lowerMessage.includes('care recipient') || 
        lowerMessage.includes('who are you caring for') ||
        lowerMessage.includes('person you\'re caring for')) {
      return 'care_recipient_name';
    }

    // Relationship patterns
    if (lowerMessage.includes('relationship') || 
        lowerMessage.includes('how are you related')) {
      return 'relationship';
    }

    return null;
  }
}

export const conversationContextTracker = ConversationContextTracker.getInstance();