
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
  ]
};
