
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
    buttonText: 'Chat with Match',
    isDisabled: false,
    variant: 'default',
    showSpinner: false
  });

  useEffect(() => {
    if (persistenceLoading) {
      setButtonState({
        buttonText: 'Loading...',
        isDisabled: true,
        variant: 'outline',
        showSpinner: true
      });
      return;
    }

    if (!chatState) {
      // No chat started yet
      setButtonState({
        buttonText: 'Chat with Match',
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
          buttonText: 'Chat with Match',
          isDisabled: false,
          variant: 'default',
          showSpinner: false
        });
    }
  }, [chatState, persistenceLoading]);

  return {
    buttonState,
    hasActiveChat: !!chatState?.hasStartedChat,
    chatStage: chatState?.currentStage
  };
};
