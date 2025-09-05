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

    console.log('🔍 [Context Tracker] Analyzing message for field type:', lowerMessage);

    // Last name patterns - Check FIRST to avoid "first name" false matches
    if (lowerMessage.includes('last name') || 
        lowerMessage.includes('surname') ||
        lowerMessage.includes('family name') ||
        lowerMessage.includes('your last name')) {
      console.log('✅ [Context Tracker] Detected LAST_NAME field');
      return 'last_name';
    }

    // First name patterns - More specific patterns
    if (lowerMessage.includes('first name') || 
        lowerMessage.includes('your first name') ||
        (lowerMessage.includes('what\'s your name') && !lowerMessage.includes('last')) ||
        (lowerMessage.includes('what is your name') && !lowerMessage.includes('last')) ||
        (lowerMessage.includes('tell me your name') && !lowerMessage.includes('last'))) {
      console.log('✅ [Context Tracker] Detected FIRST_NAME field');
      return 'first_name';
    }

    // Email patterns
    if (lowerMessage.includes('email') || 
        lowerMessage.includes('e-mail') ||
        lowerMessage.includes('email address')) {
      console.log('✅ [Context Tracker] Detected EMAIL field');
      return 'email';
    }

    // Phone patterns
    if (lowerMessage.includes('phone') || 
        lowerMessage.includes('telephone') ||
        lowerMessage.includes('contact number') ||
        lowerMessage.includes('phone number') ||
        lowerMessage.includes('mobile')) {
      console.log('✅ [Context Tracker] Detected PHONE field');
      return 'phone';
    }

    // Location patterns - Separate from address
    if (lowerMessage.includes('location') ||
        lowerMessage.includes('select your location') ||
        lowerMessage.includes('which location') ||
        lowerMessage.includes('choose your location') ||
        (lowerMessage.includes('where') && lowerMessage.includes('located'))) {
      console.log('✅ [Context Tracker] Detected LOCATION field');
      return 'location';
    }

    // Address patterns - Specific address only
    if (lowerMessage.includes('address') || 
        lowerMessage.includes('specific address') ||
        lowerMessage.includes('full address') ||
        lowerMessage.includes('where do you live') ||
        lowerMessage.includes('your address') ||
        lowerMessage.includes('home address') ||
        lowerMessage.includes('residential address') ||
        lowerMessage.includes('street address') ||
        (lowerMessage.includes('where') && lowerMessage.includes('located') && !lowerMessage.includes('city')) ||
        lowerMessage.includes('complete address') ||
        lowerMessage.includes('mailing address')) {
      console.log('✅ [Context Tracker] Detected ADDRESS field');
      return 'address';
    }

    // Care recipient patterns
    if (lowerMessage.includes('care recipient') || 
        lowerMessage.includes('who are you caring for') ||
        lowerMessage.includes('person you\'re caring for') ||
        lowerMessage.includes('care recipient\'s name')) {
      console.log('✅ [Context Tracker] Detected CARE_RECIPIENT_NAME field');
      return 'care_recipient_name';
    }

    // Relationship patterns
    if (lowerMessage.includes('relationship') || 
        lowerMessage.includes('how are you related') ||
        lowerMessage.includes('relationship to')) {
      console.log('✅ [Context Tracker] Detected RELATIONSHIP field');
      return 'relationship';
    }

    console.log('❌ [Context Tracker] No field type detected');
    return null;
  }
}

export const conversationContextTracker = ConversationContextTracker.getInstance();