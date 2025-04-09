
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatFlowEngine } from '@/hooks/useChatFlowEngine';
import { ChatbotLauncher } from './ChatbotLauncher';
import { ChatWindow } from './ChatWindow';
import { ChatStepType, ChatSenderType } from '@/types/chatbotTypes';
import { useLocation } from 'react-router-dom';

/**
 * Main chatbot widget component that handles the conversation flow
 */
export function ChatbotWidget() {
  const location = useLocation();
  const [autoOpenTimeout, setAutoOpenTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expanded, setExpanded] = useState(false);
  const {
    state,
    addUserMessage,
    addBotMessage,
    updateContactInfo,
    updateCareNeeds,
    setStep,
    toggleOpen,
    toggleMinimized,
    navigateToRegistration,
  } = useChatFlowEngine();

  // Tracks when we should auto-open the chatbot (only on root page)
  useEffect(() => {
    // Only auto-open on homepage and not if chatbot is already open
    if (location.pathname === '/' && !state.isOpen && !localStorage.getItem('chatbot_closed')) {
      const timeout = setTimeout(() => {
        toggleOpen();
        // Welcome message
        handleStepChange(ChatStepType.WELCOME);
      }, 5000); // 5 seconds delay
      
      setAutoOpenTimeout(timeout);
    }
    
    // Cleanup timeout on unmount or route change
    return () => {
      if (autoOpenTimeout) {
        clearTimeout(autoOpenTimeout);
      }
    };
  }, [location.pathname, state.isOpen]);

  // Handle chat option selection
  const handleOptionSelect = async (value: string) => {
    // First add the user's selection as a message
    await addUserMessage(value);
    
    // Process different option values based on step
    if (state.currentStep === ChatStepType.WELCOME) {
      if (value === 'yes') {
        handleStepChange(ChatStepType.RELATIONSHIP);
      } else if (value === 'no') {
        await addBotMessage("No problem! Feel free to explore our site and chat again if you have any questions.", [
          { label: "Learn about Tavara", value: "learn" },
          { label: "Find caregivers", value: "find_caregivers" }
        ]);
      }
    } 
    else if (state.currentStep === ChatStepType.RELATIONSHIP) {
      // Store relationship value
      await updateCareNeeds({ relationship: value });
      handleStepChange(ChatStepType.CARE_TYPE);
    } 
    else if (state.currentStep === ChatStepType.CARE_TYPE) {
      // Store care type
      await updateCareNeeds({ careType: [value] });
      handleStepChange(ChatStepType.CARE_SCHEDULE);
    } 
    else if (state.currentStep === ChatStepType.CARE_SCHEDULE) {
      // Store schedule preference
      await updateCareNeeds({ schedule: value });
      handleStepChange(ChatStepType.CONTACT_INFO);
    } 
    else if (state.currentStep === ChatStepType.CONTACT_INFO) {
      // This would be handled differently - form input
      if (value === 'skip') {
        handleStepChange(ChatStepType.ROLE_IDENTIFICATION);
      }
    } 
    else if (state.currentStep === ChatStepType.ROLE_IDENTIFICATION) {
      // Store user role
      await updateCareNeeds({ 
        role: value as 'family' | 'professional' | 'community' 
      });
      handleStepChange(ChatStepType.REGISTRATION_CTA);
    } 
    else if (state.currentStep === ChatStepType.REGISTRATION_CTA) {
      if (value === 'register') {
        // Navigate to registration
        navigateToRegistration();
      } else if (value === 'later') {
        handleStepChange(ChatStepType.FAREWELL);
      }
    }
  };

  // Handle step changes in the conversation flow
  const handleStepChange = async (step: ChatStepType) => {
    setStep(step);
    
    // Different messages based on the step
    switch (step) {
      case ChatStepType.WELCOME:
        await addBotMessage(
          "👋 Hi there! I'm Tani, your Tavara Care Assistant. I can help you find the right care solution. Are you looking for care services?",
          [
            { label: "Yes, I am", value: "yes" },
            { label: "Just browsing", value: "no" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.RELATIONSHIP:
        await addBotMessage(
          "Great! To help you best, I'd like to know: what's your relationship to the person needing care?",
          [
            { label: "Parent/Child", value: "family" },
            { label: "I need care", value: "self" },
            { label: "I'm a caregiver", value: "caregiver" },
            { label: "Other", value: "other" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.CARE_TYPE:
        await addBotMessage(
          "What type of care are you primarily looking for?",
          [
            { label: "Senior Care", value: "senior" },
            { label: "Child Care", value: "child" },
            { label: "Special Needs", value: "special_needs" },
            { label: "Temporary Care", value: "temporary" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.CARE_SCHEDULE:
        await addBotMessage(
          "How often would you need care?",
          [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Occasional", value: "occasional" },
            { label: "Not sure yet", value: "unsure" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.CONTACT_INFO:
        await addBotMessage(
          "Thanks! It would be helpful to know who I'm talking with. What's your name and email so we can keep in touch?",
          [
            { label: "Skip for now", value: "skip" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.ROLE_IDENTIFICATION:
        // Determine most likely role based on previous answers
        let suggestedRole = 'family';
        if (state.conversation.careNeeds?.relationship === 'caregiver') {
          suggestedRole = 'professional';
        }
        
        await addBotMessage(
          "Based on what you've shared, which role best describes you?",
          [
            { label: "Family Member", value: "family" },
            { label: "Care Professional", value: "professional" },
            { label: "Community Member", value: "community" }
          ],
          { step, suggestedRole }
        );
        break;
        
      case ChatStepType.REGISTRATION_CTA:
        const role = state.conversation.careNeeds?.role || 'family';
        let roleMessage = "";
        
        if (role === 'family') {
          roleMessage = "You can now create a family profile to find qualified caregivers quickly.";
        } else if (role === 'professional') {
          roleMessage = "You can now create a professional profile to connect with families needing your expertise.";
        } else {
          roleMessage = "You can now create a community profile to support care networks in your area.";
        }
        
        await addBotMessage(
          `Perfect! ${roleMessage} Would you like to complete your registration now?`,
          [
            { label: "Yes, register now", value: "register" },
            { label: "Maybe later", value: "later" }
          ],
          { step }
        );
        break;
        
      case ChatStepType.FAREWELL:
        await addBotMessage(
          "No problem! You can continue exploring Tavara.care and register anytime. I'm here if you have more questions!",
          [
            { label: "See features", value: "features" },
            { label: "Close chat", value: "close" }
          ],
          { step }
        );
        break;
    }
  };

  // Process user text input
  const handleSendMessage = async (text: string) => {
    await addUserMessage(text);
    
    // Extract information from the message
    if (state.currentStep === ChatStepType.CONTACT_INFO) {
      // Simple email extraction (basic validation)
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      const emailMatch = text.match(emailRegex);
      
      if (emailMatch) {
        await updateContactInfo({ email: emailMatch[0] });
      }
      
      // Extract name (simple heuristic)
      const words = text.split(' ').filter(w => w.length > 1);
      if (words.length >= 2) {
        await updateContactInfo({ 
          firstName: words[0],
          lastName: words.slice(1).join(' ')
        });
      } else if (words.length === 1) {
        await updateContactInfo({ firstName: words[0] });
      }
      
      // Acknowledge and move to next step
      await addBotMessage(
        `Thanks${state.conversation.contactInfo?.firstName ? `, ${state.conversation.contactInfo.firstName}` : ''}! I've saved your contact information.`
      );
      
      handleStepChange(ChatStepType.ROLE_IDENTIFICATION);
    } else {
      // For other steps, provide a generic response and continue the flow
      await addBotMessage(
        "I appreciate your message. To help you best, please select one of the options below.",
        state.currentStep !== ChatStepType.FAREWELL ? [
          { label: "Continue", value: "continue" }
        ] : undefined
      );
      
      if (text.toLowerCase().includes("continue")) {
        // Determine the next step based on current step
        const stepMap = {
          [ChatStepType.WELCOME]: ChatStepType.RELATIONSHIP,
          [ChatStepType.RELATIONSHIP]: ChatStepType.CARE_TYPE,
          [ChatStepType.CARE_TYPE]: ChatStepType.CARE_SCHEDULE,
          [ChatStepType.CARE_SCHEDULE]: ChatStepType.CONTACT_INFO,
          [ChatStepType.CONTACT_INFO]: ChatStepType.ROLE_IDENTIFICATION,
          [ChatStepType.ROLE_IDENTIFICATION]: ChatStepType.REGISTRATION_CTA,
        };
        
        const nextStep = stepMap[state.currentStep as keyof typeof stepMap];
        if (nextStep) {
          handleStepChange(nextStep);
        }
      }
    }
  };

  // Handle the chatbot close action
  const handleClose = () => {
    toggleOpen();
    localStorage.setItem('chatbot_closed', 'true');
  };

  // Expand the launcher button on hover
  const handleLauncherHover = () => {
    setExpanded(true);
  };

  // Collapse the launcher button when not hovering
  const handleLauncherLeave = () => {
    setExpanded(false);
  };

  // Determine if we should show the widget based on route
  // Don't show on registration or dashboard pages
  const shouldShowWidget = !(
    location.pathname.startsWith('/dashboard') || 
    location.pathname.startsWith('/registration')
  );

  if (!shouldShowWidget) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <ChatWindow
              messages={state.conversation.conversationData}
              isLoading={state.isLoading}
              isMinimized={state.isMinimized}
              onSendMessage={handleSendMessage}
              onOptionSelect={handleOptionSelect}
              onMinimize={toggleMinimized}
              onClose={handleClose}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!state.isOpen && (
        <div
          onMouseEnter={handleLauncherHover}
          onMouseLeave={handleLauncherLeave}
        >
          <ChatbotLauncher onClick={toggleOpen} expanded={expanded} />
        </div>
      )}
    </div>
  );
}
