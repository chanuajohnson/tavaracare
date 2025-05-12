
/**
 * Collection of phrases for use in chat interactions
 * This helps vary the language used in the chatbot for a more natural conversation
 */
export const phrasings = {
  /**
   * Phrases used for transitioning between sections
   */
  transitions: [
    "Now let's talk about",
    "Let's move on to",
    "Next, I'd like to ask about",
    "Let's explore",
    "Now I'd like to learn about",
    "Moving forward to",
    "Shifting focus to",
    "Let's discuss",
    "Next up is",
    "Continuing on to"
  ],
  
  /**
   * Phrases used for introducing questions
   * Note: Include trailing space
   */
  questionIntros: [
    "", // Empty string for some questions to have no intro
    "Could you share ",
    "I'd like to know ",
    "Please tell me ",
    "Would you mind sharing ",
    "I'm curious about ",
    "Can you tell me ",
    "May I ask ",
    "I'm interested in learning ",
    "Would you be willing to share ",
    "I'd appreciate knowing ",
    "Help me understand "
  ],

  /**
   * Trinidadian-style greetings
   */
  greetings: [
    "Hey there",
    "Hi friend",
    "Hello",
    "Greetings",
    "Welcome",
    "Good day",
    "Howdy",
    "Nice to meet you"
  ],

  /**
   * Acknowledgment phrases
   */
  acknowledgments: [
    "Perfect",
    "Great",
    "Wonderful",
    "Fantastic",
    "Excellent",
    "Thanks for that",
    "Got it",
    "I understand",
    "That's helpful",
    "Noted"
  ],

  /**
   * Cultural expressions
   */
  expressions: [
    "Right",
    "Well",
    "So",
    "Now",
    "Alright",
    "Great",
    "Perfect"
  ],
  
  /**
   * Trinidadian dialect words and phrases with variants
   * Organized by type for contextual usage
   */
  trinidadianDialect: {
    // For replacing "Alright" at the beginning of messages
    alrightVariants: [
      "Right then",
      "Aye cool",
      "Cool cool",
      "Nice nice",
      "Great then",
      "Eh heh",
      "Well good",
      "Moving on",
      "So listen",
      "Let we go",
      "Rightio"
    ],
    
    // For replacing "Thank you" phrases
    thankYouVariants: [
      "Thanks plenty",
      "Much appreciated",
      "Thanks eh",
      "Real thanks",
      "That's real nice"
    ],
    
    // For replacing greeting phrases
    greetingVariants: [
      "Yuh alright",
      "Good day",
      "Howdy",
      "Whas happening",
      "How yuh going"
    ],
    
    // For replacing affirmative responses
    affirmativeVariants: [
      "For real",
      "That's right",
      "Exactly so",
      "Yes nah",
      "Indeed yes"
    ],
    
    // For replacing confirmation phrases
    confirmationVariants: [
      "We good to go",
      "All set",
      "Looking good",
      "We reach",
      "All correct"
    ]
  },

  /**
   * Connection error messages
   */
  connectionErrors: [
    "We're having some trouble connecting right now. Let's try again.",
    "Looks like there's a connection issue. Could you try again?",
    "Our systems are a bit slow right now. Let's give it another try.",
    "Sorry about that, we couldn't process your request. Let's try again."
  ],

  /**
   * Error recovery messages
   */
  errorRecovery: [
    "Sorry about that little hiccup. Let's continue where we left off.",
    "Let me get back on track. Where were we?",
    "My apologies for the interruption. Let's pick up where we were.",
    "Thanks for your patience. Let's continue with your registration."
  ],

  /**
   * Validation response messages
   */
  validationResponses: [
    "That doesn't look quite right. Could you check and try again?",
    "I think there might be a typo. Please verify and try again.",
    "That format doesn't seem right. Could you double-check?",
    "Please provide a valid format for this field."
  ],
  
  /**
   * Input format guidance messages
   */
  formatGuidance: {
    email: [
      "(example: yourname@example.com)",
      "(please use format: name@domain.com)",
      "(like: contact@example.com)"
    ],
    phone: [
      "(example: +1 868 123 4567)",
      "(please include country code, like: +1 868 555 1234)",
      "(format: +1-868-123-4567)"
    ],
    name: [
      "(your full name please)",
      "(first and last name)",
      "(as it appears on official documents)"
    ]
  }
};
