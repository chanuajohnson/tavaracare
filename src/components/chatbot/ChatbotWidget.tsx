
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatFlowEngine } from '@/hooks/useChatFlowEngine';
import { ChatbotLauncher } from './ChatbotLauncher';
import { ChatWindow } from './ChatWindow';
import { ChatStepType } from '@/types/chatbotTypes';
import { useLocation } from 'react-router-dom';

/**
 * Main chatbot widget component that handles the conversation flow
 */
export function ChatbotWidget() {
  const location = useLocation();
  const [autoOpenTimeout, setAutoOpenTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [shouldShowWidget, setShouldShowWidget] = useState(true);
  
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

  useEffect(() => {
    const isHiddenRoute = 
      location.pathname.startsWith('/dashboard') || 
      location.pathname.startsWith('/registration');
    
    setShouldShowWidget(!isHiddenRoute);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && !state.isOpen && !localStorage.getItem('chatbot_closed')) {
      const timeout = setTimeout(() => {
        toggleOpen();
        handleStepChange(ChatStepType.WELCOME);
      }, 5000); // 5 seconds delay
      
      setAutoOpenTimeout(timeout);
    }
    
    return () => {
      if (autoOpenTimeout) {
        clearTimeout(autoOpenTimeout);
      }
    };
  }, [location.pathname, state.isOpen, toggleOpen]);

  const handleOptionSelect = useCallback(async (value: string) => {
    await addUserMessage(value);
    
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
      await updateCareNeeds({ relationship: value });
      handleStepChange(ChatStepType.CARE_TYPE);
    } 
    else if (state.currentStep === ChatStepType.CARE_TYPE) {
      await updateCareNeeds({ careType: [value] });
      handleStepChange(ChatStepType.CARE_SCHEDULE);
    } 
    else if (state.currentStep === ChatStepType.CARE_SCHEDULE) {
      await updateCareNeeds({ schedule: value });
      handleStepChange(ChatStepType.CONTACT_INFO);
    } 
    else if (state.currentStep === ChatStepType.CONTACT_INFO) {
      if (value === 'skip') {
        handleStepChange(ChatStepType.ROLE_IDENTIFICATION);
      }
    } 
    else if (state.currentStep === ChatStepType.ROLE_IDENTIFICATION) {
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
        { suggestedRole }
      );
    } 
    else if (state.currentStep === ChatStepType.REGISTRATION_CTA) {
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
        ]
      );
    }
  }, [state.currentStep, addUserMessage, addBotMessage, updateCareNeeds]);

  const handleStepChange = useCallback(async (step: ChatStepType) => {
    setStep(step);
    const currentStep = step; // Create a variable to use in the contextData
    
    switch (step) {
      case ChatStepType.WELCOME:
        await addBotMessage(
          "👋 Hi there! I'm Tani, your Tavara Care Assistant. I can help you find the right care solution. Are you looking for care services?",
          [
            { label: "Yes, I am", value: "yes" },
            { label: "Just browsing", value: "no" }
          ],
          { step: currentStep }
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
          { step: currentStep }
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
          { step: currentStep }
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
          { step: currentStep }
        );
        break;
        
      case ChatStepType.CONTACT_INFO:
        await addBotMessage(
          "Thanks! It would be helpful to know who I'm talking with. What's your name and email so we can keep in touch?",
          [
            { label: "Skip for now", value: "skip" }
          ],
          { step: currentStep }
        );
        break;
        
      case ChatStepType.ROLE_IDENTIFICATION:
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
          { step: currentStep, suggestedRole }
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
          { step: currentStep }
        );
        break;
        
      case ChatStepType.FAREWELL:
        await addBotMessage(
          "No problem! You can continue exploring Tavara.care and register anytime. I'm here if you have more questions!",
          [
            { label: "See features", value: "features" },
            { label: "Close chat", value: "close" }
          ],
          { step: currentStep }
        );
        break;
    }
  }, [setStep, addBotMessage, state.conversation.careNeeds]);

  const handleSendMessage = useCallback(async (text: string) => {
    await addUserMessage(text);
    
    if (state.currentStep === ChatStepType.CONTACT_INFO) {
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      const emailMatch = text.match(emailRegex);
      
      if (emailMatch) {
        await updateContactInfo({ email: emailMatch[0] });
      }
      
      const words = text.split(' ').filter(w => w.length > 1);
      if (words.length >= 2) {
        await updateContactInfo({ 
          firstName: words[0],
          lastName: words.slice(1).join(' ')
        });
      } else if (words.length === 1) {
        await updateContactInfo({ firstName: words[0] });
      }
      
      await addBotMessage(
        `Thanks${state.conversation.contactInfo?.firstName ? `, ${state.conversation.contactInfo.firstName}` : ''}! I've saved your contact information.`
      );
      
      handleStepChange(ChatStepType.ROLE_IDENTIFICATION);
    } else {
      await addBotMessage(
        "I appreciate your message. To help you best, please select one of the options below.",
        state.currentStep !== ChatStepType.FAREWELL ? [
          { label: "Continue", value: "continue" }
        ] : undefined
      );
      
      if (text.toLowerCase().includes("continue")) {
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
  }, [state.currentStep, addUserMessage, addBotMessage, updateContactInfo]);

  const handleClose = useCallback(() => {
    toggleOpen();
    localStorage.setItem('chatbot_closed', 'true');
  }, [toggleOpen]);

  const handleLauncherHover = useCallback(() => {
    setExpanded(true);
  }, []);

  const handleLauncherLeave = useCallback(() => {
    setExpanded(false);
  }, []);

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
              messages={state.conversation.conversationData || []}
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
