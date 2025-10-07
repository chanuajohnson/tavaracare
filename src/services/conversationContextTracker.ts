// Service to track conversation context and expected field types
class ConversationContextTracker {
  private static instance: ConversationContextTracker;
  private expectedFieldType: string | null = null;
  private lastBotMessage: string = '';
  private confirmationPending: { fieldType: string; value: string } | null = null;

  static getInstance(): ConversationContextTracker {
    if (!ConversationContextTracker.instance) {
      ConversationContextTracker.instance = new ConversationContextTracker();
    }
    return ConversationContextTracker.instance;
  }

  // Analyze bot message to determine what field is being asked for
  setExpectedFieldFromBotMessage(botMessage: string) {
    this.lastBotMessage = botMessage;
    console.log('🔍 [Context Tracker] ANALYZING BOT MESSAGE:', botMessage);
    console.log('🔍 [Context Tracker] Bot message includes "specific address"?', botMessage.toLowerCase().includes('specific address'));
    console.log('🔍 [Context Tracker] Bot message includes "address"?', botMessage.toLowerCase().includes('address'));
    
    // Check for confirmation messages
    if (this.isConfirmationMessage(botMessage)) {
      const confirmedValue = this.extractConfirmationValue(botMessage);
      const fieldType = this.detectFieldTypeFromMessage(botMessage);
      if (confirmedValue && fieldType) {
        this.confirmationPending = { fieldType, value: confirmedValue };
        console.log('✅ [Context Tracker] CONFIRMATION PENDING:', this.confirmationPending);
      }
    }
    
    this.expectedFieldType = this.detectFieldTypeFromMessage(botMessage);
    console.log('🎯 [Context Tracker] FINAL SET FIELD TYPE:', this.expectedFieldType);
    console.log('🤖 [Context Tracker] Bot asked for field:', this.expectedFieldType, 'from message:', botMessage.substring(0, 50));
  }

  getExpectedFieldType(): string | null {
    return this.expectedFieldType;
  }

  clearExpectedField() {
    this.expectedFieldType = null;
    console.log('🧹 [Context Tracker] Cleared expected field');
  }

  getConfirmationPending(): { fieldType: string; value: string } | null {
    return this.confirmationPending;
  }

  clearConfirmationPending() {
    this.confirmationPending = null;
    console.log('🧹 [Context Tracker] Cleared confirmation pending');
  }

  private isConfirmationMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('confirm') || 
           lowerMessage.includes('correct?') || 
           lowerMessage.includes('right?') ||
           lowerMessage.includes('just to confirm') ||
           lowerMessage.includes('to confirm');
  }

  private extractConfirmationValue(message: string): string | null {
    console.log('🔍 [Context Tracker] Extracting confirmation value from:', message);
    
    // Pattern to extract address from confirmation messages
    // "Just to confirm... LP Calcutta Road No. 1, correct?"
    const addressPattern = /(?:confirm[^.]*\.{2,}\s*|to confirm[^.]*\.{2,}\s*|confirm[^.]*[.]\s*)([^,?]+)/i;
    const match = message.match(addressPattern);
    
    if (match && match[1]) {
      const extractedValue = match[1].trim();
      console.log('✅ [Context Tracker] Extracted confirmation value:', extractedValue);
      return extractedValue;
    }
    
    console.log('❌ [Context Tracker] No confirmation value extracted');
    return null;
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
      console.log('✅ [Context Tracker] Detected ADDRESS field from message:', lowerMessage);
      console.log('🏠 [Context Tracker] ADDRESS detection - specific pattern matched');
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