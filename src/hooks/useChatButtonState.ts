
import { useState, useEffect } from 'react';
import { useChatPersistence } from './useChatPersistence';

interface ChatButtonState {
  buttonText: string;
  isDisabled: boolean;
  variant: 'default' | 'secondary' | 'outline';
  showSpinner: boolean;
}

export const useChatButtonState = (caregiverId: string) => {
  const { chatState, isLoading: persistenceLoading } = useChatPersistence(caregiverId);
  const [buttonState, setButtonState] = useState<ChatButtonState>({
    buttonText: 'Start Guided Chat',
    isDisabled: false,
    variant: 'default',
    showSpinner: false
  });

  useEffect(() => {
    console.log(`[useChatButtonState] Button state update for caregiver: ${caregiverId}`);
    console.log(`[useChatButtonState] Chat state:`, chatState);
    console.log(`[useChatButtonState] Persistence loading:`, persistenceLoading);

    if (persistenceLoading) {
      setButtonState({
        buttonText: 'Loading...',
        isDisabled: true,
        variant: 'outline',
        showSpinner: true
      });
      return;
    }

    if (!chatState || !chatState.hasStartedChat) {
      // No chat started yet
      setButtonState({
        buttonText: 'Start Guided Chat',
        isDisabled: false,
        variant: 'default',
        showSpinner: false
      });
      return;
    }

    // Chat exists, update based on stage
    switch (chatState.currentStage) {
      case 'introduction':
      case 'interest_expression':
        setButtonState({
          buttonText: 'Continue Chat',
          isDisabled: false,
          variant: 'default',
          showSpinner: false
        });
        break;
      
      case 'waiting_acceptance':
        setButtonState({
          buttonText: 'Request Sent',
          isDisabled: true,
          variant: 'secondary',
          showSpinner: false
        });
        break;
      
      case 'guided_qa':
        setButtonState({
          buttonText: 'Continue Chat',
          isDisabled: false,
          variant: 'default',
          showSpinner: false
        });
        break;
      
      default:
        setButtonState({
          buttonText: 'Start Guided Chat',
          isDisabled: false,
          variant: 'default',
          showSpinner: false
        });
    }

    console.log(`[useChatButtonState] Final button state:`, {
      buttonText: buttonState.buttonText,
      isDisabled: buttonState.isDisabled,
      variant: buttonState.variant,
      showSpinner: buttonState.showSpinner
    });
  }, [chatState, persistenceLoading, caregiverId]);

  return {
    buttonState,
    hasActiveChat: !!chatState?.hasStartedChat,
    chatStage: chatState?.currentStage
  };
};
